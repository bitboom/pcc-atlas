import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://bitboom.github.io',
  base: '/pcc-atlas',
  integrations: [
    svelte(),
    starlight({
      title: 'PCC Atlas',
      description: 'Diagram-first, source-backed atlas of private AI compute systems: Apple PCC, Meta Private Processing, and Google Private AI.',
      customCss: ['./src/styles/custom.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/bitboom/pcc-atlas' }],
      sidebar: [
        { label: 'Start', items: [{ label: 'Overview', slug: '' }] },
        {
          label: 'Projects',
          items: [
            { label: 'Apple Private Cloud Compute', slug: 'projects/apple' },
            { label: 'Meta Private Processing', slug: 'projects/meta' },
            { label: 'Google Private AI', slug: 'projects/google' }
          ]
        },
        {
          label: 'Compare',
          items: [
            { label: 'Architecture Boundary', slug: 'compare/architecture-boundary' },
            { label: 'Request Flow', slug: 'compare/request-flow' },
            { label: 'Transparency & Verifiability', slug: 'compare/transparency-and-verifiability' }
          ]
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Stateless Inference', slug: 'concepts/stateless-inference' },
            { label: 'Non-Targetability', slug: 'concepts/non-targetability' },
            { label: 'Remote Attestation', slug: 'concepts/remote-attestation' },
            { label: 'Verifiable Transparency', slug: 'concepts/verifiable-transparency' }
          ]
        },
        { label: 'Study', items: [{ label: 'Interactive Study', slug: 'study' }] },
        { label: 'Evidence', items: [{ label: 'Evidence Explorer', slug: 'evidence' }] }
      ],
      editLink: {
        baseUrl: 'https://github.com/bitboom/pcc-atlas/edit/main/'
      },
      lastUpdated: true
    })
  ]
});
