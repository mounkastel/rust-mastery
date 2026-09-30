import { mount } from 'svelte';

import App from './App.svelte';
import { CourseStore, defaultDeps } from './lib/app/store.svelte';
import './styles/base.css';

const target = document.getElementById('app');
if (target === null) throw new Error('#app is missing from index.html');

mount(App, { target, props: { store: new CourseStore(defaultDeps()) } });
