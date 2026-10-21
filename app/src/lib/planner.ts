/**
 * The revision planner.
 *
 * Carries forward the self-adjusting rescheduler from the v3.1 Revision Hub — the
 * one genuinely good piece of that app — but the slot contents are now chosen by
 * the system rather than fixed in advance:
 *
 *   1. spaced-repetition cards that are due come first, because a missed review
 *      costs more than a missed first pass;
 *   2. then the weakest studied spec points;
 *   3. then untaught-but-scheduled content, so new work still gets a first pass.
 *
 * Missed slots are moved forward, ordered by subject priority, and dropped only
 * when there is genuinely nowhere left to put them.
 */
import type { PlanDay, PlanSlot, MasteryRecord, SrCard, SessionKind } from '@/types/progress'
import type { Subject } from '@/types/spec'
import { addDays, daysBetween, today, weekdayIndex } from '@/lib/date'
import { isUntouched, rag } from '@/lib/mastery'

/** Minutes a day may exceed its capacity to absorb carried-over work. */
export const OVERFLOW_ALLOWANCE = 30
const SLOT_MINUTES = 30
/** Below this, a block is too short to be worth scheduling. */
const MIN_SLOT_MINUTES = 15

let slotCounter = 0
const slotId = () => `slot-${Date.now().toString(36)}-${(slotCounter++).toString(36)}`

export interface PlannerInput {
  date: string
  capacityMinutes: number
  subjects: Subject[]
  mastery: Map<string, MasteryRecord>
  srCards: SrCard[]
  /** Subject ids to exclude, e.g. one already sat. */
  exclude?: string[]
  /**
   * Spec topic ids already scheduled on nearby days. When the whole fortnight is
   * generated in one pass, every day sees the same mastery snapshot and would
   * otherwise pick the same weakest topics over and over. Passing what has
   * already been placed makes the plan advance through the specification.
   */
  avoidTopicIds?: string[]
}

interface Candidate {
  subjectId: string
  kind: SessionKind
  topicIds: string[]
  label: string
  /** Lower sorts first. */
  weight: number
  /** Preferred block length. Defaults to SLOT_MINUTES. */
  minutes?: number
}

/** Roughly how long a review block needs, at about four cards a minute. */
const reviewMinutes = (cards: number): number =>
  Math.max(MIN_SLOT_MINUTES, Math.min(SLOT_MINUTES, Math.ceil(cards / 4 / 5) * 5))

/**
 * Rank what most needs doing on `date`, best first. Pure — it does not look at
 * what is already scheduled, so callers can slice as much as they have room for.
 */
export const rankWork = (input: PlannerInput): Candidate[] => {
  const { date, subjects, mastery, srCards, exclude = [], avoidTopicIds = [] } = input
  const avoid = new Set(avoidTopicIds)
  const todayKey = today()
  const active = subjects.filter((s) => !exclude.includes(s.id))
  const candidates: Candidate[] = []

  const dueBySubject = new Map<string, number>()
  for (const c of srCards) {
    if (c.due <= date) dueBySubject.set(c.subjectId, (dueBySubject.get(c.subjectId) ?? 0) + 1)
  }

  for (const subject of active) {
    // Nearer exams pull a subject's work forward.
    const daysToExam = subject.examDate ? Math.max(1, daysBetween(date, subject.examDate)) : 400
    const urgency = Math.min(1, 180 / daysToExam)
    const base = subject.priority - urgency * 2

    // 1. Reviews.
    //
    // Only today can know how many cards are actually due. A future day is
    // planned from today's snapshot, so it gets a generic review block at a
    // moderate weight — otherwise every day in the fortnight would claim the
    // same card count and crowd out new content.
    const due = dueBySubject.get(subject.id) ?? 0
    const inRotation = srCards.some((c) => c.subjectId === subject.id)
    if (date === todayKey && due > 0) {
      candidates.push({
        subjectId: subject.id,
        kind: 'flashcards',
        topicIds: [],
        label: `${due} card${due === 1 ? '' : 's'} due`,
        weight: base - 3 - Math.min(2, due / 20),
        minutes: reviewMinutes(due),
      })
    } else if (date > todayKey && inRotation) {
      candidates.push({
        subjectId: subject.id,
        kind: 'flashcards',
        topicIds: [],
        label: 'Spaced repetition review',
        weight: base - 0.5,
        minutes: reviewMinutes(srCards.filter((c) => c.subjectId === subject.id).length),
      })
    }

    // 2. Weakest studied topics.
    const topics = subject.units.flatMap((u) => u.topics)
    const scored = topics.map((t) => {
      const studied = t.points.filter((p) => !isUntouched(mastery.get(p.id)))
      const score = studied.length
        ? studied.reduce((s, p) => s + (mastery.get(p.id)?.score ?? 0), 0) / studied.length
        : null
      return { topic: t, score, studied: studied.length }
    })

    for (const { topic, score, studied } of scored) {
      if (score === null) continue
      if (score >= 0.75) continue
      candidates.push({
        subjectId: subject.id,
        kind: score < 0.45 ? 'learn' : 'quiz',
        topicIds: [topic.id],
        label: `${topic.code} ${topic.title}`,
        // Weakest and most-studied first: a shaky topic he has actually met beats a new one.
        // Already-planned topics sink to the bottom rather than being dropped, so a short
        // specification can still fill the available time.
        weight: base - 2 + score * 2 - Math.min(0.5, studied / 20) + (avoid.has(topic.id) ? 50 : 0),
      })
    }

    // 3. First pass at untouched content, in spec order.
    const untouched = scored
      .filter((s) => s.score === null)
      .sort((a, b) => Number(avoid.has(a.topic.id)) - Number(avoid.has(b.topic.id)))
      .slice(0, 3)
    for (const [i, { topic }] of untouched.entries()) {
      candidates.push({
        subjectId: subject.id,
        kind: 'learn',
        topicIds: [topic.id],
        label: `${topic.code} ${topic.title}`,
        weight: base + 1 + i * 0.1 + (avoid.has(topic.id) ? 50 : 0),
      })
    }
  }

  return candidates.sort((a, b) => a.weight - b.weight)
}

