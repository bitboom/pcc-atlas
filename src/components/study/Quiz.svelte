<script>
  import studyManifest from '../../data/study.generated.json';
  export let project = 'all';
  let selected = '';
  let checked = false;
  $: quizzes = studyManifest.items.filter((item) => item.type === 'quiz' && (project === 'all' || item.project === project));
  $: quiz = quizzes[0];
</script>

<section class="study-widget quiz-widget" data-study-project={project}>
  <p class="evidence-kicker">Quiz</p>
  {#if quiz}
    <h3>{quiz.question}</h3>
    {#each quiz.options as option}
      <label class="quiz-option">
        <input type="radio" name={quiz.id} bind:group={selected} value={option} onchange={() => (checked = false)} />
        {option}
      </label>
    {/each}
    <button type="button" onclick={() => (checked = true)}>Check answer</button>
    {#if checked}
      <p class:selected-correct={selected === quiz.answer} class:selected-wrong={selected !== quiz.answer}>
        {selected === quiz.answer ? 'Correct' : `Answer: ${quiz.answer}`}
      </p>
      <code>{quiz.sourceRefs[0]?.path}</code>
    {/if}
  {:else}
    <p>No quiz available.</p>
  {/if}
</section>
