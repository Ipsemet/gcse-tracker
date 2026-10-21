import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '@/store/useProgress'
import { useAllSubjects, useCountdown } from '@/lib/hooks'
import { Bar, Card, Empty, Loading, Notice, Pill, Ring, Stat, SubjectBadge } from '@/components/ui'
import { summariseSubject, rag } from '@/lib/mastery'
import { weakestPoints } from '@/lib/planner'
import { levelProgress } from '@/lib/xp'
import { formatMinutes, today } from '@/lib/date'

export default function Dashboard() {
  const { subjects, loading } = useAllSubjects()
  const profile = useProgress((s) => s.profile)
  const mastery = useProgress((s) => s.mastery)
  const srCards = useProgress((s) => s.srCards)
  const plan = useProgress((s) => s.plan)
  const ensurePlan = useProgress((s) => s.ensurePlan)
  const runReschedule = useProgress((s) => s.runReschedule)
  const lastReschedule = useProgress((s) => s.lastReschedule)
  const countdown = useCountdown()

  const todayKey = today()

  // Build the plan and reconcile missed days once the subjects are in.
  useEffect(() => {
    if (subjects.length === 0) return
    void (async () => {
      await ensurePlan(subjects)
      await runReschedule(subjects)
    })()
  }, [subjects, ensurePlan, runReschedule])

  const dueCount = useMemo(
    () => [...srCards.values()].filter((c) => c.due <= todayKey).length,
    [srCards, todayKey],
  )

  const summaries = useMemo(
    () => subjects.map((s) => ({ subject: s, mastery: summariseSubject(s, mastery) })),
    [subjects, mastery],
  )

  const weak = useMemo(() => weakestPoints(subjects, mastery, 6), [subjects, mastery])
  const day = plan.get(todayKey)
  const outstanding = day?.slots.filter((s) => !s.done) ?? []
  const doneToday = day?.slots.filter((s) => s.done).length ?? 0
  const level = levelProgress(profile.xp)

  if (loading && subjects.length === 0) return <Loading label="Loading subjects…" />

  return (
    <div className="stack-lg fade-up">
      <section>
        <div className="row row-wrap" style={{ marginBottom: 14 }}>
          <div>
            <h1>Right then, {profile.name}.</h1>
            <p className="muted small" style={{ margin: '2px 0 0' }}>
              {outstanding.length > 0
                ? `${outstanding.length} block${outstanding.length === 1 ? '' : 's'} left today — about ${formatMinutes(outstanding.reduce((s, x) => s + x.minutes, 0))}.`
                : doneToday > 0
                  ? 'Today is done. Good work.'
                  : 'Nothing scheduled today.'}
            </p>
          </div>
          <div className="spacer" />
          <div className="row" style={{ gap: 12 }}>
            <Ring value={level.pct} size={54}>{`L${level.level}`}</Ring>
            <div>
              <div className="stat-label">Streak</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {profile.streak.current > 0 ? '🔥' : '·'} {profile.streak.current}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-4">
          <Stat
            value={countdown.days}
            label="Days to GCSEs"
            tone={countdown.days < 120 ? 'red' : countdown.days < 300 ? 'amber' : 'accent'}
            sub={`${countdown.weeks} weeks · ${countdown.date}`}
          />
          <Stat value={dueCount} label="Cards due" tone={dueCount > 40 ? 'amber' : 'accent'} sub="Spaced repetition" />
          <Stat value={profile.xp.toLocaleString('en-GB')} label="XP" sub={`${level.needed - level.into} to level ${level.level + 1}`} />
          <Stat
            value={`${Math.round((summaries.reduce((s, x) => s + x.mastery.overall, 0) / Math.max(1, summaries.length)) * 100)}%`}
            label="Spec covered"
            sub={`${summaries.reduce((s, x) => s + x.mastery.counts.total - x.mastery.counts.untouched, 0)} of ${summaries.reduce((s, x) => s + x.mastery.counts.total, 0)} points`}
          />
        </div>
      </section>

      {lastReschedule && (lastReschedule.moved > 0 || lastReschedule.dropped > 0) ? (
        <Notice variant={lastReschedule.dropped > 0 ? 'warn' : 'info'}>
          {lastReschedule.moved > 0 && `Moved ${lastReschedule.moved} missed block${lastReschedule.moved === 1 ? '' : 's'} forward. `}
          {lastReschedule.dropped > 0 && `${lastReschedule.dropped} couldn't be fitted in and were dropped — there is more work than time in the next fortnight.`}
        </Notice>
      ) : null}

      <section>
        <div className="card-head">
          <h2>Today</h2>
          <div className="spacer" />
          <Link to="/plan" className="btn btn-ghost btn-sm">Full plan →</Link>
        </div>

        {outstanding.length === 0 ? (
          <Empty icon={doneToday > 0 ? '✅' : '🌤️'} title={doneToday > 0 ? 'All done for today' : 'Nothing scheduled'}>
            {doneToday > 0
              ? `${doneToday} block${doneToday === 1 ? '' : 's'} completed. Anything else you do today is a bonus.`
              : 'Add some study time in Settings, or start a topic yourself from Subjects.'}
          </Empty>
        ) : (
          <div className="grid grid-2">
            {outstanding.map((slot) => {
              const subject = subjects.find((s) => s.id === slot.subjectId)
              if (!subject) return null
              const href = slot.kind === 'flashcards'
                ? `/subject/${subject.id}/cards`
                : slot.topicIds[0]
                  ? slot.kind === 'quiz'
                    ? `/subject/${subject.id}/quiz/${slot.topicIds[0]}`
                    : `/subject/${subject.id}/topic/${slot.topicIds[0]}`
                  : `/subject/${subject.id}`
              return (
                <Link key={slot.id} to={href} style={{ color: 'inherit' }}>
                  <Card className="card-tight" style={{ borderLeft: `3px solid ${subject.colour}` }}>
                    <div className="row">
                      <SubjectBadge icon={subject.icon} colour={subject.colour} size={32} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="row" style={{ gap: 6 }}>
                          <strong style={{ fontSize: '0.9rem' }}>{subject.shortName}</strong>
                          <Pill>{slot.kind}</Pill>
                          {slot.rescheduled ? <Pill tone="amber">carried over</Pill> : null}
                        </div>
                        <div className="small muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {slot.label}
                        </div>
                      </div>
                      <span className="tiny dim nowrap">{slot.minutes}m</span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <div className="card-head">
          <h2>Subjects</h2>
          <div className="spacer" />
          <Link to="/subjects" className="btn btn-ghost btn-sm">All subjects →</Link>
        </div>
        <div className="grid grid-3">
          {summaries.map(({ subject, mastery: m }) => (
            <Link key={subject.id} to={`/subject/${subject.id}`} style={{ color: 'inherit' }}>
              <Card className="card-tight">
                <div className="row" style={{ marginBottom: 10 }}>
                  <SubjectBadge icon={subject.icon} colour={subject.colour} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 650, fontSize: '0.9rem' }}>{subject.shortName}</div>
                    <div className="tiny dim">{subject.board} {subject.specCode}</div>
                  </div>
                  <div className="spacer" />
                  <Ring value={m.overall} size={40} colour={subject.colour}>
                    {`${Math.round(m.overall * 100)}%`}
                  </Ring>
                </div>
                <Bar value={m.overall} tone={rag(m.overall)} height={5} />
                <div className="row tiny dim" style={{ marginTop: 7 }}>
                  <span>🟢 {m.counts.green}</span>
                  <span>🟡 {m.counts.amber}</span>
                  <span>🔴 {m.counts.red}</span>
                  <div className="spacer" />
                  <span>{m.counts.untouched} to start</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {weak.length > 0 ? (
        <section>
          <div className="card-head"><h2>Needs work</h2></div>
          <Card className="card-flush">
            {weak.map((row, i) => {
              const subject = subjects.find((s) => s.id === row.subjectId)
              return (
                <Link
                  key={row.pointId}
                  to={`/subject/${row.subjectId}/topic/${row.topicId}`}
                  style={{
                    color: 'inherit', display: 'block', padding: '11px 15px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div className="row">
                    <span className="mono tiny dim nowrap" style={{ minWidth: 52 }}>{row.code}</span>
                    <span className="small" style={{ flex: 1, minWidth: 0 }}>{row.statement}</span>
                    <Pill tone={rag(row.score)}>{Math.round(row.score * 100)}%</Pill>
                    {subject ? <span title={subject.name}>{subject.icon}</span> : null}
                  </div>
                </Link>
              )
            })}
          </Card>
        </section>
      ) : null}
    </div>
  )
}
