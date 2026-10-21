# Current state

**Updated:** 21 October 2026 — RS content authored for the November test.

Harry is one week into Year 10. GCSEs are **summer 2028** (608 days). RS short course is examined
in **summer 2027** if the 8061D record is right.

---

## Built and working

The platform is complete end to end and verified in a browser:

| Area | State |
|---|---|
| Spec spine | Data model + build pipeline. OCR J277: 12 units, 26 topics, **106 spec points**. AQA RS 8061D: 2 units, 8 topics, **43 spec points**. |
| Content pipeline | `content/subjects/*.mjs` → zod validation → `app/public/content/*.json`. Build fails on invalid content. |
| Learn | Topic pages with notes, key terms, exam tips, common mistakes, resources, and per-spec-point confidence rating. |
| Recall | SM-2 spaced repetition with in-session learning steps. Verified: card graded, queue advanced, state persisted. |
| Test | Nine question types, auto-marking, mark schemes, levels-based marking for extended answers, self-marking fallback. Verified: 3/3 on an ordering question, mastery written correctly. |
| Plan | Adaptive daily planner + the rescheduler carried over from the old Revision Hub. Verified: advances through the spec in order, fills capacity exactly, moves missed blocks forward. |
| Progress | Mastery by subject, RAG counts, estimated grade, 28-day activity strip, XP/levels, 15 badges. |
| AI tutor | Explain-a-spec-point, hints, and marking of extended answers. Cloudflare Worker proxy written and documented. **Not yet deployed — needs an API key.** |
| PWA | Installable, offline, service worker caching content stale-while-revalidate. Mobile layout verified at 375×812. |
| Backup | JSON export/import — also how progress moves between laptop and phone. |

### Computer Science content authored

- **106 / 106 spec points have flashcards** — 150 cards
- **64 questions, 177 marks**, across every unit, mixed types, all with mark schemes
- **3 / 26 topics have full teaching notes**: 1.1.1 Architecture of the CPU, 1.2.4 Data storage,
  2.4.1 Boolean logic — including SVG diagrams and worked examples

---

## Outstanding — in priority order

### 1. ~~Confirm the exam boards~~ — DONE, 8 September 2026

All eleven confirmed from the school's own exam boards PDF and curriculum pages. See
[EXAM-BOARDS.md](EXAM-BOARDS.md). Four of the old system's assumptions were wrong (English
Language, English Literature and Spanish are all Edexcel, not AQA; RS covers Islam as well as
Christianity).

Two things still open:

- **Further Maths** — Harry is doing it, but it appears nowhere on the school site. Board, code
  and year all unknown. Do not assume AQA 8365.
- **Sport J829** — the third unit (R186 or R187) is not known.

### 2. Build the remaining spec spines

Done: Computer Science (106 points), Religious Studies (43 points).

Remaining, in the order they matter:

| Subject | Board / code | Why this order |
|---|---|---|
| Biology, Chemistry, Physics | AQA 8461 / 8462 / 8463 | Three separate specs, biggest volume, taught across both years |
| Mathematics | Edexcel 1MA1 Higher | Largest single spec |
| Geography | AQA 8035 | |
| English Language | Edexcel 1EN0 | |
| English Literature | Edexcel 1ET0 | Text-driven — needs the set texts modelled, not just spec points |
| Spanish | Edexcel 1SP0 | Vocabulary and grammar rather than knowledge recall — may need a different content shape |
| Sport | OCR J829 | Only R184 is examined; the rest is coursework. Needs deadline tracking more than a question bank |

### 3. RS content — earliest deadline — FIRST PASS DONE, 21 October 2026

Examined **summer 2027**; Harry has an in-school RS test in a few weeks (date not given).
Authored from the school's four knowledge organisers (Christian beliefs, Muslim beliefs,
Relationships and families, Peace and conflict), checked against the AQA spec:

- **8 / 8 topics have teaching notes**
- **140 flashcards** — every one of the 43 spec points covered
- **61 questions, 267 marks** in AQA's 1 / 2 / 4 / 5 / 12 pattern, every spec point covered.
  Includes the organiser's own 20 practice questions (tagged `sourceRef`).

The organiser has errors; the content follows the facts and flags each one in a callout —
list at the top of `content/subjects/rs/notes.mjs`. The big one: it says the Shi'a imams had no
family link to Muhammad. They were his descendants.

Next: drill Harry's weak topics once he has used it, and add a second 12-marker per topic.

### 4. Deploy

- Claude worker — `worker/README.md`, needs an Anthropic API key, about five minutes.
- The app — static build, GitHub Pages: `VITE_BASE=/repo-name/ npm --prefix app run build`.

### 5. Verify the J277 spine against the official OCR PDF

Board confirmed; the unit/topic structure is my own transcription and is still badged
`provisional`. Once checked line-by-line, set `confidence: 'confirmed'`.

### 6. Fill out CS content

23 of 26 topics still have no teaching notes.

## What was taken from the old system

- The **self-adjusting rescheduler** from Revision Hub v3.1, rebuilt so slot contents are chosen
  from mastery gaps rather than fixed in advance
- The **verified URL set** and the rules about which sites can be linked deeply
- The **gamification approach** — XP, levels, streaks, badges
- The **design language** — dark theme, CSS variables, mobile-first

## What was deliberately dropped

- The KS3 CS question bank — it is KS3, not J277, and the spec spine makes ad-hoc topics unusable
- The Revision Hub's fixed topic lists and hard-coded six-week schedule
- The old RS flashcards — built against a possibly-wrong specification

The old projects are untouched in `OLD SYSTEM/` for reference.
