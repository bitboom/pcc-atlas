<script>
  import studyManifest from '../../data/study.generated.json';
  export let project = 'all';
  let index = 0;
  $: cards = studyManifest.items.filter((item) => item.type === 'flashcard' && (project === 'all' || item.project === project));
  $: card = cards[index] || cards[0];
  function next() { if (cards.length) index = (index + 1) % cards.length; }
</script>

<section class="study-widget study-cards" data-study-project={project}>
  <p class="evidence-kicker">Study cards</p>
  {#if card}
    <h3>{card.question}</h3>
    <p>{card.answer}</p>
    <code>{card.sourceRefs[0]?.path}</code>
    <button type="button" onclick={next}>Next card</button>
  {:else}
    <p>No study cards available.</p>
  {/if}
</section>
