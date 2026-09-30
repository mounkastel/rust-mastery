<script lang="ts">
  import type { CourseStore } from '../../lib/app/store.svelte';
  import { storageKeys } from '../../lib/storage/schema';

  interface Props {
    store: CourseStore;
  }
  const { store }: Props = $props();

  let message = $state('');
  let importing = $state<HTMLInputElement | null>(null);
  let pendingReset = $state(false);

  const summary = $derived(store.summarise());

  function download(): void {
    const url = URL.createObjectURL(new Blob([store.exportJson()], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'rust-mastery-progress.json';
    anchor.click();
    URL.revokeObjectURL(url);
    message = 'Progress saved to a file.';
  }

  async function onFile(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file === undefined) return;
    const result = store.importJson(await file.text());
    if (result.ok) message = `Loaded ${file.name}.`;
    else message = result.reason ?? 'That file could not be read.';
    input.value = '';
  }

  /** Two presses, because a single mis-click here is unrecoverable. */
  function reset(): void {
    if (!pendingReset) {
      pendingReset = true;
      message = 'This deletes every tick, grade and review date. Choose Reset again to confirm.';
      return;
    }
    store.reset();
    pendingReset = false;
    message = 'Progress cleared.';
  }
</script>

<div class="data">
  <p class="count">{summary.passed} of {summary.total} passed</p>
  <div class="row">
    <button type="button" class="link" onclick={download}>Export</button>
    <button
      type="button"
      class="link"
      onclick={() => {
        importing?.click();
      }}
    >
      Import
    </button>
    <button type="button" class="link danger" onclick={reset}>
      {pendingReset ? 'Confirm reset' : 'Reset'}
    </button>
  </div>
  <input
    bind:this={importing}
    type="file"
    accept="application/json,.json"
    onchange={onFile}
    tabindex="-1"
    aria-hidden="true"
    class="file"
  />
  {#if message !== ''}
    <p class="message" role="status">{message}</p>
  {/if}
  <p class="where">Stored in this browser under <code>{storageKeys.progress}</code>.</p>
</div>

<style>
  .data {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-block-start: 1px solid var(--edge);
    color: var(--text-faint);
    font-size: var(--step--1);
  }
  .count {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }
  .link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 0.15em;
    cursor: pointer;
  }
  .link.danger {
    color: var(--bad);
  }
  /* The Import button drives this; it is not a control in its own right, so it
     is out of the tab order and out of the accessibility tree. */
  .file {
    inline-size: 1px;
    block-size: 1px;
    opacity: 0;
  }
  .message {
    margin: 0;
    color: var(--text-muted);
  }
  .where {
    margin: 0;
  }
  .where code {
    overflow-wrap: anywhere;
  }
</style>
