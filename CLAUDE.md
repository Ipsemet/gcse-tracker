# CLAUDE.md — Harry's GCSE Command Centre

A spec-driven GCSE learning platform, built by Rob for his son Harry. Harry started Year 10 in
September 2026; GCSEs are **summer 2028**.

School-specific detail — the school, its site, staff contacts — lives in `LOCAL.md`, which is
gitignored. Keep it out of tracked files: this repo is published to GitHub Pages.

Read `docs/CURRENT-STATE.md` before doing anything. It is the single source of truth for what
is built, what is authored, and what is outstanding.

## The one rule that matters

**Everything hangs off the spec spine.** Every subject is decomposed into its exam board's own
numbered spec points (OCR J277 §1.1.1a, AQA Biology §4.1.1.1a…). Notes, flashcards, questions,
resources, mastery scores and the revision planner all key off spec point ids.

Nothing in this project invents its own topic names. The previous system did, and the result was
content built against a guessed RS specification that had to be thrown away.

Corollary: **never author content against an unconfirmed specification.** Each subject carries a
`confidence` field (`confirmed` / `provisional` / `unconfirmed`) and the UI badges anything that
is not confirmed. Get the board PDF, verify, flip the flag, then build.

## Layout

```
CLAUDE.md                      ← this file
docs/CURRENT-STATE.md          ← what is built and what is next
docs/ARCHITECTURE.md           ← how the app fits together
docs/CONTENT-AUTHORING.md      ← how to add a subject or write content
docs/handovers/                ← dated session handovers
content/
  schema.mjs                   ← zod schemas for authored content
  subjects/<id>/spec.mjs       ← the spec spine (required)
  subjects/<id>/notes.mjs      ← teaching notes (optional)
  subjects/<id>/flashcards.mjs ← flashcards (optional)
  subjects/<id>/questions.mjs  ← question bank (optional)
tools/build-content.mjs        ← validates and compiles content to JSON
app/                           ← React PWA (Vite, TypeScript, Zustand, IndexedDB)
worker/                        ← Cloudflare Worker holding the Claude API key
OLD SYSTEM/                    ← the previous three projects, kept for reference only
```

## Commands

```bash
npm --prefix app run dev            # dev server on :5173
npm --prefix app run build          # validate content, typecheck, build
npm --prefix app run content:check  # validate content only
node tools/build-content.mjs        # compile content, prints a coverage table
```

The build **fails** on invalid content — a mark scheme whose marks do not total the question's
marks, an MCQ without exactly one correct answer, a reference to a spec point that does not exist.
That is deliberate. Fix the content, do not weaken the validator.

## Harry's GCSE profile

**All exam boards are confirmed** — see [docs/EXAM-BOARDS.md](docs/EXAM-BOARDS.md) for the source
and the full detail. Do not re-derive them; do not trust the old system's version, which had four
of them wrong.

| Subject | Board | Code |
|---|---|---|
| Biology / Chemistry / Physics (Triple) | AQA | 8461 / 8462 / 8463 |
| Computer Science | OCR | J277 |
| Geography | AQA | 8035 |
| Spanish | Edexcel | 1SP0 |
| Mathematics (Higher) | Edexcel | 1MA1 |
| English Language | Edexcel | 1EN0 |
| English Literature | Edexcel | 1ET0 |
| Religious Studies (Short Course) | AQA | 8061D |
| Sport | OCR | J829 |

- **RS is examined in Year 10 — summer 2027.** Everything else is summer 2028.
- **RS covers Christianity AND Islam** (confirmed by Rob, 8 Sept 2026). The old note saying
  "Christianity only" was wrong.
- **Eng Lit texts:** Macbeth, Journey's End *or* Boys Don't Cry, A Christmas Carol, Edexcel Poetry
  Anthology, Unseen Poetry. Not the AQA set the old system assumed.
- **Sport is J829 Cambridge National in Sport _Studies_**, not Sport Science — the school's PDF has
  the right code but the wrong name. Only R184 is externally examined; the rest is coursework.
- **Further Maths is not confirmed.** Harry is doing it, but it appears nowhere on the school site.
  Board and code still need confirming — do not assume AQA 8365.
- History and Music are not options.
- The school has its own stage ladders; exam comms via MCAS/EduLink.
- Staff contacts are in `LOCAL.md`.
- Harry uses a macOS laptop. Feedback to Rob is by WhatsApp.

## How Rob works

- **British English.** Always.
- **Explicit decision points.** Ask, get an answer, act on it immediately.
- **Direct feedback.** If output is wrong he says so. Fix it cleanly, no apology padding.
- **Handover discipline.** End each session with a dated `.md` in `docs/handovers/`. When a
  handover materially changes the state of things, fold it into `CURRENT-STATE.md`.
- **.md by default.** Only produce .docx if asked.
- **Never assume a version number.** Ask before bumping.
- **Reporting:** summarise changes by file and one-liner. Do not echo large code blocks back.

## Hard rules carried over from the old system

### Resource URLs
- **BBC Bitesize:** bare `/bitesize/topics/[id]` URLs were retired in 2024 and BBC blocks
  fetching, so deep links cannot be verified from here. Use verified subject roots. Only use a
  deep link that was confirmed directly — extracted from a school PDF, or Rob opened it and
  reported the title. **Never present a generated BBC path as curated.** This failed across two
  sessions before the rule stuck; do not spend tokens trying again.
- Every `Resource` has a `verified` flag. `false` renders a caution badge in the UI. Set it to
  `true` only for a URL known to exist — in practice, site roots.
- **CSNewbs:** root only. **W3Schools, Python Tutor, Craig'n'Dave, 101 Computing, Isaac
  Computer Science:** stable at root.
- **The school site:** returns 403 to plain `curl` and to WebFetch, but serves normally with a
  browser `User-Agent` header — that is the whole trick, no browser automation needed. The URLs,
  the curriculum subject ids and the exam-boards PDF path are all in `LOCAL.md`.
- **School PDF hyperlinks:** text extraction misses them. Use pypdf annotation parsing —
  iterate `page.get('/Annots')`, `.get_object()`, then `.get('/A').get('/URI')`.

### Content authoring
- Author in `content/subjects/`, never edit the generated JSON in `app/public/content/`.
- Spec point ids are generated from unit/topic codes. Never hand-write an id.
- Question mark schemes must total the question's marks. The build enforces it.
- Keep mark-scheme wording close to how a board writes it — the wording is what is being learned.

### AI features
- The API key never ships in the bundle. Proxy mode (Cloudflare Worker) is the intended setup;
  direct mode exists for Rob's own machine only.
- Set `ALLOWED_ORIGIN` in `worker/wrangler.toml` before going live, or the endpoint is an open
  relay to the Anthropic account.
- Cost target is **under £5/month**. The app enforces a monthly request cap and shows a running
  estimate in Settings.
