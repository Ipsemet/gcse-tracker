/**
 * SM-2 spaced repetition, with short learning steps at the front.
 *
 * Plain SM-2 sends a brand-new card to 1 day then 6 days, which is too coarse for
 * a card seen for the first time in a session. New and lapsed cards go through
 * in-session learning steps first and only enter the day-based schedule once
 * they have been recalled cleanly.
 */
import type { RecallGrade, SrCard } from '@/types/progress'
import { addDays, today } from '@/lib/date'

/** Minutes between the in-session learning steps. */
const LEARNING_STEPS = [1, 10]
const MIN_EASE = 1.3
const START_EASE = 2.5
/** Cap so a mature card still resurfaces before the exams. */
const MAX_INTERVAL = 180

export const newCard = (cardId: string, subjectId: string): SrCard => ({
  cardId,
  subjectId,
  ease: START_EASE,
  interval: 0,
  repetitions: 0,
  lapses: 0,
  due: today(),
  lastReviewed: null,
  learning: true,
})

/** A grade of 3 or better counts as successful recall. */
export const isPass = (grade: RecallGrade): boolean => grade >= 3

/**
 * Apply a review. Returns the updated card plus, for cards still in learning,
 * how many minutes until it should come back round in this same session.
 */
export const review = (
  card: SrCard,
  grade: RecallGrade,
  now: Date = new Date(),
): { card: SrCard; againInMinutes: number | null } => {
  const reviewedOn = today()
  const passed = isPass(grade)

  // Ease moves on every review, by the standard SM-2 formula.
  const ease = Math.max(
    MIN_EASE,
    card.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
  )

  if (card.learning) {
    if (!passed) {
      // Back to the first learning step.
      return {
        card: { ...card, ease, repetitions: 0, lastReviewed: reviewedOn },
        againInMinutes: LEARNING_STEPS[0],
      }
    }
    // "Easy" means don't show it again today — graduate immediately rather than
    // walking the card through the remaining learning steps.
    const step = card.repetitions
    if (grade < 5 && step < LEARNING_STEPS.length - 1) {
      return {
        card: { ...card, ease, repetitions: step + 1, lastReviewed: reviewedOn },
        againInMinutes: LEARNING_STEPS[step + 1],
      }
    }
    // Graduated. A confident answer skips straight to a longer first interval.
    const interval = grade >= 5 ? 4 : 1
    return {
      card: {
        ...card, ease, interval, repetitions: 1, learning: false,
        due: addDays(reviewedOn, interval), lastReviewed: reviewedOn,
      },
      againInMinutes: null,
    }
  }

  if (!passed) {
    // Lapse: back into learning, and the interval restarts short.
    return {
      card: {
        ...card,
        ease,
        interval: 0,
        repetitions: 0,
        lapses: card.lapses + 1,
        learning: true,
        due: reviewedOn,
        lastReviewed: reviewedOn,
      },
      againInMinutes: LEARNING_STEPS[0],
    }
  }

  const repetitions = card.repetitions + 1
  let interval: number
  if (repetitions === 1) interval = 1
  else if (repetitions === 2) interval = 6
  else interval = Math.round(card.interval * ease)

  // A hard-but-passed card (grade 3) should not stretch as far.
  if (grade === 3) interval = Math.max(1, Math.round(interval * 0.8))
  interval = Math.min(interval, MAX_INTERVAL)

  void now
  return {
    card: {
      ...card, ease, interval, repetitions,
      due: addDays(reviewedOn, interval), lastReviewed: reviewedOn,
    },
    againInMinutes: null,
  }
}

/** True once a card has survived long enough to count as known. */
export const isMature = (card: SrCard): boolean => !card.learning && card.interval >= 21

export interface QueueCounts {
  due: number
  new: number
  learning: number
  mature: number
}

export const queueCounts = (cards: SrCard[], date = today()): QueueCounts => {
  let due = 0, learning = 0, mature = 0
  for (const c of cards) {
    if (c.due <= date) due++
    if (c.learning) learning++
    else if (isMature(c)) mature++
  }
  return { due, new: 0, learning, mature }
}

/**
 * Build a review queue: cards already due, then unseen cards up to `newLimit`.
 * Due cards are ordered most-overdue first so nothing rots at the back.
 */
export const buildQueue = (
  existing: SrCard[],
  allCardIds: { id: string; subjectId: string }[],
  { limit = 40, newLimit = 12, date = today() } = {},
): SrCard[] => {
  const byId = new Map(existing.map((c) => [c.cardId, c]))
  const due = existing
    .filter((c) => c.due <= date)
    .sort((a, b) => a.due.localeCompare(b.due) || b.lapses - a.lapses)

  const fresh = allCardIds
    .filter((c) => !byId.has(c.id))
    .slice(0, newLimit)
    .map((c) => newCard(c.id, c.subjectId))

  return [...due, ...fresh].slice(0, limit)
}
