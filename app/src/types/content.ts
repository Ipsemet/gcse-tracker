/** Learning and assessment content. Everything here attaches to spec point ids. */

export type ResourceKind =
  | 'video' | 'article' | 'interactive' | 'practice' | 'past-paper'
  | 'revision-guide' | 'quizlet' | 'app' | 'reference'

export interface Resource {
  id: string
  title: string
  /** One line on what it actually gives you. */
  description: string
  url: string
  provider: string
  kind: ResourceKind
  /** Roughly how long it takes to work through. */
  minutes?: number
  /**
   * URL has been opened and confirmed to be the page it claims to be.
   * Unverified links are shown with a caution marker, never as curated.
   * (BBC Bitesize deep links in particular cannot be verified programmatically.)
   */
  verified: boolean
  free: boolean
}

export interface KeyTerm {
  term: string
  definition: string
  /** Where precision matters, the wording that actually earns the mark. */
  examWording?: string
}

export type ContentBlock =
  | { type: 'prose'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'code'; language: string; code: string; caption?: string }
  | { type: 'callout'; variant: 'tip' | 'warning' | 'exam' | 'note'; title?: string; text: string }
  | { type: 'steps'; title?: string; steps: { title: string; text: string }[] }
  | { type: 'worked-example'; question: string; steps: string[]; answer: string }
  | { type: 'diagram'; svg: string; caption?: string }

export interface ContentSection {
  id: string
  title: string
  /** Spec points this section teaches. */
  specPointIds: string[]
  blocks: ContentBlock[]
}

/** The teaching notes for one spec topic (e.g. 1.1.1 Architecture of the CPU). */
export interface TopicNote {
  topicId: string
  subjectId: string
  title: string
  /** Two or three sentences: what this topic is and why it is examined. */
  summary: string
  estimatedMinutes: number
  sections: ContentSection[]
  keyTerms: KeyTerm[]
  examTips: string[]
  commonMistakes: string[]
  resources: Resource[]
}

export type FlashcardKind = 'definition' | 'recall' | 'calculation' | 'code' | 'compare' | 'list'

export interface Flashcard {
  id: string
  subjectId: string
  specPointIds: string[]
  kind: FlashcardKind
  front: string
  back: string
  hint?: string
  /** For `list` cards: the individual items, so partial recall can be scored. */
  items?: string[]
}

export type QuestionType =
  | 'mcq'          // single correct option
  | 'multi'        // several correct options
  | 'short'        // one or two marks, free text
  | 'extended'     // 6+ marks, levels-based mark scheme
  | 'calculation'  // numeric answer plus working
  | 'code'         // write or complete a program
  | 'trace'        // predict the output of given code
  | 'match'        // pair items across two columns
  | 'order'        // put steps into sequence

/** GCSE command words drive how an answer is marked. Training these is worth marks. */
export type CommandWord =
  | 'State' | 'Identify' | 'Give' | 'Name' | 'Define' | 'Describe' | 'Explain'
  | 'Compare' | 'Discuss' | 'Evaluate' | 'Justify' | 'Analyse' | 'Calculate'
  | 'Complete' | 'Draw' | 'Write' | 'Refine' | 'Suggest'

export interface MCQOption {
  id: string
  text: string
  correct: boolean
  /** Why this distractor is wrong — shown after answering. */
  why?: string
}

export interface MarkSchemePoint {
  text: string
  marks: number
  /** Alternative wordings that also earn this mark. */
  alternatives?: string[]
}

/** For extended answers marked in bands rather than points. */
export interface MarkSchemeLevel {
  level: number
  marksFrom: number
  marksTo: number
  descriptor: string
  indicativeContent?: string[]
}

export interface Question {
  id: string
  subjectId: string
  specPointIds: string[]
  /** Paper code this style of question belongs to. */
  paper?: string
  type: QuestionType
  commandWord?: CommandWord
  marks: number
  difficulty: 1 | 2 | 3
  /** Scenario or preamble shared by the question. */
  context?: string
  stem: string
  /** Starter code, data table or figure the question refers to. */
  figure?: { type: 'code'; language: string; code: string } | { type: 'table'; headers: string[]; rows: string[][] }
  options?: MCQOption[]
  /** Pairs for `match`, ordered steps for `order`. */
  pairs?: { left: string; right: string }[]
  sequence?: string[]
  /** Model answer shown after attempting. */
  modelAnswer?: string
  markScheme?: MarkSchemePoint[]
  levels?: MarkSchemeLevel[]
  /** Exact strings auto-marked as correct for short/calculation answers. */
  acceptableAnswers?: string[]
  examinerNote?: string
  source: 'authored' | 'board-sample' | 'past-paper'
  /** Where a past-paper question is referenced rather than reproduced. */
  sourceRef?: string
}

/** A fixed set of questions assembled as a full exam-style paper. */
export interface PracticePaper {
  id: string
  subjectId: string
  title: string
  paper: string
  durationMins: number
  totalMarks: number
  questionIds: string[]
  gradeBoundaries?: Record<string, number>
}
