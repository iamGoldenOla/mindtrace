# SECURITY.md: Security, privacy and child safeguarding

MINDTRACE concerns children's learning. The repository is **public** (hackathon rule). Treat this file as the highest-priority document in the project.

## 1. Data rules

1. **Synthetic data only** in the repository, tests, screenshots, demo and public deployment. No real children, no real school names, no real photos or voices of children.
2. **Minimise.** Collect only what an educational purpose needs. No medical records, diagnoses, home addresses, phone numbers, or government IDs. A learner has an internal `code` and an optional pseudonym.
3. **Diagnosis field is out of scope.** If a user already has a professional report, they may record only "a professional assessment exists" as a teacher-reported note. Never store diagnostic labels as structured data or send them to a model.
4. **No audio retention.** Speech is sent to Muse Voice Transcribe, the transcript is kept, and the audio buffer is discarded immediately. Audio is never written to disk, storage, logs, or analytics.
5. **Pseudonymous prompts.** Model prompts contain learner `code`, stage, language and evidence only. Never names, schools, contact details or free-text fields that might contain them without a scrubbing step (`lib/ai/scrub.ts`).
6. **Retention and deletion.** A teacher can delete a learner and all linked records. Deletion cascades and writes an audit event with no personal content. Public demo data is reset nightly.

## 2. Model provider rules

1. Use `muse-spark-1.3` (the non-contributor variant). **Never** use a `-contributor` model with learner data, because Meta states those are used to improve its products. The provider layer enforces an allowlist and rejects model names ending in `-contributor`.
2. Check Meta's current terms and data-use policy before any non-synthetic data is ever sent. For the hackathon, only synthetic data is sent.
3. Model keys live in server environment variables only. Never in client bundles, logs, error messages, or the repository.
4. Rate-limit AI routes per user. Set provider spend alerts.
5. Log AI runs (model, prompt version, latency, token counts, status, input hash). Do not log raw prompts or transcripts containing learner content.

## 3. Authentication and authorisation

- Supabase Auth. Sessions are httpOnly cookies. No tokens in `localStorage`.
- Roles: `teacher`, `parent`, `specialist`, `admin`. For the demo, `teacher` is fully built; others are read-limited.
- **Row-level security is enabled on every table** (see `DATABASE.md`). Access is granted through `learner_access`, never by role alone. Administrators do not automatically see learner records.
- Authorisation is enforced in the database and re-checked in API routes. Hidden buttons are not security.
- All write routes validate input with a schema (zod) and reject unknown fields.
- Audit events for: learner create/delete, report generation, report review, access grants, exports.

## 4. Application security checklist

- [ ] Secrets only in env vars; `.env.example` has names with no values; `.env*` is git-ignored.
- [ ] A secret-scanning check runs before every push (e.g. gitleaks) and on CI.
- [ ] Security headers: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'`, HSTS.
- [ ] CSRF protection on cookie-authenticated mutations (same-site cookies plus origin check).
- [ ] No raw SQL built from user input. Use parameterised queries or the Supabase client.
- [ ] Output encoding: render AI text as text, never as HTML. No `dangerouslySetInnerHTML` on model output.
- [ ] Dependency audit (`npm audit`) reviewed before submission; lockfile committed.
- [ ] Error responses never reveal stack traces, SQL, keys, or learner content.
- [ ] Uploaded content: none accepted in v1.

## 5. Prompt injection and untrusted input

Teacher notes, parent notes, transcripts, and resource text are **untrusted data**. They are passed to the model inside clearly delimited data blocks and never treated as instructions. The agent's tool set is narrow and server-validated:

- Tools can only read evidence for the learner already authorised for the session.
- Tools cannot send email, change access, delete data, or call external URLs.
- Any tool argument that references an ID is checked against the authorised learner in server code.
- Model output is validated against a schema and a verifier pass before it is stored or shown.

## 6. Child safeguarding and content safety

- The platform is used by adults. Learner-facing activities are shown to a child **with a supervising adult**; there is no learner login in v1.
- No chat with children. No open-ended model output is ever shown to a learner. Learner-facing text is drawn from reviewed templates or from model output that passed a schema and a safety check, and the teacher approves follow-up tasks first.
- Generated images (Muse Image) are reviewed by the teacher before use and must not depict real people.
- Language in reports is respectful and non-stigmatising (see `AI_SPEC.md`).
- If a teacher note describes a safeguarding concern (harm, abuse, danger), the product shows a plain notice to follow their organisation's safeguarding procedure and does not attempt to assess it.

## 7. Privacy-law posture

MINDTRACE is designed around data minimisation, purpose limitation, consent, access control, and deletion, which are common to GDPR (EU/UK), COPPA and FERPA (US), the NDPA (Nigeria) and similar laws. **The hackathon build does not claim compliance with any specific law.** The README and the demo must say so. Any real deployment needs a legal review, a data-protection impact assessment, and consent processes in each jurisdiction.

## 8. Incident handling

If a secret is committed: revoke it immediately, rotate, then clean history. If synthetic data is found to contain real personal data: delete, rotate, document. Security reports: open a private advisory on the repository or contact the maintainer listed in the README.

## 9. What not to claim

MINDTRACE is not a validated screening instrument. Do not describe any score as a risk probability or a clinical result. Do not state that the product is "compliant", "certified" or "clinically validated".
