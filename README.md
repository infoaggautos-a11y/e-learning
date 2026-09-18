# Operative Pathway

build a custom questionare, and interactive ai powered questionare system: For this meeting, the goal is not to impress them with technical jargon. It is to discover exactly what they want, what they have not thought through, what is mandatory versus optional, and what determines cost.

I would organize the meeting questions in this order. You don't need to ask every question mechanically; use them as your meeting checklist.

1. Start with the business objective

These questions should come before technology.

What problem is this platform being created to solve?

Who is commissioning/owning the platform?

Who are the actual users: security operatives, trainees, companies, training institutions, government agencies, or all of these?

Is this for one organization initially, or is the intention to onboard many organizations?

How many candidates do you expect in Year 1? What about 3–5 years?

Is this intended only for Nigeria, or could it eventually operate internationally?

How will the platform generate revenue, if it is commercial?

Will candidates, employers, training institutions, or government agencies pay?

Are there existing manual processes that this system is replacing?

Important question:

"Walk us through what happens today, from the moment someone wants to become an operative until they receive their permit."

That one question can uncover half the system requirements.

2. Clarify what "multi-tenant" means to them

They specifically requested multi-tenancy, so don't assume what they mean.

Who constitutes a tenant?

Will security companies have their own accounts?

Will training institutions have separate portals?

Can each organization manage its own candidates?

Can tenants create their own courses or only use centrally approved courses?

Can tenants create examination questions?

Will each tenant have its own administrators?

Should tenants have their own branding?

Can one candidate belong to multiple organizations?

Should the central authority be able to see and control every tenant?

I'd specifically ask:

"Do you envision one central authority controlling the standards while individual organizations manage their own candidates underneath it?"

That determines a major part of the architecture.

3. Candidate enrollment and identity

What information must be collected during registration?

NIN?

BVN?

Passport photograph?

Date of birth?

Address?

State of origin?

Employer?

Previous certification?

Next of kin?

Medical information?

Criminal/background-check information?

Who verifies candidate information?

Can candidates register themselves?

Can organizations register candidates in bulk?

Do candidates need to pay before enrollment?

Can an administrator suspend or blacklist a candidate?

What happens when someone changes employer?

And importantly:

"Do you need integration with NIMC or another external identity-verification provider, or are candidates simply submitting their information?"

4. Understand the learning structure

Ask them to show you the actual curriculum if it exists.

How many courses are there initially?

How many modules per course?

Who owns the training content?

Does the content already exist?

Is it currently PDF, PowerPoint, video, paper manuals, etc.?

Who will convert existing materials into digital lessons?

Will Floodgate be expected to produce learning content or only provide the platform?

Will courses contain video, audio, text, diagrams and quizzes?

Are there mandatory learning hours?

Must candidates complete one module before unlocking another?

Can candidates skip content?

Should video completion be tracked?

Will instructors conduct live classes?

Are discussion/forums required?

Do candidates need downloadable materials?

Which languages must be supported?

Is offline learning actually required, or just good performance on slow connections?

The content ownership question is commercially important. Building an LMS and producing 50 hours of training content are two completely different projects.

5. Dig deeply into the "1,500 questions per module"

This is one of the biggest scope questions.

Ask:

"When you say 1,500 distinct questions per module, do you already have 1,500 approved questions, or are you expecting the software to generate them?"

Then:

Who provides the base questions?

Who provides the scenario templates?

Who determines the correct answers?

Who approves generated questions?

How many modules require 1,500 questions?

Are these multiple-choice questions?

Can questions have multiple correct answers?

Are there practical/situational assessments?

Will images, video or audio appear in questions?

Are questions classified by difficulty?

Should questions be mapped to learning objectives?

Can questions expire or be retired?

Do they expect AI-generated questions?

If AI is involved, must a human approve each generated item before it enters a live examination?

This is where you protect yourself from accidentally agreeing to something enormous.

If there are 20 modules × 1,500 questions, that's potentially 30,000 assessment items. The meeting must establish whether they're asking you to build the engine, produce the content, or both.

6. Examination rules

Get them to describe an actual examination.

"Suppose I am a candidate sitting the examination tomorrow. What exactly happens from login until I receive my result?"

Then establish:

How many questions per exam?

How much time?

Pass mark?

Number of attempts?

Waiting period after failure?

Does failure require retraining?

Are questions randomly selected?

Should two candidates sitting next to each other receive different questions?

Should answer choices also be randomized?

Can candidates return to previous questions?

Can an exam be paused?

What happens if internet connectivity disappears?

What happens if power fails?

Is there an examination centre or can candidates take exams anywhere?

Are results shown immediately?

Can results be appealed?

Can an administrator override results?

Who can see results?

Do they require detailed examination audit records?

7. Get very specific about "biometric locks"

Don't accept "biometric" as a requirement until they define it.

Ask:

"What exact problem do you expect biometrics to solve?"

Then:

Face verification?

Fingerprint?

NIN biometric matching?

Liveness detection?

Is biometric verification required at registration?

At examination start?

Continuously throughout the examination?

Randomly during the exam?

Does the system need to detect another person appearing in front of the camera?

