/**
 * AQA 8061D question bank.
 *
 * Follows AQA's question pattern for every topic: 1-mark multiple choice, 2-mark
 * "Give two", 4-mark "Explain two ways / two contrasting / two similar", 5-mark
 * "Explain two … Refer to sacred writings", 12-mark "Evaluate this statement".
 * Mark schemes follow AQA's structure; the 12-mark levels paraphrase AQA's
 * published level descriptors. SPaG (3 marks on the 12-markers in the real
 * paper) is not counted here.
 *
 * Questions marked sourceRef 'School knowledge organiser' are the 20 practice
 * questions printed at the end of Harry's organisers (scanned 19 Oct 2026). The
 * organiser gives the sacred-writings question 6 marks; AQA gives it 5, so 5 is
 * used here. All others are authored in AQA style, not reproduced from AQA papers.
 */

const SCHOOL = 'School knowledge organiser practice questions'

// --- Shared mark-scheme builders --------------------------------------------

/** 4-mark "Explain two ways / beliefs". Each: 1 for a simple point, 1 for development. */
const four = (first, firstDev, second, secondDev) => [
  { text: `First point: ${first}`, marks: 1 },
  { text: `Developed: ${firstDev}`, marks: 1 },
  { text: `Second point: ${second}`, marks: 1 },
  { text: `Developed: ${secondDev}`, marks: 1 },
]

/** 5-mark — as `four`, plus 1 for a relevant sacred writing or source of authority. */
const five = (first, firstDev, second, secondDev, source) => [
  ...four(first, firstDev, second, secondDev),
  { text: `Relevant sacred writing or source of authority, e.g. ${source}`, marks: 1 },
]

/** 12-mark evaluation — AQA's four levels. */
const twelve = (forArgs, againstArgs) => [
  {
    level: 4, marksFrom: 10, marksTo: 12,
    descriptor: 'A well-argued response with reasoned consideration of different points of view. Logical chains of reasoning lead to a justified conclusion, supported by accurate religious teaching.',
    indicativeContent: [...forArgs.map((a) => `For: ${a}`), ...againstArgs.map((a) => `Against: ${a}`), 'A conclusion that weighs the two sides and says which is stronger, and why'],
  },
  { level: 3, marksFrom: 7, marksTo: 9, descriptor: 'Reasoned consideration of different points of view, with logical chains of reasoning drawing on religious teaching. Conclusion is missing or not fully justified.' },
  { level: 2, marksFrom: 4, marksTo: 6, descriptor: 'Reasoned consideration of ONE point of view, OR different points of view each supported by a simple reason.' },
  { level: 1, marksFrom: 1, marksTo: 3, descriptor: 'A point of view with a reason stated in support.' },
]

const twelveNote = 'Structure: argue FOR with reasons and a named teaching; argue AGAINST the same way; then a conclusion that weighs them up. Name the religious group (Catholic, Sunni…) rather than "Christians say". In the exam there are 3 more marks for spelling, punctuation and grammar.'

