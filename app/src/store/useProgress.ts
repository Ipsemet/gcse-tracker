/** Progress store: mastery, spaced repetition, attempts, sessions, profile, plan. */
import { create } from 'zustand'
import type {
  Attempt, MasteryRecord, PlanDay, Profile, RecallGrade, Settings, SrCard, StudySession,
} from '@/types/progress'
import type { Question } from '@/types/content'
import type { Subject } from '@/types/spec'
import * as db from '@/lib/db'
import { applyAttempt, emptyMastery, rescore, setConfidence as setConf } from '@/lib/mastery'
import { newCard, review as sm2Review } from '@/lib/sm2'
import { capacityFor, generateDay, reschedule } from '@/lib/planner'
import { BADGES, checkBadges, emptyProfile, grantFreezes, levelForXp, recordActivity, XP, type BadgeStats } from '@/lib/xp'
import { addDays, today } from '@/lib/date'

export const defaultSettings = (): Settings => ({
  // Sun, Mon..Fri, Sat — weeknights lighter than weekends.
  weeklyCapacity: [60, 45, 45, 45, 45, 30, 60],
  pomodoroMinutes: 25,
  breakMinutes: 5,
  soundEnabled: true,
  ai: {
    mode: 'off',
    proxyUrl: '',
    apiKey: '',
    model: 'claude-sonnet-5',
    monthlyRequestCap: 400,
  },
})

interface ProgressState {
  ready: boolean
  profile: Profile
  settings: Settings
  mastery: Map<string, MasteryRecord>
  srCards: Map<string, SrCard>
  plan: Map<string, PlanDay>
  recentAttempts: Attempt[]
  /** Set by the last reschedule run, shown as a notice on the plan. */
  lastReschedule: { moved: number; dropped: number; at: string } | null

  init: () => Promise<void>
  saveSettings: (patch: Partial<Settings>) => Promise<void>
  saveProfile: (patch: Partial<Profile>) => Promise<void>

  recordAttempt: (question: Question, response: string, marksEarned: number, seconds: number, markedBy: Attempt['markedBy'], sessionId?: string) => Promise<void>
  setPointConfidence: (pointId: string, subjectId: string, confidence: number) => Promise<void>
  markTopicRead: (subjectId: string, pointIds: string[]) => Promise<void>

  reviewCard: (cardId: string, subjectId: string, grade: RecallGrade) => Promise<{ againInMinutes: number | null }>

  awardXp: (amount: number) => Promise<void>
  saveSession: (session: StudySession) => Promise<void>

  ensurePlan: (subjects: Subject[], days?: number) => Promise<void>
  completeSlot: (date: string, slotId: string) => Promise<void>
  regenerateDay: (date: string, subjects: Subject[]) => Promise<void>
  runReschedule: (subjects: Subject[]) => Promise<void>

  reload: () => Promise<void>
}

