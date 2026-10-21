/** Everything stored locally about how Harry is doing. Lives in IndexedDB. */

/** Red / amber / green, derived from mastery score. */
export type Rag = 'red' | 'amber' | 'green'

export interface MasteryRecord {
  /** Spec point id. */
  id: string
  subjectId: string
  /** 0-1. Blend of accuracy, recency and self-rated confidence. */
  score: number
  /** Self-rating 0-5, set on the topic page. Null until Harry rates it. */
  confidence: number | null
  marksEarned: number
  marksAvailable: number
  attempts: number
  /** ISO timestamps. */
  firstSeen: string | null
  lastSeen: string | null
  /** Set when the school has taught it, so untaught content isn't scored as weak. */
  taught: boolean
}

/** SM-2 scheduling state for one flashcard. */
export interface SrCard {
  cardId: string
  subjectId: string
  /** SM-2 ease factor, floor 1.3. */
  ease: number
  /** Days until next review. */
  interval: number
  repetitions: number
  lapses: number
  /** ISO date (YYYY-MM-DD) the card is next due. */
  due: string
  lastReviewed: string | null
  /** True until the card has graduated out of the learning steps. */
  learning: boolean
}

/** Quality of a spaced-repetition recall, SM-2 scale. */
export type RecallGrade = 0 | 1 | 2 | 3 | 4 | 5

export interface Attempt {
  id: string
  questionId: string
  subjectId: string
  specPointIds: string[]
  /** ISO timestamp. */
  at: string
  /** What Harry entered — option ids, text, or ordered items. */
  response: string
  marksEarned: number
  marksAvailable: number
  /** How the marks were decided. */
  markedBy: 'auto' | 'self' | 'ai'
  secondsTaken: number
  /** Set when the attempt was part of a timed paper. */
  sessionId?: string
}

export type SessionKind = 'learn' | 'flashcards' | 'quiz' | 'paper' | 'review'

export interface StudySession {
  id: string
  subjectId: string
  kind: SessionKind
  startedAt: string
  endedAt: string | null
  /** Active seconds, excluding pauses. */
  seconds: number
  specPointIds: string[]
  marksEarned: number
  marksAvailable: number
  xpEarned: number
}

/** One block of planned work on one day. */
export interface PlanSlot {
  id: string
  subjectId: string
  /** What the planner wants done: revise a topic, clear the SR queue, sit a paper. */
  kind: SessionKind
  minutes: number
  /** Spec topic ids to cover, chosen by the planner from mastery gaps. */
  topicIds: string[]
  label: string
  done: boolean
  /** True when carried over from a missed day. */
  rescheduled: boolean
  /** True when placed above the day's normal capacity. */
  overflow: boolean
}

export interface PlanDay {
  /** ISO date, YYYY-MM-DD. */
  date: string
  capacityMinutes: number
  slots: PlanSlot[]
  /** Set once the rescheduler has processed this day. */
  reconciled: boolean
}

export interface Streak {
  current: number
  longest: number
  /** ISO date of the last day with any completed slot. */
  lastActiveDate: string | null
  /** Dates where a "freeze" was spent to protect the streak. */
  freezesUsed: string[]
  freezesAvailable: number
}

export interface Badge {
  id: string
  earnedAt: string
  /** Progress toward a badge not yet earned, 0-1. */
  progress?: number
}

export interface Profile {
  name: string
  yearGroup: number
  /** ISO date the GCSE exam period starts. */
  examStart: string
  xp: number
  level: number
  streak: Streak
  badges: Badge[]
  /** Target grade per subject id. */
  targets: Record<string, number>
}

export interface Settings {
  /** Minutes of study the planner aims for, by weekday index (0 = Sunday). */
  weeklyCapacity: number[]
  pomodoroMinutes: number
  breakMinutes: number
  soundEnabled: boolean
  /** How the AI features reach Claude. */
  ai: {
    mode: 'off' | 'proxy' | 'direct'
    /** Worker URL for `proxy` mode. */
    proxyUrl: string
    /** Only used in `direct` mode, stored locally, never bundled. */
    apiKey: string
    model: string
    /** Soft cap so the monthly cost target holds. */
    monthlyRequestCap: number
  }
}
