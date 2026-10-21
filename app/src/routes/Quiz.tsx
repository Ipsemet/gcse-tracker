import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useChime, useStopwatch, useSubject } from '@/lib/hooks'
import { useProgress } from '@/store/useProgress'
import QuestionView from '@/components/QuestionView'
import { Card, Empty, Loading, Notice, Pill } from '@/components/ui'
import { buildQuiz, findTopic, questionsForTopic } from '@/lib/content'
import { markQuestion, type MarkResult } from '@/lib/marking'
import { aiReady, hint as fetchHint, markAnswer } from '@/lib/ai'
import { formatDuration } from '@/lib/date'
import type { Question } from '@/types/content'

const QUIZ_LENGTH = 10

export default function Quiz() {
  const { subjectId, topicId } = useParams()
  const content = useSubject(subjectId)
  const mastery = useProgress((s) => s.mastery)
  const settings = useProgress((s) => s.settings)
  const recordAttempt = useProgress((s) => s.recordAttempt)
  const saveSession = useProgress((s) => s.saveSession)
  const chime = useChime()

  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [index, setIndex] = useState(0)
  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<MarkResult | null>(null)
  const [selfMarks, setSelfMarks] = useState<number | null>(null)
  const [aiFeedback, setAiFeedback] = useState<Awaited<ReturnType<typeof markAnswer>> | null>(null)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [hintText, setHintText] = useState<string | null>(null)
  const [totals, setTotals] = useState({ earned: 0, available: 0 })
  const [questionStart, setQuestionStart] = useState(() => Date.now())
  const [sessionId] = useState(() => `sess-${Date.now()}`)
  const [startedAt] = useState(() => new Date().toISOString())
  const seconds = useStopwatch(true)

  // Assemble the quiz once, weighted toward the weakest spec points.
  useEffect(() => {
    if (questions !== null || !content) return
    const pool = topicId
      ? questionsForTopic(content.subject, content.questions, topicId)
      : content.questions
    const scoreFor = (pointId: string) => mastery.get(pointId)?.score ?? 0
    setQuestions(buildQuiz(pool, { count: QUIZ_LENGTH, scoreFor }))
  }, [content, topicId, questions, mastery])

  if (!content || !questions) return <Loading label="Building your quiz…" />

  const { subject } = content
  const topic = topicId ? findTopic(subject, topicId)?.topic : null
  const backHref = topicId ? `/subject/${subject.id}/topic/${topicId}` : `/subject/${subject.id}`

  if (questions.length === 0) {
    return (
      <div className="fade-up">
        <Link to={backHref} className="tiny dim">← Back</Link>
        <div style={{ marginTop: 14 }}>
          <Empty icon="❓" title="No questions here yet">
            {topic
              ? `Nothing written for ${topic.code} ${topic.title} so far.`
              : `No questions written for ${subject.name} yet.`}
          </Empty>
        </div>
      </div>
    )
  }

  const done = index >= questions.length
  const question = done ? null : questions[index]

  const submit = async () => {
    if (!question || submitted) return
    const marked = markQuestion(question, response)
    setResult(marked)
    setSubmitted(true)
    if (marked.outcome !== 'needs-review') {
      chime(marked.outcome === 'correct' ? 'good' : 'bad')
      await commit(question, marked.marksEarned, 'auto')
    }
  }

  const commit = async (q: Question, marks: number, markedBy: 'auto' | 'self' | 'ai') => {
    const taken = Math.round((Date.now() - questionStart) / 1000)
    await recordAttempt(q, response, marks, taken, markedBy, sessionId)
    setTotals((t) => ({ earned: t.earned + marks, available: t.available + q.marks }))
  }

  const selfMark = async (marks: number) => {
    if (!question) return
    setSelfMarks(marks)
    await commit(question, marks, 'self')
  }

  const aiMark = async () => {
    if (!question) return
    setAiBusy(true)
    setAiError(null)
    try {
      const feedback = await markAnswer(settings, question, response)
      setAiFeedback(feedback)
      setSelfMarks(feedback.marks)
      await commit(question, feedback.marks, 'ai')
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI marking failed.')
    } finally {
      setAiBusy(false)
    }
  }

  const getHint = async () => {
    if (!question) return
    try {
      setHintText(await fetchHint(settings, question))
    } catch (e) {
      setHintText(e instanceof Error ? e.message : 'Could not fetch a hint.')
    }
  }

  const next = async () => {
    if (index + 1 >= questions.length) {
      await saveSession({
        id: sessionId,
        subjectId: subject.id,
        kind: 'quiz',
        startedAt,
        endedAt: new Date().toISOString(),
        seconds,
        specPointIds: [...new Set(questions.flatMap((q) => q.specPointIds))],
        marksEarned: totals.earned,
        marksAvailable: totals.available,
        xpEarned: 0,
      })
      chime('done')
    }
    setIndex((i) => i + 1)
    setResponse('')
    setSubmitted(false)
    setResult(null)
    setSelfMarks(null)
    setAiFeedback(null)
    setAiError(null)
    setHintText(null)
    setQuestionStart(Date.now())
  }

  if (done) {
    const pct = totals.available > 0 ? Math.round((totals.earned / totals.available) * 100) : 0
    const tone = pct >= 75 ? 'green' : pct >= 50 ? 'amber' : 'red'
    return (
      <div className="fade-up" style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', paddingTop: 34 }}>
        <div style={{ fontSize: '3rem' }} className="pop">{pct >= 75 ? '🏆' : pct >= 50 ? '👍' : '📚'}</div>
        <h1 style={{ marginTop: 10 }}>{totals.earned} / {totals.available}</h1>
        <p className="muted">
          {pct}% on {questions.length} questions{topic ? ` from ${topic.code}` : ''} in {formatDuration(seconds)}.
        </p>
        <div style={{ margin: '20px 0' }}>
          <div className="bar" style={{ height: 10 }}>
            <div className={`bar-fill ${tone}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <p className="small muted">
          {pct >= 75
            ? 'Strong. These spec points have moved toward green.'
            : pct >= 50
              ? 'Middling — worth another pass at the ones you dropped marks on.'
              : 'Go back over the notes for this topic before testing again.'}
        </p>
        <div className="btn-group" style={{ marginTop: 22, justifyContent: 'center' }}>
          <Link to={backHref} className="btn btn-primary">Back to {topic ? 'topic' : 'subject'}</Link>
          <button className="btn" onClick={() => {
            setQuestions(null); setIndex(0); setTotals({ earned: 0, available: 0 })
            setResponse(''); setSubmitted(false); setResult(null); setSelfMarks(null)
          }}>Another 10</button>
        </div>
      </div>
    )
  }

  if (!question) return <Loading />

  const needsReview = result?.outcome === 'needs-review'
  const canContinue = submitted && (!needsReview || selfMarks !== null)

  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="row" style={{ marginBottom: 14 }}>
        <Link to={backHref} className="btn btn-ghost btn-sm">← Exit</Link>
        <div className="spacer" />
        <span className="tiny dim">{index + 1} / {questions.length}</span>
        <span className="tiny dim">{totals.earned}/{totals.available} marks</span>
        <span className="tiny dim">{formatDuration(seconds)}</span>
      </div>

      <div className="bar" style={{ marginBottom: 18 }}>
        <div className="bar-fill" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <Card>
        <QuestionView
          question={question}
          submitted={submitted}
          result={result}
          response={response}
          onChange={setResponse}
        />

        {hintText ? (
          <div style={{ marginTop: 14 }}>
            <Notice icon="💡">{hintText}</Notice>
          </div>
        ) : null}

        {submitted && result ? (
          <div className="fade-up" style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {!needsReview ? (
              <div className="row" style={{ marginBottom: 12 }}>
                <Pill tone={result.outcome === 'correct' ? 'green' : result.outcome === 'partial' ? 'amber' : 'red'}>
                  {result.marksEarned} / {result.marksAvailable} marks
                </Pill>
                <span className="small muted">
                  {result.outcome === 'correct' ? 'Correct.' : result.outcome === 'partial' ? 'Partly there.' : 'Not right.'}
                </span>
              </div>
            ) : null}

            {result.feedback ? <p className="small muted">{result.feedback}</p> : null}

            {question.markScheme?.length ? (
              <div style={{ marginBottom: 14 }}>
                <div className="stat-label" style={{ marginBottom: 7 }}>Mark scheme</div>
                <ul style={{ margin: 0, paddingLeft: 20 }} className="small">
                  {question.markScheme.map((m, i) => (
                    <li key={i} style={{ marginBottom: 5 }}>
                      <strong className="mono tiny">[{m.marks}]</strong> {m.text}
                      {m.alternatives?.length ? (
                        <span className="dim"> — or: {m.alternatives.join(' / ')}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {question.levels?.length ? (
              <div style={{ marginBottom: 14 }}>
                <div className="stat-label" style={{ marginBottom: 7 }}>Levels</div>
                {question.levels.map((l) => (
                  <div key={l.level} style={{
                    padding: '9px 12px', background: 'var(--bg)', borderRadius: 7,
                    border: '1px solid var(--border)', marginBottom: 6,
                  }}>
                    <div className="row" style={{ gap: 7 }}>
                      <Pill tone="accent">Level {l.level}</Pill>
                      <span className="tiny dim">{l.marksFrom}–{l.marksTo} marks</span>
                    </div>
                    <div className="small" style={{ marginTop: 4 }}>{l.descriptor}</div>
                    {l.indicativeContent?.length ? (
                      <div className="tiny dim" style={{ marginTop: 4 }}>
                        Indicative content: {l.indicativeContent.join('; ')}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {question.modelAnswer ? (
              <div style={{
                padding: 13, background: 'var(--green-dim)', borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--green)', marginBottom: 14,
              }}>
                <div className="stat-label" style={{ color: 'var(--green)', marginBottom: 5 }}>Model answer</div>
                <div className="small" style={{ whiteSpace: 'pre-wrap' }}>{question.modelAnswer}</div>
              </div>
            ) : null}

            {question.examinerNote ? (
              <Notice icon="🎓">{question.examinerNote}</Notice>
            ) : null}

            {needsReview && selfMarks === null ? (
              <div style={{ marginTop: 14 }}>
                <div className="stat-label" style={{ marginBottom: 8 }}>
                  Mark your own answer against the scheme
                </div>
                <div className="btn-group">
                  {Array.from({ length: question.marks + 1 }, (_, i) => (
                    <button key={i} className="btn btn-sm" onClick={() => void selfMark(i)}>
                      {i}
                    </button>
                  ))}
                  {aiReady(settings) ? (
                    <button className="btn btn-sm btn-primary" onClick={() => void aiMark()} disabled={aiBusy}>
                      {aiBusy ? 'Marking…' : '✨ Let Claude mark it'}
                    </button>
                  ) : null}
                </div>
                {aiError ? <div className="small" style={{ color: 'var(--red)', marginTop: 8 }}>{aiError}</div> : null}
              </div>
            ) : null}

            {aiFeedback ? (
              <div className="fade-up" style={{ marginTop: 14 }}>
                <div className="row" style={{ marginBottom: 9 }}>
                  <Pill tone={aiFeedback.marks === aiFeedback.outOf ? 'green' : aiFeedback.marks > 0 ? 'amber' : 'red'}>
                    Claude: {aiFeedback.marks} / {aiFeedback.outOf}
                  </Pill>
                </div>
                {aiFeedback.strengths.length > 0 ? (
                  <>
                    <div className="stat-label" style={{ color: 'var(--green)' }}>What earned marks</div>
                    <ul className="small" style={{ margin: '5px 0 12px', paddingLeft: 20 }}>
                      {aiFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </>
                ) : null}
                {aiFeedback.missing.length > 0 ? (
                  <>
                    <div className="stat-label" style={{ color: 'var(--amber)' }}>What was missing</div>
                    <ul className="small" style={{ margin: '5px 0 12px', paddingLeft: 20 }}>
                      {aiFeedback.missing.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </>
                ) : null}
                {aiFeedback.improvedAnswer ? (
                  <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 7, border: '1px solid var(--border)' }}>
                    <div className="stat-label" style={{ marginBottom: 5 }}>A full-mark answer</div>
                    <div className="small" style={{ whiteSpace: 'pre-wrap' }}>{aiFeedback.improvedAnswer}</div>
                  </div>
                ) : null}
                <div className="tiny dim" style={{ marginTop: 9 }}>
                  Claude is not an examiner. Treat the mark as an indication, not a grade.
                </div>
              </div>
            ) : null}

            {selfMarks !== null && !aiFeedback ? (
              <div className="row" style={{ marginTop: 12 }}>
                <Pill tone={selfMarks === question.marks ? 'green' : selfMarks > 0 ? 'amber' : 'red'}>
                  Self-marked {selfMarks} / {question.marks}
                </Pill>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      <div className="row" style={{ marginTop: 16, gap: 10 }}>
        {!submitted && aiReady(settings) && !hintText ? (
          <button className="btn btn-ghost" onClick={() => void getHint()}>💡 Hint</button>
        ) : null}
        <div className="spacer" />
        {!submitted ? (
          <button className="btn btn-primary btn-lg" onClick={() => void submit()} disabled={!response.trim()}>
            Submit
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={() => void next()} disabled={!canContinue}>
            {index + 1 >= questions.length ? 'Finish' : 'Next question'} →
          </button>
        )}
      </div>
    </div>
  )
}
