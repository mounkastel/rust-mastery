<script lang="ts">
  import { lessonHref } from '../../lib/app/router';
  import type { NavRow } from './nav-row';
  import StatusPill from './StatusPill.svelte';

  interface Props {
    label: string;
    rows: NavRow[];
    currentId?: string;
  }
  const { label, rows, currentId = '' }: Props = $props();

  /** Roving arrow-key navigation; the list is one tab stop, not one per item. */
  function onkeydown(event: KeyboardEvent): void {
    const list = event.currentTarget as HTMLUListElement;
    const items = [...list.querySelectorAll<HTMLAnchorElement>('a')];
    if (items.length === 0) return;
    const from = items.indexOf(document.activeElement as HTMLAnchorElement);
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === 'ArrowDown'
            ? (from + 1) % items.length
            : event.key === 'ArrowUp'
              ? (from - 1 + items.length) % items.length
              : null;
    if (target === null) return;
    event.preventDefault();
    items[target]?.focus();
  }
</script>

<section class="tree" aria-labelledby="tree-{label}">
  <h2 class="tree-heading" id="tree-{label}">{label}</h2>
  <!--
    The roving-tabindex pattern needs a keydown listener on the list itself, which
    Svelte's a11y rule objects to because <ul> is not interactive. The listener
    only ever acts on anchors inside the list, which are focusable.
  -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <ul {onkeydown}>
    {#each rows as row (row.id)}
      {@const isCurrent = row.id === currentId}
      <li>
        <a
          href={lessonHref(row.id)}
          class="tree-row"
          class:is-current={isCurrent}
          aria-current={isCurrent ? 'page' : undefined}
          tabindex={isCurrent || (currentId === '' && row.isNext) ? 0 : -1}
          data-lock={row.lock}
        >
          <StatusPill {row} />
          <span class="tree-label">{row.title}</span>
          {#if row.isLong}<span class="tree-flag">long</span>{/if}
        </a>
      </li>
    {/each}
  </ul>
</section>

<style>
  .tree {
    padding-block: var(--space-3);
    border-block-start: 1px solid var(--edge);
  }
  .tree-heading {
    margin: 0 0 var(--space-2);
    padding-inline: var(--space-4);
    color: var(--text-faint);
    font-size: var(--step--1);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .tree-row {
    display: grid;
    grid-template-columns: 1.25rem 1fr auto;
    gap: var(--space-2);
    align-items: baseline;
    padding: var(--space-1) var(--space-4);
    border-inline-start: 2px solid transparent;
    color: var(--text-muted);
    text-decoration: none;
  }
  .tree-row:hover {
    background: var(--bg-sunken);
    color: var(--text);
  }
  /* Locked is dimmed, not struck through: most of the course is locked at
     the start, and 53 struck-through lines read as a wall of "no". */
  .tree-row[data-lock='locked'] {
    color: var(--text-faint);
  }
  .tree-row.is-current {
    border-inline-start-color: var(--accent);
    background: var(--accent-quiet);
    color: var(--text);
    font-weight: 560;
  }
  .tree-label {
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  .tree-flag {
    color: var(--text-faint);
    font-size: var(--step--1);
  }
</style>
