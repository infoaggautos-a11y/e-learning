export type AnswerStatus = "confirmed" | "tbc" | "client" | "jetech";

export const STATUS_LABELS: Record<AnswerStatus, string> = {
  confirmed: "Confirmed",
  tbc: "To Be Confirmed",
  client: "Client to Provide",
  jetech: "Jetech to Propose",
};

export interface Section {
  id: string;
  number: number;
  title: string;
  intro: string;
  keyQuestion?: string;
  questions: string[];
  note?: string;
}

export const SECTIONS: Section[] = [
  {
    id: "objective",
    number: 1,
    title: "Business objective",
    intro: "These questions come before technology. They establish why the platform exists and who it serves.",
    keyQuestion:
      "Walk us through what happens today, from the moment someone wants to become an operative until they receive their permit.",
    questions: [
      "What problem is this platform being created to solve?",
      "Who is commissioning / owning the platform?",
      "Who are the actual users: security operatives, trainees, companies, training institutions, government agencies, or all of these?",
      "Is this for one organization initially, or is the intention to onboard many organizations?",
      "How many candidates do you expect in Year 1? What about 3–5 years?",
      "Is this intended only for Nigeria, or could it eventually operate internationally?",
      "How will the platform generate revenue, if it is commercial?",
      "Will candidates, employers, training institutions, or government agencies pay?",
      "Are there existing manual processes that this system is replacing?",
    ],
  },
  {
    id: "multi-tenant",
    number: 2,
    title: "What \"multi-tenant\" means",
    intro: "Multi-tenancy was specifically requested. Do not assume what it means.",
    keyQuestion:
      "Do you envision one central authority controlling the standards while individual organizations manage their own candidates underneath it?",
    questions: [
      "Who constitutes a tenant?",
      "Will security companies have their own accounts?",
      "Will training institutions have separate portals?",
      "Can each organization manage its own candidates?",
      "Can tenants create their own courses or only use centrally approved courses?",
      "Can tenants create examination questions?",
      "Will each tenant have its own administrators?",
      "Should tenants have their own branding?",
      "Can one candidate belong to multiple organizations?",
      "Should the central authority be able to see and control every tenant?",
    ],
  },
  {
    id: "enrollment",
    number: 3,
    title: "Candidate enrollment & identity",
    intro: "What must be collected at registration, who verifies it, and how identity is handled.",
    keyQuestion:
      "Do you need integration with NIMC or another external identity-verification provider, or are candidates simply submitting their information?",
    questions: [
      "What information must be collected during registration? (NIN, BVN, passport photograph, date of birth, address, state of origin, employer, previous certification, next of kin, medical information, criminal / background-check information)",
      "Who verifies candidate information?",
      "Can candidates register themselves?",
      "Can organizations register candidates in bulk?",
      "Do candidates need to pay before enrollment?",
      "Can an administrator suspend or blacklist a candidate?",
      "What happens when someone changes employer?",
    ],
  },
  {
    id: "learning",
    number: 4,
    title: "Learning structure",
    intro: "Ask to see the actual curriculum if it exists. Building an LMS and producing 50 hours of content are two completely different projects.",
    questions: [
      "How many courses are there initially?",
      "How many modules per course?",
      "Who owns the training content?",
      "Does the content already exist? In what format (PDF, PowerPoint, video, paper manuals)?",
      "Who will convert existing materials into digital lessons?",
      "Will Jetech be expected to produce learning content or only provide the platform?",
      "Will courses contain video, audio, text, diagrams and quizzes?",
      "Are there mandatory learning hours?",
      "Must candidates complete one module before unlocking another? Can candidates skip content?",
      "Should video completion be tracked?",
      "Will instructors conduct live classes?",
      "Are discussion forums required?",
      "Do candidates need downloadable materials?",
      "Which languages must be supported?",
      "Is offline learning actually required, or just good performance on slow connections?",
    ],
    note: "Content ownership is commercially important.",
  },
  {
    id: "question-bank",
    number: 5,
    title: "The \"1,500 questions per module\"",
    intro: "One of the biggest scope questions. 20 modules × 1,500 questions is potentially 30,000 assessment items.",
    keyQuestion:
      "When you say 1,500 distinct questions per module, do you already have 1,500 approved questions, or are you expecting the software to generate them?",
    questions: [
      "Who provides the base questions?",
      "Who provides the scenario templates?",
      "Who determines the correct answers?",
      "Who approves generated questions?",
      "How many modules require 1,500 questions?",
      "Are these multiple-choice questions? Can questions have multiple correct answers?",
      "Are there practical / situational assessments?",
      "Will images, video or audio appear in questions?",
      "Are questions classified by difficulty?",
      "Should questions be mapped to learning objectives?",
      "Can questions expire or be retired?",
      "Do you expect AI-generated questions?",
      "If AI is involved, must a human approve each generated item before it enters a live examination?",
    ],
    note: "Establish whether they want the engine, the content, or both.",
  },
  {
    id: "exam-rules",
    number: 6,
    title: "Examination rules",
    intro: "Get them to describe an actual examination end to end.",
    keyQuestion:
      "Suppose I am a candidate sitting the examination tomorrow. What exactly happens from login until I receive my result?",
    questions: [
      "How many questions per exam? How much time?",
      "Pass mark?",
      "Number of attempts? Waiting period after failure?",
      "Does failure require retraining?",
      "Are questions randomly selected? Should two candidates sitting next to each other receive different questions?",
      "Should answer choices also be randomized?",
      "Can candidates return to previous questions? Can an exam be paused?",
      "What happens if internet connectivity disappears? What happens if power fails?",
      "Is there an examination centre or can candidates take exams anywhere?",
      "Are results shown immediately?",
      "Can results be appealed? Can an administrator override results?",
      "Who can see results?",
      "Do you require detailed examination audit records?",
    ],
  },
  {
    id: "biometrics",
    number: 7,
    title: "\"Biometric locks\"",
    intro: "Do not accept \"biometric\" as a requirement until it is defined. This could turn an LMS into a proctoring system.",
    keyQuestion: "What exact problem do you expect biometrics to solve?",
    questions: [
      "Face verification, fingerprint, NIN biometric matching, or liveness detection?",
      "Is biometric verification required at registration?",
      "At examination start? Continuously throughout? Randomly during the exam?",
      "Does the system need to detect another person appearing in front of the camera?",
      "Should it detect candidates leaving the examination screen?",
      "Is webcam monitoring required? Should examination sessions be recorded?",
      "What happens if legitimate biometric verification fails?",
      "Who reviews disputed biometric failures?",
    ],
  },
  {
    id: "upn",
    number: 8,
    title: "UPN — Unique Operative Permit Number",
    intro: "Spend time here. Software should not automatically issue something with regulatory significance unless that is the approved process.",
    keyQuestion:
      "Who has the legal or administrative authority to issue the Unique Operative Permit Number?",
    questions: [
      "What exactly does a UPN represent? Is it a certificate number or an operative licence?",
      "Is there an existing numbering format?",
      "Is the UPN permanent? Can it expire? Can it be renewed?",
      "Can it be suspended? Can it be revoked?",
      "Can an operative have more than one? Is it tied permanently to the individual?",
      "What happens if the operative changes employer?",
      "Does a government / regulatory database need to receive the UPN?",
      "Who is allowed to issue / revoke it?",
      "Is human approval required before issuance?",
    ],
  },
  {
    id: "certificate",
    number: 9,
    title: "Certificate & QR verification",
    intro: "Describe the idea verbally and let them react.",
    keyQuestion:
      "If somebody presents a certificate at a gate, office or employer, what should happen when the QR code is scanned?",
    questions: [
      "Who can scan it? Should verification be public?",
      "What information should appear? (Candidate photo, name, UPN, employer, training completed, issue date, expiry date, current status)",
      "Should the verifier see \"Valid\", \"Expired\", \"Suspended\" or \"Revoked\"?",
      "Should scanning be logged?",
      "Should the certificate be downloadable as PDF? Is physical printing required?",
      "Is there an existing certificate design?",
    ],
  },
  {
    id: "scale",
    number: 10,
    title: "Scale & infrastructure",
    intro: "Do not simply accept \"thousands of concurrent learners.\" Ask for numbers.",
    questions: [
      "Expected registered users at launch? Year 1? Five-year target?",
      "Expected candidates online simultaneously?",
      "Expected candidates taking exams simultaneously?",
      "Number of organizations? Number of courses?",
      "Number of examinations per month?",
      "Number of certificates generated annually?",
      "Expected video storage?",
      "Expected geographic coverage?",
      "Is Nigeria-only data hosting required?",
      "Is there a preferred cloud provider? Is government / private-cloud / on-premise deployment expected?",
      "Required uptime? Disaster-recovery expectations?",
    ],
  },
  {
    id: "reporting",
    number: 11,
    title: "Administration & reporting",
    intro: "Often forgotten in initial specifications.",
    keyQuestion:
      "What are the five numbers management would want to see every morning when they log in?",
    questions: [
      "What should the super-admin dashboard show?",
      "What should tenant administrators see?",
      "Which metrics matter: enrollment numbers, course completion, pass/fail rates, examination attempts, certificates issued, UPNs issued, suspended/revoked permits?",
      "Geographic reporting? Organization performance?",
      "Revenue / payment reporting?",
      "Export to Excel / PDF? Scheduled reports?",
      "Regulator dashboard? Audit dashboard?",
    ],
  },
  {
    id: "payments",
    number: 12,
    title: "Payments & commercial operations",
    intro: "Their document does not mention this. Ask now — it could become a major subsystem.",
    questions: [
      "Is enrollment paid? Are courses paid? Are examinations paid?",
      "Is certification paid? Is UPN issuance paid? Are renewals paid?",
      "Does each tenant pay subscription / licensing fees?",
      "Individual or corporate billing?",
      "Paystack / bank transfer / card?",
      "Invoices and receipts? Refund rules?",
      "Who receives the money? Does revenue need to be split between organizations?",
    ],
  },
  {
    id: "integrations",
    number: 13,
    title: "Integrations",
    intro: "Which external systems must connect to this platform?",
    questions: [
      "NIMC / NIN?",
      "Payment gateway?",
      "Government databases?",
      "Existing HR systems or security-company databases?",
      "SMS, email, WhatsApp?",
      "Biometrics provider?",
      "Existing LMS? Certificate authority? Accounting systems?",
      "Do you require APIs so other systems can verify a UPN without using the website?",
    ],
  },
  {
    id: "compliance",
    number: 14,
    title: "Ownership, security & compliance",
    intro: "These questions protect both sides.",
    questions: [
      "Who owns candidate data? Who owns course content?",
      "Who owns the question bank? Who owns generated questions?",
      "Who owns the source code?",
      "Who is permitted to access candidate information?",
      "Required data-retention period?",
      "What happens when a candidate requests account / data deletion?",
      "Are there specific regulatory / security standards you expect?",
      "Who approves production security requirements?",
      "Do you require penetration testing before launch?",
      "Do you require complete audit trails of administrator actions?",
    ],
  },
  {
    id: "delivery",
    number: 15,
    title: "Commercial & delivery",
    intro: "Do not leave the meeting without these answers.",
    keyQuestion:
      "If we could only deliver five capabilities for the first production release, which five would make the project successful for you?",
    questions: [
      "Is there a target launch date? Why that date? Is there an event / regulatory deadline driving it?",
      "What absolutely must exist on Day 1? What can wait for Phase 2?",
      "Do you have an approved budget range?",
      "Who approves the project? Who signs off technical requirements?",
      "Who signs off learning content? Who approves examination questions?",
      "Who approves UPN issuance rules?",
      "Who will be Jetech's primary contact?",
      "Do you expect Jetech to operate / support the platform after launch?",
      "What SLA / support level is expected?",
    ],
  },
];

export const questionId = (sectionId: string, index: number) => `${sectionId}-${index}`;
export const keyQuestionId = (sectionId: string) => `${sectionId}-key`;

export const TOTAL_QUESTIONS = SECTIONS.reduce(
  (n, s) => n + s.questions.length + (s.keyQuestion ? 1 : 0),
  0,
);

export function getSection(id: string) {
  return SECTIONS.find((s) => s.id === id);
}
