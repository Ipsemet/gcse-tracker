# Harry's GCSE Command Centre

A spec-driven GCSE learning platform: teaching notes, spaced repetition, exam-style testing with
real mark schemes, an adaptive revision planner, and progress tracking against the actual
specification — not against topic names someone made up.

Built for one Year 10 student sitting eleven GCSEs in summer 2028.

## Quick start

```bash
npm --prefix app install
npm --prefix app run dev
```

Then open http://localhost:5173.

## Building

```bash
npm --prefix app run build
```

This validates all content, typechecks, and produces a static site in `app/dist/` that can be
served from anywhere. For a GitHub Pages project site:

```bash
VITE_BASE=/your-repo-name/ npm --prefix app run build
```

## The idea

Every subject is broken into its exam board's own numbered spec points. Notes, flashcards,
questions, resources and progress all attach to those points. That makes "68% of Computer Science"
a statement about the actual qualification rather than about a made-up checklist, and it makes it
impossible for content to quietly drift off-spec.

Content is authored as readable JavaScript modules in `content/`, validated by
`tools/build-content.mjs`, and compiled to JSON the app fetches at runtime.

## AI tutor

Optional. Explains spec points, gives hints, and marks extended answers against the mark scheme.
The Anthropic API key lives in a Cloudflare Worker (`worker/`), never in the browser bundle. See
`worker/README.md` — about five minutes to deploy. There is a monthly request cap and a running
cost estimate in Settings; the target is under £5/month.

## Documentation

- `CLAUDE.md` — working rules, Harry's profile, hard-won lessons
- `docs/CURRENT-STATE.md` — what is built and what is next
- `docs/ARCHITECTURE.md` — how it fits together and why
- `docs/CONTENT-AUTHORING.md` — adding a subject, writing content

## Privacy

Everything is stored in the browser on the device. No account, no server, nothing sent anywhere —
unless the AI tutor is switched on, in which case only the question being asked is sent to
Anthropic. Backup is a JSON file you export yourself.
