/*
 * CYBERPATH — roadmap content model
 * ---------------------------------
 * Pure data, no logic. app.js consumes ROADMAP to assemble a personalised plan.
 *
 * Design notes (the "why"):
 *  - Cert prices move constantly and vary by region, so we grade cost by TIER
 *    (Free / $ / $$ / $$$) instead of quoting figures we cannot keep accurate.
 *  - Every phase carries free resources AND paid resources; the engine filters
 *    by the learner's budget answer rather than us maintaining two data sets.
 *  - `weeks` is a baseline for a beginner studying ~10h/week. The engine scales
 *    it by the learner's real weekly hours and prior experience.
 */

/* Cost tiers used on certification badges. */
const TIER = {
  FREE: { key: 'free', label: 'Free', hint: 'No exam fee' },
  LOW:  { key: 'low',  label: '$',    hint: 'Under ~$300' },
  MID:  { key: 'mid',  label: '$$',   hint: '~$300–$800' },
  HIGH: { key: 'high', label: '$$$',  hint: '$800 and up' },
};

/*
 * Shared foundation phases. The engine drops any phase the learner already
 * covers (via their background answer or experience level). `skill` maps to a
 * background-skills checkbox; `skipIfExperienced` drops it for security pros.
 */
const FOUNDATIONS = [
  {
    id: 'net',
    tier: 'foundation',
    skill: 'networking',
    name: 'Networking Fundamentals',
    focus: 'How data actually moves: TCP/IP, DNS, HTTP, subnetting, the OSI model and common ports.',
    weeks: 4,
    skills: ['OSI & TCP/IP model', 'Subnetting & CIDR', 'DNS / DHCP / HTTP', 'Wireshark packet reading'],
    free: [
      { name: 'Professor Messer — Network+ N10-009', url: 'https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/', note: 'Full free video course' },
      { name: 'Practical Networking (YouTube playlists)', url: 'https://www.youtube.com/@PracticalNetworking/playlists', note: 'The OSI model & TCP/IP, clearly explained' },
      { name: 'Cisco Networking Academy', url: 'https://www.netacad.com/courses/networking', note: 'Free networking basics' },
    ],
    paid: [
      { name: 'CompTIA Network+ course', url: 'https://www.comptia.org/certifications/network-plus', note: 'Optional structured path' },
    ],
    certs: [{ name: 'CompTIA Network+', tier: TIER.MID, level: 'entry', optional: true, url: 'https://www.comptia.org/certifications/network-plus' }],
  },
  {
    id: 'linux',
    tier: 'foundation',
    skill: 'linux',
    name: 'Linux & Command Line',
    focus: 'Live in the terminal: the filesystem, permissions, users, processes, package managers and bash.',
    weeks: 3,
    skills: ['Shell navigation & pipes', 'Permissions & users', 'Processes & services', 'Basic bash scripting'],
    free: [
      { name: 'Linux Journey', url: 'https://linuxjourney.com/', note: 'Guided lessons' },
      { name: 'OverTheWire: Bandit', url: 'https://overthewire.org/wargames/bandit/', note: 'Learn by hacking a box' },
      { name: 'NetworkChuck — Linux for Hackers (YouTube)', url: 'https://www.youtube.com/@NetworkChuck/playlists', note: 'Command-line skills, hacker-flavoured' },
    ],
    paid: [
      { name: 'Linux Foundation — Intro to Linux', url: 'https://training.linuxfoundation.org/', note: 'Optional certificate' },
    ],
    certs: [{ name: 'Linux Essentials (LPI)', tier: TIER.LOW, level: 'entry', optional: true, url: 'https://www.lpi.org/our-certifications/linux-essentials-overview/' }],
  },
  {
    id: 'fund',
    tier: 'foundation',
    skill: null,
    skipIfExperienced: true,
    name: 'Security Fundamentals',
    focus: 'The vocabulary and mindset: CIA triad, threats vs. vulnerabilities vs. risk, cryptography basics and access control.',
    weeks: 4,
    skills: ['CIA triad & risk', 'Cryptography basics', 'Authentication & access control', 'Common attack types'],
    free: [
      { name: 'ISC2 Certified in Cybersecurity (CC)', url: 'https://www.isc2.org/certifications/cc', note: 'Self-paced training; exam often free via ISC2’s program — verify current availability' },
      { name: 'Professor Messer — Security+ SY0-701', url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/', note: 'Full free video course' },
      { name: 'Professor Messer (YouTube playlists)', url: 'https://www.youtube.com/@professormesser/playlists', note: 'Security+ & Network+ as free playlists' },
    ],
    paid: [
      { name: 'CompTIA Security+ course + exam', url: 'https://www.comptia.org/certifications/security-plus', note: 'The industry entry standard' },
    ],
    certs: [
      { name: 'ISC2 Certified in Cybersecurity (CC)', tier: TIER.FREE, level: 'entry', url: 'https://www.isc2.org/certifications/cc' },
      { name: 'CompTIA Security+', tier: TIER.MID, level: 'entry', url: 'https://www.comptia.org/certifications/security-plus' },
    ],
  },
  {
    id: 'prog',
    tier: 'foundation',
    skill: 'programming',
    name: 'Scripting with Python',
    focus: 'Automate the boring stuff and read other people’s code: variables, loops, functions, HTTP requests and simple tooling.',
    weeks: 4,
    skills: ['Python syntax & logic', 'Working with files & APIs', 'HTTP requests', 'Writing small tools'],
    free: [
      { name: 'Automate the Boring Stuff with Python', url: 'https://automatetheboringstuff.com/', note: 'Free online book' },
      { name: 'freeCodeCamp — Python', url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/', note: 'Free interactive course' },
      { name: 'freeCodeCamp — Python full course (YouTube)', url: 'https://www.youtube.com/@freecodecamp/playlists', note: 'Beginner-friendly video course' },
    ],
    paid: [
      { name: 'TCM Security — Python for Ethical Hackers', url: 'https://academy.tcm-sec.com/', note: 'Security-focused Python' },
    ],
    certs: [],
  },
];

/*
 * Career tracks. Each phase's tier controls whether the "cert appetite" answer
 * keeps it: hobby learners stop after `specialization`; entry & advanced keep
 * the certification and career phases. Advanced learners additionally see the
 * `advancedCerts`.
 */
const TRACKS = {
  offensive: {
    name: 'Offensive Security / Penetration Testing',
    short: 'Offensive',
    tagline: 'Break in ethically. Find the holes before attackers do.',
    roles: ['Penetration Tester', 'Red Teamer', 'Bug Bounty Hunter', 'Security Consultant'],
    phases: [
      {
        id: 'off-core', tier: 'core', name: 'Offensive Core: Recon, Web & Network Attacks', weeks: 8,
        focus: 'The attacker workflow end to end: enumeration, web exploitation (OWASP Top 10), and network service attacks against guided targets.',
        skills: ['Reconnaissance & enumeration', 'Web attacks (SQLi, XSS, IDOR)', 'Network service exploitation', 'Metasploit & manual exploitation'],
        free: [
          { name: 'TryHackMe — Jr Penetration Tester path', url: 'https://tryhackme.com/path/outline/jrpenetrationtester', note: 'Guided offensive path (freemium)' },
          { name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security/all-topics', note: 'Best free web-hacking labs' },
          { name: 'IppSec — HTB video walkthroughs (YouTube)', url: 'https://www.youtube.com/@ippsec/videos', note: 'Watch real machines get owned, step by step' },
        ],
        paid: [
          { name: 'Hack The Box Academy — Penetration Tester path (CPTS)', url: 'https://academy.hackthebox.com/path/preview/penetration-tester', note: 'Structured pentest curriculum' },
        ],
        certs: [],
      },
      {
        id: 'off-spec', tier: 'specialization', name: 'Exploitation & Active Directory', weeks: 8,
        branches: ['Wireless & RF attacks','Cloud & container pentest','Mobile app testing'],
        focus: 'Privilege escalation on Linux and Windows, pivoting, and attacking Active Directory — the skills real assessments live on.',
        skills: ['Linux & Windows privilege escalation', 'Active Directory attacks', 'Pivoting & tunnelling', 'Password attacks'],
        free: [
          { name: 'TryHackMe — Offensive Pentesting path', url: 'https://tryhackme.com/path/outline/pentesting', note: 'AD & privesc rooms' },
          { name: 'Hack The Box — retired machines', url: 'https://app.hackthebox.com/machines?status=retired', note: 'Practice with community walkthroughs' },
          { name: 'John Hammond — hacking & CTF (YouTube)', url: 'https://www.youtube.com/@_JohnHammond/playlists', note: 'Privesc, tooling & malware breakdowns' },
        ],
        paid: [
          { name: 'TCM Security — Practical Ethical Hacking', url: 'https://academy.tcm-sec.com/', note: 'AD-focused & affordable' },
        ],
        certs: [],
      },
      {
        id: 'off-cert', tier: 'certification', name: 'Certification Sprint', weeks: 10,
        focus: 'Target a hands-on, exam-lab certification that hiring managers recognise. Pick one and drill its exam format.',
        skills: ['24h exam-lab stamina', 'Professional report writing', 'Time-boxed methodology', 'Note-taking discipline'],
        free: [
          { name: 'VulnHub — offline vulnerable VMs', url: 'https://www.vulnhub.com/', note: 'Free exam-style practice' },
          { name: 'HTB — Starting Point', url: 'https://app.hackthebox.com/starting-point', note: 'Guided intro machines' },
          { name: 'The Cyber Mentor / TCM (YouTube)', url: 'https://www.youtube.com/@TCMSecurityAcademy/playlists', note: 'PNPT/OSCP-aligned walkthroughs' },
        ],
        paid: [
          { name: 'OffSec PEN-200 (OSCP)', url: 'https://www.offsec.com/courses/pen-200/', note: 'The classic industry cert' },
          { name: 'TCM Security PNPT', url: 'https://certifications.tcm-sec.com/pnpt/', note: 'Affordable, report + debrief' },
        ],
        certs: [
          { name: 'eLearnSecurity eJPT (INE)', tier: TIER.LOW, level: 'entry', url: 'https://security.ine.com/certifications/ejpt-certification/' },
          { name: 'HTB CPTS', tier: TIER.MID, level: 'core', url: 'https://www.hackthebox.com/hacker/certifications' },
          { name: 'TCM PNPT', tier: TIER.MID, level: 'core', url: 'https://certifications.tcm-sec.com/pnpt/' },
          { name: 'OffSec OSCP', tier: TIER.HIGH, level: 'advanced', url: 'https://www.offsec.com/courses/pen-200/' },
        ],
      },
      {
        id: 'off-career', tier: 'career', name: 'Portfolio, Reporting & Job Hunt', weeks: 4,
        focus: 'Turn skills into offers: a public write-up portfolio, a polished report sample, CTF ranking and a targeted résumé.',
        skills: ['Public write-ups / blog', 'Sample pentest report', 'CTF profile (HTB/THM)', 'Résumé & interview prep'],
        free: [
          { name: 'Hack The Box / TryHackMe profiles', url: 'https://app.hackthebox.com/', note: 'Rank = proof of skill' },
          { name: 'GitHub Pages for write-ups', url: 'https://pages.github.com/', note: 'Free portfolio hosting' },
          { name: 'InsiderPhD — breaking into the field (YouTube)', url: 'https://www.youtube.com/@InsiderPhD/playlists', note: 'Portfolio, reporting & bug bounty' },
        ],
        paid: [],
        certs: [],
      },
    ],
    advancedCerts: [
      { name: 'OffSec OSEP (Evasion)', tier: TIER.HIGH, level: 'advanced', url: 'https://www.offsec.com/courses/pen-300/' },
      { name: 'OffSec OSWE (Web Expert)', tier: TIER.HIGH, level: 'advanced', url: 'https://www.offsec.com/courses/web-300/' },
      { name: 'GIAC GXPN', tier: TIER.HIGH, level: 'advanced', url: 'https://www.giac.org/certifications/exploit-researcher-advanced-penetration-tester-gxpn/' },
    ],
  },

  defensive: {
    name: 'Defensive Security / Blue Team',
    short: 'Blue Team',
    tagline: 'Detect, respond, and hunt. Be the reason the attack fails.',
    roles: ['SOC Analyst', 'Incident Responder', 'Threat Hunter', 'Detection Engineer'],
    phases: [
      {
        id: 'def-core', tier: 'core', name: 'Blue Team Core: Logs, SIEM & Detection', weeks: 8,
        focus: 'Read the signals: Windows/Linux logs, network telemetry, and using a SIEM to spot malicious activity.',
        skills: ['Windows & Linux logging', 'SIEM queries (Splunk/ELK)', 'Network traffic analysis', 'MITRE ATT&CK mapping'],
        free: [
          { name: 'LetsDefend — SOC Analyst path', url: 'https://app.letsdefend.io/', note: 'Hands-on SOC (freemium)' },
          { name: 'Splunk — free courses', url: 'https://www.splunk.com/en_us/training/free-courses/overview.html', note: 'Fundamentals & search, free' },
          { name: 'MyDFIR — SOC analyst series (YouTube)', url: 'https://www.youtube.com/@MyDFIR/playlists', note: 'SOC skills & home-lab builds' },
        ],
        paid: [
          { name: 'TryHackMe — SOC Level 1 path', url: 'https://tryhackme.com/path/outline/soclevel1', note: 'Structured blue path' },
        ],
        certs: [],
      },
      {
        id: 'def-spec', tier: 'specialization', name: 'Incident Response & Threat Hunting', weeks: 8,
        branches: ['Detection engineering','Malware analysis','Cyber threat intel (CTI)'],
        focus: 'Work an incident from alert to containment, hunt proactively, and understand malware behaviour and phishing.',
        skills: ['IR lifecycle (NIST)', 'Threat hunting hypotheses', 'Phishing & malware triage', 'Endpoint (EDR) analysis'],
        free: [
          { name: 'Blue Team Labs Online', url: 'https://blueteamlabs.online/', note: 'IR & forensics challenges' },
          { name: 'CyberDefenders — Blue Team CTFs', url: 'https://cyberdefenders.org/blueteam-ctf-challenges/', note: 'Free defensive challenges' },
          { name: 'Black Hills InfoSec (YouTube)', url: 'https://www.youtube.com/@BlackHillsInformationSecurity/playlists', note: 'Threat hunting & IR webcasts' },
        ],
        paid: [
          { name: 'TryHackMe — SOC Level 2 path', url: 'https://tryhackme.com/path/outline/soclevel2', note: 'Advanced defensive rooms' },
        ],
        certs: [],
      },
      {
        id: 'def-cert', tier: 'certification', name: 'Certification', weeks: 8,
        focus: 'Validate blue-team skills with a recognised certification. Security+ opens doors; CySA+ / BTL1 prove hands-on depth.',
        skills: ['Exam methodology', 'Analyst reporting', 'Tool fluency under time pressure'],
        free: [
          { name: 'ISC2 CC (foundation)', url: 'https://www.isc2.org/certifications/cc', note: 'Often free — verify availability' },
        ],
        paid: [
          { name: 'CompTIA CySA+', url: 'https://www.comptia.org/certifications/cybersecurity-analyst', note: 'Analyst-focused' },
          { name: 'Security Blue Team — BTL1', url: 'https://www.securityblue.team/', note: 'Practical blue exam' },
        ],
        certs: [
          { name: 'CompTIA Security+', tier: TIER.MID, level: 'entry', url: 'https://www.comptia.org/certifications/security-plus' },
          { name: 'Microsoft SC-200', tier: TIER.LOW, level: 'entry', url: 'https://learn.microsoft.com/credentials/certifications/security-operations-analyst/' },
          { name: 'CompTIA CySA+', tier: TIER.MID, level: 'core', url: 'https://www.comptia.org/certifications/cybersecurity-analyst' },
          { name: 'Security Blue Team BTL1', tier: TIER.MID, level: 'core', url: 'https://www.securityblue.team/' },
        ],
      },
      {
        id: 'def-career', tier: 'career', name: 'Home SOC Lab & Job Hunt', weeks: 4,
        focus: 'Build and document a home detection lab, write up an incident investigation, and target SOC analyst roles.',
        skills: ['Home lab (Security Onion / ELK)', 'Written incident report', 'Detection rule samples', 'Résumé & interview prep'],
        free: [
          { name: 'Security Onion', url: 'https://securityonionsolutions.com/', note: 'Free SIEM/IDS lab' },
          { name: 'GitHub Pages for write-ups', url: 'https://pages.github.com/', note: 'Free portfolio hosting' },
        ],
        paid: [],
        certs: [],
      },
    ],
    advancedCerts: [
      { name: 'GIAC GCIH', tier: TIER.HIGH, level: 'advanced', url: 'https://www.giac.org/certifications/certified-incident-handler-gcih/' },
      { name: 'GIAC GCIA', tier: TIER.HIGH, level: 'advanced', url: 'https://www.giac.org/certifications/certified-intrusion-analyst-gcia/' },
    ],
  },

  grc: {
    name: 'Governance, Risk & Compliance (GRC)',
    short: 'GRC',
    tagline: 'Security as a business function: policy, risk, audit and frameworks.',
    roles: ['Security Analyst (GRC)', 'IT Auditor', 'Risk Analyst', 'Compliance Manager'],
    phases: [
      {
        id: 'grc-core', tier: 'core', name: 'Governance, Risk & Frameworks', weeks: 6,
        focus: 'The language of security management: risk assessment, security controls, and the major frameworks (NIST, ISO 27001).',
        skills: ['Risk assessment & treatment', 'NIST CSF & 800-53', 'ISO/IEC 27001 basics', 'Security policy writing'],
        free: [
          { name: 'NIST Cybersecurity Framework 2.0', url: 'https://www.nist.gov/cyberframework', note: 'Primary source, free' },
          { name: 'ISC2 CC — governance domains', url: 'https://www.isc2.org/certifications/cc', note: 'Free foundational training' },
          { name: 'Simply Cyber — GRC (YouTube)', url: 'https://www.youtube.com/@SimplyCyber/playlists', note: 'Gerald Auger’s GRC-focused videos' },
        ],
        paid: [
          { name: 'TryHackMe — Security Engineer path', url: 'https://tryhackme.com/path/outline/security-engineer', note: 'Applied context' },
        ],
        certs: [],
      },
      {
        id: 'grc-spec', tier: 'specialization', name: 'Audit, Compliance & Risk Management', weeks: 8,
        branches: ['Privacy & data protection (GDPR)','Third-party / vendor risk','BC/DR & resilience'],
        focus: 'Run an audit, map controls to regulations (GDPR, PCI-DSS, HIPAA, SOC 2), and manage a risk register.',
        skills: ['Control mapping & audit', 'Regulations (GDPR/PCI/HIPAA)', 'Risk register management', 'Evidence & reporting'],
        free: [
          { name: 'OpenGRC / open frameworks', url: 'https://www.cisecurity.org/controls', note: 'CIS Controls — free' },
          { name: 'ISACA free resources', url: 'https://www.isaca.org/', note: 'Glossaries & guidance' },
        ],
        paid: [
          { name: 'ISO 27001 Foundation course', url: 'https://www.iso.org/isoiec-27001-information-security.html', note: 'Framework depth' },
        ],
        certs: [],
      },
      {
        id: 'grc-cert', tier: 'certification', name: 'Certification', weeks: 10,
        focus: 'GRC careers are certification-led. Start with CC/Security+, then aim for the audit/management certifications employers list.',
        skills: ['Domain memorisation', 'Case-based exam reasoning', 'Professional documentation'],
        free: [
          { name: 'ISC2 CC', url: 'https://www.isc2.org/certifications/cc', note: 'Often free — verify availability' },
        ],
        paid: [
          { name: 'ISACA CISA', url: 'https://www.isaca.org/credentialing/cisa', note: 'Audit standard' },
          { name: 'ISC2 CISSP', url: 'https://www.isc2.org/certifications/cissp', note: 'Senior management standard' },
        ],
        certs: [
          { name: 'ISC2 Certified in Cybersecurity (CC)', tier: TIER.FREE, level: 'entry', url: 'https://www.isc2.org/certifications/cc' },
          { name: 'CompTIA Security+', tier: TIER.MID, level: 'entry', url: 'https://www.comptia.org/certifications/security-plus' },
          { name: 'ISACA CISA', tier: TIER.MID, level: 'core', url: 'https://www.isaca.org/credentialing/cisa' },
          { name: 'ISACA CISM', tier: TIER.MID, level: 'core', url: 'https://www.isaca.org/credentialing/cism' },
        ],
      },
      {
        id: 'grc-career', tier: 'career', name: 'Documentation Portfolio & Job Hunt', weeks: 4,
        focus: 'Assemble a portfolio of sample policies, a risk assessment and an audit checklist, then target GRC analyst roles.',
        skills: ['Sample policy set', 'Risk assessment write-up', 'Audit checklist', 'Résumé & interview prep'],
        free: [
          { name: 'SANS policy templates', url: 'https://www.sans.org/information-security-policy/', note: 'Free policy templates' },
          { name: 'GitHub for a documentation portfolio', url: 'https://pages.github.com/', note: 'Free hosting' },
        ],
        paid: [],
        certs: [],
      },
    ],
    advancedCerts: [
      { name: 'ISC2 CISSP', tier: TIER.MID, level: 'advanced', url: 'https://www.isc2.org/certifications/cissp' },
      { name: 'ISO 27001 Lead Auditor', tier: TIER.HIGH, level: 'advanced', url: 'https://www.iso.org/isoiec-27001-information-security.html' },
    ],
  },

  cloud: {
    name: 'Cloud Security',
    short: 'Cloud',
    tagline: 'Secure the platforms everything now runs on: AWS, Azure and GCP.',
    roles: ['Cloud Security Engineer', 'Cloud Security Analyst', 'DevSecOps Engineer'],
    phases: [
      {
        id: 'cloud-core', tier: 'core', name: 'Cloud Fundamentals (AWS / Azure)', weeks: 6,
        focus: 'How the cloud works before you can secure it: compute, storage, networking, and the shared-responsibility model.',
        skills: ['Core cloud services', 'Shared responsibility model', 'Cloud networking (VPC)', 'Identity basics (IAM)'],
        free: [
          { name: 'Microsoft Learn — AZ-900 / SC-900', url: 'https://learn.microsoft.com/en-us/training/', note: 'Free official training' },
          { name: 'AWS Skill Builder (free tier)', url: 'https://skillbuilder.aws/', note: 'Free cloud practitioner content' },
          { name: 'AWS — official channel (YouTube)', url: 'https://www.youtube.com/@amazonwebservices/playlists', note: 'Security & re:Inforce sessions' },
        ],
        paid: [
          { name: 'A Cloud Guru / Pluralsight paths', url: 'https://www.pluralsight.com/cloud-guru', note: 'Structured, optional' },
        ],
        certs: [{ name: 'Microsoft SC-900', tier: TIER.LOW, level: 'entry', optional: true, url: 'https://learn.microsoft.com/credentials/certifications/security-compliance-and-identity-fundamentals/' }],
      },
      {
        id: 'cloud-spec', tier: 'specialization', name: 'Cloud Security & IAM Hardening', weeks: 8,
        branches: ['Container & Kubernetes security','Cloud incident response','Serverless security'],
        focus: 'Secure real workloads: IAM least privilege, key management, logging/monitoring, and cloud misconfiguration hunting.',
        skills: ['IAM least privilege', 'Encryption & key management', 'Cloud logging & monitoring', 'Misconfiguration auditing'],
        free: [
          { name: 'AWS Well-Architected — Security Pillar', url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html', note: 'Free best-practice guide' },
          { name: 'flAWS / flAWS2 cloud CTF', url: 'https://flaws.cloud/', note: 'Free cloud-hacking labs' },
          { name: 'CloudGoat (Rhino Security Labs)', url: 'https://github.com/RhinoSecurityLabs/cloudgoat', note: 'Deliberately vulnerable AWS' },
        ],
        paid: [
          { name: 'TryHackMe — Cloud security rooms', url: 'https://tryhackme.com/paths', note: 'Guided cloud security' },
        ],
        certs: [],
      },
      {
        id: 'cloud-cert', tier: 'certification', name: 'Certification', weeks: 8,
        focus: 'Prove cloud-security depth with a provider or vendor-neutral certification aligned to the platform you use most.',
        skills: ['Provider security services', 'Exam scenario reasoning', 'Architecture trade-offs'],
        free: [
          { name: 'Microsoft Learn — SC-900 / AZ-500 paths', url: 'https://learn.microsoft.com/training/', note: 'Free official exam prep' },
        ],
        paid: [
          { name: 'AWS Security – Specialty', url: 'https://aws.amazon.com/certification/certified-security-specialty/', note: 'AWS depth' },
          { name: 'ISC2 CCSP', url: 'https://www.isc2.org/certifications/ccsp', note: 'Vendor-neutral' },
        ],
        certs: [
          { name: 'Microsoft SC-900', tier: TIER.LOW, level: 'entry', url: 'https://learn.microsoft.com/credentials/certifications/security-compliance-and-identity-fundamentals/' },
          { name: 'AWS Certified Cloud Practitioner', tier: TIER.LOW, level: 'entry', url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/' },
          { name: 'Microsoft AZ-500', tier: TIER.MID, level: 'core', url: 'https://learn.microsoft.com/credentials/certifications/azure-security-engineer/' },
          { name: 'AWS Security – Specialty', tier: TIER.MID, level: 'core', url: 'https://aws.amazon.com/certification/certified-security-specialty/' },
        ],
      },
      {
        id: 'cloud-career', tier: 'career', name: 'Cloud Lab & Job Hunt', weeks: 4,
        focus: 'Ship a secured reference deployment (IaC + monitoring), document it, and target cloud-security roles.',
        skills: ['Terraform / IaC hardening', 'Documented secure deployment', 'CI/CD security', 'Résumé & interview prep'],
        free: [
          { name: 'Terraform (free tier deploys)', url: 'https://developer.hashicorp.com/terraform', note: 'Infrastructure as code' },
          { name: 'GitHub Pages for write-ups', url: 'https://pages.github.com/', note: 'Free hosting' },
        ],
        paid: [],
        certs: [],
      },
    ],
    advancedCerts: [
      { name: 'Microsoft SC-100 (Architect)', tier: TIER.MID, level: 'advanced', url: 'https://learn.microsoft.com/credentials/certifications/cybersecurity-architect-expert/' },
      { name: 'GIAC GCSA / GPCS', tier: TIER.HIGH, level: 'advanced', url: 'https://www.giac.org/' },
    ],
  },

  appsec: {
    name: 'Application Security / DevSecOps',
    short: 'AppSec',
    tagline: 'Secure the code and the pipeline. Where developers meet security.',
    roles: ['Application Security Engineer', 'DevSecOps Engineer', 'Bug Bounty Hunter'],
    phases: [
      {
        id: 'appsec-core', tier: 'core', name: 'Web Security Fundamentals (OWASP Top 10)', weeks: 8,
        focus: 'Understand and exploit the vulnerabilities you will later defend against — hands-on, in a browser, against real labs.',
        skills: ['OWASP Top 10', 'Injection & XSS', 'Authentication flaws', 'Access-control bugs'],
        free: [
          { name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security/learning-paths', note: 'The gold standard, free' },
          { name: 'OWASP Juice Shop', url: 'https://owasp.org/www-project-juice-shop/', note: 'Vulnerable app to break' },
          { name: 'LiveOverflow — how web vulns work (YouTube)', url: 'https://www.youtube.com/@LiveOverflow/playlists', note: 'Exploitation explained visually' },
        ],
        paid: [
          { name: 'Web Security Academy → BSCP prep', url: 'https://portswigger.net/web-security/certification', note: 'Leads to a cert' },
        ],
        certs: [],
      },
      {
        id: 'appsec-spec', tier: 'specialization', name: 'Secure Code & DevSecOps', weeks: 8,
        branches: ['API security','Mobile AppSec','Software supply-chain security'],
        focus: 'Shift left: threat modelling, secure coding patterns, SAST/DAST, dependency scanning and securing CI/CD pipelines.',
        skills: ['Threat modelling', 'Secure coding patterns', 'SAST / DAST / SCA', 'Pipeline (CI/CD) security'],
        free: [
          { name: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/', note: 'Secure coding reference' },
          { name: 'Secure Code Warrior (free tier)', url: 'https://www.securecodewarrior.com/', note: 'Secure-coding practice' },
        ],
        paid: [
          { name: 'TCM Security — Practical Web Hacking', url: 'https://academy.tcm-sec.com/', note: 'Applied web security' },
        ],
        certs: [],
      },
      {
        id: 'appsec-cert', tier: 'certification', name: 'Certification', weeks: 8,
        focus: 'A practical AppSec certification proves you can find and explain real web vulnerabilities under exam conditions.',
        skills: ['Timed exploitation', 'Vulnerability reporting', 'Remediation guidance'],
        free: [
          { name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', note: 'Free, BSCP-aligned exam prep' },
        ],
        paid: [
          { name: 'Burp Suite Certified Practitioner (BSCP)', url: 'https://portswigger.net/web-security/certification', note: 'Practical, affordable' },
          { name: 'INE eWPT', url: 'https://security.ine.com/certifications/ewpt-certification/', note: 'Web pentest cert' },
        ],
        certs: [
          { name: 'Burp Suite Certified Practitioner', tier: TIER.LOW, level: 'core', url: 'https://portswigger.net/web-security/certification' },
          { name: 'INE eWPT', tier: TIER.MID, level: 'core', url: 'https://security.ine.com/certifications/ewpt-certification/' },
          { name: 'GIAC GWEB', tier: TIER.HIGH, level: 'advanced', url: 'https://www.giac.org/certifications/certified-web-application-defender-gweb/' },
        ],
      },
      {
        id: 'appsec-career', tier: 'career', name: 'Bug Bounty & Portfolio', weeks: 4,
        focus: 'Report real (in-scope) vulnerabilities, publish write-ups, and target AppSec/DevSecOps roles.',
        skills: ['Bug bounty (in-scope)', 'Public vulnerability write-ups', 'Remediation PRs', 'Résumé & interview prep'],
        free: [
          { name: 'HackerOne / Bugcrowd (in-scope only)', url: 'https://www.hackerone.com/', note: 'Real, authorised targets' },
          { name: 'GitHub Pages for write-ups', url: 'https://pages.github.com/', note: 'Free hosting' },
        ],
        paid: [],
        certs: [],
      },
    ],
    advancedCerts: [
      { name: 'OffSec OSWE', tier: TIER.HIGH, level: 'advanced', url: 'https://www.offsec.com/courses/web-300/' },
      { name: 'INE eWPTX', tier: TIER.MID, level: 'advanced', url: 'https://security.ine.com/certifications/ewptxv2-certification/' },
    ],
  },

  dfir: {
    name: 'Digital Forensics & Incident Response (DFIR)',
    short: 'DFIR',
    tagline: 'Follow the evidence. Reconstruct the attack, disk by disk, log by log.',
    roles: ['Digital Forensics Analyst', 'Incident Responder', 'Malware Analyst'],
    phases: [
      {
        id: 'dfir-core', tier: 'core', name: 'Forensics Foundations (Disk, Memory, Logs)', weeks: 8,
        focus: 'Acquire and analyse evidence: filesystem artefacts, memory captures, and the Windows/Linux logs that tell the story.',
        skills: ['Evidence acquisition & chain of custody', 'Filesystem forensics', 'Memory forensics (Volatility)', 'Log timeline building'],
        free: [
          { name: 'Autopsy (Sleuth Kit)', url: 'https://www.sleuthkit.org/autopsy/', note: 'Free forensics platform' },
          { name: '13Cubed (YouTube)', url: 'https://www.youtube.com/@13cubed', note: 'Excellent free DFIR training' },
        ],
        paid: [
          { name: 'TryHackMe — Cyber Defense path', url: 'https://tryhackme.com/path/outline/cyberdefense', note: 'Guided forensics & IR rooms' },
        ],
        certs: [],
      },
      {
        id: 'dfir-spec', tier: 'specialization', name: 'Incident Response & Malware Triage', weeks: 8,
        branches: ['Malware reverse engineering','Cloud forensics','Threat intelligence'],
        focus: 'Respond to a live incident and safely triage malware: behavioural analysis, IOCs, and reporting findings.',
        skills: ['IR lifecycle in practice', 'Malware behavioural analysis', 'IOC extraction', 'Forensic reporting'],
        free: [
          { name: 'CyberDefenders — DFIR challenges', url: 'https://cyberdefenders.org/blueteam-ctf-challenges/', note: 'Free DFIR challenges' },
          { name: 'Volatility Foundation', url: 'https://volatilityfoundation.org/', note: 'Memory analysis toolkit' },
          { name: 'DFIRScience (YouTube)', url: 'https://www.youtube.com/@DFIRScience/playlists', note: 'Hands-on forensics tutorials' },
        ],
        paid: [
          { name: 'Blue Team Labs Online', url: 'https://blueteamlabs.online/', note: 'IR & forensics labs' },
        ],
        certs: [],
      },
      {
        id: 'dfir-cert', tier: 'certification', name: 'Certification', weeks: 8,
        focus: 'A DFIR certification proves you can run an investigation methodically and defensibly.',
        skills: ['Methodical investigation', 'Defensible documentation', 'Tool fluency'],
        free: [
          { name: 'CyberDefenders', url: 'https://cyberdefenders.org/', note: 'Free DFIR challenges for exam prep' },
        ],
        paid: [
          { name: 'Security Blue Team — BTL1', url: 'https://www.securityblue.team/', note: 'Practical, covers DFIR' },
          { name: 'INE eCDFP', url: 'https://security.ine.com/certifications/ecdfp-certification/', note: 'Forensics-focused' },
        ],
        certs: [
          { name: 'Security Blue Team BTL1', tier: TIER.MID, level: 'entry', url: 'https://www.securityblue.team/' },
          { name: 'INE eCDFP', tier: TIER.MID, level: 'core', url: 'https://security.ine.com/certifications/ecdfp-certification/' },
          { name: 'GIAC GCFA', tier: TIER.HIGH, level: 'advanced', url: 'https://www.giac.org/certifications/certified-forensic-analyst-gcfa/' },
        ],
      },
      {
        id: 'dfir-career', tier: 'career', name: 'Case Portfolio & Job Hunt', weeks: 4,
        focus: 'Publish a full (synthetic) investigation report, build a tool/artefact cheat-sheet, and target DFIR roles.',
        skills: ['Full investigation report', 'Artefact reference sheet', 'Timeline visualisation', 'Résumé & interview prep'],
        free: [
          { name: 'DFIR public challenge write-ups', url: 'https://cyberdefenders.org/', note: 'Portfolio material' },
          { name: 'GitHub Pages for write-ups', url: 'https://pages.github.com/', note: 'Free hosting' },
        ],
        paid: [],
        certs: [],
      },
    ],
    advancedCerts: [
      { name: 'GIAC GCFA / GCFE', tier: TIER.HIGH, level: 'advanced', url: 'https://www.giac.org/' },
      { name: 'GIAC GREM (Malware)', tier: TIER.HIGH, level: 'advanced', url: 'https://www.giac.org/certifications/reverse-engineering-malware-grem/' },
    ],
  },
};

/*
 * The "not sure yet" route. It reuses the shared foundations, then a single
 * exploration phase that fans out to every track so the learner can commit.
 */
const EXPLORE_PHASE = {
  id: 'explore', tier: 'specialization', name: 'Try Each Path, Then Commit', weeks: 4,
  focus: 'Sample offensive, defensive, GRC, cloud, AppSec and DFIR work with short tasters, then re-run this planner with a chosen track.',
  skills: ['Sample all six domains', 'Notice what energises you', 'Talk to people in each role', 'Commit to one track'],
  free: [
    { name: 'TryHackMe — Intro to Cyber Security', url: 'https://tryhackme.com/path/outline/introtocyber', note: 'Bite-size tasters of each domain' },
    { name: 'Cybrary — free intro courses', url: 'https://www.cybrary.it/catalog', note: 'Broad overviews' },
    { name: 'Simply Cyber — get started (YouTube)', url: 'https://www.youtube.com/@SimplyCyber/playlists', note: 'Daily cyber career guidance' },
  ],
  paid: [],
  certs: [],
  isExplore: true,
};

/* Question definitions drive both the wizard UI and the no-JS fallback copy. */
const QUESTIONS = [
  {
    id: 'goal', legend: 'Which area of cybersecurity pulls at you most?',
    help: 'Pick the work that sounds most exciting. Not sure? Choose the last option and we’ll help you explore.',
    type: 'radio',
    options: [
      { value: 'offensive', label: 'Breaking in (Offensive / Pentesting)', desc: 'Ethical hacking, red teaming, finding vulnerabilities.' },
      { value: 'defensive', label: 'Defending (Blue Team / SOC)', desc: 'Detecting attacks, incident response, threat hunting.' },
      { value: 'grc', label: 'Governance & Risk (GRC)', desc: 'Policy, audit, compliance, risk management.' },
      { value: 'cloud', label: 'Cloud Security', desc: 'Securing AWS, Azure and GCP environments.' },
      { value: 'appsec', label: 'Application Security', desc: 'Securing code, web apps and CI/CD pipelines.' },
      { value: 'dfir', label: 'Forensics & Response (DFIR)', desc: 'Investigating breaches, evidence, malware.' },
      { value: 'unsure', label: 'I’m not sure yet', desc: 'Answer a few aptitude questions and we’ll match you.' },
    ],
  },

  /* ---- Aptitude block: shown ONLY when goal === 'unsure'. Feeds the recommender
     in match.js, which infers the best-fit track from these answers. ---- */
  {
    id: 'apt_drive', showIf: function (a) { return a.goal === 'unsure'; },
    legend: 'Which part of the security lifecycle would you be happiest living in?',
    help: 'Go with your gut — the stage that sounds most like you, not the most impressive.',
    type: 'radio',
    options: [
      { value: 'break', label: 'Finding the way in', desc: 'Probing systems and proving what an attacker could exploit.' },
      { value: 'watch', label: 'Catching attacks in progress', desc: 'Watching the alerts, spotting the intrusion, shutting it down.' },
      { value: 'build', label: 'Building systems that resist', desc: 'Designing and hardening platforms and code so attacks bounce off.' },
      { value: 'investigate', label: 'Reconstructing what happened', desc: 'Following the evidence after a breach to tell the full story.' },
      { value: 'govern', label: 'Setting the rules', desc: 'Policy, audits, and proving the organisation is compliant.' },
    ],
  },
  {
    id: 'apt_mindset', showIf: function (a) { return a.goal === 'unsure'; },
    legend: 'Which sounds most like how your brain actually works?',
    help: 'No wrong answer — this is your natural instinct, not what you think you should pick.',
    type: 'radio',
    options: [
      { value: 'adversarial', label: 'I look for the flaw', desc: 'Show me anything and I find the weak point I could abuse.' },
      { value: 'layered', label: 'I think in defenses', desc: 'I picture the layers and controls that keep something safe.' },
      { value: 'evidence', label: 'I follow the evidence', desc: 'I trust data and artefacts and chase them wherever they lead.' },
      { value: 'systems', label: 'I see whole systems', desc: 'I map how all the pieces connect and where they will strain.' },
      { value: 'rules', label: 'I think in rules', desc: 'I reason about policy, standards and accountability.' },
    ],
  },
  {
    id: 'apt_medium', showIf: function (a) { return a.goal === 'unsure'; },
    legend: 'Which craft would you most want to master?',
    help: 'Imagine a year to get genuinely good at one of these. Which pulls hardest?',
    type: 'radio',
    options: [
      { value: 'code', label: 'Code & a debugger', desc: 'Reading source, writing tools, understanding software inside-out.' },
      { value: 'exploit', label: 'Exploit frameworks & shells', desc: 'Offensive tooling: getting a foothold and escalating.' },
      { value: 'cloudiac', label: 'Cloud consoles & IaC', desc: 'AWS/Azure/GCP and infrastructure-as-code like Terraform.' },
      { value: 'siem', label: 'A SIEM & its query language', desc: 'Turning oceans of logs into detections that fire.' },
      { value: 'forensics', label: 'Disk & memory forensics', desc: 'Carving artefacts out of images to rebuild a timeline.' },
      { value: 'frameworks', label: 'Risk & control frameworks', desc: 'Risk registers, NIST/ISO controls and audit evidence.' },
    ],
  },
  {
    id: 'apt_social', showIf: function (a) { return a.goal === 'unsure'; },
    legend: 'Where do you do your best work?',
    help: 'Think about the setting where you have felt most in flow.',
    type: 'radio',
    options: [
      { value: 'solo', label: 'Heads-down and alone', desc: 'Deep in one hard problem for hours, undisturbed.' },
      { value: 'ops-team', label: 'In a tight reacting team', desc: 'Shoulder to shoulder responding to live events.' },
      { value: 'with-devs', label: 'Alongside developers', desc: 'Embedded with people who ship, fixing things together.' },
      { value: 'stakeholders', label: 'With the business', desc: 'In the room with managers, auditors and decision-makers.' },
    ],
  },
  {
    id: 'apt_report', showIf: function (a) { return a.goal === 'unsure'; },
    legend: 'How do you honestly feel about writing things up?',
    help: 'Every role writes something — this just measures enjoy-vs-tolerate.',
    type: 'radio',
    options: [
      { value: 'energizes', label: 'I enjoy it', desc: 'Turning messy findings into clear, persuasive writing is satisfying.' },
      { value: 'professional', label: 'It is part of it', desc: 'Good documentation is just part of doing the job well.' },
      { value: 'minimal', label: 'Keep me hands-on', desc: 'I will do the minimum; the technical work is the point.' },
    ],
  },

  {
    id: 'experience', legend: 'Where are you starting from today?',
    help: 'Be honest — this sets how much foundation we include and how fast the plan moves.',
    type: 'radio',
    options: [
      { value: 'none', label: 'Complete beginner', desc: 'New to IT and security.' },
      { value: 'it', label: 'Some IT / tech background', desc: 'Comfortable with computers, maybe help-desk or dev.' },
      { value: 'some-sec', label: 'Some security exposure', desc: 'Done a course, CTFs, or a bit of security at work.' },
      { value: 'pro', label: 'Working in tech/security', desc: 'Pivoting or levelling up in the field.' },
    ],
  },
  {
    id: 'background', legend: 'Which of these do you already know? (Select any)',
    help: 'We’ll skip foundations you’ve already covered so your plan isn’t padded. This step is optional — if none apply, just choose Next.',
    type: 'checkbox',
    options: [
      { value: 'networking', label: 'Networking', desc: 'TCP/IP, DNS, subnetting.' },
      { value: 'linux', label: 'Linux / command line', desc: 'Comfortable in a terminal.' },
      { value: 'programming', label: 'Programming / scripting', desc: 'Python or similar.' },
      { value: 'sysadmin', label: 'System administration', desc: 'Managing Windows/Linux systems.' },
    ],
  },
  {
    id: 'hours', legend: 'How much time can you realistically study each week?',
    help: 'Consistency beats intensity. Choose what you can actually sustain.',
    type: 'radio',
    options: [
      { value: '3', label: 'A few hours (1–5h)', desc: 'Evenings/weekends around other commitments.' },
      { value: '8', label: 'Part-time (5–10h)', desc: 'A steady weekly rhythm.' },
      { value: '15', label: 'Serious (10–20h)', desc: 'Studying is a major priority.' },
      { value: '25', label: 'Full-time (20h+)', desc: 'This is your main focus right now.' },
    ],
  },
  {
    id: 'deadline', legend: 'Do you have a target date to be job-ready?',
    help: 'We’ll sanity-check your plan against it and tell you if your weekly hours add up.',
    type: 'radio',
    options: [
      { value: '3', label: 'Within 3 months', desc: 'Aggressive — usually needs full-time study.' },
      { value: '6', label: 'Within 6 months', desc: 'Focused and intensive.' },
      { value: '12', label: 'Within a year', desc: 'A steady, sustainable pace.' },
      { value: '0', label: 'No fixed deadline', desc: 'I’ll go at my own pace.' },
    ],
  },
  {
    id: 'budget', legend: 'What’s your budget for learning and certifications?',
    help: 'You can build real skills with zero spend; certifications are where money usually goes.',
    type: 'radio',
    options: [
      { value: 'free', label: 'Free only', desc: 'Show me the best no-cost path.' },
      { value: 'mixed', label: 'Mostly free, some spend', desc: 'Free learning, pay for key certifications.' },
      { value: 'paid', label: 'I can invest', desc: 'Show the best options, paid included.' },
    ],
  },
  {
    id: 'style', legend: 'How do you learn best?',
    help: 'We’ll tailor the study method and which kind of resources we lead with.',
    type: 'radio',
    options: [
      { value: 'hands', label: 'Hands-on labs & challenges', desc: 'Learn by doing — CTFs, boxes, breaking things.' },
      { value: 'structured', label: 'Structured courses & video', desc: 'Guided, step-by-step curricula.' },
      { value: 'reading', label: 'Reading & documentation', desc: 'Books, docs, write-ups at my own pace.' },
      { value: 'balanced', label: 'A mix of everything', desc: 'Blend labs, video and reading.' },
    ],
  },
  {
    id: 'appetite', legend: 'What’s your goal with this path?',
    help: 'This controls how far the certification ladder goes in your plan.',
    type: 'radio',
    options: [
      { value: 'hobby', label: 'Learn for interest / hobby', desc: 'Skills matter more than certificates.' },
      { value: 'entry', label: 'Land my first security job', desc: 'Entry + one solid core certification.' },
      { value: 'advanced', label: 'Advance / specialise deeply', desc: 'Go all the way to expert certifications.' },
    ],
  },
];

/*
 * CROSS-TRACK BRIDGES — the accurate, real-world adjacency between tracks (why a
 * pivot works, not just that it does). Rendered as "where this path can take you next".
 */
const BRIDGES = {
  offensive: [
    { to: 'appsec', why: 'Web exploitation IS entry-level AppSec — the same OWASP Top 10, Burp and injection skills, pointed at defence.' },
    { to: 'defensive', why: 'Purple teaming: you can only write great detections for attacks you have run yourself.' },
  ],
  defensive: [
    { to: 'dfir', why: 'SOC triage lives in logs and timelines — the natural on-ramp to disk and memory forensics.' },
    { to: 'cloud', why: 'Modern SOCs are cloud-first; CloudTrail, Sentinel and GuardDuty are the new log sources.' },
  ],
  grc: [
    { to: 'cloud', why: 'Cloud posture maps directly onto CIS Benchmarks, SOC 2 and ISO 27001 controls.' },
    { to: 'defensive', why: 'SOC coverage and MTTD/MTTR become the audit evidence you sign off.' },
  ],
  cloud: [
    { to: 'appsec', why: 'Pipelines, containers and infrastructure-as-code are shared DevSecOps ground.' },
    { to: 'offensive', why: 'Cloud pentesting (IAM abuse, misconfig hunting) is a fast-growing offensive niche.' },
  ],
  appsec: [
    { to: 'offensive', why: 'The attacker mindset tells you which findings are actually exploitable, not just scanner noise.' },
    { to: 'cloud', why: 'Securing CI/CD and IaC pulls you straight into cloud-native security.' },
  ],
  dfir: [
    { to: 'defensive', why: 'Detection engineering closes the loop on what your investigations keep uncovering.' },
    { to: 'offensive', why: 'Knowing attacker TTPs first-hand sharpens exactly what you hunt for in the evidence.' },
  ],
};

/*
 * MILESTONES — named checkpoints injected into the path map after the phase that earns
 * them. `track:'*'` fires for any track; otherwise it matches the plan's track.
 */
const MILESTONES = [
  { track: '*', tier: 'foundation', name: 'Home lab built', blurb: 'A VM host + a vulnerable target + a Linux attacker box — your permanent practice ground.' },
  { track: 'offensive', tier: 'core', name: 'First box rooted', blurb: 'Own a machine recon-to-root with no walkthrough.' },
  { track: 'offensive', tier: 'certification', name: 'First pentest report', blurb: 'A professional report: findings, risk ratings, remediation.' },
  { track: 'defensive', tier: 'core', name: 'First alert triaged', blurb: 'Take a SIEM alert from raw log to a true/false-positive verdict.' },
  { track: 'defensive', tier: 'specialization', name: 'First incident handled', blurb: 'Run an alert through the full NIST IR lifecycle to containment.' },
  { track: 'dfir', tier: 'specialization', name: 'First case solved', blurb: 'Rebuild an attack timeline from disk/memory and defend it in writing.' },
  { track: 'grc', tier: 'specialization', name: 'First audit completed', blurb: 'Map controls to a framework and produce an evidenced finding.' },
  { track: 'cloud', tier: 'career', name: 'First secured deployment', blurb: 'Ship a hardened IaC reference deployment with logging + alerting.' },
  { track: 'appsec', tier: 'career', name: 'First CVE / disclosure', blurb: 'A valid in-scope bug-bounty report or a responsibly disclosed CVE.' },
  { track: '*', tier: 'career', name: 'First write-up published', blurb: 'A public post that proves how you think, not just what you did.' },
];

/* Expose to app.js (plain globals — no bundler, keeps GitHub Pages trivial). */
window.CYBERPATH_DATA = { TIER, FOUNDATIONS, TRACKS, EXPLORE_PHASE, QUESTIONS, BRIDGES, MILESTONES };