const id = () => (crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`)

export const useProgress = create<ProgressState>((set, get) => ({
  ready: false,
  profile: emptyProfile(),
  settings: defaultSettings(),
  mastery: new Map(),
  srCards: new Map(),
  plan: new Map(),
  recentAttempts: [],
  lastReschedule: null,

  init: async () => {
    const [profile, settings, mastery, srCards, plan, attempts] = await Promise.all([
      db.getProfile(), db.getSettings(), db.getAllMastery(), db.getAllSrCards(),
      db.getAllPlanDays(), db.getAttemptsSince(addDays(today(), -30)),
    ])
    set({
      ready: true,
      profile: profile ?? emptyProfile(),
      settings: { ...defaultSettings(), ...settings, ai: { ...defaultSettings().ai, ...settings?.ai } },
      mastery: new Map(mastery.map((m) => [m.id, m])),
      srCards: new Map(srCards.map((c) => [c.cardId, c])),
      plan: new Map(plan.map((d) => [d.date, d])),
      recentAttempts: attempts.slice(-100),
    })
    if (!profile) await db.putProfile(emptyProfile())
    if (!settings) await db.putSettings(defaultSettings())
  },

  reload: async () => {
    set({ ready: false })
    await get().init()
  },

  saveSettings: async (patch) => {
    const settings = { ...get().settings, ...patch, ai: { ...get().settings.ai, ...patch.ai } }
    set({ settings })
    await db.putSettings(settings)
  },

  saveProfile: async (patch) => {
    const profile = { ...get().profile, ...patch }
    profile.level = levelForXp(profile.xp)
    set({ profile })
    await db.putProfile(profile)
  },

  recordAttempt: async (question, response, marksEarned, seconds, markedBy, sessionId) => {
    const at = new Date().toISOString()
    const attempt: Attempt = {
      id: id(),
      questionId: question.id,
      subjectId: question.subjectId,
      specPointIds: question.specPointIds,
      at,
      response,
      marksEarned,
      marksAvailable: question.marks,
      markedBy,
      secondsTaken: seconds,
      ...(sessionId ? { sessionId } : {}),
    }
    await db.addAttempt(attempt)

    // Marks are attributed in full to every spec point the question tested.
    const mastery = new Map(get().mastery)
    const updated: MasteryRecord[] = []
    for (const pointId of question.specPointIds) {
      const current = mastery.get(pointId) ?? emptyMastery(pointId, question.subjectId)
      const next = applyAttempt(current, marksEarned, question.marks, at)
      mastery.set(pointId, next)
      updated.push(next)
    }
    await db.putManyMastery(updated)

    set((s) => ({ mastery, recentAttempts: [...s.recentAttempts, attempt].slice(-100) }))
    await get().awardXp(marksEarned * XP.perMarkEarned + (marksEarned === question.marks ? XP.questionCorrect : 0))
  },

  setPointConfidence: async (pointId, subjectId, confidence) => {
    const current = get().mastery.get(pointId) ?? emptyMastery(pointId, subjectId)
    const next = setConf(current, confidence)
    const mastery = new Map(get().mastery).set(pointId, next)
    set({ mastery })
    await db.putMastery(next)
  },

  markTopicRead: async (subjectId, pointIds) => {
    const at = new Date().toISOString()
    const mastery = new Map(get().mastery)
    const updated: MasteryRecord[] = []
    for (const pointId of pointIds) {
      const current = mastery.get(pointId) ?? emptyMastery(pointId, subjectId)
      // Reading marks a point as taught and seen, but earns no accuracy credit.
      const next = rescore({ ...current, taught: true, lastSeen: at, firstSeen: current.firstSeen ?? at })
      mastery.set(pointId, next)
      updated.push(next)
    }
    await db.putManyMastery(updated)
    set({ mastery })
    await get().awardXp(XP.topicRead)
  },

  reviewCard: async (cardId, subjectId, grade) => {
    const existing = get().srCards.get(cardId) ?? newCard(cardId, subjectId)
    const wasNew = !get().srCards.has(cardId)
    const { card, againInMinutes } = sm2Review(existing, grade)
    const srCards = new Map(get().srCards).set(cardId, card)
    set({ srCards })
    await db.putSrCard(card)
    await get().awardXp(wasNew && grade >= 4 ? XP.cardRecalledFirstTime : XP.cardReviewed)
    return { againInMinutes }
  },

  awardXp: async (amount) => {
    if (amount <= 0) return
    const profile = { ...get().profile }
    profile.xp += amount
    profile.level = levelForXp(profile.xp)
    profile.streak = grantFreezes(recordActivity(profile.streak))

    const earned = checkBadges(await buildBadgeStats(get()), profile.badges)
    if (earned.length) profile.badges = [...profile.badges, ...earned]

    set({ profile })
    await db.putProfile(profile)
  },

  saveSession: async (session) => {
    await db.putSession(session)
    await get().awardXp(session.xpEarned)
  },

  ensurePlan: async (subjects, days = 14) => {
    const { settings, mastery, srCards, plan } = get()
    const next = new Map(plan)
    let changed = false

    // Topics already spoken for across the horizon, so successive days advance
    // through the specification instead of all picking the same weakest topic.
    const planned = new Set<string>()
    for (const day of next.values()) {
      if (day.date < today()) continue
      for (const slot of day.slots) for (const t of slot.topicIds) planned.add(t)
    }

    for (let i = 0; i < days; i++) {
      const date = addDays(today(), i)
      if (next.has(date)) continue
      const capacity = capacityFor(date, settings.weeklyCapacity)
      const day = generateDay({
        date,
        capacityMinutes: capacity,
        subjects,
        mastery,
        srCards: [...srCards.values()],
        avoidTopicIds: [...planned],
      })
      for (const slot of day.slots) for (const t of slot.topicIds) planned.add(t)
      next.set(date, day)
      await db.putPlanDay(day)
      changed = true
    }
    if (changed) set({ plan: next })
  },

  completeSlot: async (date, slotId) => {
    const day = get().plan.get(date)
    if (!day) return
    const slots = day.slots.map((s) => (s.id === slotId ? { ...s, done: true } : s))
    const updated = { ...day, slots }
    const plan = new Map(get().plan).set(date, updated)
    set({ plan })
    await db.putPlanDay(updated)
    await get().awardXp(XP.slotCompleted)
    if (slots.every((s) => s.done) && slots.length > 0) await get().awardXp(XP.dailyGoalMet)
  },

  regenerateDay: async (date, subjects) => {
    const { settings, mastery, srCards, plan } = get()
    const existing = plan.get(date)
    const done = existing?.slots.filter((s) => s.done) ?? []
    const planned = new Set<string>()
    for (const day of plan.values()) {
      if (day.date === date || day.date < today()) continue
      for (const slot of day.slots) for (const t of slot.topicIds) planned.add(t)
    }
    const fresh = generateDay({
      date,
      capacityMinutes: capacityFor(date, settings.weeklyCapacity),
      subjects,
      mastery,
      srCards: [...srCards.values()],
      avoidTopicIds: [...planned],
    })
    // Keep anything already completed; regenerate only what is outstanding.
    const doneMinutes = done.reduce((s, x) => s + x.minutes, 0)
    let budget = fresh.capacityMinutes - doneMinutes
    const kept = fresh.slots.filter((s) => {
      if (budget < s.minutes) return false
      budget -= s.minutes
      return true
    })
    const day: PlanDay = { ...fresh, slots: [...done, ...kept] }
    set({ plan: new Map(plan).set(date, day) })
    await db.putPlanDay(day)
  },

  runReschedule: async (subjects) => {
    await get().ensurePlan(subjects)
    const days = [...get().plan.values()]
    const result = reschedule(days, subjects)
    const plan = new Map(result.days.map((d) => [d.date, d]))
    set({ plan, lastReschedule: { moved: result.moved, dropped: result.dropped.length, at: today() } })
    for (const day of result.days) await db.putPlanDay(day)
    await db.putFlag('lastReschedule', today())
  },
}))

const buildBadgeStats = async (state: ProgressState): Promise<BadgeStats> => {
  const [attempts, sessions] = await Promise.all([db.getAllAttempts(), db.getAllSessions()])
  const subjectsStarted = new Set([...state.mastery.values()].map((m) => m.subjectId)).size
  const greenPoints = [...state.mastery.values()].filter((m) => m.score >= 0.75).length
  const perfectQuizzes = sessions.filter(
    (s) => s.kind === 'quiz' && s.marksAvailable > 0 && s.marksEarned === s.marksAvailable,
  ).length
  const hourOf = (iso: string) => new Date(iso).getHours()
  return {
    cardsReviewed: [...state.srCards.values()].reduce((s, c) => s + c.repetitions + c.lapses, 0),
    questionsAnswered: attempts.length,
    marksEarned: attempts.reduce((s, a) => s + a.marksEarned, 0),
    topicsRead: sessions.filter((s) => s.kind === 'learn').length,
    papersCompleted: sessions.filter((s) => s.kind === 'paper' && s.endedAt).length,
    streakCurrent: state.profile.streak.current,
    streakLongest: state.profile.streak.longest,
    greenPoints,
    subjectsStarted,
    perfectQuizzes,
    earlyBirdSessions: sessions.filter((s) => hourOf(s.startedAt) < 8).length,
    lateNightSessions: sessions.filter((s) => hourOf(s.startedAt) >= 22).length,
  }
}

export { BADGES }
