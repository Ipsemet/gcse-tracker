/**
 * Content loading.
 *
 * The compiled JSON in public/content/ is fetched on demand and memoised. The
 * service worker caches it stale-while-revalidate, so content is available
 * offline and refreshes without a rebuild.
 */
import type { Subject, SpecTopic, SpecUnit, SpecPoint } from '@/types/spec'
import type { Flashcard, Question, TopicNote } from '@/types/content'

export interface ContentIndexEntry {
  id: string
  name: string
  shortName: string
  board: Subject['board']
  specCode: string
  examSeries: string
  examDate: string | null
  confidence: Subject['confidence']
  confidenceNote: string | null
  colour: string
  icon: string
  priority: number
  specPointCount: number
  coverage: {
    specPoints: number
    withNotes: number
    withFlashcards: number
    withQuestions: number
    topics: number
    topicsWithNotes: number
    flashcards: number
    questions: number
    totalMarks: number
  }
}

export interface ContentIndex {
  builtAt: string
  subjects: ContentIndexEntry[]
}

export interface SubjectContent {
  subject: Subject
  notes: TopicNote[]
  flashcards: Flashcard[]
  questions: Question[]
}

const base = import.meta.env.BASE_URL
const url = (path: string) => `${base}content/${path}`.replace(/([^:]\/)\/+/g, '$1')

const cache = new Map<string, Promise<unknown>>()

const fetchJson = <T>(path: string): Promise<T> => {
  let hit = cache.get(path) as Promise<T> | undefined
  if (!hit) {
    hit = fetch(url(path)).then((r) => {
      if (!r.ok) throw new Error(`Could not load ${path} (${r.status})`)
      return r.json() as Promise<T>
    })
    // A failed fetch must not poison the cache — a retry should be able to work.
    hit.catch(() => cache.delete(path))
    cache.set(path, hit)
  }
  return hit
}

export const loadIndex = (): Promise<ContentIndex> => fetchJson<ContentIndex>('index.json')

export const loadSubject = async (id: string): Promise<SubjectContent> => {
  const [subject, notes, flashcards, questions] = await Promise.all([
    fetchJson<Subject>(`${id}/spec.json`),
    fetchJson<TopicNote[]>(`${id}/notes.json`),
    fetchJson<Flashcard[]>(`${id}/flashcards.json`),
    fetchJson<Question[]>(`${id}/questions.json`),
  ])
  return { subject, notes, flashcards, questions }
}

// --- Lookups -----------------------------------------------------------------

export const allTopics = (subject: Subject): SpecTopic[] =>
  subject.units.flatMap((u) => u.topics)

export const allPoints = (subject: Subject): SpecPoint[] =>
  subject.units.flatMap((u) => u.topics.flatMap((t) => t.points))

export const findTopic = (subject: Subject, topicId: string): { unit: SpecUnit; topic: SpecTopic } | null => {
  for (const unit of subject.units) {
    const topic = unit.topics.find((t) => t.id === topicId)
    if (topic) return { unit, topic }
  }
  return null
}

export const findPoint = (subject: Subject, pointId: string): SpecPoint | null =>
  allPoints(subject).find((p) => p.id === pointId) ?? null

export const topicIdForPoint = (subject: Subject, pointId: string): string | null => {
  for (const unit of subject.units) {
    for (const topic of unit.topics) {
      if (topic.points.some((p) => p.id === pointId)) return topic.id
    }
  }
  return null
}

/** Questions that test any of the given spec points. */
export const questionsForPoints = (questions: Question[], pointIds: string[]): Question[] => {
  const want = new Set(pointIds)
  return questions.filter((q) => q.specPointIds.some((p) => want.has(p)))
}

export const cardsForPoints = (cards: Flashcard[], pointIds: string[]): Flashcard[] => {
  const want = new Set(pointIds)
  return cards.filter((c) => c.specPointIds.some((p) => want.has(p)))
}

export const questionsForTopic = (subject: Subject, questions: Question[], topicId: string): Question[] => {
  const found = findTopic(subject, topicId)
  if (!found) return []
  return questionsForPoints(questions, found.topic.points.map((p) => p.id))
}

export const cardsForTopic = (subject: Subject, cards: Flashcard[], topicId: string): Flashcard[] => {
  const found = findTopic(subject, topicId)
  if (!found) return []
  return cardsForPoints(cards, found.topic.points.map((p) => p.id))
}

export const noteForTopic = (notes: TopicNote[], topicId: string): TopicNote | null =>
  notes.find((n) => n.topicId === topicId) ?? null

/**
 * Assemble a quiz. Weakest points first, capped per point so one topic cannot
 * take over, then shuffled so the order does not telegraph the difficulty.
 */
export const buildQuiz = (
  questions: Question[],
  {
    pointIds,
    count = 10,
    scoreFor,
    maxPerPoint = 2,
    excludeIds = [],
  }: {
    pointIds?: string[]
    count?: number
    scoreFor?: (pointId: string) => number
    maxPerPoint?: number
    excludeIds?: string[]
  } = {},
): Question[] => {
  const skip = new Set(excludeIds)
  let pool = questions.filter((q) => !skip.has(q.id))
  if (pointIds?.length) {
    const want = new Set(pointIds)
    pool = pool.filter((q) => q.specPointIds.some((p) => want.has(p)))
  }

  // Rank by the weakest spec point each question touches.
  const ranked = pool
    .map((q) => ({
      q,
      weakest: scoreFor
        ? Math.min(...q.specPointIds.map((p) => scoreFor(p)))
        : Math.random(),
    }))
    .sort((a, b) => a.weakest - b.weakest)

  const used = new Map<string, number>()
  const picked: Question[] = []
  for (const { q } of ranked) {
    if (picked.length >= count) break
    const over = q.specPointIds.some((p) => (used.get(p) ?? 0) >= maxPerPoint)
    if (over) continue
    for (const p of q.specPointIds) used.set(p, (used.get(p) ?? 0) + 1)
    picked.push(q)
  }

  // Top up if the per-point cap left the quiz short.
  if (picked.length < count) {
    const have = new Set(picked.map((q) => q.id))
    for (const { q } of ranked) {
      if (picked.length >= count) break
      if (!have.has(q.id)) picked.push(q)
    }
  }

  return shuffle(picked)
}

export const shuffle = <T>(items: T[]): T[] => {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
