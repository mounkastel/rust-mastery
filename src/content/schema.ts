import * as v from 'valibot';

/**
 * Content schema. The TypeScript types are inferred from these validators so
 * a malformed curriculum entry fails `npm test` rather than a learner.
 */
const optionIdSchema = v.picklist(['a', 'b', 'c', 'd']);

const optionSchema = v.object({
  id: optionIdSchema,
  text: v.string(),
});

const questionBase = {
  id: v.pipe(v.string(), v.regex(/^[a-z0-9-]+$/)),
  prompt: v.pipe(v.string(), v.minLength(8)),
  explain: v.pipe(v.string(), v.minLength(8)),
};

const questionSchema = v.variant('kind', [
  v.object({
    ...questionBase,
    kind: v.literal('choice'),
    options: v.pipe(v.array(optionSchema), v.minLength(2), v.maxLength(6)),
    correct: optionIdSchema,
  }),
  v.object({
    ...questionBase,
    kind: v.picklist(['predict', 'bug', 'recite']),
  }),
  v.object({
    ...questionBase,
    kind: v.literal('recite'),
    checklist: v.pipe(v.array(v.string()), v.minLength(1)),
  }),
]);
export type Question = v.InferOutput<typeof questionSchema>;

const conceptSchema = v.object({
  id: v.pipe(v.string(), v.regex(/^[a-z0-9-]+$/)),
  title: v.pipe(v.string(), v.minLength(3)),
  prereq: v.array(v.string()),
  difficulty: v.picklist([1, 2, 3, 4]),
  estMinutes: v.pipe(v.number(), v.integer(), v.minValue(5), v.maxValue(240)),
  fundamental: v.optional(v.boolean()),
  integrative: v.optional(v.boolean()),
  bonus: v.optional(v.boolean()),
  reading: v.pipe(
    v.array(v.object({ num: v.string(), title: v.string(), href: v.string() })),
    v.maxLength(12),
  ),
  examples: v.array(
    v.object({
      title: v.string(),
      href: v.string(),
      kind: v.picklist(['exact', 'reinforce']),
    }),
  ),
  drills: v.array(v.object({ name: v.string(), href: v.string() })),
  practice: v.optional(
    v.pipe(v.array(v.object({ id: v.string(), text: v.string() })), v.minLength(1)),
  ),
  questions: v.pipe(v.array(questionSchema), v.minLength(1)),
});
export type Concept = v.InferOutput<typeof conceptSchema>;

const chapterSchema = v.object({
  key: v.string(),
  num: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1))),
  title: v.string(),
  integrative: v.boolean(),
  concepts: v.pipe(v.array(conceptSchema), v.minLength(1)),
});
export type Chapter = v.InferOutput<typeof chapterSchema>;

export const curriculumSchema = v.object({
  title: v.string(),
  tagline: v.string(),
  method: v.array(v.object({ verb: v.string(), gloss: v.string() })),
  chapters: v.pipe(v.array(chapterSchema), v.minLength(1)),
});
