<script lang="ts">
  import { LOCK_WORD } from './lock-label';
  import type { NavRow } from './nav-row';

  interface Props {
    row: NavRow;
  }
  const { row }: Props = $props();
</script>

<span class="dot" data-lock={row.lock} data-next={row.isNext}>
  <span class="visually-hidden">{LOCK_WORD[row.lock]}</span>
</span>

<style>
  .dot {
    display: inline-block;
    inline-size: 0.6rem;
    block-size: 0.6rem;
    border-radius: 50%;
    border: 1.5px solid var(--edge-strong);
    align-self: center;
  }
  .dot[data-lock='locked'] {
    border-color: var(--edge);
    background: transparent;
  }
  .dot[data-lock='available'] {
    border-color: var(--edge-strong);
    background: transparent;
  }
  .dot[data-next='true'] {
    border-color: var(--accent);
    background: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-quiet);
  }
  .dot[data-lock='started'] {
    border-color: var(--warn);
    background: var(--warn);
  }
  .dot[data-lock='passed'] {
    border-color: var(--ok);
    background: var(--ok);
  }
  .dot[data-lock='revisit'] {
    border-color: var(--bad);
    background: var(--bad);
  }
</style>
