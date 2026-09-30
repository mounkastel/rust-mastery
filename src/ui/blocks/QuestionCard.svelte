<script lang="ts">
  import type { Concept, Question } from '../../content';
  import { stateOf, type Answer } from '../../lib/domain/quiz';
  import RichText from '../blocks/RichText.svelte';

  interface Props {
    concept: Concept;
    question: Question;
    index: number;
    answer: Answer | undefined;
    order: readonly string[];
    onchoose: (optionId: string) => void;
    onreveal: () => void;
    ongrade: (passed: boolean) => void;
  }
  const { concept, question, index, answer, order, onchoose, onreveal, ongrade }: Props = $props();

  const KIND_LABEL = {
    choice: 'Choose one',
    predict: 'Predict the output',
    bug: 'Find the bug',
    recite: 'Write it out',
  } as const;

  const state = $derived(stateOf(question, answer));
  const judged = $derived(state === 'correct' || state === 'wrong');

  const options = $derived(
    question.kind === 'choice'
      ? order.map((id) => question.options.find((o) => o.id === id)).filter((o) => o !== undefined)
      : [],
  );
</script>

<article class="q" data-qid={question.id} data-state={state} aria-labelledby="q-{question.id}">
  <header class="q-head">
    <p class="q-meta">
      <span class="q-num">Question {index + 1} of {concept.questions.length}</span>
      <span class="q-kind">{KIND_LABEL[question.kind]}</span>
    </p>
    <h3 id="q-{question.id}" class="visually-hidden">Question {index + 1}</h3>
    <RichText text={question.prompt} />
  </header>

  {#if question.kind === 'choice'}
    <ul class="options">
      {#each options as option (option.id)}
        {@const isAnswer = option.id === question.correct}
        {@const isPicked = option.id === answer?.selected}
        <li>
          <button
            type="button"
            class="option"
            class:correct={judged && isAnswer}
            class:incorrect={judged && isPicked && !isAnswer}
            disabled={judged}
            onclick={() => {
              onchoose(option.id);
            }}
          >
            <span class="option-key" aria-hidden="true">{option.id}</span>
            <span class="option-text">{option.text}</span>
            {#if judged && isAnswer}<span class="visually-hidden"> (correct answer)</span>{/if}
          </button>
        </li>
      {/each}
    </ul>
  {:else if state === 'unanswered'}
    <button
      type="button"
      class="btn"
      onclick={() => {
        onreveal();
      }}>Show the answer</button
    >
  {/if}

  {#if state !== 'unanswered'}
    <div class="verdict" data-state={state}>
      <p class="verdict-line">
        {state === 'correct' ? 'Correct' : state === 'wrong' ? 'Not quite' : 'Answer'}
      </p>
      <RichText text={question.explain} lead />
    </div>
  {/if}

  {#if question.kind !== 'choice' && state === 'revealed'}
    <div class="selfcheck">
      <p id="self-{question.id}">Before you looked, did you get it?</p>
      <div class="selfcheck-actions" role="group" aria-labelledby="self-{question.id}">
        <button
          type="button"
          class="btn"
          onclick={() => {
            ongrade(true);
          }}>Yes</button
        >
        <button
          type="button"
          class="btn"
          onclick={() => {
            ongrade(false);
          }}>No</button
        >
      </div>
    </div>
  {/if}
</article>

<style>
  .q {
    min-inline-size: 0;
    padding: var(--space-4);
    border: 1px solid var(--edge);
    border-radius: var(--radius-3);
    background: var(--bg-raised);
  }
  .q[data-state='correct'] {
    border-inline-start: 3px solid var(--ok);
  }
  .q[data-state='wrong'] {
    border-inline-start: 3px solid var(--bad);
  }
  .q-head :global(.prose:last-child) {
    margin-block-end: var(--space-3);
  }
  .q-meta {
    display: flex;
    gap: var(--space-3);
    margin: 0 0 var(--space-2);
    color: var(--text-faint);
    font-size: var(--step--1);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .q-kind {
    color: var(--accent);
  }
  .options {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-2);
    margin: 0 0 var(--space-3);
    padding: 0;
    list-style: none;
  }
  .option {
    display: grid;
    grid-template-columns: 1.5rem minmax(0, 1fr);
    gap: var(--space-3);
    inline-size: 100%;
    padding: var(--space-3);
    border: 1px solid var(--edge);
    border-radius: var(--radius-2);
    background: var(--bg);
    text-align: start;
    cursor: pointer;
  }
  .option:hover:not(:disabled) {
    border-color: var(--accent);
    background: var(--accent-quiet);
  }
  .option:disabled {
    cursor: default;
  }
  .option.correct {
    border-color: var(--ok);
    background: var(--ok-quiet);
  }
  .option.incorrect {
    border-color: var(--bad);
    background: var(--bad-quiet);
  }
  .option-key {
    display: grid;
    place-items: center;
    inline-size: 1.5rem;
    block-size: 1.5rem;
    border: 1px solid var(--edge-strong);
    border-radius: var(--radius-1);
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: var(--step--1);
  }
  .option.correct .option-key {
    border-color: var(--ok);
    color: var(--ok);
  }
  .option.incorrect .option-key {
    border-color: var(--bad);
    color: var(--bad);
  }
  .option-text {
    overflow-wrap: anywhere;
  }
  .verdict {
    padding: var(--space-3);
    border-radius: var(--radius-2);
    background: var(--bg-sunken);
  }
  .verdict[data-state='correct'] {
    background: var(--ok-quiet);
  }
  .verdict[data-state='wrong'] {
    background: var(--bad-quiet);
  }
  .verdict-line {
    margin: 0 0 var(--space-2);
    font-weight: 640;
  }
  .verdict[data-state='correct'] .verdict-line {
    color: var(--ok);
  }
  .verdict[data-state='wrong'] .verdict-line {
    color: var(--bad);
  }
  .selfcheck {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: center;
    justify-content: space-between;
    margin-block-start: var(--space-3);
    padding: var(--space-3);
    border: 1px dashed var(--edge-strong);
    border-radius: var(--radius-2);
  }
  .selfcheck p {
    margin: 0;
  }
  .selfcheck-actions {
    display: flex;
    gap: var(--space-2);
  }
  .btn {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--edge-strong);
    border-radius: var(--radius-2);
    background: var(--bg-raised);
    cursor: pointer;
  }
  .btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
</style>
