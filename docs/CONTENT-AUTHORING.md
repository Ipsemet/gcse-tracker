# Content authoring

All content lives in `content/subjects/<subjectId>/`. Run `node tools/build-content.mjs` to
validate and compile it; the build prints a coverage table and fails on any error.

## Adding a subject

Create `content/subjects/<id>/spec.mjs`:

```js
export default {
  id: 'bio',                       // short, lowercase, stable
  name: 'Biology',
  shortName: 'Biology',
  board: 'AQA',
  specCode: '8461',
  specTitle: 'GCSE Biology',
  specUrl: 'https://…',
  examSeries: 'Summer 2028',
  confidence: 'unconfirmed',       // until the board PDF is in hand
  confidenceNote: 'Board not yet confirmed by the school.',
  colour: '#34d99a',               // six-digit hex
  icon: '🧬',
  priority: 2,                     // lower wins when the planner must choose
  papers: [ /* … */ ],
  units: [
    { code: '4.1', title: 'Cell biology', paper: '8461/1', topics: [
      { code: '4.1.1', title: 'Cell structure', points: [
        { statement: '…', difficulty: 2, keywords: ['…'], detail: ['…'] },
      ]},
    ]},
  ],
}
```

Spec point **ids and codes are generated** — `1.1.1` + the first point becomes `1.1.1a`, id
`j277.1.1.1a`. Author the statements in order and never write an id by hand.

Set `confidence: 'confirmed'` only once the unit titles, topic titles and statements have been
checked line-by-line against the official specification PDF.

## Notes, flashcards and questions

These files are optional and reference spec points by **bare code** (`'1.1.1a'`); the build
resolves them to full ids and errors on anything that does not exist.

- `notes.mjs` — array of topic notes, keyed by `topicCode`. Blocks available: `prose`, `list`,
  `table`, `code`, `callout`, `steps`, `worked-example`, `diagram` (inline SVG).
- `flashcards.mjs` — `{ id, points, kind, front, back, hint?, items? }`
- `questions.mjs` — see below.

Ids must be unique within a subject. The convention is `cs-c-0001` for cards, `cs-q-0001` for
questions, `cs-r-0001` for resources.

## Question rules the build enforces

- `markScheme` marks must total the question's `marks`.
- `mcq` needs exactly one correct option; `multi` needs at least two; both need three or more options.
- `extended` needs `levels` or a `markScheme`.
- `short` and `calculation` need `acceptableAnswers` or a `markScheme`, or they cannot be marked.

Write mark scheme text close to how the board writes it, and use `alternatives` for the other
wordings that earn the mark — the auto-marker matches against both, and the wording is itself
part of what is being learned.

## Resource links

```js
{ id, title, description, url, provider, kind, minutes?, verified, free }
```

`verified: true` means the URL is known to exist — in practice a site root someone has opened.
Anything deeper is `false` and renders with a caution badge. See the URL rules in `CLAUDE.md`:
BBC Bitesize deep links in particular must never be presented as curated unless confirmed directly.

## Coverage

The build prints, per subject: spec points, topics with notes, flashcards, questions and total
marks. Aim in this order:

1. **Flashcards on every spec point** — cheapest per point and drives the spaced repetition engine.
2. **Questions across every topic** — mastery scores are meaningless without them.
3. **Teaching notes** — most expensive to write; do the topics Harry is actually weak on first.
