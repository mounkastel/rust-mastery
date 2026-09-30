<script lang="ts">
  import { onMount } from 'svelte';

  import { conceptById, curriculum } from './content';
  import type { CourseStore } from './lib/app/store.svelte';
  import { parse, type Route } from './lib/app/router';
  import type { Progress } from './lib/domain/state';
  import DataPanel from './ui/shell/DataPanel.svelte';
  import Course from './ui/views/Course.svelte';
  import Dashboard from './ui/views/Dashboard.svelte';
  import Lesson from './ui/views/Lesson.svelte';
  import Review from './ui/views/Review.svelte';
  import Search from './ui/views/Search.svelte';
  import type { NavRow } from './ui/shell/nav-row';
  import NavTree from './ui/shell/NavTree.svelte';

  interface Props {
    store: CourseStore;
  }
  const { store }: Props = $props();

  let navOpen = $state(false);
  let route = $state<Route>(parse(typeof location === 'undefined' ? '' : location.hash));

  onMount(() => {
    const onhash = (): void => {
      route = parse(location.hash);
    };
    addEventListener('hashchange', onhash);
    return () => {
      removeEventListener('hashchange', onhash);
    };
  });

  // Reflect the resolved choice on <html> so the token set applies before the
  // first paint. `system` is expressed by removing the attribute, which lets
  // the prefers-color-scheme block in tokens.css take over.
  $effect(() => {
    if (store.progress.theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset['theme'] = store.progress.theme;
  });

  const navRows = $derived.by((): NavRow[] =>
    store.views().map((view) => ({
      id: view.concept.id,
      title: view.concept.title,
      lock: view.lock,
      isNext: view.isNext,
      isLong: view.concept.estMinutes >= 45,
    })),
  );
  const dueCount = $derived(store.dueToday().length);
  const currentLessonId = $derived(route.name === 'lesson' ? route.id : '');
  const lessonConcept = $derived(
    route.name === 'lesson' ? (conceptById.get(route.id) ?? null) : null,
  );

  const THEME_WORD = { system: 'Match system', light: 'Light', dark: 'Dark' } as const;

  function cycleTheme(current: Progress['theme']): Progress['theme'] {
    return current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
  }

  const SHORTCUTS: Record<string, string> = {
    g: '#/',
    c: '#/course',
    r: '#/review',
    '/': '#/search?q=',
  };

  function onkeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const inField =
      event.target instanceof HTMLElement &&
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
    if (inField) return;
    if (navOpen && event.key === 'Escape') {
      navOpen = false;
      document.querySelector<HTMLButtonElement>('.nav-toggle')?.focus();
      return;
    }
    const target = SHORTCUTS[event.key];
    if (target === undefined) return;
    event.preventDefault();
    location.hash = target;
  }
</script>

<svelte:window {onkeydown} />

<a class="skip" href="#main">Skip to content</a>

