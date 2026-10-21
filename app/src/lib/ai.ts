/**
 * Claude client for the tutor features.
 *
 * Two modes:
 *   proxy  — requests go to a Cloudflare Worker that holds the API key. This is
 *            the intended setup: nothing secret ever reaches the browser bundle.
 *   direct — the key is pasted into Settings and stored locally. Convenient on
 *            Rob's own machine; it puts the key in the browser, so it is not the
 *            mode to use on Harry's laptop.
 *
 * Every call is counted against a monthly cap so the running cost stays inside
 * the budget even if something loops.
 */
import type { Question } from '@/types/content'
import type { SpecPoint } from '@/types/spec'
import type { Settings } from '@/types/progress'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export class AiUnavailable extends Error {}
export class AiCapReached extends Error {}

const USAGE_KEY = 'gcse-hq:ai-usage'

interface Usage {
  month: string
  requests: number
  inputTokens: number
  outputTokens: number
}

const currentMonth = () => new Date().toISOString().slice(0, 7)

export const getUsage = (): Usage => {
  try {
    const raw = JSON.parse(localStorage.getItem(USAGE_KEY) ?? 'null') as Usage | null
    if (raw?.month === currentMonth()) return raw
  } catch {
    // Corrupt or unavailable storage just resets the counter.
  }
  return { month: currentMonth(), requests: 0, inputTokens: 0, outputTokens: 0 }
}

const recordUsage = (inputTokens: number, outputTokens: number) => {
  const u = getUsage()
  const next: Usage = {
    month: u.month,
    requests: u.requests + 1,
    inputTokens: u.inputTokens + inputTokens,
    outputTokens: u.outputTokens + outputTokens,
  }
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(next))
  } catch {
    // Non-fatal: the cap simply stops being enforced if storage is blocked.
  }
}

/** Rough cost estimate in GBP, for the budget readout in Settings. */
export const estimateCost = (usage: Usage): number => {
  // Sonnet pricing, USD per million tokens, converted at a rounded rate.
  const usd = (usage.inputTokens / 1e6) * 3 + (usage.outputTokens / 1e6) * 15
  return usd * 0.79
}

interface CallOptions {
  system: string
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
}

