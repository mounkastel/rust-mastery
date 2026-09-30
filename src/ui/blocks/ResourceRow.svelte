<script lang="ts">
  import { isExternal, withBase } from '../../lib/app/paths';

  interface Props {
    label: string;
    /** Omitted for a task with no page to open, such as a DIY exercise. */
    href?: string;
    meta?: string;
    note?: string;
    checked?: boolean;
    oncheck?: (value: boolean) => void;
  }
  const { label, href, meta = '', note = '', checked = false, oncheck }: Props = $props();

  const inputId = $derived(
    `res-${[label, href ?? '']
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`,
  );
  /** Content may point at a vendored file or at an external doc page. */
  const url = $derived(href === undefined ? null : isExternal(href) ? href : withBase(href));
</script>

<div class="res">
  <div class="res-main">
    {#if oncheck !== undefined}
      <input
        type="checkbox"
        id={inputId}
        {checked}
        onchange={(e) => {
          oncheck(e.currentTarget.checked);
        }}
      />
    {/if}
    <label
      class="res-label"
      class:mono={meta === 'code'}
      class:clickable={oncheck !== undefined}
      for={inputId}
    >
      {#if meta !== '' && meta !== 'code'}<span class="res-meta">{meta}</span>{/if}
      {label}
    </label>
  </div>
  <div class="res-side">
    {#if note !== ''}<span class="res-note">{note}</span>{/if}
    {#if url !== null}
      <a class="link" href={url} target="_blank" rel="noopener noreferrer">
        Open<span class="visually-hidden"> {label} in a new tab</span>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M6 3h7v7M13 3 6.5 9.5M11 9.5V13H3V5h3.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </a>
    {/if}
  </div>
</div>

<style>
  .res {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: baseline;
    justify-content: space-between;
    padding-block: var(--space-2);
    border-block-end: 1px solid var(--edge);
  }
  .res:last-child {
    border-block-end: 0;
  }
  .res-main {
    display: flex;
    gap: var(--space-3);
    align-items: baseline;
    min-inline-size: 0;
  }
  .res-main input {
    inline-size: 1rem;
    block-size: 1rem;
    accent-color: var(--accent);
    align-self: center;
    flex: none;
  }
  .res-label {
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  /* Only a label with a checkbox to drive is a control. */
  .res-label.clickable {
    cursor: pointer;
  }
  .res-label.mono {
    font-family: var(--mono);
    font-size: var(--step--1);
  }
  .res-meta {
    display: inline-block;
    min-inline-size: 2.6em;
    margin-inline-end: var(--space-2);
    color: var(--text-faint);
    font-family: var(--mono);
    font-size: var(--step--1);
  }
  /* The note and the link are allowed to stack: a long command next to a link
     is wider than a 360px viewport. */
  .res-side {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: baseline;
    min-inline-size: 0;
  }
  .res-note {
    color: var(--text-faint);
    font-size: var(--step--1);
    font-family: var(--mono);
  }
  .link {
    display: inline-flex;
    gap: 0.25em;
    align-items: center;
    white-space: nowrap;
  }
</style>
