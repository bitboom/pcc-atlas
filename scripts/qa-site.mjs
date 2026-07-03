import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}
const baseUrl = (arg('--base-url', 'http://127.0.0.1:4321/pcc-atlas') || '').replace(/\/$/, '');
const evidenceDir = arg('--evidence-dir', '.omo/evidence/browser-local');
mkdirSync(evidenceDir, { recursive: true });

const routes = [
  '/',
  '/projects/apple/',
  '/projects/meta/',
  '/projects/google/',
  '/compare/architecture-boundary/',
  '/compare/request-flow/',
  '/compare/transparency-and-verifiability/',
  '/study/',
  '/evidence/'
];
const viewports = [375, 768, 1280];
const summary = { baseUrl, evidenceDir, mode: 'playwright', routes: [], errors: [] };

function urlFor(route) {
  return `${baseUrl}${route === '/' ? '/' : route}`;
}

async function fetchFallback() {
  summary.mode = 'fetch-fallback';
  for (const route of routes) {
    const url = urlFor(route);
    const res = await fetch(url);
    const text = await res.text();
    const ok = res.ok && text.includes('PCC Atlas') && (route === '/' || /Diagram|Study|Evidence|Private|Transparency/.test(text));
    summary.routes.push({ route, status: res.status, ok, textLength: text.length });
    if (!ok) summary.errors.push(`fetch validation failed for ${route}`);
  }
}

async function runPlaywright() {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of viewports) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const consoleErrors = [];
      const requestFailures = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      page.on('requestfailed', (request) => requestFailures.push(`${request.url()} ${request.failure()?.errorText || ''}`));
      for (const route of routes) {
        const url = urlFor(route);
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const bodyText = await page.locator('body').innerText({ timeout: 10000 });
        const svgCount = await page.locator('svg.atlas-svg').count();
        const hasStudy = await page.locator('.study-widget').count();
        const hasSource = await page.locator('[data-source-ref]').count();
        const ok = Boolean(response?.ok()) && bodyText.includes('PCC Atlas') && (svgCount > 0 || route === '/evidence/') && hasSource > 0;
        const shotName = `${route.replaceAll('/', '_') || 'home'}-${width}.png`.replace(/^_/, 'home-');
        await page.screenshot({ path: join(evidenceDir, shotName), fullPage: true });
        summary.routes.push({ route, width, status: response?.status(), ok, svgCount, hasStudy, hasSource, consoleErrors: [...consoleErrors], requestFailures: [...requestFailures] });
        if (!ok) summary.errors.push(`browser validation failed for ${route} at ${width}px`);
      }
      await page.close();
      if (consoleErrors.length) summary.errors.push(`console errors at ${width}px: ${consoleErrors.join('; ')}`);
      if (requestFailures.length) summary.errors.push(`request failures at ${width}px: ${requestFailures.join('; ')}`);
    }
  } finally {
    await browser.close();
  }
}

try {
  await runPlaywright();
} catch (error) {
  summary.playwrightError = String(error?.message || error);
  await fetchFallback();
}

writeFileSync(join(evidenceDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
if (summary.errors.length) {
  console.error(summary.errors.join('\n'));
  process.exit(1);
}
console.log(`QA passed for ${routes.length} routes in ${summary.mode} mode. Evidence: ${evidenceDir}`);
