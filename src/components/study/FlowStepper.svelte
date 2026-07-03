<script>
  import studyManifest from '../../data/study.generated.json';
  export let project = 'all';
  let index = 0;
  $: items = studyManifest.items.filter((item) => item.type === 'flow-step' && (project === 'all' || item.project === project));
  $: current = items[index] || items[0];
  function next() { if (items.length) index = (index + 1) % items.length; }
  function prev() { if (items.length) index = (index + items.length - 1) % items.length; }
</script>

<section class="study-widget flow-stepper" data-study-project={project}>
  <p class="evidence-kicker">Flow stepper</p>
  {#if current}
    <h3>{current.title}</h3>
    <p>{current.summary}</p>
    <code>{current.sourceRefs[0]?.path}</code>
    <div class="study-actions">
      <button type="button" onclick={prev}>Previous</button>
      <span>{index + 1} / {items.length}</span>
      <button type="button" onclick={next}>Next</button>
    </div>
  {:else}
    <p>No flow steps available.</p>
  {/if}
</section>
