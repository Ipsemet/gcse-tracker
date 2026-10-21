#!/usr/bin/env node
/**
 * Compiles authored content in content/subjects/<id>/ into validated JSON
 * under app/public/content/, which the app fetches at runtime.
 *
 * Authoring is compact: you write spec unit/topic codes and statements, and this
 * assigns every spec point a stable id (`<speccode>.<topic>.<letter>`, lower-cased)
 * so ids can never drift or be mistyped by hand.
 *
 *   node tools/build-content.mjs            build
 *   node tools/build-content.mjs --check    validate only, write nothing
 */
import { readdir, mkdir, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { zSubject, zTopicNote, zFlashcard, zQuestion } from '../content/schema.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'content', 'subjects')
const outDir = join(root, 'app', 'public', 'content')
const checkOnly = process.argv.includes('--check')

const problems = []
const fail = (where, msg) => problems.push(`${where}: ${msg}`)

/** "1.1.1" + index 0 -> "1.1.1a". Beyond 26 points falls back to a2, b2, ... */
const pointCode = (topicCode, i) => {
  const letter = String.fromCharCode(97 + (i % 26))
  const cycle = Math.floor(i / 26)
  return `${topicCode}${letter}${cycle > 0 ? cycle + 1 : ''}`
}

const slug = (specCode) => specCode.toLowerCase().replace(/[^a-z0-9]+/g, '')

/** Expand a compact authored subject into the full Subject shape with ids. */
function expandSubject(raw) {
  const prefix = slug(raw.specCode)
  const seen = new Set()
  const units = raw.units.map((u) => ({
    id: `${prefix}.${u.code}`,
    code: u.code,
    title: u.title,
    ...(u.paper ? { paper: u.paper } : {}),
    topics: u.topics.map((t) => {
      if (!t.code.startsWith(u.code + '.')) {
        fail(raw.id, `topic ${t.code} is not nested under unit ${u.code}`)
      }
      return {
        id: `${prefix}.${t.code}`,
        code: t.code,
        title: t.title,
        points: t.points.map((p, i) => {
          const code = pointCode(t.code, i)
          const id = `${prefix}.${code}`
          if (seen.has(id)) fail(raw.id, `duplicate spec point id ${id}`)
          seen.add(id)
          return { id, code, ...p }
        }),
      }
    }),
  }))

  const { units: _drop, ...rest } = raw
  return { ...rest, units, __pointIds: seen }
}

/** Authored content refers to spec points by bare code ("1.1.1a"); resolve to full ids. */
const resolvePoints = (codes, prefix, pointIds, where) =>
  codes.map((c) => {
    const id = c.startsWith(prefix + '.') ? c : `${prefix}.${c}`
    if (!pointIds.has(id)) fail(where, `references unknown spec point "${c}"`)
    return id
  })

async function loadOptional(path) {
  if (!existsSync(path)) return null
  return (await import(pathToFileURL(path).href)).default
}

async function buildSubject(dir) {
  const base = join(srcDir, dir)
  const rawSubject = await loadOptional(join(base, 'spec.mjs'))
  if (!rawSubject) {
    fail(dir, 'no spec.mjs found')
    return null
  }

  const parsed = zSubject.safeParse(rawSubject)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      fail(`${dir}/spec.mjs`, `${issue.path.join('.') || '(root)'} — ${issue.message}`)
    }
    return null
  }

  const subject = expandSubject(parsed.data)
  const pointIds = subject.__pointIds
  delete subject.__pointIds
  const prefix = slug(subject.specCode)

  // --- Topic notes -----------------------------------------------------------
  const rawNotes = (await loadOptional(join(base, 'notes.mjs'))) ?? []
  const topicByCode = new Map()
  for (const u of subject.units) for (const t of u.topics) topicByCode.set(t.code, t)

  const notes = rawNotes.map((n) => {
    const where = `${dir}/notes.mjs:${n.topicCode}`
    const r = zTopicNote.safeParse(n)
    if (!r.success) {
      for (const i of r.error.issues) fail(where, `${i.path.join('.')} — ${i.message}`)
      return null
    }
    const topic = topicByCode.get(r.data.topicCode)
    if (!topic) {
      fail(where, `no such spec topic "${r.data.topicCode}"`)
      return null
    }
    return {
      topicId: topic.id,
      subjectId: subject.id,
      title: r.data.title,
      summary: r.data.summary,
      estimatedMinutes: r.data.estimatedMinutes,
      sections: r.data.sections.map((s) => ({
        id: s.id,
        title: s.title,
        specPointIds: resolvePoints(s.points, prefix, pointIds, `${where}/${s.id}`),
        blocks: s.blocks,
      })),
      keyTerms: r.data.keyTerms,
      examTips: r.data.examTips,
      commonMistakes: r.data.commonMistakes,
      resources: r.data.resources,
    }
  }).filter(Boolean)

  // --- Flashcards ------------------------------------------------------------
  const rawCards = (await loadOptional(join(base, 'flashcards.mjs'))) ?? []
  const cardIds = new Set()
  const flashcards = rawCards.map((c) => {
    const where = `${dir}/flashcards.mjs:${c.id}`
    const r = zFlashcard.safeParse(c)
    if (!r.success) {
      for (const i of r.error.issues) fail(where, `${i.path.join('.')} — ${i.message}`)
      return null
    }
    if (cardIds.has(r.data.id)) fail(where, 'duplicate flashcard id')
    cardIds.add(r.data.id)
    const { points, ...rest } = r.data
    return { ...rest, subjectId: subject.id, specPointIds: resolvePoints(points, prefix, pointIds, where) }
  }).filter(Boolean)

  // --- Questions -------------------------------------------------------------
  const rawQs = (await loadOptional(join(base, 'questions.mjs'))) ?? []
  const qIds = new Set()
  const questions = rawQs.map((q) => {
    const where = `${dir}/questions.mjs:${q.id}`
    const r = zQuestion.safeParse(q)
    if (!r.success) {
      for (const i of r.error.issues) fail(where, `${i.path.join('.')} — ${i.message}`)
      return null
    }
    const d = r.data
    if (qIds.has(d.id)) fail(where, 'duplicate question id')
    qIds.add(d.id)

    // Marks must be reachable from the mark scheme, or the score is meaningless.
    if (d.markScheme?.length) {
      const total = d.markScheme.reduce((s, m) => s + m.marks, 0)
      if (total !== d.marks) fail(where, `mark scheme totals ${total} but question is worth ${d.marks}`)
    }
    if (d.type === 'mcq') {
      const correct = (d.options ?? []).filter((o) => o.correct).length
      if (correct !== 1) fail(where, `mcq must have exactly one correct option, has ${correct}`)
    }
    if (d.type === 'multi' && (d.options ?? []).filter((o) => o.correct).length < 2) {
      fail(where, 'multi must have at least two correct options')
    }
    if ((d.type === 'mcq' || d.type === 'multi') && (d.options ?? []).length < 3) {
      fail(where, 'needs at least three options')
    }
    if (d.type === 'extended' && !d.levels?.length && !d.markScheme?.length) {
      fail(where, 'extended answer needs levels or a mark scheme')
    }
    if ((d.type === 'short' || d.type === 'calculation') && !d.acceptableAnswers?.length && !d.markScheme?.length) {
      fail(where, 'needs acceptableAnswers or a markScheme so it can be marked')
    }

    const { points, ...rest } = d
    return { ...rest, subjectId: subject.id, specPointIds: resolvePoints(points, prefix, pointIds, where) }
  }).filter(Boolean)

  // --- Coverage --------------------------------------------------------------
  const covered = new Set()
  for (const q of questions) for (const p of q.specPointIds) covered.add(p)
  const carded = new Set()
  for (const c of flashcards) for (const p of c.specPointIds) carded.add(p)
  const noted = new Set()
  for (const n of notes) for (const s of n.sections) for (const p of s.specPointIds) noted.add(p)

  const coverage = {
    specPoints: pointIds.size,
    withNotes: noted.size,
    withFlashcards: carded.size,
    withQuestions: covered.size,
    topics: topicByCode.size,
    topicsWithNotes: notes.length,
    flashcards: flashcards.length,
    questions: questions.length,
    totalMarks: questions.reduce((s, q) => s + q.marks, 0),
  }

  return { subject, notes, flashcards, questions, coverage }
}

