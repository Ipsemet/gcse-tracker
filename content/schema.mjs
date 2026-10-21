// Zod schemas for authored content. Used by tools/build-content.mjs at build time.
// The TypeScript mirrors of these live in app/src/types/ — keep them in step.
import { z } from '../app/node_modules/zod/index.js'

export const zSpecPoint = z.object({
  statement: z.string().min(3),
  detail: z.array(z.string()).optional(),
  tier: z.enum(['foundation', 'higher']).optional(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  keywords: z.array(z.string()).optional(),
})

export const zSpecTopic = z.object({
  code: z.string().regex(/^[0-9]+(\.[0-9]+)*$/),
  title: z.string().min(2),
  points: z.array(zSpecPoint).min(1),
})

export const zSpecUnit = z.object({
  code: z.string().regex(/^[0-9]+(\.[0-9]+)*$/),
  title: z.string().min(2),
  paper: z.string().optional(),
  topics: z.array(zSpecTopic).min(1),
})

export const zPaper = z.object({
  code: z.string(),
  name: z.string(),
  durationMins: z.number().int().positive(),
  marks: z.number().int().positive(),
  weighting: z.number().min(0).max(1),
  calculator: z.boolean().optional(),
  covers: z.array(z.string()),
  notes: z.string().optional(),
})

export const zGradeBoundarySet = z.object({
  series: z.string(),
  estimated: z.boolean(),
  tier: z.enum(['foundation', 'higher']).optional(),
  boundaries: z.record(z.string(), z.number()),
})

export const zSubject = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  shortName: z.string(),
  board: z.enum(['OCR', 'AQA', 'Edexcel', 'WJEC', 'Eduqas', 'Cambridge Nationals']),
  specCode: z.string(),
  specTitle: z.string(),
  specUrl: z.string().url().optional(),
  tier: z.enum(['foundation', 'higher']).optional(),
  examSeries: z.string(),
  examDate: z.string().optional(),
  confidence: z.enum(['confirmed', 'provisional', 'unconfirmed']),
  confidenceNote: z.string().optional(),
  colour: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string(),
  priority: z.number().int(),
  papers: z.array(zPaper),
  units: z.array(zSpecUnit).min(1),
  gradeBoundaries: z.array(zGradeBoundarySet).optional(),
  examNotes: z.array(z.string()).optional(),
})

export const zResource = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string().url(),
  provider: z.string(),
  kind: z.enum(['video', 'article', 'interactive', 'practice', 'past-paper', 'revision-guide', 'quizlet', 'app', 'reference']),
  minutes: z.number().int().positive().optional(),
  verified: z.boolean(),
  free: z.boolean(),
})

const zContentBlock = z.discriminatedUnion('type', [
  z.object({ type: z.literal('prose'), text: z.string() }),
  z.object({ type: z.literal('list'), ordered: z.boolean().optional(), items: z.array(z.string()) }),
  z.object({ type: z.literal('table'), headers: z.array(z.string()), rows: z.array(z.array(z.string())) }),
  z.object({ type: z.literal('code'), language: z.string(), code: z.string(), caption: z.string().optional() }),
  z.object({ type: z.literal('callout'), variant: z.enum(['tip', 'warning', 'exam', 'note']), title: z.string().optional(), text: z.string() }),
  z.object({ type: z.literal('steps'), title: z.string().optional(), steps: z.array(z.object({ title: z.string(), text: z.string() })) }),
  z.object({ type: z.literal('worked-example'), question: z.string(), steps: z.array(z.string()), answer: z.string() }),
  z.object({ type: z.literal('diagram'), svg: z.string(), caption: z.string().optional() }),
])

export const zTopicNote = z.object({
  topicCode: z.string(),
  title: z.string(),
  summary: z.string(),
  estimatedMinutes: z.number().int().positive(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    points: z.array(z.string()).default([]),
    blocks: z.array(zContentBlock),
  })),
  keyTerms: z.array(z.object({
    term: z.string(),
    definition: z.string(),
    examWording: z.string().optional(),
  })).default([]),
  examTips: z.array(z.string()).default([]),
  commonMistakes: z.array(z.string()).default([]),
  resources: z.array(zResource).default([]),
})

export const zFlashcard = z.object({
  id: z.string(),
  points: z.array(z.string()).min(1),
  kind: z.enum(['definition', 'recall', 'calculation', 'code', 'compare', 'list']),
  front: z.string(),
  back: z.string(),
  hint: z.string().optional(),
  items: z.array(z.string()).optional(),
})

const zMarkSchemePoint = z.object({
  text: z.string(),
  marks: z.number().int().positive(),
  alternatives: z.array(z.string()).optional(),
})

const zMarkSchemeLevel = z.object({
  level: z.number().int().positive(),
  marksFrom: z.number().int().nonnegative(),
  marksTo: z.number().int().positive(),
  descriptor: z.string(),
  indicativeContent: z.array(z.string()).optional(),
})

export const zQuestion = z.object({
  id: z.string(),
  points: z.array(z.string()).min(1),
  paper: z.string().optional(),
  type: z.enum(['mcq', 'multi', 'short', 'extended', 'calculation', 'code', 'trace', 'match', 'order']),
  commandWord: z.string().optional(),
  marks: z.number().int().positive(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  context: z.string().optional(),
  stem: z.string(),
  figure: z.union([
    z.object({ type: z.literal('code'), language: z.string(), code: z.string() }),
    z.object({ type: z.literal('table'), headers: z.array(z.string()), rows: z.array(z.array(z.string())) }),
  ]).optional(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    correct: z.boolean(),
    why: z.string().optional(),
  })).optional(),
  pairs: z.array(z.object({ left: z.string(), right: z.string() })).optional(),
  sequence: z.array(z.string()).optional(),
  modelAnswer: z.string().optional(),
  markScheme: z.array(zMarkSchemePoint).optional(),
  levels: z.array(zMarkSchemeLevel).optional(),
  acceptableAnswers: z.array(z.string()).optional(),
  examinerNote: z.string().optional(),
  source: z.enum(['authored', 'board-sample', 'past-paper']),
  sourceRef: z.string().optional(),
})
