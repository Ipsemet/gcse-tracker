/**
 * OCR GCSE (9-1) Computer Science — J277
 *
 * Board confirmed from the school's published "Exam Boards and Subject Codes" PDF.
 * Unit and topic structure follows the published J277 specification. Statements
 * are faithful to the specification's assessable content; check them against the
 * official PDF and tick `confidence: 'confirmed'` once done.
 */
export default {
  id: 'cs',
  name: 'Computer Science',
  shortName: 'Comp Sci',
  board: 'OCR',
  specCode: 'J277',
  specTitle: 'GCSE (9-1) Computer Science',
  specUrl: 'https://www.ocr.org.uk/qualifications/gcse/computer-science-j277-from-2020/',
  examSeries: 'Summer 2028',
  confidence: 'provisional',
  confidenceNote:
    'Board and spec code confirmed from the school exam-boards PDF (8 Sept 2026). Unit/topic structure and statement wording follow the published J277 specification but have not been checked line-by-line against the official PDF.',
  colour: '#4f8cff',
  icon: '💻',
  priority: 2,
  papers: [
    {
      code: 'J277/01',
      name: 'Computer systems',
      durationMins: 90,
      marks: 80,
      weighting: 0.5,
      calculator: false,
      covers: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'],
      notes: 'Written paper. No calculator. Mix of short answer and extended response.',
    },
    {
      code: 'J277/02',
      name: 'Computational thinking, algorithms and programming',
      durationMins: 90,
      marks: 80,
      weighting: 0.5,
      calculator: false,
      covers: ['2.1', '2.2', '2.3', '2.4', '2.5'],
      notes:
        'Written paper. Section B is answered in OCR Exam Reference Language or a high-level language. Practical Programming Skills are taught but not separately assessed.',
    },
  ],
  examNotes: [
    'Two written papers, 1h30 each, 80 marks each, 50% of the qualification each.',
    'Paper 2 Section B requires written code — OCR Exam Reference Language (ERL) or a recognised high-level language. Pick one and stick to it.',
    'Command words matter: "State" wants one word, "Describe" wants what it is, "Explain" wants what it is plus why/effect.',
    'Practical Programming Skills are compulsory to teach but are not directly assessed — they underpin Paper 2.',
    'School teaching order, Year 10: T1 computational thinking + data representation, T2 systems architecture + memory and storage, T3 networks, T4 network security + systems software, T5 algorithms, T6 impacts. Programming runs through all six terms.',
    'School teaching order, Year 11: T1 binary/hex and computer systems recap, T2 systems security, T2-T5 the NEA programming project, T4-T5 impacts and exam preparation.',
  ],
  units: [
    {
      code: '1.1',
      title: 'Systems architecture',
      paper: 'J277/01',
      topics: [
        {
          code: '1.1.1',
          title: 'Architecture of the CPU',
          points: [
            {
              statement: 'The purpose of the CPU: the fetch–decode–execute cycle',
              detail: [
                'Fetch: the instruction at the address in the PC is copied to the MAR, fetched into the MDR, and the PC is incremented',
                'Decode: the control unit works out what the instruction means',
                'Execute: the instruction is carried out, using the ALU and accumulator where needed',
              ],
              difficulty: 2,
              keywords: ['fetch', 'decode', 'execute', 'cycle', 'instruction'],
            },
            {
              statement: 'Common CPU components and their function: ALU, control unit, cache, registers',
              detail: [
                'ALU — arithmetic and logic operations',
                'Control unit (CU) — decodes instructions and coordinates the other components',
                'Cache — very fast memory holding frequently used instructions and data',
              ],
              difficulty: 2,
              keywords: ['ALU', 'control unit', 'cache', 'register'],
            },
            {
              statement: 'Von Neumann architecture: MAR, MDR, program counter, accumulator',
              detail: [
                'MAR — holds the address of the memory location being read from or written to',
                'MDR — holds the data or instruction fetched from, or to be written to, memory',
                'Program counter (PC) — holds the address of the next instruction',
                'Accumulator — holds the result of ALU calculations',
              ],
              difficulty: 3,
              keywords: ['Von Neumann', 'MAR', 'MDR', 'program counter', 'accumulator'],
            },
          ],
        },
        {
          code: '1.1.2',
          title: 'CPU performance',
          points: [
            {
              statement: 'How common characteristics of CPUs affect their performance: clock speed, cache size, number of cores',
              detail: [
                'Clock speed — cycles per second, so instructions executed per second',
                'Cache size — more cache means fewer slow trips to RAM',
                'Cores — each core can fetch–decode–execute independently, but only helps if software is written to use them',
              ],
              difficulty: 2,
              keywords: ['clock speed', 'hertz', 'cache size', 'cores', 'multi-core'],
            },
          ],
        },
        {
          code: '1.1.3',
          title: 'Embedded systems',
          points: [
            {
              statement: 'The purpose and characteristics of embedded systems',
              detail: [
                'A computer built into a larger device to perform one dedicated task',
                'Typically low power, low cost, small, reliable, with software stored in ROM and rarely changed',
              ],
              difficulty: 1,
              keywords: ['embedded', 'dedicated', 'firmware', 'ROM'],
            },
            {
              statement: 'Examples of embedded systems',
              detail: ['Washing machine, microwave, engine management unit, traffic lights, MP3 player, dishwasher'],
              difficulty: 1,
              keywords: ['embedded', 'examples'],
            },
          ],
        },
      ],
    },
    {
      code: '1.2',
      title: 'Memory and storage',
      paper: 'J277/01',
      topics: [
        {
          code: '1.2.1',
          title: 'Primary storage (memory)',
          points: [
            {
              statement: 'The need for primary storage',
              detail: ['The CPU can only access data and instructions held in primary storage, so anything being used now must be there'],
              difficulty: 1,
              keywords: ['primary storage', 'main memory', 'volatile'],
            },
            {
              statement: 'The difference between RAM and ROM',
              detail: ['RAM is volatile and read/write; ROM is non-volatile and read-only'],
              difficulty: 1,
              keywords: ['RAM', 'ROM', 'volatile', 'non-volatile'],
            },
            {
              statement: 'The purpose of ROM in a computer system',
              detail: ['Holds the boot program / BIOS, which starts the computer and loads the operating system into RAM'],
              difficulty: 2,
              keywords: ['ROM', 'boot', 'BIOS', 'firmware'],
            },
            {
              statement: 'The purpose of RAM in a computer system',
              detail: ['Holds the operating system, applications and data currently in use so the CPU can access them quickly'],
              difficulty: 2,
              keywords: ['RAM', 'main memory'],
            },
            {
              statement: 'Virtual memory',
              detail: [
                'When RAM is full, part of secondary storage is used as though it were RAM',
                'Data not currently needed is moved out to the virtual memory and back in when required',
                'Much slower than RAM because secondary storage access is slower — heavy use causes disk thrashing',
              ],
              difficulty: 3,
              keywords: ['virtual memory', 'paging', 'swap', 'thrashing'],
            },
          ],
        },
        {
          code: '1.2.2',
          title: 'Secondary storage',
          points: [
            {
              statement: 'The need for secondary storage',
              detail: ['Non-volatile long-term storage for programs and data that must survive power-off'],
              difficulty: 1,
              keywords: ['secondary storage', 'non-volatile', 'persistent'],
            },
            {
              statement: 'Common types of storage: optical, magnetic, solid state',
              detail: [
                'Optical — pits and lands read by laser (CD, DVD, Blu-ray)',
                'Magnetic — magnetised platters and a moving read/write head (HDD, tape)',
                'Solid state — flash memory with no moving parts (SSD, USB stick, SD card)',
              ],
              difficulty: 2,
              keywords: ['optical', 'magnetic', 'solid state', 'flash'],
            },
            {
              statement: 'Suitable storage devices and storage media for a given application',
              difficulty: 3,
              keywords: ['storage device', 'storage media', 'suitability'],
            },
            {
              statement:
                'The advantages and disadvantages of different storage devices and media relating to capacity, speed, portability, durability, reliability and cost',
              difficulty: 3,
              keywords: ['capacity', 'speed', 'portability', 'durability', 'reliability', 'cost'],
            },
          ],
        },
        {
          code: '1.2.3',
          title: 'Units',
          points: [
            {
              statement: 'The units of data storage: bit, nibble, byte, kilobyte, megabyte, gigabyte, terabyte, petabyte',
              detail: ['1 nibble = 4 bits, 1 byte = 8 bits, then ×1000 (or ×1024) at each step upward'],
              difficulty: 1,
              keywords: ['bit', 'nibble', 'byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'],
            },
            {
              statement: 'How data needs to be converted into a binary format to be processed by a computer',
              difficulty: 1,
              keywords: ['binary', 'digital', 'representation'],
            },
            {
              statement: 'Data capacity and calculation of data capacity requirements',
              detail: ['Image: width × height × colour depth. Sound: sample rate × duration × bit depth × channels. Text: characters × bits per character'],
              difficulty: 3,
              keywords: ['file size', 'capacity', 'calculation'],
            },
          ],
        },
        {
          code: '1.2.4',
          title: 'Data storage',
          points: [
            {
              statement: 'Numbers: how to convert between denary, binary and hexadecimal',
              detail: ['8-bit place values 128 64 32 16 8 4 2 1; hex digits map to 4-bit nibbles'],
              difficulty: 2,
              keywords: ['denary', 'binary', 'hexadecimal', 'conversion', 'place value'],
            },
            {
              statement: 'Numbers: how to add two 8-bit binary integers, and explain overflow errors',
              detail: ['Overflow occurs when the result needs more bits than are available, so the carry out of the most significant bit is lost'],
              difficulty: 2,
              keywords: ['binary addition', 'carry', 'overflow'],
            },
            {
              statement: 'Numbers: how to perform a binary shift, and its effect',
              detail: ['Left shift by n multiplies by 2ⁿ; right shift by n divides by 2ⁿ. Bits shifted out are lost, and precision can be lost on a right shift'],
              difficulty: 2,
              keywords: ['binary shift', 'left shift', 'right shift', 'multiply', 'divide'],
            },
            {
              statement: 'Characters: the use of binary codes to represent characters, and the term "character set"',
              difficulty: 1,
              keywords: ['character', 'character set', 'binary code'],
            },
            {
              statement:
                'Characters: the relationship between the number of bits per character in a character set and the number of characters that can be represented (ASCII, Unicode)',
              detail: ['n bits represent 2ⁿ characters. ASCII uses 7 bits (128 characters), extended ASCII 8; Unicode uses more bits to cover all world alphabets and emoji'],
              difficulty: 2,
              keywords: ['ASCII', 'Unicode', 'bits per character'],
            },
            {
              statement: 'Images: how an image is represented as a series of pixels in binary, and the role of metadata',
              detail: ['Metadata stores the information needed to rebuild the image, such as width, height, colour depth and file type'],
              difficulty: 2,
              keywords: ['pixel', 'bitmap', 'metadata', 'resolution'],
            },
            {
              statement: 'Images: the effect of colour depth and resolution on image quality and file size',
              difficulty: 2,
              keywords: ['colour depth', 'resolution', 'file size', 'quality'],
            },
            {
              statement: 'Sound: how sound can be sampled and stored in digital form',
              detail: ['Analogue sound waves are measured (sampled) at regular intervals and each sample stored as a binary number'],
              difficulty: 2,
              keywords: ['sample', 'analogue', 'digital', 'sampling'],
            },
            {
              statement: 'Sound: the effect of sample rate, duration and bit depth on playback quality and file size',
              difficulty: 2,
              keywords: ['sample rate', 'bit depth', 'duration', 'file size'],
            },
          ],
        },
        {
          code: '1.2.5',
          title: 'Compression',
          points: [
            {
              statement: 'The need for compression',
              detail: ['Smaller files transmit faster, use less bandwidth and take less storage space'],
              difficulty: 1,
              keywords: ['compression', 'bandwidth', 'storage'],
            },
            {
              statement: 'Types of compression: lossy and lossless',
              detail: [
                'Lossy permanently removes data — smaller files, quality loss, used for images/audio/video',
                'Lossless records patterns so the original can be perfectly restored — used where every bit matters, such as text and executables',
              ],
              difficulty: 2,
              keywords: ['lossy', 'lossless', 'compression'],
            },
          ],
        },
      ],
    },
    {
      code: '1.3',
      title: 'Computer networks, connections and protocols',
      paper: 'J277/01',
      topics: [
        {
          code: '1.3.1',
          title: 'Networks and topologies',
          points: [
            {
              statement: 'Types of network: LAN and WAN',
              detail: ['LAN — small geographical area, infrastructure owned by the organisation. WAN — large area, infrastructure hired from a third party'],
              difficulty: 1,
              keywords: ['LAN', 'WAN', 'network'],
            },
            {
              statement: 'Factors that affect the performance of networks',
              detail: ['Bandwidth, number of users, transmission media, error rate, interference, latency'],
              difficulty: 2,
              keywords: ['bandwidth', 'latency', 'interference', 'performance'],
            },
            {
              statement: 'The different roles of computers in a client–server and a peer-to-peer network',
              difficulty: 2,
              keywords: ['client', 'server', 'peer-to-peer', 'client-server'],
            },
            {
              statement:
                'The hardware needed to connect stand-alone computers into a LAN: wireless access points, routers, switches, NIC, transmission media',
              difficulty: 2,
              keywords: ['router', 'switch', 'NIC', 'wireless access point', 'transmission media'],
            },
            {
              statement:
                'The Internet as a worldwide collection of computer networks: DNS, hosting, the cloud, web servers and clients',
              detail: ['DNS translates a domain name into an IP address so the browser can request the page from the right server'],
              difficulty: 2,
              keywords: ['Internet', 'DNS', 'hosting', 'cloud', 'web server'],
            },
            {
              statement: 'Star and mesh network topologies',
              detail: ['Star — every node connects to a central switch. Mesh — nodes connect to each other, with multiple routes between any two'],
              difficulty: 2,
              keywords: ['star topology', 'mesh topology'],
            },
          ],
        },
        {
          code: '1.3.2',
          title: 'Wired and wireless networks, protocols and layers',
          points: [
            {
              statement: 'Modes of connection: wired (Ethernet) and wireless (Wi-Fi, Bluetooth)',
              difficulty: 1,
              keywords: ['Ethernet', 'Wi-Fi', 'Bluetooth', 'wired', 'wireless'],
            },
            {
              statement: 'Encryption',
              detail: ['Data is scrambled using a key so that intercepted data cannot be understood without the key'],
              difficulty: 2,
              keywords: ['encryption', 'key', 'cipher text'],
            },
            {
              statement: 'IP addressing and MAC addressing',
              detail: ['IP address identifies a device on a network and can change; MAC address is assigned to the NIC and does not change'],
              difficulty: 2,
              keywords: ['IP address', 'MAC address', 'IPv4', 'IPv6'],
            },
            {
              statement: 'Standards',
              detail: ['Agreed rules that let hardware and software from different manufacturers work together'],
              difficulty: 1,
              keywords: ['standard', 'interoperability'],
            },
            {
              statement: 'Common protocols: TCP/IP, HTTP, HTTPS, FTP, POP, IMAP, SMTP',
              difficulty: 2,
              keywords: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'POP', 'IMAP', 'SMTP', 'protocol'],
            },
            {
              statement: 'The concept of layers',
              detail: ['Protocols are grouped into self-contained layers, so each layer can be developed or changed independently — simpler to build and to troubleshoot'],
              difficulty: 3,
              keywords: ['layer', 'layering', 'protocol stack'],
            },
          ],
        },
      ],
    },
    {
      code: '1.4',
      title: 'Network security',
      paper: 'J277/01',
      topics: [
        {
          code: '1.4.1',
          title: 'Threats to computer systems and networks',
          points: [
            {
              statement: 'Forms of attack: malware',
              detail: ['Virus, worm, trojan, ransomware, spyware, keylogger — know what each does and how it spreads'],
              difficulty: 2,
              keywords: ['malware', 'virus', 'worm', 'trojan', 'ransomware', 'spyware'],
            },
            {
              statement: 'Forms of attack: social engineering, including phishing and people as the "weak point"',
              difficulty: 2,
              keywords: ['social engineering', 'phishing', 'pretexting', 'shouldering', 'blagging'],
            },
            {
              statement: 'Forms of attack: brute-force attacks',
              difficulty: 1,
              keywords: ['brute force', 'password'],
            },
            {
              statement: 'Forms of attack: denial of service attacks',
              difficulty: 2,
              keywords: ['denial of service', 'DoS', 'DDoS', 'flood'],
            },
            {
              statement: 'Forms of attack: data interception and theft',
              difficulty: 2,
              keywords: ['interception', 'packet sniffing', 'man in the middle'],
            },
            {
              statement: 'Forms of attack: SQL injection',
              difficulty: 3,
              keywords: ['SQL injection', 'database', 'input'],
            },
          ],
        },
        {
          code: '1.4.2',
          title: 'Identifying and preventing vulnerabilities',
          points: [
            {
              statement: 'Common prevention methods: penetration testing',
              difficulty: 2,
              keywords: ['penetration testing', 'pen test', 'white box', 'black box'],
            },
            {
              statement: 'Common prevention methods: anti-malware software and firewalls',
              difficulty: 2,
              keywords: ['anti-malware', 'antivirus', 'firewall'],
            },
            {
              statement: 'Common prevention methods: user access levels and passwords',
              difficulty: 1,
              keywords: ['user access level', 'permissions', 'password', 'authentication'],
            },
            {
              statement: 'Common prevention methods: encryption and physical security',
              difficulty: 2,
              keywords: ['encryption', 'physical security', 'locks', 'CCTV'],
            },
          ],
        },
      ],
    },
    {
      code: '1.5',
      title: 'Systems software',
      paper: 'J277/01',
      topics: [
        {
          code: '1.5.1',
          title: 'Operating systems',
          points: [
            {
              statement: 'The purpose and functionality of operating systems: user interface',
              difficulty: 1,
              keywords: ['operating system', 'user interface', 'GUI', 'CLI'],
            },
            {
              statement: 'The purpose and functionality of operating systems: memory management and multitasking',
              difficulty: 3,
              keywords: ['memory management', 'multitasking', 'scheduling'],
            },
            {
              statement: 'The purpose and functionality of operating systems: peripheral management and drivers',
              difficulty: 2,
              keywords: ['peripheral', 'device driver'],
            },
            {
              statement: 'The purpose and functionality of operating systems: user management',
              difficulty: 1,
              keywords: ['user management', 'accounts', 'access rights'],
            },
            {
              statement: 'The purpose and functionality of operating systems: file management',
              difficulty: 1,
              keywords: ['file management', 'directory', 'file system'],
            },
          ],
        },
        {
          code: '1.5.2',
          title: 'Utility software',
          points: [
            {
              statement: 'The purpose and functionality of utility software',
              difficulty: 1,
              keywords: ['utility software', 'maintenance'],
            },
            {
              statement: 'Utility system software: encryption software, defragmentation, data compression',
              detail: ['Defragmentation moves the parts of split files back together so the read/write head moves less and access is faster'],
              difficulty: 2,
              keywords: ['encryption software', 'defragmentation', 'compression'],
            },
          ],
        },
      ],
    },
    {
      code: '1.6',
      title: 'Ethical, legal, cultural and environmental impacts of digital technology',
      paper: 'J277/01',
      topics: [
        {
          code: '1.6.1',
          title: 'Ethical, legal, cultural and environmental impact',
          points: [
            {
              statement: 'Impacts of digital technology on wider society: ethical, legal, cultural, environmental and privacy issues',
              detail: ['Be ready to argue both sides and reach a judgement — this is where the 8-mark extended response usually sits'],
              difficulty: 3,
              keywords: ['ethical', 'legal', 'cultural', 'environmental', 'privacy', 'stakeholder'],
            },
            {
              statement: 'Legislation: The Data Protection Act 2018',
              difficulty: 2,
              keywords: ['Data Protection Act', 'DPA 2018', 'GDPR', 'personal data'],
            },
            {
              statement: 'Legislation: The Computer Misuse Act 1990',
              detail: ['Three offences: unauthorised access; unauthorised access with intent to commit a further offence; unauthorised modification of material'],
              difficulty: 2,
              keywords: ['Computer Misuse Act', 'unauthorised access', 'hacking'],
            },
            {
              statement: 'Legislation: The Copyright Designs and Patents Act 1988',
              difficulty: 2,
              keywords: ['Copyright Designs and Patents Act', 'copyright', 'intellectual property'],
            },
            {
              statement: 'Software licences: open source and proprietary',
              difficulty: 2,
              keywords: ['open source', 'proprietary', 'licence', 'source code'],
            },
          ],
        },
      ],
    },
    {
      code: '2.1',
      title: 'Algorithms',
      paper: 'J277/02',
      topics: [
        {
          code: '2.1.1',
          title: 'Computational thinking',
          points: [
            {
              statement: 'Principles of computational thinking: abstraction',
              detail: ['Removing unnecessary detail so you can focus on what matters to the problem'],
              difficulty: 2,
              keywords: ['abstraction', 'detail'],
            },
            {
              statement: 'Principles of computational thinking: decomposition',
              detail: ['Breaking a problem into smaller sub-problems that can be solved one at a time'],
              difficulty: 2,
              keywords: ['decomposition', 'sub-problem'],
            },
            {
              statement: 'Principles of computational thinking: algorithmic thinking',
              detail: ['Working out the step-by-step sequence of instructions that solves the problem'],
              difficulty: 2,
              keywords: ['algorithmic thinking', 'algorithm', 'steps'],
            },
          ],
        },
        {
          code: '2.1.2',
          title: 'Designing, creating and refining algorithms',
          points: [
            {
              statement: 'Identify the inputs, processes and outputs for a problem',
              difficulty: 1,
              keywords: ['input', 'process', 'output', 'IPO'],
            },
            {
              statement: 'Structure diagrams',
              difficulty: 2,
              keywords: ['structure diagram', 'decomposition'],
            },
            {
              statement:
                'Create, interpret, correct, complete and refine algorithms using pseudocode, flowcharts and a high-level programming language',
              detail: ['Flowchart symbols: terminal (rounded), process (rectangle), decision (diamond), input/output (parallelogram), sub-program'],
              difficulty: 3,
              keywords: ['pseudocode', 'flowchart', 'algorithm', 'refine'],
            },
            {
              statement: 'Identify common errors in algorithms',
              difficulty: 2,
              keywords: ['error', 'debugging'],
            },
            {
              statement: 'Trace tables',
              detail: ['One column per variable, one row per iteration — write down every change in order'],
              difficulty: 2,
              keywords: ['trace table', 'dry run', 'tracing'],
            },
          ],
        },
        {
          code: '2.1.3',
          title: 'Searching and sorting algorithms',
          points: [
            {
              statement: 'Standard searching algorithms: binary search',
              detail: ['Requires a sorted list. Check the middle item, discard the half that cannot contain the target, repeat'],
              difficulty: 3,
              keywords: ['binary search', 'sorted', 'midpoint'],
            },
            {
              statement: 'Standard searching algorithms: linear search',
              detail: ['Check each item in turn from the start. Works on unsorted data but is slower on large lists'],
              difficulty: 1,
              keywords: ['linear search', 'sequential search'],
            },
            {
              statement: 'Standard sorting algorithms: bubble sort',
              detail: ['Compare adjacent pairs and swap if out of order; repeat passes until a pass makes no swaps'],
              difficulty: 2,
              keywords: ['bubble sort', 'pass', 'swap'],
            },
            {
              statement: 'Standard sorting algorithms: merge sort',
              detail: ['Split the list in half repeatedly until each list holds one item, then merge pairs back together in order'],
              difficulty: 3,
              keywords: ['merge sort', 'divide and conquer', 'merge'],
            },
            {
              statement: 'Standard sorting algorithms: insertion sort',
              detail: ['Take each item in turn and insert it into its correct place among the items already sorted'],
              difficulty: 2,
              keywords: ['insertion sort', 'insert'],
            },
          ],
        },
      ],
    },
    {
      code: '2.2',
      title: 'Programming fundamentals',
      paper: 'J277/02',
      topics: [
        {
          code: '2.2.1',
          title: 'Programming fundamentals',
          points: [
            {
              statement: 'The use of variables, constants, operators, inputs, outputs and assignments',
              difficulty: 1,
              keywords: ['variable', 'constant', 'operator', 'assignment', 'input', 'output'],
            },
            {
              statement: 'The use of the three basic programming constructs: sequence',
              difficulty: 1,
              keywords: ['sequence'],
            },
            {
              statement: 'The use of the three basic programming constructs: selection',
              detail: ['if / else if / else, and switch-case'],
              difficulty: 2,
              keywords: ['selection', 'if', 'else', 'switch'],
            },
            {
              statement: 'The use of the three basic programming constructs: iteration, both count-controlled and condition-controlled',
              detail: ['Count-controlled: for. Condition-controlled: while, do-until'],
              difficulty: 2,
              keywords: ['iteration', 'for', 'while', 'do until', 'loop'],
            },
          ],
        },
        {
          code: '2.2.2',
          title: 'Data types',
          points: [
            {
              statement: 'The use of data types: integer, real, Boolean, character and string',
              difficulty: 1,
              keywords: ['integer', 'real', 'float', 'Boolean', 'character', 'string'],
            },
            {
              statement: 'The use of casting to convert between data types',
              detail: ['str(), int(), float(), bool() — needed because input() always returns a string'],
              difficulty: 2,
              keywords: ['casting', 'type conversion', 'int()', 'str()', 'float()'],
            },
          ],
        },
        {
          code: '2.2.3',
          title: 'Additional programming techniques',
          points: [
            {
              statement: 'The use of basic string manipulation',
              detail: ['Length, substring, concatenation, position, upper/lower case, ASCII conversion'],
              difficulty: 2,
              keywords: ['string manipulation', 'substring', 'concatenation', 'length'],
            },
            {
              statement: 'The use of basic file handling operations: open, read, write, close',
              difficulty: 2,
              keywords: ['file handling', 'open', 'read', 'write', 'close'],
            },
            {
              statement: 'The use of records to store data',
              difficulty: 2,
              keywords: ['record', 'field', 'structure'],
            },
            {
              statement: 'The use of SQL to search for data',
              detail: ['SELECT fields FROM table WHERE condition — the only SQL required by J277'],
              difficulty: 2,
              keywords: ['SQL', 'SELECT', 'FROM', 'WHERE', 'database'],
            },
            {
              statement: 'The use of arrays (or equivalent) when solving problems, including one- and two-dimensional arrays',
              difficulty: 3,
              keywords: ['array', '1D array', '2D array', 'index', 'list'],
            },
            {
              statement: 'How to use sub programs (functions and procedures) to produce structured code',
              detail: ['A function returns a value; a procedure does not. Parameters pass data in'],
              difficulty: 3,
              keywords: ['sub program', 'function', 'procedure', 'parameter', 'return'],
            },
            {
              statement: 'Random number generation',
              difficulty: 1,
              keywords: ['random', 'random number'],
            },
          ],
        },
      ],
    },
    {
      code: '2.3',
      title: 'Producing robust programs',
      paper: 'J277/02',
      topics: [
        {
          code: '2.3.1',
          title: 'Defensive design',
          points: [
            {
              statement: 'Defensive design considerations: anticipating misuse',
              difficulty: 2,
              keywords: ['defensive design', 'misuse', 'anticipate'],
            },
            {
              statement: 'Defensive design considerations: authentication',
              difficulty: 2,
              keywords: ['authentication', 'password', 'login'],
            },
            {
              statement: 'Input validation',
              detail: ['Range check, type check, presence check, length check, format check — validation checks it is sensible, not that it is true'],
              difficulty: 2,
              keywords: ['validation', 'range check', 'type check', 'presence check', 'length check', 'format check'],
            },
            {
              statement: 'Maintainability: use of sub programs, naming conventions, indentation and commenting',
              difficulty: 2,
              keywords: ['maintainability', 'naming convention', 'indentation', 'comment'],
            },
          ],
        },
        {
          code: '2.3.2',
          title: 'Testing',
          points: [
            {
              statement: 'The purpose of testing',
              difficulty: 1,
              keywords: ['testing', 'purpose'],
            },
            {
              statement: 'Types of testing: iterative and final/terminal',
              difficulty: 2,
              keywords: ['iterative testing', 'final testing', 'terminal testing'],
            },
            {
              statement: 'Identify syntax and logic errors',
              detail: ['Syntax errors break the rules of the language and stop it running; logic errors run but give the wrong result'],
              difficulty: 2,
              keywords: ['syntax error', 'logic error'],
            },
            {
              statement: 'Selecting and using suitable test data: normal, boundary, invalid and erroneous',
              difficulty: 2,
              keywords: ['test data', 'normal', 'boundary', 'invalid', 'erroneous'],
            },
            {
              statement: 'Refining algorithms following testing',
              difficulty: 3,
              keywords: ['refine', 'improve', 'efficiency'],
            },
          ],
        },
      ],
    },
    {
      code: '2.4',
      title: 'Boolean logic',
      paper: 'J277/02',
      topics: [
        {
          code: '2.4.1',
          title: 'Boolean logic',
          points: [
            {
              statement: 'Simple logic diagrams using the operators AND, OR and NOT',
              difficulty: 2,
              keywords: ['AND', 'OR', 'NOT', 'logic gate', 'logic diagram'],
            },
            {
              statement: 'Truth tables',
              detail: ['With n inputs a truth table has 2ⁿ rows — list the input combinations in binary counting order so none are missed'],
              difficulty: 2,
              keywords: ['truth table', 'inputs', 'outputs'],
            },
            {
              statement: 'Combining Boolean operators using AND, OR and NOT',
              detail: ['Notation: AND is ∧ or ., OR is ∨ or +, NOT is ¬ or an overbar'],
              difficulty: 3,
              keywords: ['Boolean expression', 'combining', 'notation'],
            },
            {
              statement: 'Applying logical operators in truth tables to solve problems',
              difficulty: 3,
              keywords: ['truth table', 'problem solving', 'Boolean'],
            },
          ],
        },
      ],
    },
    {
      code: '2.5',
      title: 'Programming languages and Integrated Development Environments',
      paper: 'J277/02',
      topics: [
        {
          code: '2.5.1',
          title: 'Languages',
          points: [
            {
              statement: 'Characteristics and purpose of different levels of programming language: high-level and low-level',
              detail: ['High-level is closer to English, machine independent, easier to write and debug; low-level gives direct hardware control and efficient use of memory'],
              difficulty: 2,
              keywords: ['high-level', 'low-level', 'assembly', 'machine code'],
            },
            {
              statement: 'The purpose of translators',
              difficulty: 1,
              keywords: ['translator', 'source code', 'machine code'],
            },
            {
              statement: 'The characteristics of a compiler and an interpreter',
              detail: [
                'Compiler translates the whole program at once and produces an executable; reports all errors at the end; runs fast',
                'Interpreter translates and runs line by line; stops at the first error; easier to debug but slower to run',
              ],
              difficulty: 2,
              keywords: ['compiler', 'interpreter', 'executable', 'translate'],
            },
          ],
        },
        {
          code: '2.5.2',
          title: 'The Integrated Development Environment (IDE)',
          points: [
            {
              statement: 'Common tools and facilities available in an IDE: editors, error diagnostics, run-time environment, translators',
              detail: ['Editor features: syntax highlighting, auto-indent, auto-complete. Diagnostics: breakpoints, stepping, variable watch'],
              difficulty: 2,
              keywords: ['IDE', 'editor', 'error diagnostics', 'run-time environment', 'breakpoint'],
            },
          ],
        },
      ],
    },
  ],
}
