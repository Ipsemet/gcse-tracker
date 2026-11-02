/**
 * "What are you revising for?" — the per-subject scope controls.
 *
 * - Variant: a whole-subject choice such as RS → Islam only (radio buttons).
 * - Focus: tick the topics in the next test or mock (checkboxes).
 *
 * Both are stored per device and narrow the subject everywhere — topic list,
 * quizzes, flashcards and the plan. A link can set them in one tap, so a parent
 * or teacher can send it: #/subject/rs?variant=islam&topics=3.1.2.1,3.1.2.2
 * (topic codes as printed on the spec).
 */
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useContent } from '@/store/useContent'
import { ALL_VARIANTS, topicsForVariant } from '@/lib/content'
import { Card, VariantPicker } from '@/components/ui'

export default function RevisingFor({ subjectId }: { subjectId: string }) {
  const raw = useContent((s) => s.raw[subjectId])
  const variant = useContent((s) => s.variants[subjectId]) ?? ALL_VARIANTS
  const focus = useContent((s) => s.focus[subjectId]) ?? []
  const setVariant = useContent((s) => s.setVariant)
  const setFocus = useContent((s) => s.setFocus)
  const [params, setParams] = useSearchParams()

  // Apply a shared link once the subject is loaded, then tidy the URL.
  useEffect(() => {
    if (!raw) return
    const v = params.get('variant')
    const t = params.get('topics')
    if (!v && !t) return
    const choices = new Set([ALL_VARIANTS, ...(raw.subject.variants?.choices.map((c) => c.id) ?? [])])
    if (v && choices.has(v)) setVariant(subjectId, v)
    if (t !== null) {
      const codes = new Set(t.split(',').map((c) => c.trim()).filter(Boolean))
      const ids = raw.subject.units.flatMap((u) => u.topics).filter((x) => codes.has(x.code)).map((x) => x.id)
      setFocus(subjectId, ids)
    }
    setParams({}, { replace: true })
  }, [raw, params, setParams, setVariant, setFocus, subjectId])

  if (!raw) return null
  const { subject } = raw
  const offered = topicsForVariant(subject, variant)
  const offeredIds = new Set(offered.map((t) => t.id))
  const ticked = new Set(focus.filter((id) => offeredIds.has(id)))
  const allOn = ticked.size === 0

  const toggle = (id: string) => {
    const next = new Set(ticked)
    next.has(id) ? next.delete(id) : next.add(id)
    setFocus(subjectId, [...next])
  }

  const variantLabel = subject.variants?.choices.find((c) => c.id === variant)?.label

  return (
    <Card>
      <div className="card-head"><h3>What are you revising for?</h3></div>

      {subject.variants ? (
        <div style={{ marginBottom: 16 }}>
          <VariantPicker
            name={`variant-${subject.id}`}
            label={subject.variants.label}
            choices={[
              { id: ALL_VARIANTS, label: subject.variants.choices.length === 2 ? 'Both' : 'All' },
              ...subject.variants.choices,
            ]}
            value={variant}
            onChange={(v) => setVariant(subject.id, v)}
          />
        </div>
      ) : null}

      <fieldset className="variant-picker">
        <legend className="small dim">Focus on — tick the topics in your next test or mock</legend>
        <div className="focus-list">
          {subject.units.map((u) => {
            const topics = u.topics.filter((t) => offeredIds.has(t.id))
            if (topics.length === 0) return null
            return (
              <div key={u.id} className="focus-unit">
                <div className="tiny dim">{u.code} {u.title}</div>
                {topics.map((t) => (
                  <label key={t.id} className={`focus-option${ticked.has(t.id) ? ' is-on' : ''}`}>
                    <input type="checkbox" checked={ticked.has(t.id)} onChange={() => toggle(t.id)} />
                    <span className="mono tiny dim">{t.code}</span> {t.title}
                  </label>
                ))}
              </div>
            )
          })}
        </div>
      </fieldset>

      <div className="row row-wrap" style={{ gap: 10, marginTop: 12 }}>
        <div className="tiny muted" style={{ flex: '1 1 260px' }}>
          {allOn
            ? `Revising ${variantLabel ? `all ${variantLabel} topics` : 'every topic'}. Tick topics to narrow it down.`
            : `Revising ${ticked.size} of ${offered.length} topics${variantLabel ? ` (${variantLabel})` : ''}. Quizzes, flashcards and your plan stick to these. Your progress on the rest is kept.`}
        </div>
        {!allOn ? (
          <button type="button" className="btn btn-sm" onClick={() => setFocus(subjectId, [])}>
            Revise everything again
          </button>
        ) : null}
      </div>
    </Card>
  )
}
