/** Shared hooks that stitch the content store to the progress store. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useContent } from '@/store/useContent'
import { useProgress } from '@/store/useProgress'
import type { SubjectContent } from '@/lib/content'
import type { Subject } from '@/types/spec'
import { summariseSubject, type SubjectMastery } from '@/lib/mastery'
import { daysBetween, today } from '@/lib/date'

/** Load one subject's content, returning null until it is ready. */
export const useSubject = (subjectId: string | undefined): SubjectContent | null => {
  const content = useContent((s) => (subjectId ? s.subjects[subjectId] : undefined))
  const ensureSubject = useContent((s) => s.ensureSubject)
  useEffect(() => {
    if (subjectId) void ensureSubject(subjectId)
  }, [subjectId, ensureSubject])
  return content ?? null
}

/** Load every subject's content. Used by the dashboard and planner. */
export const useAllSubjects = (): { subjects: Subject[]; content: SubjectContent[]; loading: boolean } => {
  const index = useContent((s) => s.index)
  const subjects = useContent((s) => s.subjects)
  const ensureAll = useContent((s) => s.ensureAllSubjects)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    void ensureAll()
  }, [ensureAll])

  return useMemo(() => {
    const content = Object.values(subjects)
    const expected = index?.subjects.length ?? 0
    return {
      subjects: content.map((c) => c.subject).sort((a, b) => a.priority - b.priority),
      content,
      loading: content.length < expected,
    }
  }, [subjects, index])
}

export const useSubjectMastery = (subject: Subject | null): SubjectMastery | null => {
  const mastery = useProgress((s) => s.mastery)
  return useMemo(() => (subject ? summariseSubject(subject, mastery) : null), [subject, mastery])
}

/** Days until the first exam, from the profile. */
export const useCountdown = (): { days: number; weeks: number; date: string } => {
  const examStart = useProgress((s) => s.profile.examStart)
  return useMemo(() => {
    const days = Math.max(0, daysBetween(today(), examStart))
    return { days, weeks: Math.floor(days / 7), date: examStart }
  }, [examStart])
}

/**
 * A stopwatch that survives tab switches by tracking wall-clock time rather than
 * counting ticks, so a backgrounded tab does not undercount the session.
 */
export const useStopwatch = (running: boolean): number => {
  const [seconds, setSeconds] = useState(0)
  const startedAt = useRef<number | null>(null)
  const accrued = useRef(0)

  useEffect(() => {
    if (running) {
      startedAt.current = Date.now()
      const tick = setInterval(() => {
        const base = startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0
        setSeconds(Math.floor(accrued.current + base))
      }, 500)
      return () => {
        if (startedAt.current) accrued.current += (Date.now() - startedAt.current) / 1000
        startedAt.current = null
        clearInterval(tick)
      }
    }
    return undefined
  }, [running])

  return seconds
}

/** Short chime on a correct answer or a finished timer. Respects the sound setting. */
export const useChime = () => {
  const soundEnabled = useProgress((s) => s.settings.soundEnabled)
  return useMemo(() => (kind: 'good' | 'bad' | 'done' = 'good') => {
    if (!soundEnabled) return
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const notes = kind === 'good' ? [660, 880] : kind === 'bad' ? [280, 200] : [523, 659, 784]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.09)
        gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + i * 0.09 + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.09 + 0.2)
        osc.connect(gain).connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.09)
        osc.stop(ctx.currentTime + i * 0.09 + 0.22)
      })
      setTimeout(() => void ctx.close(), 900)
    } catch {
      // Audio can be blocked before a user gesture; never let that break a session.
    }
  }, [soundEnabled])
}