const call = async (settings: Settings, opts: CallOptions): Promise<string> => {
  const { ai } = settings
  if (ai.mode === 'off') throw new AiUnavailable('AI features are switched off in Settings.')
  if (getUsage().requests >= ai.monthlyRequestCap) {
    throw new AiCapReached(
      `Monthly AI request cap of ${ai.monthlyRequestCap} reached. Raise it in Settings if that is intended.`,
    )
  }

  const body = {
    model: ai.model,
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.3,
    system: opts.system,
    messages: opts.messages,
  }

  let endpoint: string
  const headers: Record<string, string> = { 'content-type': 'application/json' }

  if (ai.mode === 'proxy') {
    if (!ai.proxyUrl) throw new AiUnavailable('No proxy URL set. Add one in Settings.')
    endpoint = ai.proxyUrl
  } else {
    if (!ai.apiKey) throw new AiUnavailable('No API key set. Add one in Settings.')
    endpoint = 'https://api.anthropic.com/v1/messages'
    headers['x-api-key'] = ai.apiKey
    headers['anthropic-version'] = '2023-06-01'
    headers['anthropic-dangerous-direct-browser-access'] = 'true'
  }

  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new AiUnavailable(`Claude request failed (${res.status}). ${detail.slice(0, 300)}`)
  }

  const json = await res.json() as {
    content?: { type: string; text?: string }[]
    usage?: { input_tokens?: number; output_tokens?: number }
  }
  recordUsage(json.usage?.input_tokens ?? 0, json.usage?.output_tokens ?? 0)

  return (json.content ?? [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('\n')
    .trim()
}

const TUTOR_SYSTEM = `You are a GCSE tutor for a Year 10 student in England. Be direct and concise.

Rules:
- British English throughout.
- Answer at GCSE level. Do not go beyond the specification.
- Explain the idea, then give one concrete example.
- When a spec point is supplied, stay tightly on it.
- Never invent exam board content, mark schemes or grade boundaries. If you are not sure what a specification says, say so.
- Do not write a student's coursework or NEA for them.
- Keep it under 250 words unless asked for more.`

export const explainPoint = (
  settings: Settings,
  point: SpecPoint,
  subjectName: string,
  specCode: string,
  askedQuestion?: string,
): Promise<string> =>
  call(settings, {
    system: TUTOR_SYSTEM,
    messages: [{
      role: 'user',
      content: [
        `Subject: ${subjectName} (${specCode})`,
        `Spec point ${point.code}: ${point.statement}`,
        point.detail?.length ? `Specification detail:\n- ${point.detail.join('\n- ')}` : '',
        askedQuestion
          ? `The student asks: ${askedQuestion}`
          : 'Explain this spec point so the student can answer exam questions on it.',
      ].filter(Boolean).join('\n\n'),
    }],
  })

export interface AiMarkResult {
  marks: number
  outOf: number
  strengths: string[]
  missing: string[]
  improvedAnswer: string
}

const MARKER_SYSTEM = `You are a GCSE examiner marking a single answer against its mark scheme.

Rules:
- British English.
- Mark strictly to the mark scheme provided. Do not award marks for content that is not creditworthy.
- Award whole marks only, never more than the maximum.
- Be specific about what earned each mark and what was missing.
- Respond with JSON only, matching exactly:
{"marks": <number>, "strengths": [<string>], "missing": [<string>], "improvedAnswer": "<string>"}
- "improvedAnswer" is a model answer that would gain full marks, written as a student would write it.`

export const markAnswer = async (
  settings: Settings,
  question: Question,
  answer: string,
): Promise<AiMarkResult> => {
  const scheme = question.levels?.length
    ? question.levels.map((l) => `Level ${l.level} (${l.marksFrom}-${l.marksTo}): ${l.descriptor}${
        l.indicativeContent?.length ? `\n  Indicative content: ${l.indicativeContent.join('; ')}` : ''
      }`).join('\n')
    : (question.markScheme ?? []).map((m) => `- (${m.marks}) ${m.text}${
        m.alternatives?.length ? ` [also accept: ${m.alternatives.join(' / ')}]` : ''
      }`).join('\n')

  const raw = await call(settings, {
    system: MARKER_SYSTEM,
    messages: [{
      role: 'user',
      content: [
        question.context ? `Context: ${question.context}` : '',
        `Question (${question.marks} marks${question.commandWord ? `, command word: ${question.commandWord}` : ''}): ${question.stem}`,
        `Mark scheme:\n${scheme || '(none supplied — mark on subject knowledge at GCSE level)'}`,
        `Student's answer:\n${answer}`,
      ].filter(Boolean).join('\n\n'),
    }],
    maxTokens: 900,
    temperature: 0,
  })

  const parsed = extractJson(raw)
  const marks = Math.max(0, Math.min(question.marks, Math.round(Number(parsed?.marks ?? 0))))
  return {
    marks,
    outOf: question.marks,
    strengths: toStringArray(parsed?.strengths),
    missing: toStringArray(parsed?.missing),
    improvedAnswer: typeof parsed?.improvedAnswer === 'string' ? parsed.improvedAnswer : '',
  }
}

export const chat = (
  settings: Settings,
  messages: ChatMessage[],
  context?: string,
): Promise<string> =>
  call(settings, {
    system: context ? `${TUTOR_SYSTEM}\n\nCurrent topic context:\n${context}` : TUTOR_SYSTEM,
    messages,
    maxTokens: 1200,
  })

/** Fetch a hint that nudges without giving the answer away. */
export const hint = (settings: Settings, question: Question): Promise<string> =>
  call(settings, {
    system: `${TUTOR_SYSTEM}\n\nGive a hint that points the student toward the method or the key idea. Never state the answer. Two sentences maximum.`,
    messages: [{ role: 'user', content: `Question (${question.marks} marks): ${question.stem}` }],
    maxTokens: 200,
    temperature: 0.4,
  })

const extractJson = (text: string): Record<string, unknown> | null => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
  try {
    return JSON.parse(candidate) as Record<string, unknown>
  } catch {
    return null
  }
}

const toStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

export const aiReady = (settings: Settings): boolean =>
  settings.ai.mode === 'proxy' ? Boolean(settings.ai.proxyUrl)
    : settings.ai.mode === 'direct' ? Boolean(settings.ai.apiKey)
      : false
