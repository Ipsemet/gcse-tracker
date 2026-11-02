/** Content store: the subject index and lazily-loaded per-subject content. */
import { create } from 'zustand'
import { narrowContent, loadIndex, loadSubject, type ContentIndex, type SubjectContent } from '@/lib/content'

const VARIANT_KEY = 'gcse.variants'
const FOCUS_KEY = 'gcse.focus'

/**
 * Per-subject choices — the variant (e.g. { rs: 'islam' }) and the focus topics
 * for an upcoming test. Device preferences, so localStorage is enough.
 */
const read = <T,>(key: string): Record<string, T> => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, T>
  } catch {
    return {}
  }
}

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode or blocked storage: the choice just won't survive a reload.
  }
}

interface ContentState {
  index: ContentIndex | null
  /** Content as built, before any variant choice is applied. */
  raw: Record<string, SubjectContent>
  /** Content narrowed to each subject's chosen variant — what every screen reads. */
  subjects: Record<string, SubjectContent>
  variants: Record<string, string>
  /** Topic ids Harry is focusing on per subject; empty or missing means all. */
  focus: Record<string, string[]>
  loading: Set<string>
  error: string | null
  loadIndex: () => Promise<void>
  ensureSubject: (id: string) => Promise<SubjectContent | null>
  ensureAllSubjects: () => Promise<SubjectContent[]>
  setVariant: (subjectId: string, choice: string) => void
  setFocus: (subjectId: string, topicIds: string[]) => void
  /** Re-apply the variant and focus to one subject's raw content. */
  renarrow: (subjectId: string) => void
}

export const useContent = create<ContentState>((set, get) => ({
  index: null,
  raw: {},
  subjects: {},
  variants: read<string>(VARIANT_KEY),
  focus: read<string[]>(FOCUS_KEY),
  loading: new Set(),
  error: null,

  loadIndex: async () => {
    if (get().index) return
    try {
      set({ index: await loadIndex(), error: null })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not load content' })
    }
  },

  ensureSubject: async (id) => {
    const existing = get().subjects[id]
    if (existing) return existing
    if (get().loading.has(id)) return null
    set((s) => ({ loading: new Set(s.loading).add(id) }))
    try {
      const content = await loadSubject(id)
      const narrowed = narrowContent(content, { variant: get().variants[id], focus: get().focus[id] })
      set((s) => {
        const loading = new Set(s.loading)
        loading.delete(id)
        return {
          raw: { ...s.raw, [id]: content },
          subjects: { ...s.subjects, [id]: narrowed },
          loading,
        }
      })
      return narrowed
    } catch (e) {
      set((s) => {
        const loading = new Set(s.loading)
        loading.delete(id)
        return { loading, error: e instanceof Error ? e.message : `Could not load ${id}` }
      })
      return null
    }
  },

  ensureAllSubjects: async () => {
    await get().loadIndex()
    const index = get().index
    if (!index) return []
    const loaded = await Promise.all(index.subjects.map((s) => get().ensureSubject(s.id)))
    return loaded.filter((c): c is SubjectContent => c !== null)
  },

  setVariant: (subjectId, choice) => {
    const variants = { ...get().variants, [subjectId]: choice }
    write(VARIANT_KEY, variants)
    set({ variants })
    get().renarrow(subjectId)
  },

  setFocus: (subjectId, topicIds) => {
    const focus = { ...get().focus, [subjectId]: topicIds }
    write(FOCUS_KEY, focus)
    set({ focus })
    get().renarrow(subjectId)
  },

  renarrow: (subjectId) => {
    const raw = get().raw[subjectId]
    if (!raw) return
    const narrowed = narrowContent(raw, { variant: get().variants[subjectId], focus: get().focus[subjectId] })
    set((s) => ({ subjects: { ...s.subjects, [subjectId]: narrowed } }))
  },
}))