export default [
  // ===================== 3.1.1.1 Christianity: key beliefs ===================
  {
    id: 'rs-q-0001', points: ['3.1.1.1b'], type: 'mcq', marks: 1, difficulty: 1, commandWord: 'Which',
    stem: 'Which one of the following is a Person of the Trinity?',
    options: [
      { id: 'a', text: 'Mother', correct: false },
      { id: 'b', text: 'Daughter', correct: false },
      { id: 'c', text: 'Son', correct: true },
      { id: 'd', text: 'Brother', correct: false },
    ],
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0002', points: ['3.1.1.1a'], type: 'mcq', marks: 1, difficulty: 1, commandWord: 'Which',
    stem: 'Which one of the following means "all-powerful"?',
    options: [
      { id: 'a', text: 'Omniscient', correct: false, why: 'All-knowing.' },
      { id: 'b', text: 'Omnipotent', correct: true },
      { id: 'c', text: 'Omnipresent', correct: false, why: 'Present everywhere.' },
      { id: 'd', text: 'Omnibenevolent', correct: false, why: 'All-loving.' },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0003', points: ['3.1.1.1a'], type: 'short', marks: 2, difficulty: 2, commandWord: 'Give',
    stem: 'Give two Christian responses to the problem of evil and suffering.',
    markScheme: [
      { text: 'Free will — humans cause suffering by misusing the freedom God gave them', marks: 1, alternatives: ['free will', 'free will defence'] },
      { text: 'Suffering helps people grow — vale of soul-making', marks: 1, alternatives: ['soul-making', 'original sin', 'suffering is a test', 'Jesus also suffered', 'pray', 'help those who suffer'] },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0004', points: ['3.1.1.1a'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two ways in which believing that God is loving influences Christians today.',
    markScheme: four(
      'Christians try to love other people',
      'because God loves them, they follow his example — e.g. "love your neighbour", helping the poor',
      'Christians trust God in hard times',
      'they believe God cares for them, so they pray and feel comforted when suffering',
    ),
    modelAnswer: 'Firstly, Christians try to love others. Because God loved the world so much that he sent his Son, they follow his example by caring for people in need, for example by giving to charities such as Christian Aid. Secondly, Christians trust God in difficult times. Believing that God loves them personally, they pray and feel comforted that God cares about what happens to them.',
    examinerNote: 'Each way needs a second sentence that develops it — usually "because…" or "for example…".',
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0005', points: ['3.1.1.1c'], type: 'extended', marks: 5, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two Christian beliefs about the creation of the world. Refer to sacred writings or another source of Christian belief and teaching in your answer.',
    markScheme: five(
      'God created the world out of nothing (ex nihilo) and it is good',
      'Genesis 1 shows God creating by his word, and seeing that it was good — so Christians should care for creation',
      'all three persons of the Trinity were involved in creation',
      'the Spirit "hovered over the waters" (Genesis 1:2) and the Word (Jesus) — "through him all things were made" (John 1:3)',
      '"In the beginning God created the heavens and the earth" (Genesis 1:1) or John 1:1-3',
    ),
    modelAnswer: 'Christians believe God created the world out of nothing. "In the beginning God created the heavens and the earth" (Genesis 1:1), and he saw that it was good, so Christians believe they should look after creation. Christians also believe the whole Trinity was involved. Genesis says the Spirit was "hovering over the waters", and John\'s gospel says of the Word, Jesus, "through him all things were made". So creation was the work of Father, Son and Holy Spirit together.',
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0006', points: ['3.1.1.1a'], type: 'extended', marks: 12, difficulty: 3, commandWord: 'Evaluate',
    stem: '"The existence of evil and suffering proves God is not loving." Evaluate this statement. In your answer you should give reasoned arguments to support this statement, give reasoned arguments to support a different point of view, refer to Christian teaching, and reach a justified conclusion.',
    levels: twelve(
      ['A loving, all-powerful God would stop suffering, so either God is not loving or not all-powerful (the inconsistent triad)', 'Natural disasters and disease are not caused by humans, so free will cannot explain them', 'Atheists and humanists argue the amount of suffering is too great for a loving God'],
      ['Free will: God loves us enough to let us choose; most suffering comes from humans misusing it', 'Vale of soul-making (Hick): suffering helps people grow in compassion and courage', 'God shared in suffering through Jesus on the cross — "God so loved the world" (John 3:16)', 'Christians believe suffering will end in heaven, where God will "wipe every tear"'],
    ),
    examinerNote: twelveNote,
    source: 'authored',
  },
  {
    id: 'rs-q-0007', points: ['3.1.1.1d'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two contrasting Christian beliefs about hell.',
    markScheme: four(
      'hell is a real place of eternal punishment',
      'Jesus speaks of "eternal fire" (Matthew 25:41) for those who reject God',
      'hell is a state of being separated from God, not a physical place',
      'a loving God would not torture people for ever; hell is being cut off from God by your own choice — some believe in universalism instead',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0008', points: ['3.1.1.1d'], type: 'extended', marks: 5, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two Christian beliefs about judgement. Refer to sacred writings or another source of Christian belief and teaching in your answer.',
    markScheme: five(
      'Jesus will return to judge everyone',
      'the Apostles\' Creed says he "will come to judge the living and the dead" — everyone is accountable',
      'people will be judged on how they treated those in need',
      'in the Parable of the Sheep and the Goats those who fed the hungry and visited prisoners go to heaven',
      'Matthew 25:31-46 or the Apostles\' Creed',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0009', points: ['3.1.1.1b'], type: 'match', marks: 3, difficulty: 1, commandWord: 'Match',
    stem: 'Match each person of the Trinity to its description.',
    pairs: [
      { left: 'God the Father', right: 'Creator of all things — "Our Father in heaven"' },
      { left: 'God the Son', right: 'Jesus — fully God and fully human' },
      { left: 'God the Holy Spirit', right: 'The unseen power of God at work in the world' },
    ],
    source: 'authored',
  },

  // ============== 3.1.1.2 Christianity: Jesus Christ and salvation ===========
  {
    id: 'rs-q-0010', points: ['3.1.1.2c'], type: 'short', marks: 1, difficulty: 1, commandWord: 'Name',
    stem: 'Name the people who committed the original sin in the Garden of Eden.',
    acceptableAnswers: ['Adam and Eve', 'Eve and Adam', 'Adam & Eve'],
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0011', points: ['3.1.1.2e'], type: 'mcq', marks: 1, difficulty: 1, commandWord: 'Which',
    stem: 'Which one of the following means restoring the relationship between people and God?',
    options: [
      { id: 'a', text: 'Ascension', correct: false, why: 'Jesus returning to heaven.' },
      { id: 'b', text: 'Incarnation', correct: false, why: 'God becoming human.' },
      { id: 'c', text: 'Atonement', correct: true },
      { id: 'd', text: 'Resurrection', correct: false, why: 'Rising from the dead.' },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0012', points: ['3.1.1.2b'], type: 'order', marks: 3, difficulty: 1, commandWord: 'Order',
    stem: 'Put these events in the order they happened.',
    sequence: ['The Last Supper', 'The crucifixion', 'The empty tomb is found', 'Jesus appears to Thomas', 'The ascension'],
    source: 'authored',
  },
  {
    id: 'rs-q-0013', points: ['3.1.1.2d'], type: 'short', marks: 2, difficulty: 2, commandWord: 'Give',
    stem: 'Give two ways Christians believe salvation can be achieved.',
    markScheme: [
      { text: 'Through grace — a free gift from God through faith in Jesus', marks: 1, alternatives: ['grace', 'faith in Jesus', 'faith'] },
      { text: 'Through law / good works — obeying God\'s commandments', marks: 1, alternatives: ['good works', 'law', 'obeying God', 'the Holy Spirit', 'Spirit'] },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0014', points: ['3.1.1.2a'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two ways in which belief in the incarnation influences Christians today.',
    markScheme: four(
      'Christians follow Jesus\' example',
      'because Jesus was God in human form, his life shows exactly how God wants people to live — e.g. forgiving others',
      'Christians celebrate Christmas',
      'they remember God becoming human and thank God for it in worship, nativity services and giving',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0015', points: ['3.1.1.2b'], type: 'extended', marks: 5, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two reasons why the resurrection is important to Christians. Refer to sacred writings or another source of Christian belief and teaching in your answer.',
    markScheme: five(
      'it shows Jesus defeated death',
      'so it proves he was the Son of God and his sacrifice worked',
      'it gives Christians hope of eternal life',
      'they believe they too will be raised, so death is not the end and they need not fear it',
      '"If Christ has not been raised, our preaching is useless and so is your faith" (1 Corinthians 15:14)',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0016', points: ['3.1.1.2d', '3.1.1.2e'], type: 'extended', marks: 12, difficulty: 3, commandWord: 'Evaluate',
    stem: '"Without Jesus\' death and resurrection, there would be no salvation." Evaluate this statement. In your answer you should give reasoned arguments to support this statement, give reasoned arguments to support a different point of view, refer to Christian teaching, and reach a justified conclusion.',
    levels: twelve(
      ['Atonement: Jesus\' death paid for the sins of the world — "he is the atoning sacrifice for our sins" (1 John 2:2)', 'The resurrection shows death is defeated; without it "your faith is futile" (1 Corinthians 15:17)', 'Grace through faith in Jesus — "I am the way… no one comes to the Father except through me" (John 14:6)'],
      ['Some Christians stress salvation through law and good works — "faith without deeds is dead" (James 2:17)', 'The Parable of the Sheep and the Goats judges people on how they helped others, not on belief about the cross', 'The Holy Spirit works in believers to bring them to salvation', 'Universalists believe a loving God will save everyone, so salvation does not depend on accepting Jesus\' sacrifice'],
    ),
    examinerNote: twelveNote,
    source: 'authored', sourceRef: SCHOOL,
  },

  // ========================= 3.1.2.1 Islam: key beliefs ======================
  {
    id: 'rs-q-0017', points: ['3.1.2.1a'], type: 'mcq', marks: 1, difficulty: 2, commandWord: 'Which',
    stem: 'Which one of the following is NOT an article of faith in Sunni Islam?',
    options: [
      { id: 'a', text: 'The holy books', correct: false },
      { id: 'b', text: 'Belief in angels', correct: false },
      { id: 'c', text: 'The Imamate', correct: true, why: 'The imamate is one of the five Shi\'a roots, not a Sunni article.' },
      { id: 'd', text: 'The prophets', correct: false },
    ],
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0018', points: ['3.1.2.1d'], type: 'mcq', marks: 1, difficulty: 1, commandWord: 'Which',
    stem: 'Which angel revealed the Qur\'an to Muhammad?',
    options: [
      { id: 'a', text: 'Mika\'il', correct: false, why: 'The angel of mercy, who sends rain.' },
      { id: 'b', text: 'Israfil', correct: false, why: 'He will blow the trumpet on the Day of Judgement.' },
      { id: 'c', text: 'Jibril', correct: true },
      { id: 'd', text: 'Iblis', correct: false, why: 'Iblis is not an angel in this sense — he was thrown out of paradise.' },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0019', points: ['3.1.2.1d'], type: 'short', marks: 2, difficulty: 1, commandWord: 'Give',
    stem: 'Give two roles of angels in Islam.',
    markScheme: [
      { text: 'Bring God\'s messages to the prophets', marks: 1, alternatives: ['messengers', 'reveal the Qur\'an', 'bring messages'] },
      { text: 'Watch over people and record their deeds', marks: 1, alternatives: ['record deeds', 'guardian', 'watch over', 'take souls at death', 'blow the trumpet', 'send rain', 'question the dead'] },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0020', points: ['3.1.2.1a'], type: 'extended', marks: 4, difficulty: 3, commandWord: 'Explain',
    stem: 'Explain two ways in which belief in the five roots of Usul ad-Din influences Shi\'a Muslims today.',
    markScheme: four(
      'belief in Adalat (God\'s justice) makes Shi\'a Muslims try to act fairly',
      'because God is just and will judge them, they work for justice and treat others fairly',
      'belief in the imamate means they follow the teaching of the imams',
      'they look to the imams\' teachings and to senior scholars for guidance on how to live, and remember the imams at festivals such as Ashura',
    ),
    examinerNote: 'Any two roots can be used: Tawhid (worship only God, avoid shirk), prophethood (follow Muhammad\'s example), resurrection (live well knowing they will be judged).',
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0021', points: ['3.1.2.1f'], type: 'extended', marks: 5, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two Muslim beliefs about life after death (Akhirah). Refer to sacred writings or another source of Muslim belief and teaching in your answer.',
    markScheme: five(
      'after death the soul waits in barzakh until the Day of Judgement',
      'two angels question the dead about their faith, and no one can return to put things right',
      'on the Day of Judgement everyone will be resurrected and judged',
      'the good go to Jannah (paradise) and the bad to Jahannam (hell), based on their deeds and faith',
      '"Whoever has done an atom\'s weight of good will see it" (Qur\'an 99:7) or "a reward for what they used to do" (56:24)',
    ),
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0022', points: ['3.1.2.1e'], type: 'extended', marks: 4, difficulty: 3, commandWord: 'Explain',
    stem: 'Explain two contrasting Muslim beliefs about predestination.',
    markScheme: four(
      'Sunni Muslims believe God has already decided everything that will happen',
      'it is written in the Book of Decrees — "Only what God has decreed will happen to us" (9:51)',
      'Shi\'a Muslims believe God knows what will happen but does not decide it',
      'humans have free will and make their own choices, so they are responsible for them',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0023', points: ['3.1.2.1e', '3.1.2.1f'], type: 'extended', marks: 12, difficulty: 3, commandWord: 'Evaluate',
    stem: '"If God has already decided everything, it is unfair for God to judge people." Evaluate this statement. In your answer you should give reasoned arguments to support this statement, give reasoned arguments to support a different point of view, refer to Muslim teaching, and reach a justified conclusion.',
    levels: twelve(
      ['If everything is written in the Book of Decrees, people cannot choose otherwise, so punishing them seems unjust', '"Only what God has decreed will happen to us" (9:51) suggests no real choice', 'Atheists would say a just God could not punish people for what he decided'],
      ['Shi\'a Muslims believe God knows but does not decide — people have free will, so judgement is fair', 'Sunni Muslims hold that people are still responsible for their choices even though God knows them', 'God is just (Adalat) and merciful, so judgement will be fair — "an atom\'s weight of good" will be seen (99:7)', 'God\'s knowledge is beyond human understanding; humans cannot judge what is fair for God'],
    ),
    examinerNote: twelveNote,
    source: 'authored',
  },
  {
    id: 'rs-q-0024', points: ['3.1.2.1a'], type: 'match', marks: 3, difficulty: 2, commandWord: 'Match',
    stem: 'Match each belief to where it appears: the Sunni six articles, the Shi\'a five roots, or both.',
    pairs: [
      { left: 'Angels', right: 'Sunni six articles only' },
      { left: 'Adalat (God\'s justice)', right: 'Shi\'a five roots only' },
      { left: 'Tawhid', right: 'Both lists' },
    ],
    source: 'authored',
  },

  // ========================= 3.1.2.2 Islam: authority ========================
  {
    id: 'rs-q-0025', points: ['3.1.2.2a'], type: 'short', marks: 1, difficulty: 1, commandWord: 'Name',
    stem: 'Name one prophet of Islam.',
    acceptableAnswers: ['Muhammad', 'Adam', 'Ibrahim', 'Abraham', 'Musa', 'Moses', 'Isa', 'Jesus', 'Dawud', 'David', 'Nuh', 'Noah', 'Isma\'il', 'Ishmael', 'Yusuf', 'Joseph', 'Sulayman', 'Solomon'],
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0026', points: ['3.1.2.2b'], type: 'match', marks: 4, difficulty: 2, commandWord: 'Match',
    stem: 'Match each holy book to the prophet who received it.',
    pairs: [
      { left: 'Tawrat (Torah)', right: 'Musa (Moses)' },
      { left: 'Zabur (Psalms)', right: 'Dawud (David)' },
      { left: 'Injil (Gospel)', right: 'Isa (Jesus)' },
      { left: 'Sahifah (Scrolls)', right: 'Ibrahim (Abraham)' },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0027', points: ['3.1.2.2c'], type: 'mcq', marks: 1, difficulty: 2, commandWord: 'Which',
    stem: 'Which one of the following did Shi\'a Muslims believe should succeed Muhammad?',
    options: [
      { id: 'a', text: 'Abu Bakr', correct: false, why: 'Sunni Muslims accepted Abu Bakr as the first caliph.' },
      { id: 'b', text: 'Ali', correct: true },
      { id: 'c', text: 'Umar', correct: false, why: 'The second Sunni caliph.' },
      { id: 'd', text: 'Abu Talib', correct: false, why: 'Muhammad\'s uncle, who raised him.' },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0028', points: ['3.1.2.2a'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two reasons why Ibrahim is important to Muslims.',
    markScheme: four(
      'he taught that there is only one God',
      'he rejected the worship of idols, so he is a model of Tawhid',
      'he was willing to sacrifice his son when God asked',
      'this shows perfect obedience and faith; Muslims remember it at Id-ul-Adha and on Hajj',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0029', points: ['3.1.2.2b'], type: 'extended', marks: 5, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two reasons why the Qur\'an is important to Muslims. Refer to sacred writings or another source of Muslim belief and teaching in your answer.',
    markScheme: five(
      'it is the word of God, revealed to Muhammad through Jibril',
      'it is final and unchanged, unlike earlier books, so it has the highest authority',
      'it guides how Muslims live',
      'it is the basis of prayer and Shari\'ah law; it is recited daily and learned by heart (hafiz)',
      '"This is the Scripture in which there is no doubt, containing guidance" (Qur\'an 2:2)',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0030', points: ['3.1.2.2b'], type: 'extended', marks: 12, difficulty: 3, commandWord: 'Evaluate',
    stem: '"Holy books are not important for Muslims in the modern world." Evaluate this statement. In your answer you should give reasoned arguments to support this statement, give reasoned arguments to support a different point of view, refer to Muslim teaching, and reach a justified conclusion.',
    levels: twelve(
      ['The Tawrat, Zabur and Injil were lost or changed, so they have little authority today', 'The Qur\'an was revealed in 7th-century Arabia and does not directly address modern issues like the internet or IVF', 'Many Muslims rely on the hadith, scholars and (for Shi\'a) imams for guidance on modern life'],
      ['The Qur\'an is God\'s final, unchanged word — "the Scripture in which there is no doubt" (2:2) — so it is timeless', 'It is the basis of Shari\'ah law and daily prayer; Muslims recite it every day', 'Its principles (justice, charity, Tawhid) apply to modern issues through scholarship', 'Belief in the holy books is one of the six Sunni articles of faith'],
    ),
    examinerNote: twelveNote,
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0031', points: ['3.1.2.2a'], type: 'order', marks: 3, difficulty: 2, commandWord: 'Order',
    stem: 'Put these events in Muhammad\'s life in order.',
    sequence: ['Born in Makkah (c. 570 CE)', 'Marries Khadijah', 'The Night of Power on Mount Hira (610 CE)', 'The Hijrah to Madinah (622 CE)', 'Returns to Makkah and clears the idols from the Ka\'aba (630 CE)'],
    source: 'authored',
  },

  // ================= 3.2.1.1 Theme A: Sex, marriage and divorce ==============
  {
    id: 'rs-q-0032', points: ['3.2.1.1e'], type: 'mcq', marks: 1, difficulty: 1, commandWord: 'Which',
    stem: 'Which one of the following means a couple living together without being married?',
    options: [
      { id: 'a', text: 'Annulment', correct: false },
      { id: 'b', text: 'Cohabitation', correct: true },
      { id: 'c', text: 'Adultery', correct: false },
      { id: 'd', text: 'Polygamy', correct: false },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0033', points: ['3.2.1.1d'], type: 'short', marks: 2, difficulty: 1, commandWord: 'Give',
    stem: 'Give two religious purposes of marriage.',
    markScheme: [
      { text: 'To have children (procreation)', marks: 1, alternatives: ['children', 'procreation', 'start a family'] },
      { text: 'Lifelong companionship and support', marks: 1, alternatives: ['companionship', 'love', 'support', 'sexual relationship', 'bring children up in the faith', 'stability'] },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0034', points: ['3.2.1.1e'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two contrasting religious beliefs about unmarried couples living together (cohabitation).',
    markScheme: four(
      'the Catholic Church teaches cohabitation is wrong',
      'sex should only take place within marriage, which is a sacrament and a lifelong commitment before God',
      'many Protestant Christians accept cohabitation',
      'if the couple are committed and loving, often as a step before marriage, it is acceptable',
    ),
    examinerNote: 'Islam (cohabitation is zina, forbidden) can replace the Catholic view.',
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0035', points: ['3.2.1.1c'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two contrasting Christian beliefs about contraception.',
    markScheme: four(
      'the Catholic Church only allows natural methods',
      'sex has two purposes — creating life and expressing love — which must not be separated',
      'the Church of England accepts artificial contraception',
      'it allows couples to plan their family responsibly, e.g. for the mother\'s health or money reasons',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0036', points: ['3.2.1.1f'], type: 'extended', marks: 5, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two religious beliefs about divorce. Refer to sacred writings or another source of religious belief and teaching in your answer.',
    markScheme: five(
      'the Catholic Church does not allow divorce',
      'marriage is a sacrament made before God for life; only an annulment can end it',
      'Islam allows divorce as a last resort',
      'it is "the most hated of lawful things"; there is a three-month waiting period (iddah) to try to reconcile',
      '"Anyone who divorces his wife and marries another woman commits adultery" (Mark 10:11) or the hadith on divorce',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0037', points: ['3.2.1.1a'], type: 'extended', marks: 12, difficulty: 3, commandWord: 'Evaluate',
    stem: '"It is wrong to disapprove of homosexual relationships." Evaluate this statement. In your answer you should give reasoned arguments to support this statement, give reasoned arguments to support a different point of view, refer to religious arguments, and reach a justified conclusion.',
    levels: twelve(
      ['Galatians 3:28 — all are one in Christ, so people should not be judged on who they love', 'Liberal Christians (Quakers, Methodists) see loving same-sex relationships as equal and marry same-sex couples', 'Jesus taught "love your neighbour" and did not condemn homosexuality', 'UK law treats same-sex couples equally and same-sex marriage has been legal since 2014'],
      ['Many Christians believe God\'s plan is man and woman becoming "one flesh" (Genesis 2:24)', 'Some cite Leviticus 18:22; the Catholic Church teaches homosexual acts are sinful', 'Most Muslims believe the Qur\'an teaches homosexual acts are against God\'s will', 'Religious believers argue they have the right to follow their scripture, while still opposing prejudice'],
    ),
    examinerNote: twelveNote,
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0038', points: ['3.2.1.1g'], type: 'extended', marks: 12, difficulty: 3, commandWord: 'Evaluate',
    stem: '"Religious people should never get divorced." Evaluate this statement. In your answer you should give reasoned arguments to support this statement, give reasoned arguments to support a different point of view, refer to religious arguments, and reach a justified conclusion.',
    levels: twelve(
      ['Sanctity of vows — promises made before God, "till death us do part"', '"What God has joined together, let no one separate" (Mark 10:9)', 'The Catholic Church teaches marriage is a permanent sacrament', 'Divorce harms children'],
      ['Compassion — staying in an abusive or loveless marriage causes more harm; divorce can be the lesser of two evils', 'Matthew 19:9 allows divorce for unfaithfulness', 'The Church of England allows divorce and remarriage in church', 'Islam allows divorce as a last resort, and Muhammad married a divorced woman'],
    ),
    examinerNote: twelveNote,
    source: 'authored',
  },

  // ============== 3.2.1.2 Theme A: Families and gender equality ==============
  {
    id: 'rs-q-0039', points: ['3.2.1.2a'], type: 'mcq', marks: 1, difficulty: 1, commandWord: 'Which',
    stem: 'Many religious people live in nuclear families. Which one of the following best describes a nuclear family?',
    options: [
      { id: 'a', text: 'A couple living in their parents\' home', correct: false },
      { id: 'b', text: 'A couple without children', correct: false },
      { id: 'c', text: 'A couple with children', correct: true },
      { id: 'd', text: 'A couple living with children and grandparents', correct: false, why: 'That is an extended family.' },
    ],
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0040', points: ['3.2.1.2f'], type: 'short', marks: 1, difficulty: 1, commandWord: 'Give',
    stem: 'Give one religious teaching about gender discrimination.',
    markScheme: [
      { text: '"There is neither… male nor female, for you are all one in Christ Jesus" (Galatians 3:28)', marks: 1, alternatives: ['Galatians 3:28', 'all one in Christ', 'created equal in the image of God', 'image of God', 'single soul', 'created from a single soul', 'love your neighbour', 'all equal'] },
    ],
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0041', points: ['3.2.1.2b'], type: 'extended', marks: 5, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two religious beliefs about the purpose of families. Refer to sacred writings or another source of religious belief and teaching in your answer.',
    markScheme: five(
      'procreation — families are where children are born',
      'God commanded "be fruitful and increase in number" (Genesis 1:28), so having children is part of God\'s plan',
      'educating children in the faith',
      'Christian parents promise at baptism to raise children as Christians; Muslim parents teach their children the Qur\'an',
      'Genesis 1:28, "Honour your father and your mother" (Exodus 20:12) or "the fruit of the heart is the child" (hadith)',
    ),
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0042', points: ['3.2.1.2d', '3.2.1.2e'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two contrasting Christian beliefs about the role of women in the Church.',
    markScheme: four(
      'the Catholic Church allows only men to be priests',
      'Jesus chose only men as his apostles, and the priest represents Christ at Mass',
      'the Church of England allows women priests and bishops',
      'all are equal in Christ (Galatians 3:28), and Paul sent Phoebe as a church representative',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0043', points: ['3.2.1.2c'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two contrasting religious beliefs about polygamy.',
    markScheme: four(
      'Christians believe marriage is between one man and one woman',
      'Genesis says a man and woman become "one flesh"; polygamy is also illegal in the UK',
      'Islam allows a man up to four wives',
      'but only if he treats them all equally — "if you fear you cannot be equitable, then marry only one" (4:3)',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0044', points: ['3.2.1.2e'], type: 'extended', marks: 12, difficulty: 3, commandWord: 'Evaluate',
    stem: '"Men and women should have the same roles in religion." Evaluate this statement. In your answer you should give reasoned arguments to support this statement, give reasoned arguments to support a different point of view, refer to religious arguments, and reach a justified conclusion.',
    levels: twelve(
      ['Galatians 3:28 — "nor is there male and female, for you are all one in Christ"', 'The Church of England ordains women as priests and bishops', 'Islam teaches men and women were created from a single soul with equal reward (33:35)', 'Jesus treated women as equals, e.g. Mary Magdalene was first to see him risen'],
      ['Catholic Church: only men can be priests, as Jesus chose male apostles', 'Some read Ephesians 5:22 as men leading the family', 'Many Muslims believe men and women are equal but have different, complementary roles', 'Different roles do not mean unequal value'],
    ),
    examinerNote: twelveNote,
    source: 'authored',
  },

  // ========= 3.2.2.1 Theme B: Religion, violence, terrorism and war ===========
  {
    id: 'rs-q-0045', points: ['3.2.2.1g'], type: 'mcq', marks: 1, difficulty: 1, commandWord: 'Which',
    stem: 'Which one of the following gives the meaning of pacifism?',
    options: [
      { id: 'a', text: 'To take revenge', correct: false },
      { id: 'b', text: 'To gain power', correct: false },
      { id: 'c', text: 'To convert people to religion', correct: false },
      { id: 'd', text: 'To be against violence', correct: true },
    ],
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0046', points: ['3.2.2.1f'], type: 'mcq', marks: 1, difficulty: 2, commandWord: 'Which',
    stem: 'Which one of the following is the greater jihad?',
    options: [
      { id: 'a', text: 'A war to defend Islam', correct: false, why: 'That is lesser jihad.' },
      { id: 'b', text: 'The inner struggle to live as a good Muslim', correct: true },
      { id: 'c', text: 'The pilgrimage to Makkah', correct: false, why: 'That is Hajj.' },
      { id: 'd', text: 'Giving to charity', correct: false, why: 'That is zakah.' },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0047', points: ['3.2.2.1e'], type: 'short', marks: 2, difficulty: 2, commandWord: 'Give',
    stem: 'Give two conditions of a just war.',
    markScheme: [
      { text: 'Just cause', marks: 1, alternatives: ['just cause', 'proper authority', 'legitimate authority'] },
      { text: 'Last resort', marks: 1, alternatives: ['last resort', 'right intention', 'proportionality', 'proportion', 'chance of success', 'civilians not targeted'] },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0048', points: ['3.2.2.1a'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two similar religious beliefs about reconciliation.',
    markScheme: four(
      'Christians believe they should forgive and be reconciled with enemies',
      'Jesus said forgive "seventy times seven" and forgave those who crucified him; e.g. the Community of the Cross of Nails at Coventry Cathedral',
      'Muslims also believe in reconciliation and forgiveness',
      'God is merciful, and "anyone who forgives and puts things right will have his reward from God" (42:40)',
    ),
    examinerNote: '"Similar" — both points must agree. Christianity and Islam both value reconciliation is the easiest pairing.',
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0049', points: ['3.2.2.1c'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two similar religious beliefs about terrorism.',
    markScheme: four(
      'Christians believe terrorism is wrong',
      'innocent people are the victims, and it breaks "You shall not murder" and the just war rules',
      'Muslims believe terrorism is wrong',
      'life is sacred — "Do not take life, which God has made sacred" (17:33) — and it breaks the rules of lesser jihad',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0050', points: ['3.2.2.1e'], type: 'extended', marks: 5, difficulty: 3, commandWord: 'Explain',
    stem: 'Explain two conditions of the just war theory. Refer to sacred writings or another source of religious belief and teaching in your answer.',
    markScheme: five(
      'there must be a just cause',
      'e.g. defending a country from attack, as Britain did in the Second World War',
      'it must be proportional',
      'no more force than needed and civilians must not be targeted, so nuclear weapons would fail this test',
      'Aquinas\'s just war theory or "Blessed are the peacemakers" (Matthew 5:9) — war must aim to restore peace',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0051', points: ['3.2.2.1g', '3.2.2.1e', '3.2.2.1f'], type: 'extended', marks: 12, difficulty: 3, commandWord: 'Evaluate',
    stem: '"Religious believers should never fight in a war." Evaluate this statement. In your answer you should give reasoned arguments to support this statement, give reasoned arguments to support a different point of view, refer to religious arguments, and reach a justified conclusion.',
    levels: twelve(
      ['Jesus taught "Blessed are the peacemakers" and "turn the other cheek"', 'Jesus said "all who draw the sword will die by the sword" (Matthew 26:52)', 'Quakers are pacifists; conscientious objectors served in non-fighting roles', 'Modern weapons kill civilians, so no modern war can be proportional'],
      ['Just war theory (Augustine, Aquinas) allows war with a just cause, as a last resort', 'Self-defence: most Christians saw WW2 as just — fighting Nazi Germany', 'Islam is not pacifist: lesser jihad allows defensive war — "Fighting has been ordained for you" (2:216)', 'Not fighting could let a greater evil win, e.g. genocide'],
    ),
    examinerNote: twelveNote,
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0052', points: ['3.2.2.1d'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two religious beliefs about retaliation.',
    markScheme: four(
      'Jesus taught Christians not to retaliate',
      '"If anyone slaps you on the right cheek, turn to them the other cheek also" (Matthew 5:39), replacing "eye for eye"',
      'Islam allows fair retaliation but prefers forgiveness',
      '"Fair retribution saves life" (2:179), but forgiving is better and avoids more bloodshed',
    ),
    source: 'authored',
  },

  // ======= 3.2.2.2 Theme B: Religion and belief in 21st-century conflict =======
  {
    id: 'rs-q-0053', points: ['3.2.2.2d'], type: 'short', marks: 1, difficulty: 1, commandWord: 'Give',
    stem: 'Give one way that religious believers can work for peace.',
    markScheme: [
      { text: 'Prayer for peace', marks: 1, alternatives: ['pray', 'prayer', 'protest', 'peaceful protest', 'campaign', 'interfaith dialogue', 'reconciliation', 'charity', 'support peace organisations', 'mediation'] },
    ],
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0054', points: ['3.2.2.2c'], type: 'mcq', marks: 1, difficulty: 1, commandWord: 'Which',
    stem: 'Which one of the following is a weapon that spreads disease?',
    options: [
      { id: 'a', text: 'Nuclear', correct: false },
      { id: 'b', text: 'Chemical', correct: false, why: 'Chemical weapons poison, burn or paralyse.' },
      { id: 'c', text: 'Biological', correct: true },
      { id: 'd', text: 'Conventional', correct: false },
    ],
    source: 'authored',
  },
  {
    id: 'rs-q-0055', points: ['3.2.2.2e'], type: 'extended', marks: 5, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two reasons why religious people help victims of war. Refer to sacred writings or another source of religious belief and teaching in your answer.',
    markScheme: five(
      'Christians are taught to love their neighbour',
      'the Parable of the Good Samaritan shows helping anyone in need, whoever they are; e.g. Christian Aid helps refugees',
      'Muslims believe saving life is a great duty',
      '"Whoever saves a life, it is as if he saved the lives of all mankind" (5:32); e.g. Islamic Relief gives emergency aid regardless of belief',
      '"Love your neighbour as yourself" or Qur\'an 5:32',
    ),
    source: 'authored', sourceRef: SCHOOL,
  },
  {
    id: 'rs-q-0056', points: ['3.2.2.2b'], type: 'extended', marks: 4, difficulty: 3, commandWord: 'Explain',
    stem: 'Explain two contrasting religious beliefs about nuclear weapons.',
    markScheme: four(
      'many Christians believe nuclear weapons are always wrong',
      'they kill civilians on a huge scale, breaking "You shall not murder" and proportionality; Pope Francis said even possessing them is immoral',
      'some religious believers accept nuclear deterrence',
      'holding them prevents war because no one dares attack — but they must never be used',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0057', points: ['3.2.2.2a'], type: 'extended', marks: 12, difficulty: 3, commandWord: 'Evaluate',
    stem: '"Religion is the main cause of war today." Evaluate this statement. In your answer you should give reasoned arguments to support this statement, give reasoned arguments to support a different point of view, refer to religious arguments, and reach a justified conclusion.',
    levels: twelve(
      ['Extremist groups such as Islamic State claim religious reasons for violence', 'History shows religious wars, e.g. the Crusades', 'Religious differences can deepen conflicts between communities'],
      ['Most wars are about land, power, resources or self-defence', 'Religions teach peace — "Blessed are the peacemakers"; "Islam" shares a root with salam, peace', 'Extremists misuse religion; most believers condemn terrorism', 'Religious people are often peacemakers, e.g. Desmond Tutu, Imam Ashafa and Pastor Wuye'],
    ),
    examinerNote: twelveNote,
    source: 'authored',
  },

  // ============================ Gap fillers ==================================
  {
    id: 'rs-q-0058', points: ['3.1.2.1b'], type: 'extended', marks: 5, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two ways in which belief in Tawhid influences Muslims today. Refer to sacred writings or another source of Muslim belief and teaching in your answer.',
    markScheme: five(
      'Muslims worship only God and avoid shirk',
      'nothing may be treated as equal to God, so there are no pictures or statues of God or the Prophet in a mosque',
      'Muslims declare their faith in one God every day',
      'they recite the Shahadah — "There is no god but Allah" — in daily prayer and whisper it to newborn babies',
      'Surah 112: "He is God the One… No one is comparable to Him"',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0059', points: ['3.1.2.1c'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two ways in which believing that God is merciful influences Muslims today.',
    markScheme: four(
      'Muslims ask God for forgiveness',
      'they believe God forgives those who are truly sorry, so they repent in prayer, especially during Ramadan',
      'Muslims show mercy to others',
      'they follow God\'s example by forgiving people and helping those in need, e.g. through zakah',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0060', points: ['3.2.1.1b'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two similar religious beliefs about sex outside marriage (adultery).',
    markScheme: four(
      'Christians believe adultery is wrong',
      'it breaks the wedding vows made before God and the commandment "You shall not commit adultery"',
      'Muslims believe adultery is wrong',
      'it is zina, a serious sin — "Do not go anywhere near adultery: it is an outrage" (17:32)',
    ),
    source: 'authored',
  },
  {
    id: 'rs-q-0061', points: ['3.2.2.1b'], type: 'extended', marks: 4, difficulty: 2, commandWord: 'Explain',
    stem: 'Explain two contrasting Christian beliefs about violent protest.',
    markScheme: four(
      'most Christians believe protest must be peaceful',
      'Jesus taught "turn the other cheek"; Martin Luther King Jr achieved civil rights through non-violent protest',
      'a few Christians believe violence can sometimes be justified',
      '"righteous anger" against serious injustice — Jesus overturned the tables of the traders in the Temple',
    ),
    source: 'authored',
  },
]