<header class="bar">
  <button
    type="button"
    class="nav-toggle"
    aria-expanded={navOpen}
    aria-controls="nav"
    onclick={() => {
      navOpen = !navOpen;
    }}
  >
    <span aria-hidden="true">{navOpen ? '✕' : '☰'}</span>
    <span class="visually-hidden">Lessons menu</span>
  </button>
  <a class="brand" href="#/">
    <span class="mark" aria-hidden="true">R</span>
    <span class="title">{curriculum.title}</span>
  </a>
  <nav class="top" aria-label="Main">
    <a href="#/course" aria-current={route.name === 'course' ? 'page' : undefined}>Course</a>
    <a href="#/review" aria-current={route.name === 'review' ? 'page' : undefined}>
      Review{#if dueCount > 0}<span class="pip">{dueCount}</span>{/if}
    </a>
    <a href="#/search?q=" aria-current={route.name === 'search' ? 'page' : undefined}>Search</a>
  </nav>
  <button
    type="button"
    class="theme"
    onclick={() => {
      store.setTheme(cycleTheme(store.progress.theme));
    }}
  >
    {THEME_WORD[store.progress.theme]}
  </button>
</header>

<div class="shell" class:nav-open={navOpen}>
  <nav id="nav" class="nav" aria-label="Lessons">
    <NavTree label="Sequence" rows={navRows} currentId={currentLessonId} />
    <DataPanel {store} />
  </nav>
  {#if navOpen}
    <button
      type="button"
      class="scrim"
      aria-label="Close menu"
      onclick={() => {
        navOpen = false;
      }}
    ></button>
  {/if}

  <main id="main" class="main" tabindex="-1">
    {#if route.name === 'lesson'}
      {#if lessonConcept === null}
        <h1>Lesson not found</h1>
        <p>That address does not match a lesson. <a href="#/course">Back to the sequence</a>.</p>
      {:else}
        <Lesson {store} concept={lessonConcept} />
      {/if}
    {:else if route.name === 'course'}
      <Course {store} />
    {:else if route.name === 'review'}
      <Review {store} />
    {:else if route.name === 'search'}
      <Search {store} query={route.query} />
    {:else}
      <Dashboard {store} />
    {/if}
  </main>
</div>

<style>
  .bar {
    /* The bar holds a brand, three links, a theme button and, on narrow
       screens, a menu button. It wraps rather than widening the page. */
    position: sticky;
    inset-block-start: 0;
    z-index: 10;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: center;
    min-block-size: var(--bar-height);
    padding: var(--space-2) var(--space-4);
    row-gap: var(--space-1);
    border-block-end: 1px solid var(--edge);
    background: var(--bg-nav);
  }
  .brand {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    margin-inline-end: auto;
    color: var(--text);
    font-weight: 620;
    text-decoration: none;
  }
  .mark {
    display: grid;
    place-items: center;
    inline-size: 1.5rem;
    block-size: 1.5rem;
    border-radius: var(--radius-1);
    background: var(--accent);
    color: var(--accent-ink);
    font-weight: 700;
  }
  .top {
    display: flex;
    gap: var(--space-1);
  }
  .top a {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-2);
    color: var(--text-muted);
    text-decoration: none;
  }
  .top a:hover {
    background: var(--bg-sunken);
    color: var(--text);
  }
  .top a[aria-current='page'] {
    background: var(--accent-quiet);
    color: var(--accent);
    font-weight: 580;
  }
  .pip {
    display: inline-block;
    min-inline-size: 1.25em;
    margin-inline-start: 0.35em;
    padding-inline: 0.3em;
    border-radius: 999px;
    background: var(--accent);
    color: var(--accent-ink);
    font-size: var(--step--1);
    font-variant-numeric: tabular-nums;
    text-align: center;
  }
  .nav-toggle,
  .theme {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--edge);
    border-radius: var(--radius-2);
    background: var(--bg-raised);
    cursor: pointer;
  }
  .nav-toggle {
    display: none;
  }
  .shell {
    display: grid;
    grid-template-columns: var(--nav-width) 1fr;
    align-items: start;
  }
  .nav {
    position: sticky;
    inset-block-start: var(--bar-height);
    max-block-size: calc(100vh - var(--bar-height));
    padding-block-end: var(--space-4);
    border-inline-end: 1px solid var(--edge);
    background: var(--bg-nav);
    overflow-y: auto;
  }
  .main {
    min-inline-size: 0;
    padding: var(--space-5) var(--space-5) var(--space-7);
  }
  /* Focus moves here from the skip link, so it should not draw a ring itself. */
  .main:focus {
    outline: none;
  }
  .scrim {
    display: none;
  }
  @media (max-width: 52rem) {
    .nav-toggle {
      display: block;
    }
    .title {
      display: none;
    }
    .shell {
      grid-template-columns: 1fr;
    }
    .nav {
      position: fixed;
      inset-block: var(--bar-height) 0;
      inset-inline-start: 0;
      inline-size: min(20rem, 85vw);
      z-index: 9;
      transform: translateX(-101%);
      transition: transform 160ms ease;
    }
    .nav-open .nav {
      transform: none;
      box-shadow: var(--shadow-2);
    }
    .scrim {
      display: block;
      position: fixed;
      inset: var(--bar-height) 0 0;
      z-index: 8;
      border: 0;
      background: rgb(0 0 0 / 40%);
    }
    .main {
      padding: var(--space-4) var(--space-4) var(--space-7);
    }
  }
  @media (max-width: 26rem) {
    .top a {
      padding-inline: var(--space-2);
      font-size: var(--step--1);
    }
  }
</style>
