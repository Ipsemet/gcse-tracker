# Harry's exam boards

**Source:** the school's published *Exam Boards and Subject Codes* PDF, retrieved
8 September 2026, cross-checked against its own Year 10 and Year 11 curriculum pages.
The URLs are in `LOCAL.md`, which is gitignored.

> The site returns 403 to plain `curl` and to WebFetch. It serves normally with a browser
> `User-Agent` header.

## Harry's subjects

| Subject | Board | Code | Notes |
|---|---|---|---|
| Biology | AQA | **8461** | Triple |
| Chemistry | AQA | **8462** | Triple |
| Physics | AQA | **8463** | Triple |
| Computer Science | OCR | **J277** | ✅ spine built |
| Geography | AQA | **8035** | |
| Spanish | Edexcel | **1SP0** | |
| Mathematics | Edexcel | **1MA1** | Higher tier |
| English Language | Edexcel | **1EN0** | |
| English Literature | Edexcel | **1ET0** | |
| Religious Studies | AQA | **8061D** | Short course, **examined Year 10 (summer 2027)**. ✅ spine built |
| Sport | OCR | **J829** | Cambridge National — see the warning below |

## Corrections to what the old project assumed

Four of these were wrong in the previous system, and content built on them would have been wasted:

| | Old assumption | Actual |
|---|---|---|
| English Literature | AQA; *An Inspector Calls*, *Power & Conflict* poetry | **Edexcel 1ET0**; *Macbeth*, *Journey's End* **or** *Boys Don't Cry*, *A Christmas Carol*, Edexcel Poetry Anthology, Unseen Poetry |
| English Language | AQA | **Edexcel 1EN0** |
| Spanish | AQA | **Edexcel 1SP0** |
| Religious Studies | 8061D = "Christianity only", Islam flashcards surplus | **Christianity AND Islam.** The Islam content was right all along |

## ⚠️ Sport: the school's PDF has the wrong qualification name

The PDF lists **"OCR J829 Sports Science"**. The code is right; the name is not.

- **J829 is the Cambridge National in Sport _Studies_.** Sport _Science_ is J828.
- The school's curriculum pages confirm Sport Studies units: **R185** (Performance and leadership
  in sports activities) in Year 10, **R184** (Contemporary issues in sport) in Year 11.
- J829 requires R184 + R185 + one of R186 (Sport and the media) or R187. **The third unit is not
  yet known** — worth asking.

This matters for the platform: only **R184 is externally examined** (written paper, 70 marks).
R185 and the third unit are centre-assessed coursework, moderated by OCR. So Sport needs
coursework deadline tracking far more than it needs a question bank.

## Religious Studies — what is actually examined

One paper, **1h45, 96 marks + 6 SPaG**, sat in **Year 10, summer 2027**. Linear.

- **Section A — beliefs and teachings only** (practices are *not* on the short course):
  Christianity (key beliefs; Jesus Christ and salvation), Islam (key beliefs; authority)
- **Section B — both themes are compulsory:**
  Theme A Relationships and families, Theme B Religion, peace and conflict

Question structure per topic: 1, 2, 4, 5 and 12 marks. The 12-mark evaluation carries the grade.

**Open question:** the Year 11 RS scheme of work covers the death penalty, abortion and
euthanasia — none of which are on the 8061 short course. Almost certainly non-examined Year 11 RS
taught after the exam has been sat, but worth one email to confirm.

## Further Maths — not confirmed

Harry is in the top set and is doing Further Maths, but **it appears nowhere** on the school's
exam boards PDF, the KS4 curriculum pages, or the KS4 options page. The old project recorded
*AQA Level 2 Certificate in Further Mathematics (8365)*, which is the usual choice, but that is
an assumption and nothing on the school site supports it.

**Needs confirming with the school:** board, code, and which year it is sat.

## School teaching order (useful for the planner)

**Computer Science, Year 10:** T1 computational thinking + data representation · T2 systems
architecture, memory and storage · T3 networks · T4 network security + systems software ·
T5 algorithms · T6 impacts. Programming runs through all six terms.
**Year 11:** T1 binary/hex + systems recap · T2 systems security · T2–T5 NEA programming project ·
T4–T5 impacts and exam preparation.

**Science, Year 10:** Physics — electricity, forces, electromagnetism. Chemistry — chemical
analysis, rates, chemical changes, electrolysis and energy, quantitative, atmosphere, using
resources. Biology — infection and response, bioenergetics, homeostasis, ecology.

**Geography, Year 10:** Paper 2 Challenges of Resource Management (water focus), Paper 1 Physical
Landscapes of the UK (coasts and rivers).

**English, Year 10:** T1–2 *Macbeth* + Language Paper 1. T3–4 *Journey's End* or *Boys Don't Cry*.

**RS, Year 10:** T1–2 Islam beliefs and teachings. Mock covers Islam + Relationships and Families.

## Revision guides the school recommends

The PDF hyperlinks a CGP guide per subject. Relevant ones, extracted from the PDF annotations:

- Biology — `cgpbooks.co.uk/secondary-books/gcse/science/biology/bas46-gcse-biology-aqa-complete-revision`
- Chemistry — `…/science/chemistry/cas46-gcse-chemistry-aqa-complete-revision`
- Physics — `…/science/physics/pas48-gcse-physics-aqa-complete-revision`
- Computer Science — `…/computer-science/cor43-new-gcse-computer-science-ocr-revision`
- Geography — `…/humanities/geography/gas43-new-gcse-geography-aqa-complete`
- Spanish — `…/languages/spanish/spes43-new-gcse-spanish-edexcel-complete`
- Maths Higher — `…/maths/mxhr47-gcse-maths-edexcel-revision-guide`
- English Language — `…/english/english-lang/ener42-gcse-english-language-edexcel`
- English Lit poetry — `…/english/english-lit/poetry-guides/acehr42-gcse-english-edexcel-poetry-guide`
- English Lit unseen poetry — `…/english/english-lit/poetry-guides/euer42-gcse-english-edexcel-unseen-poetry`

No CGP guide is listed for RS or for Sport.
