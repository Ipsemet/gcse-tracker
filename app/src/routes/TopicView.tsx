import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSubject } from '@/lib/hooks'
import { useProgress } from '@/store/useProgress'
import { Blocks } from '@/components/Blocks'
import AskClaude from '@/components/AskClaude'
import {
  Bar, Card, ConfidencePicker, Empty, Loading, Notice, Pill, RagDot, Ring,
} from '@/components/ui'
import { cardsForTopic, findTopic, noteForTopic, questionsForTopic } from '@/lib/content'
import { isUntouched, rag, summariseTopic } from '@/lib/mastery'
import { formatMinutes } from '@/lib/date'

export default function TopicView() {
  const { subjectId, topicId } = useParams()
  const content = useSubject(subjectId)
  const mastery = useProgress((s) => s.mastery)
  const setPointConfidence = useProgress((s) => s.setPointConfidence)
  const markTopicRead = useProgress((s) => s.markTopicRead)
  const [readMarked, setReadMarked] = useState(false)

  const found = useMemo(
    () => (content && topicId ? findTopic(content.subject, topicId) : null),
    [content, topicId],
  )

  const score = useMemo(
    () => (found ? summariseTopic(found.topic.points.map((p) => p.id), mastery) : null),
    [found, mastery],
  )

  // Scrolling position should not carry over between topics.
  useEffect(() => {
    window.scrollTo(0, 0)
    setReadMarked(false)
  }, [topicId])

  if (!content) return <Loading label="Loading topic…" />
  if (!found || !score) {
    return <Empty icon="🤷" title="Topic not found">That spec topic isn't in this subject.</Empty>
  }

  const { subject, notes, flashcards, questions } = content
  const { unit, topic } = found
  const note = noteForTopic(notes, topic.id)
  const topicQuestions = questionsForTopic(subject, questions, topic.id)
  const topicCards = cardsForTopic(subject, flashcards, topic.id)

  const handleMarkRead = async () => {
    await markTopicRead(subject.id, topic.points.map((p) => p.id))
    setReadMarked(true)
  }

  return (
    <div className="stack-lg fade-up">
      <div>
        <Link to={`/subject/${subject.id}`} className="tiny dim">← {subject.name}</Link>
        <div className="row row-wrap" style={{ marginTop: 8, gap: 14 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="row" style={{ gap: 8, marginBottom: 3 }}>
              <span className="mono small dim">{topic.code}</span>
              {unit.paper ? <Pill>{unit.paper}</Pill> : null}
              <span className="tiny dim">{unit.code} {unit.title}</span>
            </div>
            <h1>{topic.title}</h1>
          </div>
          <Ring value={score.score} size={56} colour={subject.colour}>
            {score.studied === 0 ? '—' : `${Math.round(score.score * 100)}%`}
          </Ring>
        </div>
      </div>

      <div className="btn-group">
        {topicQuestions.length > 0 ? (
          <Link to={`/subject/${subject.id}/quiz/${topic.id}`} className="btn btn-primary">
            ❓ Test me ({topicQuestions.length})
          </Link>
        ) : null}
        {topicCards.length > 0 ? (
          <Link to={`/subject/${subject.id}/cards/${topic.id}`} className="btn">
            🃏 Flashcards ({topicCards.length})
          </Link>
        ) : null}
        <button className="btn" onClick={handleMarkRead} disabled={readMarked}>
          {readMarked ? '✓ Marked as covered' : '📖 Mark as covered'}
        </button>
      </div>

      {note ? (
        <>
          <Card>
            <div className="card-head">
              <h2>{note.title}</h2>
              <div className="spacer" />
              <Pill>{formatMinutes(note.estimatedMinutes)} read</Pill>
            </div>
            <p className="muted">{note.summary}</p>
          </Card>

          {note.sections.map((section) => (
            <Card key={section.id}>
              <div className="card-head"><h3>{section.title}</h3></div>
              <Blocks blocks={section.blocks} />
            </Card>
          ))}

          {note.keyTerms.length > 0 ? (
            <Card>
              <div className="card-head"><h3>Key terms</h3></div>
              <div className="grid grid-2">
                {note.keyTerms.map((term) => (
                  <div key={term.term} style={{
                    padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontWeight: 650, color: 'var(--accent-bright)', fontSize: '0.9rem' }}>{term.term}</div>
                    <div className="small muted" style={{ marginTop: 3 }}>{term.definition}</div>
                    {term.examWording ? (
                      <div className="tiny" style={{ marginTop: 6, color: 'var(--green)' }}>
                        In the exam: “{term.examWording}”
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {(note.examTips.length > 0 || note.commonMistakes.length > 0) ? (
            <div className="grid grid-2">
              {note.examTips.length > 0 ? (
                <Card>
                  <div className="card-head"><h3>🎯 Exam tips</h3></div>
                  <ul style={{ margin: 0, paddingLeft: 20 }} className="small">
                    {note.examTips.map((t, i) => <li key={i} style={{ marginBottom: 7 }}>{t}</li>)}
                  </ul>
                </Card>
              ) : null}
              {note.commonMistakes.length > 0 ? (
                <Card>
                  <div className="card-head"><h3>⚠️ Common mistakes</h3></div>
                  <ul style={{ margin: 0, paddingLeft: 20 }} className="small">
                    {note.commonMistakes.map((t, i) => <li key={i} style={{ marginBottom: 7 }}>{t}</li>)}
                  </ul>
                </Card>
              ) : null}
            </div>
          ) : null}

          {note.resources.length > 0 ? (
            <Card>
              <div className="card-head"><h3>Resources</h3></div>
              <div className="stack-sm">
                {note.resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      display: 'block', color: 'inherit', padding: '11px 13px',
                      background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="row" style={{ gap: 8 }}>
                      <span>{KIND_ICON[r.kind]}</span>
                      <strong style={{ fontSize: '0.88rem' }}>{r.title}</strong>
                      {!r.verified ? <Pill tone="amber" title="Link not confirmed by opening it">unverified</Pill> : null}
                      {!r.free ? <Pill>paid</Pill> : null}
                      <div className="spacer" />
                      {r.minutes ? <span className="tiny dim">{r.minutes}m</span> : null}
                    </div>
                    <div className="small muted" style={{ marginTop: 2 }}>{r.description}</div>
                    <div className="tiny dim" style={{ marginTop: 2 }}>{r.provider}</div>
                  </a>
                ))}
              </div>
            </Card>
          ) : null}
        </>
      ) : (
        <Notice variant="warn">
          No teaching notes written for this topic yet. The spec points below are still tracked —
          you can rate your confidence, and any questions attached to them still count.
        </Notice>
      )}

      <Card>
        <div className="card-head">
          <h3>Spec points</h3>
          <div className="spacer" />
          <span className="tiny dim">Rate how confident you are, 1 to 5</span>
        </div>

        <div className="stack-sm">
          {topic.points.map((point) => {
            const record = mastery.get(point.id)
            const untouched = isUntouched(record)
            return (
              <div key={point.id} style={{
                padding: 13, background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}>
                <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                  <RagDot rag={untouched ? 'untouched' : rag(record!.score)} size={10} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8, marginBottom: 3 }}>
                      <span className="mono tiny dim">{point.code}</span>
                      {point.tier ? <Pill tone="accent">{point.tier} only</Pill> : null}
                      <Pill title="Difficulty">{'★'.repeat(point.difficulty)}</Pill>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 550 }}>{point.statement}</div>

                    {point.detail?.length ? (
                      <ul className="small muted" style={{ margin: '7px 0 0', paddingLeft: 18 }}>
                        {point.detail.map((d, i) => <li key={i} style={{ marginBottom: 3 }}>{d}</li>)}
                      </ul>
                    ) : null}

                    {point.keywords?.length ? (
                      <div className="row row-wrap" style={{ gap: 5, marginTop: 8 }}>
                        {point.keywords.map((k) => <Pill key={k}>{k}</Pill>)}
                      </div>
                    ) : null}

                    <div className="row row-wrap" style={{ marginTop: 11, gap: 12 }}>
                      <ConfidencePicker
                        value={record?.confidence ?? null}
                        onChange={(n) => void setPointConfidence(point.id, subject.id, n)}
                      />
                      <div className="spacer" />
                      {!untouched ? (
                        <div className="row" style={{ gap: 8, minWidth: 130 }}>
                          <div style={{ flex: 1 }}><Bar value={record!.score} tone={rag(record!.score)} height={5} /></div>
                          <span className="tiny dim nowrap">{Math.round(record!.score * 100)}%</span>
                        </div>
                      ) : (
                        <span className="tiny dim">not started</span>
                      )}
                    </div>

                    {record && record.marksAvailable > 0 ? (
                      <div className="tiny dim" style={{ marginTop: 6 }}>
                        {record.marksEarned}/{record.marksAvailable} marks across {record.attempts} question{record.attempts === 1 ? '' : 's'}
                      </div>
                    ) : null}

                    <AskClaude subject={subject} point={point} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

const KIND_ICON: Record<string, string> = {
  video: '🎬', article: '📄', interactive: '🕹️', practice: '✍️', 'past-paper': '📝',
  'revision-guide': '📗', quizlet: '🃏', app: '📱', reference: '📚',
}
