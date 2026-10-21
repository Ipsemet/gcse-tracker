/**
 * The spec spine.
 *
 * Every subject is decomposed into the exam board's OWN numbered structure:
 *   Subject -> SpecUnit (1.1) -> SpecTopic (1.1.1) -> SpecPoint (1.1.1a)
 *
 * A SpecPoint is the atomic assessable statement. All content (notes, flashcards,
 * questions, resources) and all progress (mastery, spaced repetition) key off
 * SpecPoint ids. Nothing in this app invents its own topic names.
 */

export type ExamBoard = 'OCR' | 'AQA' | 'Edexcel' | 'WJEC' | 'Eduqas' | 'Cambridge Nationals'

/**
 * How much we trust this spec data.
 * - `confirmed`   verified against the official specification document
 * - `provisional` structure believed correct, awaiting sight of the official PDF
 * - `unconfirmed` board itself not yet confirmed by the school
 *
 * Provisional/unconfirmed subjects are badged in the UI. This exists because the
 * previous system silently built content against a guessed spec and wasted the work.
 */
export type SpecConfidence = 'confirmed' | 'provisional' | 'unconfirmed'

export type Tier = 'foundation' | 'higher'

export interface SpecPoint {
  /** Globally unique, e.g. "j277.1.1.1.a" */
  id: string
  /** Board-facing code, e.g. "1.1.1a" */
  code: string
  /** The assessable statement, in the board's wording where known. */
  statement: string
  /** Extra teaching detail the board lists under the statement. */
  detail?: string[]
  /** Higher-tier only, where the subject is tiered. */
  tier?: Tier
  /** 1 = foundational, 2 = standard, 3 = stretch. Drives scheduling and question mix. */
  difficulty: 1 | 2 | 3
  /** Terms a student must be able to use precisely for this point. */
  keywords?: string[]
}

export interface SpecTopic {
  /** e.g. "j277.1.1.1" */
  id: string
  /** e.g. "1.1.1" */
  code: string
  title: string
  points: SpecPoint[]
}

export interface SpecUnit {
  /** e.g. "j277.1.1" */
  id: string
  /** e.g. "1.1" */
  code: string
  title: string
  /** Paper code this unit is assessed in, where the split is clean. */
  paper?: string
  topics: SpecTopic[]
}

export interface Paper {
  /** e.g. "J277/01" */
  code: string
  name: string
  durationMins: number
  marks: number
  /** Share of the qualification, 0-1. */
  weighting: number
  calculator?: boolean
  /** Unit codes assessed, e.g. ["1.1", "1.2"] */
  covers: string[]
  notes?: string
}

/** Marks needed for each grade, from a published or estimated boundary set. */
export interface GradeBoundarySet {
  /** e.g. "Summer 2025", or "Estimated" */
  series: string
  estimated: boolean
  tier?: Tier
  /** grade (as string, "9".."1") -> total marks required across the qualification */
  boundaries: Record<string, number>
}

export interface Subject {
  /** Short stable key, e.g. "cs" */
  id: string
  name: string
  shortName: string
  board: ExamBoard
  /** e.g. "J277" */
  specCode: string
  specTitle: string
  specUrl?: string
  tier?: Tier
  /** Exam series this qualification is sat in, e.g. "Summer 2028". */
  examSeries: string
  /** Optional hard date once the timetable is published. */
  examDate?: string
  confidence: SpecConfidence
  /** What still needs confirming, shown in the UI while confidence !== 'confirmed'. */
  confidenceNote?: string
  colour: string
  icon: string
  /** Scheduling weight: lower wins when the planner has to drop or move work. */
  priority: number
  papers: Paper[]
  units: SpecUnit[]
  gradeBoundaries?: GradeBoundarySet[]
  /** Subject-specific notes: command words, formula sheets, NEA requirements. */
  examNotes?: string[]
}

/** The lightweight index loaded on boot; full subjects are fetched on demand. */
export interface SubjectSummary {
  id: string
  name: string
  shortName: string
  board: ExamBoard
  specCode: string
  examSeries: string
  confidence: SpecConfidence
  colour: string
  icon: string
  priority: number
  specPointCount: number
}