Should it detect candidates leaving the examination screen?

Is webcam monitoring required?

Should examination sessions be recorded?

What happens if legitimate biometric verification fails?

Who reviews disputed biometric failures?

This could turn a normal LMS into a much more sophisticated examination/proctoring system.

8. UPN — this needs serious clarification

I'd spend time here.

Ask them directly:

"Who has the legal or administrative authority to issue the Unique Operative Permit Number?"

Then:

What exactly does a UPN represent?

Is it a certificate number or an operative license?

Is there an existing numbering format?

Is the UPN permanent?

Can it expire?

Can it be renewed?

Can it be suspended?

Can it be revoked?

Can an operative have more than one?

Is it tied permanently to the individual?

What happens if the operative changes employer?

Does a government/regulatory database need to receive the UPN?

Who is allowed to issue/revoke it?

Is human approval required before issuance?

Don't let the software automatically issue something with regulatory significance merely because someone passes an online exam unless that is actually the approved business/regulatory process.

9. Certificate and QR verification

Show them the proposed idea verbally:

"If somebody presents a certificate at a gate, office or employer, what should happen when the QR code is scanned?"

Then ask:

Who can scan it?

Should verification be public?

What information should appear?

Candidate photo?

Name?

UPN?

Employer?

Training completed?

Issue date?

Expiry date?

Current status?

Should the verifier see "Valid", "Expired", "Suspended" or "Revoked"?

Should scanning be logged?

Should the certificate be downloadable as PDF?

Is physical printing required?

Is there an existing certificate design?

10. Scale and infrastructure

Don't simply accept "thousands of concurrent learners."

Ask for numbers:

Expected registered users at launch?

Year 1?

Five-year target?

Expected candidates online simultaneously?

Expected candidates taking exams simultaneously?

Number of organizations?

Number of courses?

Number of examinations per month?

Number of certificates generated annually?

Expected video storage?

Expected geographic coverage?

Is Nigeria-only data hosting required?

Is there a preferred cloud provider?

Is government/private-cloud/on-premise deployment expected?

Required uptime?

Disaster-recovery expectations?

11. Administration and reporting

This is often forgotten in initial specifications.

What should the super-admin dashboard show?

What should tenant administrators see?

Candidate enrollment numbers?

Course completion?

Pass/fail rates?

Examination attempts?

Certificates issued?

UPNs issued?

Suspended/revoked permits?

Geographic reporting?

Organization performance?

Revenue/payment reporting?

Export to Excel/PDF?

Scheduled reports?

Regulator dashboard?

Audit dashboard?

Ask:

"What are the five numbers management would want to see every morning when they log in?"

Excellent way to discover dashboard requirements.

12. Payments and commercial operations

Their document doesn't mention this, but ask now.

Is enrollment paid?

Are courses paid?

Are examinations paid?

Is certification paid?

Is UPN issuance paid?

Are renewals paid?

Does each tenant pay subscription/licensing fees?

Individual or corporate billing?

Paystack/bank transfer/card?

Invoices and receipts?

Refund rules?

Who receives the money?

Does revenue need to be split between organizations?

This could become a major platform subsystem.

13. Integrations

Ask what external systems must connect to this platform:

NIMC/NIN?

Payment gateway?

Government databases?

Existing HR systems?

Existing security-company databases?

SMS?

Email?

WhatsApp?

Biometrics provider?

Existing LMS?

Certificate authority?

Accounting systems?

Also ask whether they require APIs so other systems can verify a UPN without using the website.

14. Ownership, security and compliance

These questions protect both sides.

Who owns candidate data?

Who owns course content?

Who owns the question bank?

Who owns generated questions?

Who owns the source code?

Who is permitted to access candidate information?

Required data-retention period?

What happens when a candidate requests account/data deletion?

Are there specific regulatory/security standards they expect?

Who approves production security requirements?

Do they require penetration testing before launch?

Do they require complete audit trails of administrator actions?

15. Finish with commercial and delivery questions

Don't leave the meeting without these answers.

Is there a target launch date?

Why that date?

Is there an event/regulatory deadline driving it?

What absolutely must exist on Day 1?

What can wait for Phase 2?

Do they have an approved budget range?

Who approves the project?

Who signs off technical requirements?

Who signs off learning content?

Who approves examination questions?

Who approves UPN issuance rules?

Who will be Floodgate's primary contact?

Do they expect Floodgate to operate/support the platform after launch?

What SLA/support level is expected?

And my final question would be:

"If we could only deliver five capabilities for the first production release, which five would make the project successful for you?"

That forces them to reveal the real MVP.

One important discipline for your team: don't quote the project during this first meeting unless the requirements are already much clearer than what they've sent. The difference between an LMS with automated quizzes and a nationwide multi-tenant training + biometric proctoring + regulatory permit infrastructure could be enormous in both cost and engineering effort.

I would have one person lead the conversation and another take structured notes against these categories, especially marking every answer as Confirmed / To Be Confirmed / Client to Provide / Floodgate to Propose. That will make the post-meeting SRS and commercial proposal much stronger.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ffe67507-4a2a-4e75-8fc3-af301969dda0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
