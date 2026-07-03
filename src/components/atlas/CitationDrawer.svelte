<script>
  import sourceManifest from '../../data/source-manifest.generated.json';
  export let sourcePath = '';
  export let label = 'Open citation';
  let open = false;
  $: source = sourceManifest.sources.find((entry) => entry.path === sourcePath) || { title: sourcePath, path: sourcePath, tier: 'unknown', kind: 'source' };
</script>

<div class="citation-drawer" data-source-ref={source.path}>
  <button type="button" aria-expanded={open} onclick={() => (open = !open)}>{label}</button>
  {#if open}
    <aside class="citation-panel" aria-label="Citation details">
      <strong>{source.title}</strong>
      <p>{source.tier} · {source.kind}</p>
      <code>{source.path}</code>
      {#if source.canonicalUrl}<a href={source.canonicalUrl}>Canonical source</a>{/if}
    </aside>
  {/if}
</div>
