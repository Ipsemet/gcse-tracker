/**
 * Local persistence. IndexedDB via `idb`.
 *
 * Everything Harry does is stored on his device — no account, no server, works
 * offline. The whole database can be exported to a JSON file and re-imported,
 * which is the backup story and the way progress moves between his laptop and phone.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  Attempt, MasteryRecord, PlanDay, Profile, Settings, SrCard, StudySession,
} from '@/types/progress'

const DB_NAME = 'gcse-hq'
const DB_VERSION = 1

interface GcseDB extends DBSchema {
  mastery: { key: string; value: MasteryRecord; indexes: { bySubject: string } }
  srCards: { key: string; value: SrCard; indexes: { bySubject: string; byDue: string } }
  attempts: { key: string; value: Attempt; indexes: { bySubject: string; byQuestion: string; byAt: string } }
  sessions: { key: string; value: StudySession; indexes: { bySubject: string; byStart: string } }
  plan: { key: string; value: PlanDay }
  kv: { key: string; value: unknown }
}

let dbPromise: Promise<IDBPDatabase<GcseDB>> | null = null

export const db = (): Promise<IDBPDatabase<GcseDB>> => {
  dbPromise ??= openDB<GcseDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      const mastery = database.createObjectStore('mastery', { keyPath: 'id' })
      mastery.createIndex('bySubject', 'subjectId')

      const sr = database.createObjectStore('srCards', { keyPath: 'cardId' })
      sr.createIndex('bySubject', 'subjectId')
      sr.createIndex('byDue', 'due')

      const attempts = database.createObjectStore('attempts', { keyPath: 'id' })
      attempts.createIndex('bySubject', 'subjectId')
      attempts.createIndex('byQuestion', 'questionId')
      attempts.createIndex('byAt', 'at')

      const sessions = database.createObjectStore('sessions', { keyPath: 'id' })
      sessions.createIndex('bySubject', 'subjectId')
      sessions.createIndex('byStart', 'startedAt')

      database.createObjectStore('plan', { keyPath: 'date' })
      database.createObjectStore('kv')
    },
  })
  return dbPromise
}

// --- Mastery -----------------------------------------------------------------

export const getMastery = async (id: string) => (await db()).get('mastery', id)
export const getAllMastery = async () => (await db()).getAll('mastery')
export const getMasteryBySubject = async (subjectId: string) =>
  (await db()).getAllFromIndex('mastery', 'bySubject', subjectId)
export const putMastery = async (record: MasteryRecord) => {
  await (await db()).put('mastery', record)
}
export const putManyMastery = async (records: MasteryRecord[]) => {
  const tx = (await db()).transaction('mastery', 'readwrite')
  await Promise.all([...records.map((r) => tx.store.put(r)), tx.done])
}

// --- Spaced repetition -------------------------------------------------------

export const getSrCard = async (cardId: string) => (await db()).get('srCards', cardId)
export const getAllSrCards = async () => (await db()).getAll('srCards')
export const putSrCard = async (card: SrCard) => {
  await (await db()).put('srCards', card)
}
/** Cards due on or before `date`, across all subjects. */
export const getDueSrCards = async (date: string) =>
  (await db()).getAllFromIndex('srCards', 'byDue', IDBKeyRange.upperBound(date))

// --- Attempts ----------------------------------------------------------------

export const addAttempt = async (attempt: Attempt) => {
  await (await db()).add('attempts', attempt)
}
export const getAttemptsForQuestion = async (questionId: string) =>
  (await db()).getAllFromIndex('attempts', 'byQuestion', questionId)
export const getAllAttempts = async () => (await db()).getAll('attempts')
/** Attempts on or after an ISO timestamp, newest last. */
export const getAttemptsSince = async (since: string) =>
  (await db()).getAllFromIndex('attempts', 'byAt', IDBKeyRange.lowerBound(since))

// --- Sessions ----------------------------------------------------------------

export const putSession = async (session: StudySession) => {
  await (await db()).put('sessions', session)
}
export const getAllSessions = async () => (await db()).getAll('sessions')
export const getSessionsSince = async (since: string) =>
  (await db()).getAllFromIndex('sessions', 'byStart', IDBKeyRange.lowerBound(since))

