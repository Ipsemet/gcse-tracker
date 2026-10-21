/**
 * Mastery scoring.
 *
 * A spec point's score blends three things: how accurately Harry answers
 * questions on it, how confident he says he is, and how recently he has touched
 * it. Recency matters because a point mastered in October and never revisited is
 * not mastered in May.
 */
import type { MasteryRecord, Rag } from '@/types/progress'
import type { Subject, SpecPoint } from '@/types/spec'
import { daysBetween, today } from '@/lib/date'

/** Score at or above this is green; at or above AMBER_AT is amber. */
const GREEN_AT = 0.75
const AMBER_AT = 0.45
/** Days after which an untouched point has fully decayed to its floor. */
const DECAY_DAYS = 60
/** Retained fraction of the score once fully decayed. */
const DECAY_FLOOR = 0.55

export const emptyMastery = (id: string, subjectId: string): MasteryRecord => ({
  id,
  subjectId,
  score: 0,
  confidence: null,
  marksEarned: 0,
  marksAvailable: 0,
  attempts: 0,
  firstSeen: null,
  lastSeen: null,
  taught: false,
})

/** Multiplier in [DECAY_FLOOR, 1] based on how long since the point was last seen. */
export const recencyFactor = (lastSeen: string | null, date = today()): number => {
  if (!lastSeen) return 1
  const days = Math.max(0, daysBetween(lastSeen.slice(0, 10), date))
  const decayed = 1 - (1 - DECAY_FLOOR) * Math.min(1, days / DECAY_DAYS)
  return decayed
}

/**
 * Recompute a record's score from its own counters.
 *
 * Accuracy is weighted by evidence: a single correct answer should not read as
 * total mastery, so accuracy is pulled toward 0.5 until several marks are in.
 */
export const rescore = (record: MasteryRecord, date = today()): MasteryRecord => {
  const { marksEarned, marksAvailable, confidence } = record

  let score: number
  if (marksAvailable === 0) {
    // No questions attempted — self-rating is all we have, and it is worth less.
    score = confidence === null ? 0 : (confidence / 5) * 0.6
  } else {
    const raw = marksEarned / marksAvailable
    // Shrink toward 0.5 with little evidence; k is the "prior marks" weight.
    const k = 6
    const accuracy = (raw * marksAvailable + 0.5 * k) / (marksAvailable + k)
    score = confidence === null ? accuracy : accuracy * 0.75 + (confidence / 5) * 0.25
  }

  return { ...record, score: clamp(score * recencyFactor(record.lastSeen, date)) }
}

const clamp = (n: number) => Math.max(0, Math.min(1, n))

/** Record the outcome of a question attempt against every spec point it tested. */
export const applyAttempt = (
  record: MasteryRecord,
  marksEarned: number,
  marksAvailable: number,
  at = new Date().toISOString(),
): MasteryRecord =>
  rescore({
    ...record,
    marksEarned: record.marksEarned + marksEarned,
    marksAvailable: record.marksAvailable + marksAvailable,
    attempts: record.attempts + 1,
    firstSeen: record.firstSeen ?? at,
    lastSeen: at,
    taught: true,
  })

export const setConfidence = (record: MasteryRecord, confidence: number): MasteryRecord =>
  rescore({
    ...record,
    confidence,
    taught: true,
    lastSeen: record.lastSeen ?? new Date().toISOString(),
  })

export const rag = (score: number): Rag =>
  score >= GREEN_AT ? 'green' : score >= AMBER_AT ? 'amber' : 'red'

/** A point counts as untouched if nothing has ever been recorded against it. */
export const isUntouched = (r: MasteryRecord | undefined): boolean =>
  !r || (r.attempts === 0 && r.confidence === null && !r.taught)

export interface SubjectMastery {
  subjectId: string
  /** Mean score across all spec points, treating untouched points as zero. */
  overall: number
  /** Mean score across points that have actually been studied. */
  studiedScore: number
  counts: { total: number; untouched: number; red: number; amber: number; green: number }
  /** Weakest studied points, worst first. */
  weakest: { pointId: string; score: number }[]
}

export const allPoints = (subject: Subject): SpecPoint[] =>
  subject.units.flatMap((u) => u.topics.flatMap((t) => t.points))

export const summariseSubject = (
  subject: Subject,
  records: Map<string, MasteryRecord>,
): SubjectMastery => {
  const points = allPoints(subject)
  const counts = { total: points.length, untouched: 0, red: 0, amber: 0, green: 0 }
  const studied: { pointId: string; score: number }[] = []
  let sum = 0

  for (const p of points) {
    const r = records.get(p.id)
    if (isUntouched(r)) {
      counts.untouched++
      continue
    }
    const score = r!.score
    sum += score
    studied.push({ pointId: p.id, score })
    counts[rag(score)]++
  }

  return {
    subjectId: subject.id,
    overall: points.length ? sum / points.length : 0,
    studiedScore: studied.length ? sum / studied.length : 0,
    counts,
    weakest: studied.sort((a, b) => a.score - b.score).slice(0, 10),
  }
}

export const summariseTopic = (
  pointIds: string[],
  records: Map<string, MasteryRecord>,
): { score: number; studied: number; total: number; rag: Rag } => {
  let sum = 0
  let studied = 0
  for (const id of pointIds) {
    const r = records.get(id)
    if (isUntouched(r)) continue
    sum += r!.score
    studied++
  }
  const score = pointIds.length ? sum / pointIds.length : 0
  return { score, studied, total: pointIds.length, rag: rag(score) }
}

/**
 * Estimated grade from a subject's mastery, using the grade boundary set if the
 * subject has one. Deliberately conservative: this projects the mark Harry would
 * get if he sat the paper today on the content he has covered, and it is labelled
 * as an estimate everywhere it is shown.
 */
export const estimateGrade = (
  subject: Subject,
  mastery: SubjectMastery,
): { grade: number | null; percentage: number; basis: 'boundaries' | 'percentage' } => {
  const percentage = mastery.overall * 100
  const set = subject.gradeBoundaries?.[0]
  if (!set) {
    // No boundaries: map percentage onto grades with a rough, clearly-flagged curve.
    const grade = percentage >= 85 ? 9 : percentage >= 75 ? 8 : percentage >= 66 ? 7
      : percentage >= 56 ? 6 : percentage >= 46 ? 5 : percentage >= 36 ? 4
      : percentage >= 26 ? 3 : percentage >= 16 ? 2 : percentage > 0 ? 1 : null
    return { grade, percentage, basis: 'percentage' }
  }
  const totalMarks = subject.papers.reduce((s, p) => s + p.marks, 0)
  const projected = (mastery.overall * totalMarks)
  const grades = Object.entries(set.boundaries)
    .map(([g, marks]) => ({ grade: Number(g), marks }))
    .sort((a, b) => b.marks - a.marks)
  const hit = grades.find((g) => projected >= g.marks)
  return { grade: hit?.grade ?? null, percentage, basis: 'boundaries' }
}
