/** Renders one question and collects an answer. Marking lives in lib/marking. */
import { useEffect, useMemo, useState } from 'react'
import type { Question } from '@/types/content'
import type { MarkResult } from '@/lib/marking'
import { Pill } from '@/components/ui'
import { shuffle } from '@/lib/content'

interface Props {
  question: Question
  submitted: boolean
  result: MarkResult | null
  onChange: (response: string) => void
  response: string
}

export default function QuestionView({ question, submitted, result, onChange, response }: Props) {
  // Option order is fixed per question so it does not reshuffle on every keystroke.
  const options = useMemo(
    () => (question.options ? shuffle(question.options) : []),
    [question.id], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const rightColumn = useMemo(
    () => (question.pairs ? shuffle(question.pairs.map((p) => p.right)) : []),
    [question.id], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const [ordering, setOrdering] = useState<string[]>([])

  useEffect(() => {
    if (question.type === 'order' && question.sequence) setOrdering(shuffle(question.sequence))
  }, [question.id, question.type, question.sequence])

  useEffect(() => {
    if (question.type === 'order' && ordering.length) onChange(ordering.join('|'))
  }, [ordering]) // eslint-disable-line react-hooks/exhaustive-deps

  const correctIds = new Set((question.options ?? []).filter((o) => o.correct).map((o) => o.id))
  const chosen = new Set(response ? response.split(',').filter(Boolean) : [])

  const move = (from: number, to: number) => {
    if (to < 0 || to >= ordering.length) return
    const next = [...ordering]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setOrdering(next)
  }

  return (
    <div>
      {question.context ? (
        <div style={{
          padding: '11px 13px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
          marginBottom: 13, fontSize: '0.88rem', borderLeft: '3px solid var(--accent-dim)',
        }}>
          {question.context}
        </div>
      ) : null}

      <div className="row row-wrap" style={{ gap: 7, marginBottom: 10 }}>
        {question.commandWord ? <Pill tone="accent">{question.commandWord}</Pill> : null}
        <Pill>{question.marks} mark{question.marks === 1 ? '' : 's'}</Pill>
        <Pill title="Difficulty">{'★'.repeat(question.difficulty)}</Pill>
        {question.paper ? <Pill>{question.paper}</Pill> : null}
        {question.source !== 'authored' ? <Pill tone="amber">{question.source}</Pill> : null}
      </div>

      <div style={{ fontSize: '1.02rem', fontWeight: 550, lineHeight: 1.5, marginBottom: 14 }}>
        {question.stem}
      </div>

      {question.figure?.type === 'code' ? (
        <pre style={{
          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          padding: '13px 15px', overflowX: 'auto', marginBottom: 14, lineHeight: 1.65,
        }}><code>{question.figure.code}</code></pre>
      ) : null}

      {question.figure?.type === 'table' ? (
        <div style={{ overflowX: 'auto', marginBottom: 14 }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr>{question.figure.headers.map((h, i) => (
                <th key={i} style={{ padding: '7px 11px', borderBottom: '1px solid var(--border-bright)', textAlign: 'left' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {question.figure.rows.map((row, i) => (
                <tr key={i}>{row.map((c, j) => (
                  <td key={j} style={{ padding: '7px 11px', borderBottom: '1px solid var(--border)' }}>{c}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* --- Answer input, by type ------------------------------------------ */}

      {(question.type === 'mcq' || question.type === 'multi') ? (
        <div className="stack-sm">
          {options.map((option) => {
            const picked = question.type === 'mcq' ? response === option.id : chosen.has(option.id)
            const isRight = correctIds.has(option.id)
            const tone = !submitted ? null : isRight ? 'green' : picked ? 'red' : null

            return (
              <button
                key={option.id}
                type="button"
                disabled={submitted}
                onClick={() => {
                  if (question.type === 'mcq') onChange(option.id)
                  else {
                    const next = new Set(chosen)
                    next.has(option.id) ? next.delete(option.id) : next.add(option.id)
                    onChange([...next].join(','))
                  }
                }}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', gap: 11, alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: 'var(--radius-sm)', cursor: submitted ? 'default' : 'pointer',
                  font: 'inherit', fontSize: '0.92rem',
                  background: tone ? `var(--${tone}-dim)` : picked ? 'var(--accent-dim)' : 'var(--bg)',
                  border: `1px solid ${tone ? `var(--${tone})` : picked ? 'var(--accent)' : 'var(--border)'}`,
                  color: 'var(--text)',
                }}
              >
                <span style={{
                  flexShrink: 0, width: 21, height: 21,
                  borderRadius: question.type === 'multi' ? 5 : '50%',
                  border: `2px solid ${tone ? `var(--${tone})` : picked ? 'var(--accent)' : 'var(--border-bright)'}`,
                  display: 'grid', placeItems: 'center', fontSize: '0.7rem', marginTop: 1,
                  background: picked || (submitted && isRight) ? (tone ? `var(--${tone})` : 'var(--accent)') : 'transparent',
                  color: '#08121f', fontWeight: 800,
                }}>
                  {submitted ? (isRight ? '✓' : picked ? '✕' : '') : picked ? '✓' : ''}
                </span>
                <span style={{ flex: 1 }}>
                  {option.text}
                  {submitted && option.why && (picked || isRight) ? (
                    <div className="tiny" style={{ marginTop: 5, color: 'var(--text-muted)' }}>{option.why}</div>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      {question.type === 'order' ? (
        <div className="stack-sm">
          {ordering.map((item, i) => (
            <div key={item} className="row" style={{
              padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
              border: `1px solid ${submitted ? (result?.detail?.[i] ? 'var(--green)' : 'var(--red)') : 'var(--border)'}`,
            }}>
              <span className="mono tiny dim" style={{ minWidth: 18 }}>{i + 1}</span>
              <span className="small" style={{ flex: 1 }}>{item}</span>
              {!submitted ? (
                <div className="row" style={{ gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => move(i, i + 1)} disabled={i === ordering.length - 1} aria-label="Move down">↓</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {question.type === 'match' ? (
        <div className="stack-sm">
          {(question.pairs ?? []).map((pair, i) => {
            const current = new Map(
              (response ? response.split('|') : [])
                .map((p) => p.split('=') as [string, string])
                .filter((p) => p.length === 2),
            )
            return (
              <div key={pair.left} className="row" style={{ gap: 10 }}>
                <span className="small" style={{ flex: 1, minWidth: 0 }}>{pair.left}</span>
                <span className="dim">→</span>
                <select
                  style={{ flex: 1, minWidth: 0 }}
                  disabled={submitted}
                  value={current.get(pair.left) ?? ''}
                  onChange={(e) => {
                    current.set(pair.left, e.target.value)
                    onChange([...current].filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('|'))
                  }}
                >
                  <option value="">Choose…</option>
                  {rightColumn.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {submitted ? (
                  <span style={{ color: result?.detail?.[i] ? 'var(--green)' : 'var(--red)' }}>
                    {result?.detail?.[i] ? '✓' : '✕'}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}

      {['short', 'calculation', 'trace'].includes(question.type) ? (
        <input
          type="text"
          value={response}
          disabled={submitted}
          placeholder={question.type === 'calculation' ? 'Your answer…' : 'Type your answer…'}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontFamily: question.type === 'trace' ? 'var(--mono)' : undefined }}
        />
      ) : null}

      {['extended', 'code'].includes(question.type) ? (
        <textarea
          value={response}
          disabled={submitted}
          placeholder={question.type === 'code' ? 'Write your code…' : 'Write your answer…'}
          onChange={(e) => onChange(e.target.value)}
          rows={question.type === 'code' ? 12 : Math.max(5, question.marks + 2)}
          style={{ fontFamily: question.type === 'code' ? 'var(--mono)' : undefined }}
        />
      ) : null}
    </div>
  )
}
