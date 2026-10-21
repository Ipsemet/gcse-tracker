/** Per-spec-point "explain this" panel, backed by the Claude tutor. */
import { useState } from 'react'
import { useProgress } from '@/store/useProgress'
import { aiReady, explainPoint } from '@/lib/ai'
import type { SpecPoint, Subject } from '@/types/spec'

export default function AskClaude({ subject, point }: { subject: Subject; point: SpecPoint }) {
  const settings = useProgress((s) => s.settings)
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!aiReady(settings)) return null

  const ask = async () => {
    setBusy(true)
    setError(null)
    try {
      setAnswer(await explainPoint(settings, point, subject.name, subject.specCode, question || undefined))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      {!open ? (
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>✨ Explain this</button>
      ) : (
        <div style={{
          padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--accent-dim)',
        }}>
          <div className="row" style={{ gap: 8, marginBottom: 9 }}>
            <input
              type="text"
              value={question}
              placeholder="Anything specific? (optional)"
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !busy) void ask() }}
            />
            <button className="btn btn-primary btn-sm" onClick={() => void ask()} disabled={busy}>
              {busy ? '…' : 'Ask'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
          </div>

          {busy ? <div className="row small dim"><div className="spinner" style={{ width: 15, height: 15 }} /> Thinking…</div> : null}
          {error ? <div className="small" style={{ color: 'var(--red)' }}>{error}</div> : null}
          {answer ? (
            <div className="small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{answer}</div>
          ) : null}
          {answer ? (
            <div className="tiny dim" style={{ marginTop: 9 }}>
              Claude can get things wrong — check anything that matters against the specification.
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