// --- Plan --------------------------------------------------------------------

export const getPlanDay = async (date: string) => (await db()).get('plan', date)
export const putPlanDay = async (day: PlanDay) => {
  await (await db()).put('plan', day)
}
export const getPlanRange = async (from: string, to: string) =>
  (await db()).getAll('plan', IDBKeyRange.bound(from, to))
export const getAllPlanDays = async () => (await db()).getAll('plan')

// --- Key/value (profile, settings) -------------------------------------------

const kvGet = async <T>(key: string): Promise<T | undefined> =>
  (await db()).get('kv', key) as Promise<T | undefined>
const kvPut = async (key: string, value: unknown) => {
  await (await db()).put('kv', value, key)
}

export const getProfile = () => kvGet<Profile>('profile')
export const putProfile = (p: Profile) => kvPut('profile', p)
export const getSettings = () => kvGet<Settings>('settings')
export const putSettings = (s: Settings) => kvPut('settings', s)
export const getFlag = <T>(key: string) => kvGet<T>(`flag:${key}`)
export const putFlag = (key: string, value: unknown) => kvPut(`flag:${key}`, value)

// --- Backup ------------------------------------------------------------------

export interface Backup {
  format: 'gcse-hq-backup'
  version: number
  exportedAt: string
  mastery: MasteryRecord[]
  srCards: SrCard[]
  attempts: Attempt[]
  sessions: StudySession[]
  plan: PlanDay[]
  profile: Profile | null
  settings: Settings | null
}

export const exportBackup = async (): Promise<Backup> => {
  const d = await db()
  const [mastery, srCards, attempts, sessions, plan, profile, settings] = await Promise.all([
    d.getAll('mastery'), d.getAll('srCards'), d.getAll('attempts'),
    d.getAll('sessions'), d.getAll('plan'), getProfile(), getSettings(),
  ])
  return {
    format: 'gcse-hq-backup',
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    mastery, srCards, attempts, sessions, plan,
    profile: profile ?? null,
    settings: settings ?? null,
  }
}

/**
 * Restore from a backup. `merge` keeps existing records that the backup does not
 * mention; without it the local stores are cleared first.
 */
export const importBackup = async (backup: Backup, { merge = true } = {}): Promise<void> => {
  if (backup?.format !== 'gcse-hq-backup') throw new Error('Not a GCSE HQ backup file')
  const d = await db()
  const tx = d.transaction(['mastery', 'srCards', 'attempts', 'sessions', 'plan'], 'readwrite')
  if (!merge) {
    await Promise.all([
      tx.objectStore('mastery').clear(), tx.objectStore('srCards').clear(),
      tx.objectStore('attempts').clear(), tx.objectStore('sessions').clear(),
      tx.objectStore('plan').clear(),
    ])
  }
  await Promise.all([
    ...backup.mastery.map((r) => tx.objectStore('mastery').put(r)),
    ...backup.srCards.map((r) => tx.objectStore('srCards').put(r)),
    ...backup.attempts.map((r) => tx.objectStore('attempts').put(r)),
    ...backup.sessions.map((r) => tx.objectStore('sessions').put(r)),
    ...backup.plan.map((r) => tx.objectStore('plan').put(r)),
    tx.done,
  ])
  if (backup.profile) await putProfile(backup.profile)
  if (backup.settings) await putSettings(backup.settings)
}

/** Nuclear option, behind a confirmation in Settings. */
export const wipeAll = async (): Promise<void> => {
  const d = await db()
  const tx = d.transaction(['mastery', 'srCards', 'attempts', 'sessions', 'plan', 'kv'], 'readwrite')
  await Promise.all([
    tx.objectStore('mastery').clear(), tx.objectStore('srCards').clear(),
    tx.objectStore('attempts').clear(), tx.objectStore('sessions').clear(),
    tx.objectStore('plan').clear(), tx.objectStore('kv').clear(),
    tx.done,
  ])
}
