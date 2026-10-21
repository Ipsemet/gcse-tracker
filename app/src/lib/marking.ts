/**
 * Auto-marking.
 *
 * Objective types (mcq, multi, match, order) are marked exactly. Short and
 * calculation answers are matched against acceptable answers with sensible
 * normalisation. Extended answers cannot be auto-marked — they go to self-marking
 * against the mark scheme, or to the AI marker if it is switched on.
 */
import type { Question } from '@/types/content'

export interface MarkResult {
  marksEarned: number
  marksAvailable: number
  /** `needs-review` means a human or the AI marker has to decide. */
  outcome: 'correct' | 'partial' | 'incorrect' | 'needs-review'
  /** Per-item correctness, for match/order/multi feedback. */
  detail?: boolean[]
  feedback?: string
}

/** Lower-case, strip punctuation and collapse whitespace. */
const normalise = (s: string): string =>
  s.toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\w\s'./-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Pull a number out of an answer, tolerating units, commas and spaces. */
const toNumber = (s: string): number | null => {
  const m = s.replace(/,/g, '').match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

const numericMatch = (given: string, expected: string): boolean => {
  const a = toNumber(given)
  const b = toNumber(expected)
  if (a === null || b === null) return false
  // Tolerate rounding at the precision the expected answer is written to.
  const dp = (expected.split('.')[1] ?? '').length
  const tolerance = dp > 0 ? 0.5 * 10 ** -dp : 0.001
  return Math.abs(a - b) <= tolerance
}

export const markQuestion = (question: Question, response: string): MarkResult => {
  const marksAvailable = question.marks

  switch (question.type) {
    case 'mcq': {
      const correct = question.options?.find((o) => o.correct)
      const ok = correct !== undefined && response === correct.id
      return {
        marksEarned: ok ? marksAvailable : 0,
        marksAvailable,
        outcome: ok ? 'correct' : 'incorrect',
        feedback: ok ? undefined : question.options?.find((o) => o.id === response)?.why,
      }
    }

    case 'multi': {
      const chosen = new Set(response ? response.split(',').filter(Boolean) : [])
      const options = question.options ?? []
      // One mark per correct option, minus one per wrong option, floored at zero.
      const correctIds = new Set(options.filter((o) => o.correct).map((o) => o.id))
      let hits = 0
      let misses = 0
      for (const o of options) {
        if (chosen.has(o.id)) (correctIds.has(o.id) ? hits++ : misses++)
      }
      const perMark = marksAvailable / correctIds.size
      const earned = Math.max(0, Math.round((hits - misses) * perMark))
      return {
        marksEarned: Math.min(earned, marksAvailable),
        marksAvailable,
        outcome: earned === marksAvailable ? 'correct' : earned > 0 ? 'partial' : 'incorrect',
        detail: options.map((o) => chosen.has(o.id) === correctIds.has(o.id)),
      }
    }

    case 'order': {
      const given = response ? response.split('|') : []
      const expected = question.sequence ?? []
      const detail = expected.map((item, i) => given[i] === item)
      const hits = detail.filter(Boolean).length
      const earned = hits === expected.length
        ? marksAvailable
        : Math.floor((hits / expected.length) * marksAvailable)
      return {
        marksEarned: earned,
        marksAvailable,
        outcome: hits === expected.length ? 'correct' : hits > 0 ? 'partial' : 'incorrect',
        detail,
      }
    }

    case 'match': {
      // response is "left=right|left=right"
      const given = new Map(
        (response ? response.split('|') : [])
          .map((pair) => pair.split('=') as [string, string])
          .filter((p) => p.length === 2),
      )
      const pairs = question.pairs ?? []
      const detail = pairs.map((p) => given.get(p.left) === p.right)
      const hits = detail.filter(Boolean).length
      const earned = hits === pairs.length
        ? marksAvailable
        : Math.floor((hits / pairs.length) * marksAvailable)
      return {
        marksEarned: earned,
        marksAvailable,
        outcome: hits === pairs.length ? 'correct' : hits > 0 ? 'partial' : 'incorrect',
        detail,
      }
    }

    case 'short':
    case 'calculation':
    case 'trace': {
      const accepted = question.acceptableAnswers ?? []
      if (accepted.length === 0) return { marksEarned: 0, marksAvailable, outcome: 'needs-review' }
      const given = normalise(response)
      if (!given) return { marksEarned: 0, marksAvailable, outcome: 'incorrect' }

      const isNumeric = question.type === 'calculation'
      const ok = accepted.some((a) =>
        isNumeric ? numericMatch(response, a) : normalise(a) === given,
      )
      if (ok) return { marksEarned: marksAvailable, marksAvailable, outcome: 'correct' }

      // Near miss on a multi-mark answer: award for each mark-scheme point matched.
      if (question.markScheme?.length && marksAvailable > 1) {
        let earned = 0
        for (const point of question.markScheme) {
          const wordings = [point.text, ...(point.alternatives ?? [])]
          if (wordings.some((w) => containsKeyIdeas(given, normalise(w)))) earned += point.marks
        }
        if (earned > 0) {
          return {
            marksEarned: Math.min(earned, marksAvailable),
            marksAvailable,
            outcome: 'partial',
            feedback: 'Partially matched the mark scheme — check it and adjust if needed.',
          }
        }
        return { marksEarned: 0, marksAvailable, outcome: 'needs-review' }
      }
      return { marksEarned: 0, marksAvailable, outcome: 'incorrect' }
    }

    case 'extended':
    case 'code':
      return { marksEarned: 0, marksAvailable, outcome: 'needs-review' }
  }
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'are', 'it', 'that', 'this',
  'be', 'as', 'for', 'on', 'with', 'by', 'can', 'will', 'from', 'at', 'so', 'if',
])

/**
 * Loose containment check for mark-scheme points: does the answer use most of the
 * meaningful words from the mark point? Deliberately generous — it only ever
 * proposes marks, and the answer is shown alongside the mark scheme for review.
 */
const containsKeyIdeas = (answer: string, markPoint: string): boolean => {
  const keys = markPoint.split(' ').filter((w) => w.length > 2 && !STOPWORDS.has(w))
  if (keys.length === 0) return false
  const hits = keys.filter((k) => answer.includes(k)).length
  return hits / keys.length >= 0.6
}

/** Total marks available across a set of questions. */
export const totalMarks = (questions: Question[]): number =>
  questions.reduce((s, q) => s + q.marks, 0)

/** Grade a percentage against a boundary set, or null if it is below grade 1. */
export const gradeFromMarks = (
  marks: number,
  boundaries: Record<string, number> | undefined,
): number | null => {
  if (!boundaries) return null
  const sorted = Object.entries(boundaries)
    .map(([g, m]) => ({ grade: Number(g), marks: m }))
    .sort((a, b) => b.marks - a.marks)
  return sorted.find((g) => marks >= g.marks)?.grade ?? null
}
