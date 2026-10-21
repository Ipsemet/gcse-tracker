/** Content store: the subject index and lazily-loaded per-subject content. */
import { create } from 'zustand'
import { loadIndex, loadSubject, type ContentIndex, type SubjectContent } from '@/lib/content'

interface ContentState {
  index: ContentIndex | null
  subjects: Record<string, SubjectContent>
  loading: Set<string>
  error: string | null
  loadIndex: () => Promise<void>
  ensureSubject: (id: string) => Promise<SubjectContent | null>
  ensureAllSubjects: () => Promise<SubjectContent[]>
}

export const useContent = create<ContentState>((set, get) => ({
  index: null,
  subjects: {},
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
      set((s) => {
        const loading = new Set(s.loading)
        loading.delete(id)
        return { subjects: { ...s.subjects, [id]: content }, loading }
      })
      return content
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
}))
