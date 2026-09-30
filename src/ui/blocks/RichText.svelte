<script lang="ts">
  import type { Step } from '../../lib/domain/richtext';
  import { hasArrow, prose, segments } from '../../lib/domain/richtext';

  type Block =
    | { kind: 'code'; value: string }
    | { kind: 'output'; value: string[] }
    | { kind: 'checklist'; value: string[] }
    | { kind: 'steps'; value: Step[]; start: number }
    | { kind: 'prose'; value: string; lead: boolean };

  interface Props {
    text: string;
    /** Renders the first prose block at heading weight. */
    lead?: boolean;
  }
  const { text, lead = false }: Props = $props();

  /**
   * The lead class goes on the first prose block in the whole string, not the
   * first block, so a code sample opening the prompt does not consume it. Step
   * numbering runs across the string for the same reason.
   */
  const blocks = $derived.by((): Block[] => {
    const out: Block[] = [];
    let leadPending = lead;
    let stepNo = 0;
    for (const segment of segments(text)) {
      if (segment.kind !== 'text') {
        out.push(segment);
        continue;
      }
      if (hasArrow(segment.value)) {
        for (const run of prose(segment.value).runs) {
          out.push({ kind: 'steps', value: run, start: stepNo + 1 });
          stepNo += run.length;
        }
      } else {
        out.push({ kind: 'prose', value: segment.value, lead: leadPending });
        leadPending = false;
      }
    }
    return out;
  });

  /**
   * Splits on `code` spans so they render as elements rather than as injected
   * markup. Everything reaches the DOM as a text node, so curator text cannot
   * introduce HTML no matter what it contains.
   */
  function parts(raw: string): { text: string; code: boolean }[] {
    return raw
      .split(/(`[^`\n]+`)/)
      .filter((piece) => piece !== '')
      .map((piece) =>
        piece.startsWith('`') && piece.endsWith('`')
          ? { text: piece.slice(1, -1), code: true }
          : { text: piece, code: false },
      );
  }

  const INLINE_CODE = /`[^`\n]+`/;
  const hasInlineCode = (raw: string): boolean => INLINE_CODE.test(raw);
</script>

{#snippet inlineCode(pieces: { text: string; code: boolean }[])}
  {#each pieces as piece, j (j)}{#if piece.code}<code>{piece.text}</code
      >{:else}{piece.text}{/if}{/each}
{/snippet}

<div class="rich">
  {#each blocks as block, i (i)}
    {#if block.kind === 'code'}
      <pre class="code"><code>{block.value}</code></pre>
    {:else if block.kind === 'output'}
      <figure class="term" aria-label="Console output">
        <figcaption>Console output</figcaption>
        <pre>{block.value.join('\n')}</pre>
      </figure>
    {:else if block.kind === 'checklist'}
      <ul class="checklist">
        {#each block.value as item (item)}
          <li>{@render inlineCode(parts(item))}</li>
        {/each}
      </ul>
    {:else if block.kind === 'steps'}
      <ol class="steps" start={block.start}>
        {#each block.value as step (step.cause + step.effect)}
          <li>
            <span class="cause">{@render inlineCode(parts(step.cause))}</span>
            <span class="arrow" aria-hidden="true">→</span>
            <span class="effect">{@render inlineCode(parts(step.effect))}</span>
          </li>
        {/each}
      </ol>
    {:else}
      <p class="prose" class:lead={block.lead}>
        {#if hasInlineCode(block.value)}
          {@render inlineCode(parts(block.value))}
        {:else}{block.value}{/if}
      </p>
    {/if}
  {/each}
</div>

<style>
  .code {
    min-inline-size: 0;
    max-inline-size: 100%;
    margin: 0 0 var(--space-3);
    padding: var(--space-3);
    overflow-x: auto;
    border: 1px solid var(--code-edge);
    border-radius: var(--radius-2);
    background: var(--code-bg);
    font-size: var(--step--1);
    line-height: 1.55;
    tab-size: 4;
  }
  .term {
    max-inline-size: 100%;
    margin: 0 0 var(--space-3);
    border: 1px solid var(--terminal-edge);
    border-radius: var(--radius-2);
    background: var(--terminal-bg);
    overflow: hidden;
  }
  .term figcaption {
    padding: var(--space-1) var(--space-3);
    border-block-end: 1px solid var(--terminal-edge);
    color: #8b909b;
    font-size: var(--step--1);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .term pre {
    margin: 0;
    padding: var(--space-3);
    color: var(--terminal-fg);
    font-family: var(--mono);
    font-size: var(--step--1);
    line-height: 1.6;
    overflow-x: auto;
  }
  .prose {
    max-inline-size: var(--measure);
    margin: 0 0 var(--space-3);
  }
  .prose.lead {
    font-size: var(--step-1);
    line-height: 1.55;
  }
  .steps {
    max-inline-size: var(--measure);
    margin: 0 0 var(--space-3);
    padding-inline-start: 1.4em;
  }
  .steps li {
    margin-block-end: var(--space-2);
  }
  .cause {
    font-weight: 560;
  }
  .arrow {
    padding-inline: 0.35em;
    color: var(--accent);
  }
  .effect {
    color: var(--text-muted);
  }
  .checklist {
    max-inline-size: var(--measure);
    margin: 0 0 var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--edge);
    border-radius: var(--radius-2);
    background: var(--bg-raised);
    list-style: none;
  }
  .checklist li {
    position: relative;
    padding-inline-start: 1.4em;
    margin-block-end: var(--space-1);
  }
  .checklist li:last-child {
    margin-block-end: 0;
  }
  .checklist li::before {
    content: '';
    position: absolute;
    inset-inline-start: 0;
    inset-block-start: 0.55em;
    inline-size: 0.7em;
    block-size: 0.7em;
    border: 1.5px solid var(--edge-strong);
    border-radius: 2px;
  }
  /* Inline `code` everywhere in this component. */
  code {
    padding: 0.1em 0.3em;
    border: 1px solid var(--code-edge);
    border-radius: var(--radius-1);
    background: var(--code-bg);
  }
</style>
