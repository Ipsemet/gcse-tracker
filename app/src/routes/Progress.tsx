import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllSubjects } from '@/lib/hooks'
import { useProgress } from '@/store/useProgress'
import { Bar, Card, Empty, Loading, Pill, Ring, Stat, SubjectBadge } from '@/components/ui'
import { estimateGrade, rag, summariseSubject } from '@/lib/mastery'
import { BADGES, levelProgress } from '@/lib/xp'
import { getAllAttempts, getAllSessions } from '@/lib/db'
import { addDays, formatShort, formatDuration, today } from '@/lib/date'
import type { Attempt, StudySession } from '@/types/progress'
import type { BadgeStats } from '@/lib/xp'

export default function Progress() {
  const { subjects, loading } = useAllSubjects()
  const profile = useProgress((s) => s.profile)
  const mastery = useProgress((s) => s.mastery)
  const srCards = useProgress((s) => s.srCards)
  const [attempts, setAttempts] = useState<Attempt[] | null>(null)
  const [sessions, setSessions] = useState<StudySession[] | null>(null)

  useEffect(() => {
    void Promise.all([getAllAttempts(), getAllSessions()]).then(([a, s]) => {
      setAttempts(a)
      setSessions(s)
    })
  }, [])

  const summaries = useMemo(
    () => subjects.map((s) => ({ subject: s, m: summariseSubject(s, mastery) })),
    [subjects, mastery],
  )

  // Last 28 days of activity, for the heat strip.
  const activity = useMemo(() => {
    if (!sessions) return []
    const byDay = new Map<string, number>()
    for (const s of sessions) {
      const day = s.startedAt.slice(0, 10)
      byDay.set(day, (byDay.get(day) ?? 0) + s.seconds)
    }
    return Array.from({ length: 28 }, (_, i) => {
      const date = addDays(today(), i - 27)
      return { date, seconds: byDay.get(date) ?? 0 }
    })
  }, [sessions])

  const stats: BadgeStats | null = useMemo(() => {
    if (!attempts || !sessions) return null
    const hourOf = (iso: string) => new Date(iso).getHours()
    return {
      cardsReviewed: [...srCards.values()].reduce((s, c) => s + c.repetitions + c.lapses, 0),
      questionsAnswered: attempts.length,
      marksEarned: attempts.reduce((s, a) => s + a.marksEarned, 0),
      topicsRead: sessions.filter((s) => s.kind === 'learn').length,
      papersCompleted: sessions.filter((s) => s.kind === 'paper' && s.endedAt).length,
      streakCurrent: profile.streak.current,
      streakLongest: profile.streak.longest,
      greenPoints: [...mastery.values()].filter((m) => m.score >= 0.75).length,
      subjectsStarted: new Set([...mastery.values()].map((m) => m.subjectId)).size,
      perfectQuizzes: sessions.filter((s) => s.kind === 'quiz' && s.marksAvailable > 0 && s.marksEarned === s.marksAvailable).length,
      earlyBirdSessions: sessions.filter((s) => hourOf(s.startedAt) < 8).length,
      lateNightSessions: sessions.filter((s) => hourOf(s.startedAt) >= 22).length,
    }
  }, [attempts, sessions, srCards, mastery, profile.streak])

  if (loading && subjects.length === 0) return <Loading />
  if (!stats || !attempts) return <Loading label="Working out your numbers…" />

  const level = levelProgress(profile.xp)
  const marksAvailable = attempts.reduce((s, a) => s + a.marksAvailable, 0)
  const accuracy = marksAvailable > 0 ? Math.round((stats.marksEarned / marksAvailable) * 100) : 0
  const totalSeconds = sessions?.reduce((s, x) => s + x.seconds, 0) ?? 0
  const held = new Set(profile.badges.map((b) => b.id))
  const maxSeconds = Math.max(1, ...activity.map((a) => a.seconds))

  return (
    <div className="stack-lg fade-up">
      <div className="row row-wrap" style={{ gap: 16 }}>
        <Ring value={level.pct} size={72} stroke={6}>{`L${level.level}`}</Ring>
        <div>
          <h1>Progress</h1>
          <p className="muted small" style={{ marginTop: 2 }}>
            {profile.xp.toLocaleString('en-GB')} XP · {level.needed - level.into} to level {level.level + 1}
          </p>
        </div>
      </div>

      <div className="grid grid-4">
        <Stat value={stats.questionsAnswered} label="Questions answered" />
        <Stat value={`${accuracy}%`} label="Mark accuracy" tone={accuracy >= 70 ? 'green' : accuracy >= 50 ? 'amber' : 'red'} sub={`${stats.marksEarned}/${marksAvailable} marks`} />
        <Stat value={stats.cardsReviewed} label="Cards reviewed" sub={`${srCards.size} in rotation`} />
        <Stat value={formatDuration(totalSeconds)} label="Time studied" sub={`${sessions?.length ?? 0} sessions`} />
      </div>

      <Card>
        <div className="card-head">
          <h3>Last four weeks</h3>
          <div className="spacer" />
          <span className="tiny dim">🔥 {profile.streak.current} day streak · longest {profile.streak.longest}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 3 }}>
          {activity.map((a) => {
            const intensity = a.seconds === 0 ? 0 : 0.25 + 0.75 * (a.seconds / maxSeconds)
            return (
              <div
                key={a.date}
                title={`${formatShort(a.date)} — ${a.seconds > 0 ? formatDuration(a.seconds) : 'nothing'}`}
                style={{
                  aspectRatio: '1', borderRadius: 3,
                  background: a.seconds === 0 ? 'var(--surface-2)' : `rgb(52 217 154 / ${intensity})`,
                  border: a.date === today() ? '1px solid var(--accent)' : 'none',
                }}
              />
            )
          })}
        </div>
        <div className="row tiny dim" style={{ marginTop: 7 }}>
          <span>{formatShort(activity[0]?.date ?? today())}</span>
          <div className="spacer" />
          <span>today</span>
        </div>
      </Card>

      <section>
        <div className="card-head"><h2>By subject</h2></div>
        <div className="stack-sm">
          {summaries.map(({ subject, m }) => {
            const estimate = estimateGrade(subject, m)
            const target = profile.targets[subject.id]
            return (
              <Card key={subject.id} className="card-tight">
                <div className="row" style={{ marginBottom: 9 }}>
                  <SubjectBadge icon={subject.icon} colour={subject.colour} size={30} />
                  <Link to={`/subject/${subject.id}`} style={{ color: 'inherit', flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 650, fontSize: '0.9rem' }}>{subject.name}</div>
                    <div className="tiny dim">{subject.board} {subject.specCode}</div>
                  </Link>
                  <div style={{ textAlign: 'right' }}>
                    <div className="stat-label">Est. grade</div>
                    <div style={{
                      fontSize: '1.15rem', fontWeight: 700,
                      color: estimate.grade === null ? 'var(--text-dim)'
                        : target && estimate.grade >= target ? 'var(--green)'
                          : estimate.grade >= 5 ? 'var(--amber)' : 'var(--red)',
                    }}>
                      {estimate.grade ?? '—'}{target ? <span className="tiny dim"> / {target}</span> : null}
                    </div>
                  </div>
                </div>
                <Bar value={m.overall} tone={rag(m.overall)} height={6} />
                <div className="row tiny dim" style={{ marginTop: 6, gap: 12, flexWrap: 'wrap' }}>
                  <span>{Math.round(m.overall * 100)}% of spec</span>
                  <span>🟢 {m.counts.green} · 🟡 {m.counts.amber} · 🔴 {m.counts.red} · ⚪ {m.counts.untouched}</span>
                  <div className="spacer" />
                  {estimate.basis === 'percentage' ? (
                    <span title="No published grade boundaries loaded for this subject">rough estimate</span>
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
        <p className="tiny dim" style={{ marginTop: 10 }}>
          Estimated grades project what these spec points suggest, on content covered so far. They are not
          predictions, and they are not what the school will report.
        </p>
      </section>

      <section>
        <div className="card-head">
          <h2>Badges</h2>
          <div className="spacer" />
          <Pill tone="accent">{profile.badges.length} / {BADGES.length}</Pill>
        </div>
        <div className="grid grid-4">
          {BADGES.map((badge) => {
            const earned = held.has(badge.id)
            const progress = badge.progress(stats)
            return (
              <Card
                key={badge.id}
                className="card-tight"
                style={{ opacity: earned ? 1 : 0.62, textAlign: 'center' }}
              >
                <div style={{ fontSize: '1.7rem', filter: earned ? 'none' : 'grayscale(1)' }}>{badge.icon}</div>
                <div style={{ fontWeight: 650, fontSize: '0.82rem', marginTop: 4 }}>{badge.name}</div>
                <div className="tiny dim" style={{ marginTop: 2, minHeight: 30 }}>{badge.description}</div>
                {!earned ? (
                  <div style={{ marginTop: 7 }}>
                    <Bar value={progress} height={4} />
                    <div className="tiny dim" style={{ marginTop: 3 }}>{Math.round(progress * 100)}%</div>
                  </div>
                ) : (
                  <Pill tone="green">earned</Pill>
                )}
              </Card>
            )
          })}
        </div>
      </section>

      {attempts.length === 0 ? (
        <Empty icon="📊" title="No data yet">
          Answer some questions and the picture here fills in.
        </Empty>
      ) : null}
    </div>
  )
}
