import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAllSubjects, useChime, useStopwatch, useSubject } from '@/lib/hooks'
import { useProgress } from '@/store/useProgress'
import { Card, Empty, Loading, Pill, SubjectBadge } from '@/components/ui'
import { buildQueue, isMature } from '@/lib/sm2'
import { cardsForTopic } from '@/lib/content'
import { formatDuration, today } from '@/lib/date'
import type { Flashcard } from '@/types/content'
import type { RecallGrade } from '@/types/progress'

/** SM-2 grades, reduced to four buttons a tired teenager will actually use. */
const GRADES: { grade: RecallGrade; label: string; key: string; colour: string }[] = [
  { grade: 1, label: 'No idea', key: '1', colour: 'var(--red)' },
  { grade: 3, label: 'Hard', key: '2', colour: 'var(--amber)' },
  { grade: 4, label: 'Got it', key: '3', colour: 'var(--green)' },
  { grade: 5, label: 'Easy', key: '4', colour: 'var(--cyan)' },
]

export default function Flashcards() {
  const { subjectId, topicId } = useParams()
  const single = useSubject(subjectId)
  const all = useAllSubjects()
  const srCards = useProgress((s) => s.srCards)
  const reviewCard = useProgress((s) => s.reviewCard)
  const saveSession = useProgress((s) => s.saveSession)
  const chime = useChime()

  const [queue, setQueue] = useState<string[] | null>(null)
  const [position, setPosition] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState({ reviewed: 0, good: 0 })
  const [startedAt] = useState(() => new Date().toISOString())
  const seconds = useStopwatch(true)

  // The card pool: one topic, one subject, or everything.
  const pool = useMemo<Flashcard[]>(() => {
    if (subjectId) {
      if (!single) return []
      if (topicId) return cardsForTopic(single.subject, single.flashcards, topicId)
      return single.flashcards
    }
    return all.content.flatMap((c) => c.flashcards)
  }, [subjectId, topicId, single, all.content])

  const byId = useMemo(() => new Map(pool.map((c) => [c.id, c])), [pool])

  // Build the queue once, from the state at the moment the session starts —
  // reviewing a card changes its due date, and a live queue would drop it mid-session.
  useEffect(() => {
    if (queue !== null || pool.length === 0) return
    const relevant = [...srCards.values()].filter((c) => byId.has(c.cardId))
    const built = buildQueue(relevant, pool.map((c) => ({ id: c.id, subjectId: c.subjectId })), {
      limit: 40,
      newLimit: 15,
    })
    setQueue(built.map((c) => c.cardId))
  }, [pool, srCards, byId, queue])

  const finish = useCallback(async () => {
    if (stats.reviewed === 0) return
    await saveSession({
      id: `sess-${Date.now()}`,
      subjectId: subjectId ?? 'mixed',
      kind: 'flashcards',
      startedAt,
      endedAt: new Date().toISOString(),
      seconds,
      specPointIds: [],
      marksEarned: 0,
      marksAvailable: 0,
      xpEarned: 0,
    })
  }, [saveSession, startedAt, seconds, stats.reviewed, subjectId])

  const grade = async (g: RecallGrade) => {
    if (!queue) return
    const cardId = queue[position]
    const card = byId.get(cardId)
    if (!card) return

    const { againInMinutes } = await reviewCard(cardId, card.subjectId, g)
    chime(g >= 3 ? 'good' : 'bad')
    setStats((s) => ({ reviewed: s.reviewed + 1, good: s.good + (g >= 3 ? 1 : 0) }))

    // Cards still in the learning steps come back later in this same session.
    const next = [...queue]
    next.splice(position, 1)
    if (againInMinutes !== null) {
      const gap = Math.min(next.length, againInMinutes <= 1 ? 2 : 8)
      next.splice(Math.min(position + gap, next.length), 0, cardId)
    }

    setQueue(next)
    setRevealed(false)
    if (position >= next.length) {
      setPosition(next.length)
      void finish()
    }
  }

  // Keyboard: space to flip, 1-4 to grade.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!queue || position >= queue.length) return
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault()
        setRevealed(true)
        return
      }
      if (!revealed) return
      const hit = GRADES.find((g) => g.key === e.key)
      if (hit) {
        e.preventDefault()
        void grade(hit.grade)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const backHref = subjectId ? `/subject/${subjectId}` : '/'

  if (!queue) return <Loading label="Building your review queue…" />

  if (pool.length === 0) {
    return (
      <div className="fade-up">
        <Link to={backHref} className="tiny dim">← Back</Link>
        <div style={{ marginTop: 14 }}>
          <Empty icon="🃏" title="No flashcards here yet">
            Flashcards get written per spec point. None exist for this selection so far.
          </Empty>
        </div>
      </div>
    )
  }

  const done = position >= queue.length
  const card = done ? null : byId.get(queue[position])
  const subject = card ? all.subjects.find((s) => s.id === card.subjectId) : null
  const existing = card ? srCards.get(card.id) : undefined

  if (done) {
    const accuracy = stats.reviewed > 0 ? Math.round((stats.good / stats.reviewed) * 100) : 0
    return (
      <div className="fade-up" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: '3.2rem' }} className="pop">🎉</div>
        <h1 style={{ marginTop: 10 }}>Queue cleared</h1>
        <p className="muted">{stats.reviewed} card{stats.reviewed === 1 ? '' : 's'} reviewed in {formatDuration(seconds)}.</p>
        <div className="grid grid-3" style={{ marginTop: 22 }}>
          <Card className="card-tight"><div className="stat-label">Reviewed</div><div className="stat-value">{stats.reviewed}</div></Card>
          <Card className="card-tight"><div className="stat-label">Recalled</div><div className="stat-value" style={{ color: 'var(--green)' }}>{accuracy}%</div></Card>
          <Card className="card-tight"><div className="stat-label">Time</div><div className="stat-value">{formatDuration(seconds)}</div></Card>
        </div>
        <div className="btn-group" style={{ marginTop: 24, justifyContent: 'center' }}>
          <Link to={backHref} className="btn btn-primary">Done</Link>
          <button className="btn" onClick={() => { setQueue(null); setPosition(0); setStats({ reviewed: 0, good: 0 }) }}>
            Go again
          </button>
        </div>
      </div>
    )
  }

  if (!card) return <Loading />

  return (
    <div className="fade-up" style={{ maxWidth: 660, margin: '0 auto' }}>
      <div className="row" style={{ marginBottom: 16 }}>
        <Link to={backHref} className="btn btn-ghost btn-sm">← Exit</Link>
        <div className="spacer" />
        {subject ? <SubjectBadge icon={subject.icon} colour={subject.colour} size={26} /> : null}
        <span className="tiny dim">{position + 1} / {queue.length}</span>
        <span className="tiny dim">{formatDuration(seconds)}</span>
      </div>

      <div className="bar" style={{ marginBottom: 18 }}>
        <div className="bar-fill" style={{ width: `${(position / queue.length) * 100}%` }} />
      </div>

      <Card style={{ minHeight: 280, display: 'flex', flexDirection: 'column' }}>
        <div className="row" style={{ marginBottom: 14 }}>
          <Pill>{card.kind}</Pill>
          {existing ? (
            <Pill tone={isMature(existing) ? 'green' : 'amber'}>
              {existing.learning ? 'learning' : `${existing.interval}d interval`}
            </Pill>
          ) : (
            <Pill tone="accent">new</Pill>
          )}
          <div className="spacer" />
          {existing && existing.lapses > 0 ? <span className="tiny dim">{existing.lapses} lapses</span> : null}
        </div>

        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '18px 4px' }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: '1.14rem', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {card.front}
            </div>

            {revealed ? (
              <div className="fade-up" style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                  {card.back}
                </div>
                {card.items?.length ? (
                  <ul style={{ textAlign: 'left', margin: '14px auto 0', maxWidth: 420, paddingLeft: 20 }} className="small muted">
                    {card.items.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
                  </ul>
                ) : null}
              </div>
            ) : card.hint ? (
              <div className="small dim" style={{ marginTop: 16 }}>Hint: {card.hint}</div>
            ) : null}
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        {!revealed ? (
          <button className="btn btn-primary btn-lg btn-block" onClick={() => setRevealed(true)}>
            Show answer <span className="tiny dim" style={{ marginLeft: 4 }}>space</span>
          </button>
        ) : (
          <div className="grid grid-4" style={{ gap: 8 }}>
            {GRADES.map((g) => (
              <button
                key={g.grade}
                className="btn"
                onClick={() => void grade(g.grade)}
                style={{ borderColor: g.colour, color: g.colour, flexDirection: 'column', gap: 1, padding: '11px 6px' }}
              >
                <span>{g.label}</span>
                <span className="tiny dim">{g.key}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="row tiny dim" style={{ marginTop: 14, justifyContent: 'center', gap: 16 }}>
        <span>Reviewed {stats.reviewed}</span>
        <span>Due today {[...srCards.values()].filter((c) => c.due <= today() && byId.has(c.cardId)).length}</span>
      </div>
    </div>
  )
}
