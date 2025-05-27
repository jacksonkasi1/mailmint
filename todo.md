# MailMint - Backend Implementation Task List


## 0 │ Foundation & Repo Bootstrap
- [ ] Create **`services/mailmint-api`** directory in mono-repo
- [ ] Initialise PNPM / Yarn work-space, ESLint, Prettier, Husky, Commitlint
- [ ] Add shared **env** loader (dotenv-expand) + typing
- [ ] Add CI pipeline (Cloud Build YAML) to build & deploy to Cloud Run

---

## 1 │ Data Layer – MongoDB Atlas
- [ ] Design collections & schemas  
  - `users`, `vendors`, `emails`, `documents`, `product_lines`,  
    `verifications`, `verification_steps`, `price_benchmarks`,  
    `security_checks`, `risk_assessments`, `dashboard_metrics`, `change_logs`
- [ ] Implement Mongoose / Zod schema definitions with indices  
  - `emails.email_id` → unique  
  - compound indices on `document.status`, `emails.classification`, etc.
- [ ] Write migration script (`scripts/migrate.ts`) to create indices
- [ ] Implement soft-delete flag (`is_deleted`) on entities that require GDPR purging
- [ ] Create generic base repository with CRUD helpers & transaction support

---

## 2 │ Google Cloud Storage (GCS)
- [ ] Provision bucket **`mailmint-attachments`**
- [ ] Configure signed-URL service account (least privilege)
- [ ] Implement helper (`/lib/gcs.ts`)  
  - `uploadBufferIfOverLimit(buffer, filename, thresholdMB = 10)`
  - `generateReadUrl(path, expiresInSec)`
- [ ] Store GCS object metadata on `emails.attachments[]`

---

## 3 │ Inbound Webhook – Postmark
- [ ] **Route:** `POST /webhooks/postmark/inbound`
- [ ] Verify webhook signature (HMAC)
- [ ] Parse payload → `RawEmail`
- [ ] Idempotency guard (`email_id` uniqueness)
- [ ] Run **Classification Engine**  
  - NLP / Keyword model: FINANCE, PRODUCT_OFFER, QUOTATION, SPAM, OTHER
- [ ] Persist only FINANCE / PRODUCT_OFFER / QUOTATION
- [ ] Extract & save:
  - Vendor (upsert by domain)
  - Document & ProductLines (basic heuristics; full extraction handled later)
- [ ] Attachment handling logic (> 10 MB → off-load to GCS)
- [ ] Respond **200 OK** within < 2 s

---

## 4 │ Manual Verification Trigger
- [ ] **Route:** `POST /verifications` `{ documentId }`
- [ ] Create `verification` + five `verification_step` rows (PENDING)
- [ ] Enqueue job to **Upstash Queues** (`verification:start`)
- [ ] Return 202 with polling URL `/verifications/{id}`

---

## 5 │ Upstash Workflow (Critical Path)
### Worker: `verification-worker.ts`
- [ ] **Step 1 – Data Extraction**  
  - Parse e-mail/attachments → enrich missing fields in `documents`, `product_lines`
  - Update `verification_steps[0] = COMPLETED`
- [ ] **Step 2 – Perplexity AI Price Benchmark**  
  - POST to Perplexity → receive best prices + links
  - Insert `price_benchmarks`
  - Compute `market_avg_price` & `delta_pct`
  - Update `verification_steps[1]`
- [ ] **Step 3 – Security / Spoof Check**  
  - Run SPF, DKIM, DMARC validators
  - Detect spoof → write `security_checks`
  - If `spoof_detected = true` → flag document
  - Update `verification_steps[2]`
- [ ] **Step 4 – Risk Assessment**  
  - Calculate `risk_score` (LOW/MED/HIGH)
  - Generate `recommended_actions[]` with emoji bullets
  - Insert `risk_assessments`
  - Update `verification_steps[3]`
- [ ] **Step 5 – Finalise**  
  - Determine `document.status` (VERIFIED, WARNING, FLAGGED, FAILED)
  - Update `verification.overall_status`
  - Append entries to `change_logs`
  - Update `verification_steps[4]`
- [ ] Push progress events to Firestore-/PubSub for real-time UI

---

## 6 │ REST API Endpoints
- [ ] `GET /emails`            → paginate & filter
- [ ] `GET /documents/{id}`    → details incl. price benchmarks
- [ ] `GET /verifications/{id}`→ full timeline (steps, assessments)
- [ ] `PATCH /documents/{id}/status` (admin soft-delete, restore)
- [ ] `GET /metrics/dashboard` → totals & trend data
- [ ] Secure all endpoints with Firebase Auth (Bearer token)

---

## 7 │ Business Rules & Helpers
- [ ] Currency normalisation util (`convertToBase(amount, currency)`)
- [ ] Delta calculation util (`calcDeltaPct(offer, marketAvg)`)
- [ ] State-machine guard – throw on invalid status transitions
- [ ] Audit trail writer (`logChange(entity, field, old, new, userId)`)

---

## 8 │ Security & Observability
- [ ] Input validation (zod) on every route
- [ ] Centralised error middleware (Problem Details JSON)
- [ ] Rate limiting on `/webhooks` (Cloud Armor / Cloud Run)
- [ ] Structured logging (pino + Stackdriver)
- [ ] Metrics exporter (OpenTelemetry → Cloud Monitoring)
- [ ] Alerting policy for worker failures & queue dead-letters
