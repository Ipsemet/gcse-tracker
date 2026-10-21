/**
 * Gamification: XP, levels, streaks and badges.
 *
 * Kept honest on purpose — XP is earned for retrieval and marks, not for opening
 * the app. Rewarding time-in-app would train the wrong habit.
 */
import type { Badge, Profile, Streak } from '@/types/progress'
import { addDays, today } from '@/lib/date'

export const XP = {
  cardReviewed: 2,
  cardRecalledFirstTime: 4,
  perMarkEarned: 3,
  questionCorrect: 5,
  topicRead: 15,
  paperCompleted: 100,
  slotCompleted: 20,
  dailyGoalMet: 40,
} as const

/** Level n starts at 100·n·(n-1)/2 XP — each level costs 100 more than the last. */
export const levelForXp = (xp: number): number => {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  return level
}

export const xpForLevel = (level: number): number => (100 * level * (level - 1)) / 2

export const levelProgress = (xp: number): { level: number; into: number; needed: number; pct: number } => {
  const level = levelForXp(xp)
  const floor = xpForLevel(level)
  const ceiling = xpForLevel(level + 1)
  const into = xp - floor
  const needed = ceiling - floor
  return { level, into, needed, pct: needed ? into / needed : 0 }
}

export const emptyStreak = (): Streak => ({
  current: 0,
  longest: 0,
  lastActiveDate: null,
  freezesUsed: [],
  freezesAvailable: 2,
})

/**
 * Record activity on `date`. A single missed day spends a freeze if one is
 * available, so one busy evening does not wipe out weeks of consistency.
 */
export const recordActivity = (streak: Streak, date = today()): Streak => {
  const last = streak.lastActiveDate
  if (last === date) return streak
  if (!last) {
    return { ...streak, current: 1, longest: Math.max(1, streak.longest), lastActiveDate: date }
  }

  const yesterday = addDays(date, -1)
  if (last === yesterday) {
    const current = streak.current + 1
    return { ...streak, current, longest: Math.max(current, streak.longest), lastActiveDate: date }
  }

  const dayBefore = addDays(date, -2)
  if (last === dayBefore && streak.freezesAvailable > 0) {
    const current = streak.current + 1
    return {
      ...streak,
      current,
      longest: Math.max(current, streak.longest),
      lastActiveDate: date,
      freezesUsed: [...streak.freezesUsed, yesterday],
      freezesAvailable: streak.freezesAvailable - 1,
    }
  }

  return { ...streak, current: 1, lastActiveDate: date }
}

/** One freeze is earned back for every seven consecutive active days, capped at three. */
export const grantFreezes = (streak: Streak): Streak =>
  streak.current > 0 && streak.current % 7 === 0 && streak.freezesAvailable < 3
    ? { ...streak, freezesAvailable: streak.freezesAvailable + 1 }
    : streak

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
  /** Progress toward earning it, 0-1, from the running totals. */
  progress: (stats: BadgeStats) => number
}

export interface BadgeStats {
  cardsReviewed: number
  questionsAnswered: number
  marksEarned: number
  topicsRead: number
  papersCompleted: number
  streakCurrent: number
  streakLongest: number
  greenPoints: number
  subjectsStarted: number
  perfectQuizzes: number
  earlyBirdSessions: number
  lateNightSessions: number
}

const ratio = (n: number, target: number) => Math.min(1, n / target)

export const BADGES: BadgeDef[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Answer your first question', icon: '🎯', progress: (s) => ratio(s.questionsAnswered, 1) },
  { id: 'century', name: 'Century', description: 'Answer 100 questions', icon: '💯', progress: (s) => ratio(s.questionsAnswered, 100) },
  { id: 'thousand-marks', name: 'Mark Machine', description: 'Earn 1,000 marks', icon: '📈', progress: (s) => ratio(s.marksEarned, 1000) },
  { id: 'card-shark', name: 'Card Shark', description: 'Review 500 flashcards', icon: '🃏', progress: (s) => ratio(s.cardsReviewed, 500) },
  { id: 'week-one', name: 'Seven Days', description: 'Hit a 7-day streak', icon: '🔥', progress: (s) => ratio(s.streakLongest, 7) },
  { id: 'month-long', name: 'Unbroken', description: 'Hit a 30-day streak', icon: '⚡', progress: (s) => ratio(s.streakLongest, 30) },
  { id: 'reader', name: 'Well Read', description: 'Work through 25 topics', icon: '📚', progress: (s) => ratio(s.topicsRead, 25) },
  { id: 'first-paper', name: 'Under Exam Conditions', description: 'Complete a full practice paper', icon: '⏱️', progress: (s) => ratio(s.papersCompleted, 1) },
  { id: 'paper-round', name: 'Paper Round', description: 'Complete 10 practice papers', icon: '📄', progress: (s) => ratio(s.papersCompleted, 10) },
  { id: 'green-fifty', name: 'In the Green', description: 'Get 50 spec points to green', icon: '🟢', progress: (s) => ratio(s.greenPoints, 50) },
  { id: 'green-two-fifty', name: 'Spec Crusher', description: 'Get 250 spec points to green', icon: '🏆', progress: (s) => ratio(s.greenPoints, 250) },
  { id: 'all-rounder', name: 'All-Rounder', description: 'Start work in 5 different subjects', icon: '🎓', progress: (s) => ratio(s.subjectsStarted, 5) },
  { id: 'flawless', name: 'Flawless', description: 'Score full marks on 5 quizzes', icon: '✨', progress: (s) => ratio(s.perfectQuizzes, 5) },
  { id: 'early-bird', name: 'Early Bird', description: 'Study before 8am, 5 times', icon: '🌅', progress: (s) => ratio(s.earlyBirdSessions, 5) },
  { id: 'night-owl', name: 'Night Owl', description: 'Study after 10pm, 5 times', icon: '🦉', progress: (s) => ratio(s.lateNightSessions, 5) },
]

/** Returns the badges newly earned by these stats, given what is already held. */
export const checkBadges = (stats: BadgeStats, held: Badge[]): Badge[] => {
  const have = new Set(held.map((b) => b.id))
  const now = new Date().toISOString()
  return BADGES
    .filter((def) => !have.has(def.id) && def.progress(stats) >= 1)
    .map((def) => ({ id: def.id, earnedAt: now }))
}

export const emptyProfile = (): Profile => ({
  name: 'Harry',
  yearGroup: 10,
  examStart: '2028-05-08',
  xp: 0,
  level: 1,
  streak: emptyStreak(),
  badges: [],
  targets: {},
})
