import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllSubjects, useCountdown } from '@/lib/hooks'
import { useProgress } from '@/store/useProgress'
import { Card, Empty, Loading, Notice, Pill, Stat, SubjectBadge } from '@/components/ui'
import { addDays, formatMinutes, formatWeekday, formatShort, startOfWeek, today } from '@/lib/date'
import { dayLoad } from '@/lib/planner'

export default function Plan() {
  const { subjects, loading } = useAllSubjects()
  const plan = useProgress((s) => s.plan)
  const settings = useProgress((s) => s.settings)
  const ensurePlan = useProgress((s) => s.ensurePlan)
  const runReschedule = useProgress((s) => s.runReschedule)
  const regenerateDay = useProgress((s) => s.regenerateDay)
  const completeSlot = useProgress((s) => s.completeSlot)
  const lastReschedule = useProgress((s) => s.lastReschedule)
  const countdown = useCountdown()
  const [weekOffset, setWeekOffset] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (subjects.length > 0) void ensurePlan(subjects, 21)
  }, [subjects, ensurePlan])

  const weekStart = useMemo(() => addDays(startOfWeek(today()), weekOffset * 7), [weekOffset])
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const weekTotal = days.reduce((sum, d) => sum + (plan.get(d)?.slots.reduce((s, x) => s + x.minutes, 0) ?? 0), 0)
  const weekDone = days.reduce(
    (sum, d) => sum + (plan.get(d)?.slots.filter((s) => s.done).reduce((s, x) => s + x.minutes, 0) ?? 0),
    0,
  )

  if (loading && subjects.length === 0) return <Loading label="Loading plan…" />

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try { await fn() } finally { setBusy(false) }
  }

  return (
    <div className="stack-lg fade-up">
      <div className="row row-wrap">
        <div>
          <h1>Plan</h1>
          <p className="muted small" style={{ marginTop: 2 }}>
            Rebuilt from what you actually know. Missed blocks move forward automatically.
          </p>
        </div>
        <div className="spacer" />
        <button className="btn btn-sm" disabled={busy} onClick={() => void run(() => runReschedule(subjects))}>
          {busy ? 'Working…' : '↻ Reschedule now'}
        </button>
      </div>

      <div className="grid grid-4">
        <Stat value={countdown.days} label="Days to GCSEs" sub={`${countdown.weeks} weeks`} />
        <Stat value={formatMinutes(weekTotal)} label="Planned this week" sub={`${formatMinutes(weekDone)} done`} />
        <Stat
          value={`${weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0}%`}
          label="Week complete"
          tone={weekTotal > 0 && weekDone / weekTotal >= 0.8 ? 'green' : 'amber'}
        />
        <Stat
          value={formatMinutes(settings.weeklyCapacity.reduce((a, b) => a + b, 0))}
          label="Weekly capacity"
          sub="Change in Settings"
        />
      </div>

      {lastReschedule && lastReschedule.dropped > 0 ? (
        <Notice variant="warn">
          {lastReschedule.dropped} block{lastReschedule.dropped === 1 ? '' : 's'} could not be fitted into the
          next fortnight and were dropped. Either raise your weekly capacity in Settings, or accept that some
          content gets covered later.
        </Notice>
      ) : null}

      <div className="row">
        <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset((w) => w - 1)}>← Previous</button>
        <div className="spacer" />
        <strong className="small">
          {formatShort(weekStart)} – {formatShort(addDays(weekStart, 6))}
          {weekOffset === 0 ? ' · this week' : ''}
        </strong>
        <div className="spacer" />
        <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset((w) => w + 1)}>Next →</button>
      </div>

      <div className="stack-sm">
        {days.map((date) => {
          const day = plan.get(date)
          const isToday = date === today()
          const isPast = date < today()
          const load = day ? dayLoad(day) : 0
          const doneCount = day?.slots.filter((s) => s.done).length ?? 0

          return (
            <Card
              key={date}
              className="card-tight"
              style={{
                opacity: isPast && doneCount === 0 && (day?.slots.length ?? 0) === 0 ? 0.5 : 1,
                borderColor: isToday ? 'var(--accent)' : undefined,
              }}
            >
              <div className="row" style={{ marginBottom: day?.slots.length ? 11 : 0 }}>
                <div style={{ minWidth: 74 }}>
                  <div style={{ fontWeight: 650, fontSize: '0.9rem' }}>
                    {formatWeekday(date)} {isToday ? <Pill tone="accent">today</Pill> : null}
                  </div>
                  <div className="tiny dim">{formatShort(date)}</div>
                </div>
                <div className="spacer" />
                {day?.slots.length ? (
                  <>
                    <span className="tiny dim">{doneCount}/{day.slots.length} done</span>
                    <span className="tiny dim">{formatMinutes(load)}</span>
                    {load > (day.capacityMinutes || 0) ? <Pill tone="amber">over capacity</Pill> : null}
                  </>
                ) : (
                  <span className="tiny dim">
                    {day && day.capacityMinutes === 0 ? 'day off' : 'nothing scheduled'}
                  </span>
                )}
                {!isPast && subjects.length > 0 ? (
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Rebuild this day from current mastery"
                    onClick={() => void run(() => regenerateDay(date, subjects))}
                  >↻</button>
                ) : null}
              </div>

              {day?.slots.length ? (
                <div className="stack-sm">
                  {day.slots.map((slot) => {
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
                      <div
                        key={slot.id}
                        className="row"
                        style={{
                          padding: '9px 11px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)', opacity: slot.done ? 0.55 : 1,
                          borderLeft: `3px solid ${subject.colour}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={slot.done}
                          disabled={slot.done}
                          onChange={() => void completeSlot(date, slot.id)}
                          style={{ width: 17, height: 17, accentColor: 'var(--accent)', cursor: slot.done ? 'default' : 'pointer' }}
                          aria-label={`Mark ${slot.label} done`}
                        />
                        <SubjectBadge icon={subject.icon} colour={subject.colour} size={26} />
                        <Link
                          to={href}
                          style={{
                            flex: 1, minWidth: 0, color: 'inherit',
                            textDecoration: slot.done ? 'line-through' : undefined,
                          }}
                        >
                          <div className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {slot.label}
                          </div>
                          <div className="tiny dim">{subject.shortName} · {slot.kind}</div>
                        </Link>
                        {slot.rescheduled ? <Pill tone="amber">moved</Pill> : null}
                        {slot.overflow ? <Pill tone="red">extra</Pill> : null}
                        <span className="tiny dim nowrap">{slot.minutes}m</span>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>

      {[...plan.values()].every((d) => d.slots.length === 0) ? (
        <Empty icon="🗓️" title="Nothing planned">
          The planner needs some study time to work with. Set your weekly capacity in Settings.
        </Empty>
      ) : null}
    </div>
  )
}