/** Build a fresh day's plan from ranked work, filling up to capacity. */
export const generateDay = (input: PlannerInput): PlanDay => {
  const { date, capacityMinutes } = input
  const slots: PlanSlot[] = []
  if (capacityMinutes <= 0) return { date, capacityMinutes, slots, reconciled: false }

  const ranked = rankWork(input)
  const perSubject = new Map<string, number>()
  let used = 0

  // Spread the day across subjects, but do not leave time unfilled just because
  // there are few subjects to spread across.
  const activeCount = Math.max(1, input.subjects.length - (input.exclude?.length ?? 0))
  const perSubjectCap = Math.max(2, Math.ceil(capacityMinutes / SLOT_MINUTES / activeCount) + 1)

  for (const c of ranked) {
    const left = capacityMinutes - used
    if (left < MIN_SLOT_MINUTES) break
    // A short evening should not waste its last 15 minutes just because a full
    // slot will not fit — shorten the block instead.
    const minutes = Math.min(c.minutes ?? SLOT_MINUTES, left)
    const count = perSubject.get(c.subjectId) ?? 0
    if (count >= perSubjectCap) continue
    perSubject.set(c.subjectId, count + 1)
    slots.push({
      id: slotId(),
      subjectId: c.subjectId,
      kind: c.kind,
      minutes,
      topicIds: c.topicIds,
      label: c.label,
      done: false,
      rescheduled: false,
      overflow: false,
    })
    used += minutes
  }

  return { date, capacityMinutes, slots, reconciled: false }
}

export const dayLoad = (day: PlanDay): number =>
  day.slots.reduce((s, x) => s + x.minutes, 0)

export const dayRemaining = (day: PlanDay, allowOverflow = false): number =>
  day.capacityMinutes + (allowOverflow ? OVERFLOW_ALLOWANCE : 0) - dayLoad(day)

export const capacityFor = (date: string, weeklyCapacity: number[]): number =>
  weeklyCapacity[weekdayIndex(date)] ?? 0

export interface RescheduleResult {
  days: PlanDay[]
  moved: number
  dropped: PlanSlot[]
}

/**
 * Move undone slots from past days into the days ahead.
 *
 * Runs once a day on first open. Slots are placed today first, then across the
 * following days, and may overflow a day by up to OVERFLOW_ALLOWANCE before
 * spilling to the next. Anything that will not fit inside the horizon is dropped
 * and reported, rather than silently piling up.
 */
export const reschedule = (
  days: PlanDay[],
  subjects: Subject[],
  { from = today(), horizonDays = 14 } = {},
): RescheduleResult => {
  const byDate = new Map(days.map((d) => [d.date, { ...d, slots: [...d.slots] }]))
  const priority = new Map(subjects.map((s) => [s.id, s.priority]))

  // Collect everything missed, highest-priority subject first.
  const missed: PlanSlot[] = []
  for (const day of byDate.values()) {
    if (day.date >= from) continue
    const keep: PlanSlot[] = []
    for (const slot of day.slots) {
      if (slot.done) keep.push(slot)
      else missed.push(slot)
    }
    day.slots = keep
    day.reconciled = true
  }

  missed.sort(
    (a, b) => (priority.get(a.subjectId) ?? 99) - (priority.get(b.subjectId) ?? 99),
  )

  const horizon = Array.from({ length: horizonDays }, (_, i) => addDays(from, i))
  const dropped: PlanSlot[] = []
  let moved = 0

  for (const slot of missed) {
    const placed = horizon.some((date) => {
      const day = byDate.get(date)
      if (!day || day.capacityMinutes <= 0) return false
      // Try within capacity first across the whole horizon, then allow overflow.
      if (dayRemaining(day) < slot.minutes) return false
      day.slots.push({ ...slot, rescheduled: true, overflow: false })
      return true
    }) || horizon.some((date) => {
      const day = byDate.get(date)
      if (!day || day.capacityMinutes <= 0) return false
      if (dayRemaining(day, true) < slot.minutes) return false
      day.slots.push({ ...slot, rescheduled: true, overflow: true })
      return true
    })

    if (placed) moved++
    else dropped.push(slot)
  }

  return { days: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)), moved, dropped }
}

/** Weakest spec points across all subjects, for the "needs work" panel. */
export const weakestPoints = (
  subjects: Subject[],
  mastery: Map<string, MasteryRecord>,
  limit = 8,
): { subjectId: string; pointId: string; topicId: string; code: string; statement: string; score: number }[] => {
  const rows: { subjectId: string; pointId: string; topicId: string; code: string; statement: string; score: number }[] = []
  for (const s of subjects) {
    for (const u of s.units) {
      for (const t of u.topics) {
        for (const p of t.points) {
          const r = mastery.get(p.id)
          if (isUntouched(r)) continue
          if (rag(r!.score) === 'green') continue
          rows.push({
            subjectId: s.id, pointId: p.id, topicId: t.id,
            code: p.code, statement: p.statement, score: r!.score,
          })
        }
      }
    }
  }
  return rows.sort((a, b) => a.score - b.score).slice(0, limit)
}
