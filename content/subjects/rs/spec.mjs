/**
 * AQA GCSE (9-1) Religious Studies A — Short Course, 8061D
 *
 * Board and code confirmed from the school's published "Exam Boards and Subject
 * Codes" PDF (URL in LOCAL.md, which is gitignored).
 * The two religions — Christianity and Islam — confirmed by Rob and corroborated
 * by the school's own Year 10 scheme of work, which teaches Islam beliefs in
 * Terms 1-2 and mocks "Islam: Beliefs and Teachings & Relationships and Families".
 * Section A and Section B content transcribed from AQA's published specification.
 *
 * This corrects the previous project, which recorded 8061D as "Christianity only"
 * and treated its Islam flashcards as surplus. The opposite was true.
 *
 * Examined in Year 10 — summer 2027. Earliest deadline of all Harry's subjects.
 */
export default {
  id: 'rs',
  name: 'Religious Studies',
  shortName: 'RS',
  board: 'AQA',
  specCode: '8061D',
  specTitle: 'GCSE Religious Studies A (Short Course) — Christianity and Islam',
  specUrl: 'https://www.aqa.org.uk/subjects/religious-studies/gcse/religious-studies-8061/specification',
  examSeries: 'Summer 2027',
  confidence: 'confirmed',
  confidenceNote:
    'Board, code and religions confirmed. Open question: the Year 11 RS scheme of work covers the death penalty, abortion and euthanasia, which are not on the 8061 short course. Almost certainly non-examined Year 11 RS taught after the exam — worth one email to the school to be sure.',
  colour: '#b476ff',
  icon: '☪️',
  priority: 1,
  papers: [
    {
      code: '8061D',
      name: 'Religious Studies A (Short Course)',
      durationMins: 105,
      marks: 102,
      weighting: 1,
      calculator: false,
      covers: ['3.1', '3.2'],
      notes:
        '96 marks plus 6 for spelling, punctuation and grammar. Section A: the two religions. Section B: both themes. Linear — one paper at the end of the course.',
    },
  ],
  examNotes: [
    'One paper, 1h45, the whole qualification. Sat in Year 10 — summer 2027.',
    'Section A is beliefs and teachings only. Practices are NOT on the short course.',
    'Question structure per topic: 1 mark, 2 marks, 4 marks, 5 marks, then a 12-mark evaluation. The 12-marker is where the grade is won.',
    'The 12-mark evaluation needs arguments for, arguments against, reference to religious teaching, and a justified conclusion. Six marks of the paper are for SPaG — write in full, accurate sentences.',
    'Learn short scriptural quotations for both religions. A named source of authority lifts an answer out of the middle band.',
  ],
  units: [
    {
      code: '3.1',
      title: 'The study of religions: beliefs and teachings',
      paper: '8061D',
      topics: [
        {
          code: '3.1.1.1',
          title: 'Christianity: key beliefs',
          points: [
            {
              statement: 'The nature of God: God as omnipotent, loving and just, and the problem of evil and suffering',
              detail: [
                'Omnipotent — all-powerful; loving — God cares for creation; just — God judges fairly',
                'The problem of evil: if God is all-powerful and all-loving, why does suffering exist?',
                'Christian responses include free will, suffering as a test, and Jesus sharing in human suffering',
              ],
              difficulty: 3,
              keywords: ['omnipotent', 'benevolent', 'just', 'problem of evil', 'free will', 'theodicy'],
            },
            {
              statement: 'The oneness of God and the Trinity: Father, Son and Holy Spirit',
              detail: ['One God in three persons — not three Gods', 'Basis in the baptism of Jesus and the Nicene Creed'],
              difficulty: 2,
              keywords: ['Trinity', 'Father', 'Son', 'Holy Spirit', 'monotheism', 'Nicene Creed'],
            },
            {
              statement: 'Different Christian beliefs about creation, including the role of the Word and the Spirit',
              detail: ['Genesis 1 — God creates through the Word', 'Literal (creationist) and non-literal readings', 'John 1:1-3 identifies the Word with Christ'],
              difficulty: 2,
              keywords: ['creation', 'Genesis', 'the Word', 'creationism', 'literal', 'non-literal'],
            },
            {
              statement: 'Different Christian beliefs about the afterlife and their importance, including resurrection, judgement, heaven and hell',
              difficulty: 2,
              keywords: ['afterlife', 'resurrection', 'judgement', 'heaven', 'hell', 'purgatory'],
            },
          ],
        },
        {
          code: '3.1.1.2',
          title: 'Christianity: Jesus Christ and salvation',
          points: [
            {
              statement: 'Beliefs and teachings about the incarnation and Jesus as the Son of God',
              difficulty: 2,
              keywords: ['incarnation', 'Son of God', 'Word made flesh'],
            },
            {
              statement: 'Beliefs and teachings about the crucifixion, resurrection and ascension',
              difficulty: 2,
              keywords: ['crucifixion', 'resurrection', 'ascension'],
            },
            {
              statement: 'Beliefs and teachings about sin, including original sin',
              difficulty: 2,
              keywords: ['sin', 'original sin', 'the Fall'],
            },
            {
              statement: 'Beliefs and teachings about the means of salvation, including law, grace and Spirit',
              difficulty: 3,
              keywords: ['salvation', 'law', 'grace', 'Spirit'],
            },
            {
              statement: 'The role of Christ in salvation, including the idea of atonement',
              difficulty: 3,
              keywords: ['atonement', 'sacrifice', 'redemption', 'salvation'],
            },
          ],
        },
        {
          code: '3.1.2.1',
          title: 'Islam: key beliefs',
          points: [
            {
              statement: 'The six articles of faith in Sunni Islam and the five roots of Usul ad-Din in Shi\'a Islam, including key similarities and differences',
              detail: [
                'Sunni six articles: Tawhid, angels, holy books, prophets, Day of Judgement, predestination',
                'Shi\'a five roots: Tawhid, divine justice (Adalat), prophethood, imamate, resurrection',
              ],
              difficulty: 3,
              keywords: ['six articles of faith', 'Usul ad-Din', 'Sunni', "Shi'a", 'Adalat'],
            },
            {
              statement: 'Tawhid: the Oneness of God, with reference to the Qur\'an',
              detail: ['Surah 112 — God is one, eternal, not begotten', 'Shirk (associating partners with God) is the gravest sin'],
              difficulty: 2,
              keywords: ['Tawhid', 'oneness', 'shirk', "Qur'an", 'monotheism'],
            },
            {
              statement: 'The nature of God, including omnipotence, beneficence, mercy, fairness and justice',
              detail: ['Adalat — divine justice, particularly emphasised in Shi\'a Islam'],
              difficulty: 2,
              keywords: ['omnipotence', 'beneficence', 'mercy', 'justice', 'Adalat', '99 names'],
            },
            {
              statement: 'Angels, their nature and role, including Jibril and Mika\'il',
              difficulty: 1,
              keywords: ['angels', 'malaikah', 'Jibril', "Mika'il", 'Izra\'il'],
            },
            {
              statement: 'Predestination and human freedom, and its relationship to the Day of Judgement',
              difficulty: 3,
              keywords: ['predestination', 'al-Qadr', 'free will', 'Day of Judgement'],
            },
            {
              statement: 'Akhirah: life after death, human responsibility and accountability, resurrection, heaven and hell',
              difficulty: 2,
              keywords: ['Akhirah', 'resurrection', 'Jannah', 'Jahannam', 'barzakh', 'accountability'],
            },
          ],
        },
        {
          code: '3.1.2.2',
          title: 'Islam: authority',
          points: [
            {
              statement: 'Risalah (prophethood), including the role and importance of Adam, Ibrahim and Muhammad',
              difficulty: 2,
              keywords: ['Risalah', 'prophethood', 'Adam', 'Ibrahim', 'Muhammad'],
            },
            {
              statement: 'The holy books: Qur\'an, Tawrat, Zabur, Injil and Sahifah, their nature, authority and importance',
              detail: ['The Qur\'an is the final and unaltered revelation, given to Muhammad through the angel Jibril'],
              difficulty: 2,
              keywords: ["Qur'an", 'Tawrat', 'Zabur', 'Injil', 'Sahifah', 'revelation'],
            },
            {
              statement: 'The imamate in Shi\'a Islam: its role and significance',
              difficulty: 3,
              keywords: ['imamate', "Shi'a", 'Ali', 'succession'],
            },
          ],
        },
      ],
    },
    {
      code: '3.2',
      title: 'Thematic studies',
      paper: '8061D',
      topics: [
        {
          code: '3.2.1.1',
          title: 'Theme A: Sex, marriage and divorce',
          points: [
            {
              statement: 'Human sexuality, including heterosexual and same-sex relationships',
              difficulty: 2,
              keywords: ['sexuality', 'heterosexual', 'same-sex', 'homosexuality'],
            },
            {
              statement: 'Sexual relationships before and outside of marriage',
              difficulty: 2,
              keywords: ['premarital sex', 'adultery', 'chastity', 'celibacy'],
            },
            {
              statement: 'Contraception and family planning',
              difficulty: 2,
              keywords: ['contraception', 'family planning', 'natural methods'],
            },
            {
              statement: 'The nature and purpose of marriage',
              difficulty: 1,
              keywords: ['marriage', 'sacrament', 'covenant', 'nikah'],
            },
            {
              statement: 'Same-sex marriage and cohabitation',
              difficulty: 2,
              keywords: ['same-sex marriage', 'cohabitation'],
            },
            {
              statement: 'Divorce, including reasons for divorce and remarrying',
              difficulty: 2,
              keywords: ['divorce', 'remarriage', 'annulment', 'talaq'],
            },
            {
              statement: 'Ethical arguments related to divorce, including those based on the sanctity of marriage vows and compassion',
              difficulty: 3,
              keywords: ['sanctity of vows', 'compassion', 'ethical arguments'],
            },
          ],
        },
        {
          code: '3.2.1.2',
          title: 'Theme A: Families and gender equality',
          points: [
            {
              statement: 'The nature of families, including the role of parents and children, and extended and nuclear families',
              difficulty: 1,
              keywords: ['nuclear family', 'extended family', 'parental roles'],
            },
            {
              statement: 'The purpose of families, including procreation, stability, the protection of children, and educating children in a faith',
              difficulty: 2,
              keywords: ['procreation', 'stability', 'protection', 'faith education'],
            },
            {
              statement: 'Contemporary family issues, including same-sex parents and polygamy',
              difficulty: 2,
              keywords: ['same-sex parents', 'polygamy'],
            },
            {
              statement: 'The roles of men and women',
              difficulty: 2,
              keywords: ['gender roles', 'complementarity', 'equality'],
            },
            {
              statement: 'Gender equality',
              difficulty: 2,
              keywords: ['gender equality', 'feminism'],
            },
            {
              statement: 'Gender prejudice and discrimination, including examples',
              difficulty: 2,
              keywords: ['prejudice', 'discrimination', 'sexism'],
            },
          ],
        },
        {
          code: '3.2.2.1',
          title: 'Theme B: Religion, violence, terrorism and war',
          points: [
            {
              statement: 'The meaning and significance of peace, justice, forgiveness and reconciliation',
              difficulty: 2,
              keywords: ['peace', 'justice', 'forgiveness', 'reconciliation'],
            },
            {
              statement: 'Violence, including violent protest',
              difficulty: 2,
              keywords: ['violence', 'violent protest'],
            },
            {
              statement: 'Terrorism',
              difficulty: 2,
              keywords: ['terrorism', 'extremism'],
            },
            {
              statement: 'Reasons for war, including greed, self-defence and retaliation',
              difficulty: 2,
              keywords: ['greed', 'self-defence', 'retaliation'],
            },
            {
              statement: 'The just war theory, including the criteria for a just war',
              detail: ['Just cause, proper authority, right intention, last resort, proportionality, reasonable chance of success'],
              difficulty: 3,
              keywords: ['just war', 'just cause', 'proportionality', 'last resort'],
            },
            {
              statement: 'Holy war',
              detail: ['In Islam, greater and lesser jihad — the greater jihad is the personal struggle to live faithfully'],
              difficulty: 3,
              keywords: ['holy war', 'jihad', 'greater jihad', 'lesser jihad', 'crusade'],
            },
            {
              statement: 'Pacifism',
              difficulty: 2,
              keywords: ['pacifism', 'non-violence', 'Quakers'],
            },
          ],
        },
        {
          code: '3.2.2.2',
          title: 'Theme B: Religion and belief in 21st century conflict',
          points: [
            {
              statement: 'Religion and belief as a cause of war and violence in the contemporary world',
              difficulty: 3,
              keywords: ['religious conflict', 'contemporary'],
            },
            {
              statement: 'Nuclear weapons, including nuclear deterrence',
              difficulty: 3,
              keywords: ['nuclear weapons', 'deterrence'],
            },
            {
              statement: 'The use of weapons of mass destruction',
              difficulty: 3,
              keywords: ['weapons of mass destruction', 'WMD', 'chemical', 'biological'],
            },
            {
              statement: 'Religion and peace-making in the contemporary world, including the work of individuals influenced by religious teaching',
              difficulty: 2,
              keywords: ['peace-making', 'reconciliation', 'religious leaders'],
            },
            {
              statement: 'Religious responses to the victims of war, including the work of one present-day religious organisation',
              detail: ['Learn one named organisation in detail — Christian Aid, Islamic Relief, Muslim Aid or CAFOD'],
              difficulty: 2,
              keywords: ['victims of war', 'Islamic Relief', 'Christian Aid', 'refugees'],
            },
          ],
        },
      ],
    },
  ],
}
