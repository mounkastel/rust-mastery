import * as v from 'valibot';

const statusSchema = v.picklist(['not-started', 'in-progress', 'passed', 'revisit']);

const reviewSchema = v.object({
  dueDay: v.pipe(v.number(), v.integer(), v.minValue(0)),
  intervalDays: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(365)),
  streak: v.pipe(v.number(), v.integer(), v.minValue(0)),
  lapses: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

const boolMapSchema = v.record(v.string(), v.boolean());

const lessonSchema = v.object({
  status: statusSchema,
  examples: boolMapSchema,
  drills: boolMapSchema,
  practice: boolMapSchema,
  attempts: v.pipe(v.number(), v.integer(), v.minValue(0)),
  passed: v.boolean(),
  review: v.nullable(reviewSchema),
  correct: v.array(v.string()),
  firstPassedDay: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0))),
});

/**
 * The version is part of the key *and* the payload. A payload that fails
 * validation is discarded rather than repaired field by field: a partially
 * understood schedule would silently reschedule cards the learner already
 * graduated. Version 2 (the pre-rewrite format) is dropped, not migrated.
 */
export const progressSchema = v.object({
  version: v.literal(3),
  lessons: v.record(v.string(), lessonSchema),
  lastRecalledDay: v.record(v.string(), v.pipe(v.number(), v.integer(), v.minValue(0))),
  lastLessonId: v.nullable(v.string()),
  theme: v.picklist(['light', 'dark', 'system']),
});

export const EXPORT_SCHEMA_VERSION = 3 as const;
const STORAGE_KEY = `rust-mastery:v${EXPORT_SCHEMA_VERSION}`;
/** Written by the pre-rewrite app. Left on disk untouched; never read. */
const LEGACY_STORAGE_KEY = 'rust-mastery-course-v2';

/** Keys this build owns, plus the pre-rewrite key it deliberately ignores. */
export const storageKeys = {
  progress: STORAGE_KEY,
  legacyProgress: LEGACY_STORAGE_KEY,
} as const;
