import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAllSubjects } from '@/lib/hooks'
import { useProgress } from '@/store/useProgress'
import { useContent } from '@/store/useContent'
import { Bar, Card, ConfidenceFlag, Loading, Notice, Pill, Ring, SubjectBadge } from '@/components/ui'
import { rag, summariseSubject } from '@/lib/mastery'
import { formatMinutes } from '@/lib/date'

export default function Subjects() {
  const { subjects, loading } = useAllSubjects()
  const index = useContent((s) => s.index)
  const mastery = useProgress((s) => s.mastery)

  const rows = useMemo(
    () => subjects.map((s) => ({
      subject: s,
      m: summariseSubject(s, mastery),
      coverage: index?.subjects.find((i) => i.id === s.id)?.coverage,
    })),
    [subjects, mastery, index],
  )

  const unverified = rows.filter((r) => r.subject.confidence !== 'confirmed')

  if (loading && subjects.length === 0) return <Loading label="Loading subjects…" />

  return (
    <div className="stack-lg fade-up">
      <div>
        <h1>Subjects</h1>
        <p className="muted small" style={{ marginTop: 2 }}>
          Every subject broken down into its exam board's own spec points.
        </p>
      </div>

      {unverified.length > 0 ? (
        <Notice variant="warn">
          <strong>{unverified.length} subject{unverified.length === 1 ? '' : 's'} not yet verified against the official specification.</strong>{' '}
          Content built on an unverified spec is content that may have to be thrown away — check these against the board PDFs before doing a lot of work on them.
        </Notice>
      ) : null}

      <div className="grid grid-2">
        {rows.map(({ subject, m, coverage }) => (
          <Card key={subject.id}>
            <div className="row" style={{ marginBottom: 12 }}>
              <SubjectBadge icon={subject.icon} colour={subject.colour} size={40} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="row" style={{ gap: 7 }}>
                  <Link to={`/subject/${subject.id}`} style={{ color: 'var(--text)' }}>
                    <h3>{subject.name}</h3>
                  </Link>
                  <ConfidenceFlag confidence={subject.confidence} note={subject.confidenceNote} />
                </div>
                <div className="tiny dim">
                  {subject.board} {subject.specCode} · {subject.examSeries}
                  {subject.tier ? ` · ${subject.tier} tier` : ''}
                </div>
              </div>
              <Ring value={m.overall} size={48} colour={subject.colour}>
                {`${Math.round(m.overall * 100)}%`}
              </Ring>
            </div>

            <Bar value={m.overall} tone={rag(m.overall)} />

            <div className="row row-wrap tiny dim" style={{ marginTop: 9, gap: 12 }}>
              <span>{m.counts.total} spec points</span>
              <span>🟢 {m.counts.green} · 🟡 {m.counts.amber} · 🔴 {m.counts.red}</span>
              <span>{m.counts.untouched} untouched</span>
            </div>

            {coverage ? (
              <>
                <hr className="divider" style={{ margin: '13px 0' }} />
                <div className="row row-wrap" style={{ gap: 6 }}>
                  <Pill tone={coverage.topicsWithNotes > 0 ? 'accent' : 'default'}>
                    📖 {coverage.topicsWithNotes}/{coverage.topics} topics written
                  </Pill>
                  <Pill tone={coverage.flashcards > 0 ? 'accent' : 'default'}>🃏 {coverage.flashcards} cards</Pill>
                  <Pill tone={coverage.questions > 0 ? 'accent' : 'default'}>
                    ❓ {coverage.questions} questions · {coverage.totalMarks} marks
                  </Pill>
                </div>
              </>
            ) : null}

            <div className="btn-group" style={{ marginTop: 14 }}>
              <Link to={`/subject/${subject.id}`} className="btn btn-primary btn-sm">Open</Link>
              {coverage && coverage.flashcards > 0 ? (
                <Link to={`/subject/${subject.id}/cards`} className="btn btn-sm">Flashcards</Link>
              ) : null}
              {coverage && coverage.questions > 0 ? (
                <Link to={`/subject/${subject.id}/quiz`} className="btn btn-sm">Quiz me</Link>
              ) : null}
            </div>

            <div className="row tiny dim" style={{ marginTop: 11, gap: 12, flexWrap: 'wrap' }}>
              {subject.papers.map((p) => (
                <span key={p.code}>
                  {p.code} · {formatMinutes(p.durationMins)} · {p.marks} marks
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
