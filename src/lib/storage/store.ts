import * as v from 'valibot';

import { emptyProgress, type Progress } from '../domain/state';
import { storageKeys, progressSchema, EXPORT_SCHEMA_VERSION } from './schema';

/**
 * localStorage is not available in every context: Safari private mode throws on
 * write, and some embedded webviews have no localStorage at all. Every access
 * goes through here so a failure degrades to an in-memory session instead of
 * taking down the app.
 */
export interface Store {
  read(): string | null;
  write(value: string): void;
  remove(): void;
}

export function memoryStore(): Store {
  let value: string | null = null;
  return {
    read: () => value,
    write: (v) => {
      value = v;
    },
    remove: () => {
      value = null;
    },
  };
}

function probe(storage: Storage): boolean {
  const probeKey = '__rust_mastery_probe__';
  try {
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function browserStore(): Store {
  let backing: Storage | null = null;
  try {
    if (typeof localStorage !== 'undefined' && probe(localStorage)) backing = localStorage;
  } catch {
    backing = null;
  }
  if (backing === null) return memoryStore();
  return {
    read: () => {
      try {
        return backing.getItem(storageKeys.progress);
      } catch {
        return null;
      }
    },
    write: (value) => {
      try {
        backing.setItem(storageKeys.progress, value);
      } catch {
        // Quota exceeded or storage revoked mid-session. The session continues
        // in memory; the next successful write will persist.
      }
    },
    remove: () => {
      try {
        backing.removeItem(storageKeys.progress);
      } catch {
        // Nothing to do: a failed delete leaves stale data, not a broken app.
      }
    },
  };
}

/**
 * Reads and validates. Anything unparseable, of a different version, or
 * structurally wrong yields a fresh course rather than a partial one.
 */
export function loadProgress(store: Store): Progress {
  const raw = store.read();
  if (raw === null) return emptyProgress();
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return emptyProgress();
  }
  const parsed = v.safeParse(progressSchema, json);
  return parsed.success ? parsed.output : emptyProgress();
}

export function saveProgress(store: Store, progress: Progress): void {
  store.write(JSON.stringify(progress));
}

export function resetProgress(store: Store): Progress {
  store.remove();
  return emptyProgress();
}

interface ProgressFile {
  app: 'rust-mastery';
  version: number;
  savedAt: number;
  progress: Progress;
}

export function exportProgress(progress: Progress, savedAt: number): string {
  const file: ProgressFile = {
    app: 'rust-mastery',
    version: EXPORT_SCHEMA_VERSION,
    savedAt,
    progress,
  };
  return JSON.stringify(file, null, 2);
}

type ImportResult = { ok: true; progress: Progress } | { ok: false; reason: string };

export function importProgress(text: string): ImportResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'That file is not valid JSON.' };
  }
  if (typeof json !== 'object' || json === null) {
    return { ok: false, reason: 'That file does not contain progress data.' };
  }
  const file = json as Record<string, unknown>;
  if (file['app'] !== 'rust-mastery') {
    return { ok: false, reason: 'That file was not exported from Rust Mastery.' };
  }
  if (file['version'] !== EXPORT_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: `That file is version ${String(file['version'])}; this site reads version ${EXPORT_SCHEMA_VERSION}.`,
    };
  }
  const parsed = v.safeParse(progressSchema, file['progress']);
  if (!parsed.success) {
    return { ok: false, reason: 'That file is damaged or was edited by hand.' };
  }
  return { ok: true, progress: parsed.output };
}
