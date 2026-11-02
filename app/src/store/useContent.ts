/** Content store: the subject index and lazily-loaded per-subject content. */
import { create } from 'zustand'
import { applyVariant, loadIndex, loadSubject, type ContentIndex, type SubjectContent } from '@/lib/content'

const VARIANT_KEY = 'gcse.variants'

/** The per-subject choice (e.g. { rs: 'islam' }). A device preference, so localStorage is enough. */
const readVariants = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(VARIANT_KEY) ?? '{}') as Record<string, string>
  } catch {
    return {}
  }
}

const writeVariants = (v: Record<string, string>) => {
  try {
    localStorage.setItem(VARIANT_KEY, JSON.stringify(v))
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
  loading: Set<string>
  error: string | null
  loadIndex: () => Promise<void>
  ensureSubject: (id: string) => Promise<SubjectContent | null>
  ensureAllSubjects: () => Promise<SubjectContent[]>
  setVariant: (subjectId: string, choice: string) => void
}

export const useContent = create<ContentState>((set, get) => ({
  index: null,
  raw: {},
  subjects: {},
  variants: readVariants(),
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
      const narrowed = applyVariant(content, get().variants[id])
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
    writeVariants(variants)
    const raw = get().raw[subjectId]
    set((s) => ({
      variants,
      subjects: raw ? { ...s.subjects, [subjectId]: applyVariant(raw, choice) } : s.subjects,
    }))
  },
}))