// -----------------------------------------------------------------------------

const dirs = existsSync(srcDir)
  ? (await readdir(srcDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)
  : []

if (dirs.length === 0) {
  console.error('No subjects found in content/subjects/')
  process.exit(1)
}

const built = []
for (const dir of dirs.sort()) {
  const result = await buildSubject(dir)
  if (result) built.push(result)
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} content problem(s):\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error('')
  process.exit(1)
}

const index = {
  builtAt: new Date().toISOString(),
  subjects: built.map(({ subject, coverage }) => ({
    id: subject.id,
    name: subject.name,
    shortName: subject.shortName,
    board: subject.board,
    specCode: subject.specCode,
    examSeries: subject.examSeries,
    examDate: subject.examDate ?? null,
    confidence: subject.confidence,
    confidenceNote: subject.confidenceNote ?? null,
    colour: subject.colour,
    icon: subject.icon,
    priority: subject.priority,
    specPointCount: coverage.specPoints,
    coverage,
  })).sort((a, b) => a.priority - b.priority),
}

if (checkOnly) {
  console.log('✓ content valid\n')
} else {
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })
  const write = (p, data) => writeFile(join(outDir, p), JSON.stringify(data))
  await writeFile(join(outDir, 'index.json'), JSON.stringify(index, null, 2))
  for (const { subject, notes, flashcards, questions } of built) {
    await mkdir(join(outDir, subject.id), { recursive: true })
    await write(`${subject.id}/spec.json`, subject)
    await write(`${subject.id}/notes.json`, notes)
    await write(`${subject.id}/flashcards.json`, flashcards)
    await write(`${subject.id}/questions.json`, questions)
  }
  console.log(`✓ built ${built.length} subject(s) -> app/public/content/`)
}

const pad = (s, n) => String(s).padEnd(n)
console.log(pad('subject', 22) + pad('pts', 6) + pad('notes', 7) + pad('cards', 7) + pad('qs', 6) + 'marks')
for (const { subject, coverage: c } of built) {
  console.log(
    pad(`${subject.shortName} (${subject.specCode})`, 22) +
    pad(c.specPoints, 6) + pad(`${c.topicsWithNotes}/${c.topics}`, 7) +
    pad(c.flashcards, 7) + pad(c.questions, 6) + c.totalMarks
  )
}
console.log('')
