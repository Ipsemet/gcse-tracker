import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSubject } from '@/lib/hooks'
import { useProgress } from '@/store/useProgress'
import { Bar, Card, ConfidenceFlag, Loading, Notice, Pill, RagDot, Ring, Stat, SubjectBadge } from '@/components/ui'
import { rag, summariseSubject, summariseTopic, estimateGrade } from '@/lib/mastery'
import { cardsForTopic, noteForTopic, questionsForTopic } from '@/lib/content'
import { formatMinutes } from '@/lib/date'

export default function SubjectView() {
  const { subjectId } = useParams()
  const content = useSubject(subjectId)
  const mastery = useProgress((s) => s.mastery)
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set())

  const summary = useMemo(
    () => (content ? summariseSubject(content.subject, mastery) : null),
    [content, mastery],
  )

  if (!content || !summary) return <Loading label="Loading subject…" />
  const { subject, notes, flashcards, questions } = content
  const estimate = estimateGrade(subject, summary)

  const toggle = (id: string) =>
    setOpenUnits((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="stack-lg fade-up">
      <div>
        <Link to="/subjects" className="tiny dim">← Subjects</Link>
        <div className="row row-wrap" style={{ marginTop: 8, gap: 14 }}>
          <SubjectBadge icon={subject.icon} colour={subject.colour} size={46} />
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ gap: 8 }}>
              <h1>{subject.name}</h1>
              <ConfidenceFlag confidence={subject.confidence} note={subject.confidenceNote} />
            </div>
            <div className="small dim">
              {subject.board} {subject.specCode} — {subject.specTitle} · {subject.examSeries}
            </div>
          </div>
          <div className="spacer" />
          <Ring value={summary.overall} size={62} colour={subject.colour}>
            {`${Math.round(summary.overall * 100)}%`}
          </Ring>
        </div>
      </div>

      {subject.confidence !== 'confirmed' && subject.confidenceNote ? (
        <Notice variant="warn">{subject.confidenceNote}</Notice>
      ) : null}

      <div className="grid grid-4">
        <Stat value={summary.counts.total} label="Spec points" sub={`${summary.counts.untouched} untouched`} />
        <Stat value={summary.counts.green} label="Green" tone="green" sub={`${summary.counts.amber} amber · ${summary.counts.red} red`} />
        <Stat value={questions.length} label="Questions" sub={`${questions.reduce((s, q) => s + q.marks, 0)} marks available`} />
        <Stat
          value={estimate.grade ?? '—'}
          label="Estimated grade"
          tone={estimate.grade && estimate.grade >= 7 ? 'green' : estimate.grade && estimate.grade >= 5 ? 'amber' : 'red'}
          sub={estimate.basis === 'boundaries' ? 'From grade boundaries' : 'Rough — no boundaries loaded'}
        />
      </div>

      <div className="btn-group">
        {flashcards.length > 0 ? (
          <Link to={`/subject/${subject.id}/cards`} className="btn btn-primary">🃏 Review flashcards</Link>
        ) : null}
        {questions.length > 0 ? (
          <Link to={`/subject/${subject.id}/quiz`} className="btn">❓ Quiz me on my weakest points</Link>
        ) : null}
      </div>

      {subject.papers.length > 0 ? (
        <Card>
          <div className="card-head"><h3>The exams</h3></div>
          <div className="grid grid-2">
            {subject.papers.map((p) => (
              <div key={p.code} style={{ padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div className="row" style={{ gap: 7 }}>
                  <strong className="mono small">{p.code}</strong>
                  <Pill>{Math.round(p.weighting * 100)}%</Pill>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 3 }}>{p.name}</div>
                <div className="tiny dim" style={{ marginTop: 3 }}>
                  {formatMinutes(p.durationMins)} · {p.marks} marks
                  {p.calculator === false ? ' · no calculator' : p.calculator ? ' · calculator' : ''}
                </div>
                {p.notes ? <div className="tiny muted" style={{ marginTop: 7 }}>{p.notes}</div> : null}
              </div>
            ))}
          </div>
          {subject.examNotes?.length ? (
            <ul className="small muted" style={{ margin: '14px 0 0', paddingLeft: 20 }}>
              {subject.examNotes.map((n, i) => <li key={i} style={{ marginBottom: 4 }}>{n}</li>)}
            </ul>
          ) : null}
        </Card>
      ) : null}

      <section>
        <div className="card-head">
          <h2>Specification</h2>
          <div className="spacer" />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setOpenUnits(openUnits.size === subject.units.length ? new Set() : new Set(subject.units.map((u) => u.id)))}
          >
            {openUnits.size === subject.units.length ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        <div className="stack-sm">
          {subject.units.map((unit) => {
            const unitPoints = unit.topics.flatMap((t) => t.points.map((p) => p.id))
            const unitScore = summariseTopic(unitPoints, mastery)
            const open = openUnits.has(unit.id)

            return (
              <Card key={unit.id} className="card-flush">
                <button
                  onClick={() => toggle(unit.id)}
                  aria-expanded={open}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    background: 'transparent', border: 0, color: 'inherit', font: 'inherit',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span className="mono small dim nowrap" style={{ minWidth: 32 }}>{unit.code}</span>
                  <span style={{ fontWeight: 650, flex: 1, minWidth: 0 }}>{unit.title}</span>
                  {unit.paper ? <Pill>{unit.paper}</Pill> : null}
                  <span className="tiny dim nowrap">{unitScore.studied}/{unitScore.total}</span>
                  <div style={{ width: 62 }}><Bar value={unitScore.score} tone={rag(unitScore.score)} height={5} /></div>
                  <span className="dim" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.18s' }}>›</span>
                </button>

                {open ? (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {unit.topics.map((topic) => {
                      const score = summariseTopic(topic.points.map((p) => p.id), mastery)
                      const hasNote = noteForTopic(notes, topic.id) !== null
                      const qCount = questionsForTopic(subject, questions, topic.id).length
                      const cCount = cardsForTopic(subject, flashcards, topic.id).length

                      return (
                        <Link
                          key={topic.id}
                          to={`/subject/${subject.id}/topic/${topic.id}`}
                          style={{
                            display: 'block', color: 'inherit', padding: '11px 16px',
                            borderTop: '1px solid var(--border)',
                          }}
                        >
                          <div className="row">
                            <RagDot rag={score.studied === 0 ? 'untouched' : rag(score.score)} />
                            <span className="mono tiny dim nowrap" style={{ minWidth: 42 }}>{topic.code}</span>
                            <span className="small" style={{ flex: 1, minWidth: 0 }}>{topic.title}</span>
                            <span className="tiny dim nowrap">
                              {hasNote ? '📖 ' : ''}{cCount > 0 ? `🃏${cCount} ` : ''}{qCount > 0 ? `❓${qCount}` : ''}
                            </span>
                            <span className="tiny dim nowrap" style={{ minWidth: 46, textAlign: 'right' }}>
                              {score.studied === 0 ? '—' : `${Math.round(score.score * 100)}%`}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : null}
              </Card>
            )
          })}
        </div>
      </section>

      {summary.weakest.length > 0 ? (
        <section>
          <div className="card-head"><h2>Weakest spec points</h2></div>
          <Card className="card-flush">
            {summary.weakest.slice(0, 8).map((row, i) => {
              const point = subject.units
                .flatMap((u) => u.topics)
                .flatMap((t) => t.points.map((p) => ({ p, t })))
                .find((x) => x.p.id === row.pointId)
              if (!point) return null
              return (
                <Link
                  key={row.pointId}
                  to={`/subject/${subject.id}/topic/${point.t.id}`}
                  style={{ display: 'block', color: 'inherit', padding: '11px 15px', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}
                >
                  <div className="row">
                    <span className="mono tiny dim nowrap" style={{ minWidth: 52 }}>{point.p.code}</span>
                    <span className="small" style={{ flex: 1, minWidth: 0 }}>{point.p.statement}</span>
                    <Pill tone={rag(row.score)}>{Math.round(row.score * 100)}%</Pill>
                  </div>
                </Link>
              )
            })}
          </Card>
        </section>
      ) : summary.counts.untouched === summary.counts.total ? (
        <Notice>
          Nothing studied in this subject yet. Open a topic and work through it, or go straight to a quiz — either will start filling in the picture.
        </Notice>
      ) : null}

      <p className="tiny dim">
        {summary.counts.untouched} of {summary.counts.total} spec points have no record yet and count as zero toward coverage.
      </p>
    </div>
  )
}
