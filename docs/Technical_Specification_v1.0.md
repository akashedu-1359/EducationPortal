# Educational Web Platform
## Technical Specification Document

**Version:** 1.0
**Date:** February 2026
**Prepared By:** Solution Architecture Team
**Document Type:** Engineering Specification — Internal Development Use
**Status:** Draft for Engineering Review

---

> **Scope:** This document defines the complete system architecture, module design, data model, API contracts, security model, and implementation plan for the Educational Web Platform. It is intended for backend engineers, frontend engineers, DevOps engineers, and technical leads.

---

## Table of Contents

| # | Section |
|---|---------|
| 1 | System Overview |
| 2 | Architecture Style |
| 3 | Module Breakdown |
| 4 | Detailed Functional Requirements |
| 5 | Non-Functional Requirements |
| 6 | RBAC Design |
| 7 | Authentication Flow — JWT + Social Login |
| 8 | CMS Architecture Design |
| 9 | Payment Flow Architecture |
| 10 | Exam Engine Logic |
| 11 | Certificate Generation Flow |
| 12 | High-Level Architecture — Textual Diagram |
| 13 | Database Design |
| 14 | API Structure — Grouped Endpoints |
| 15 | Folder Structure — Backend + Frontend |
| 16 | Environment Strategy |
| 17 | Deployment Strategy |
| 18 | Logging & Monitoring Strategy |
| 19 | Security Considerations |
| 20 | Performance Considerations |
| 21 | Scalability Considerations |
| 22 | Risk Analysis |
| 23 | Phase-wise Development Plan |
| 24 | Development Complexity Analysis |
| 25 | Future Enhancement Architecture Readiness |

---

---

## 1. System Overview

### 1.1 Platform Description

The Educational Web Platform is a full-stack web application that provides:

- A **multi-role administrative backend** for managing educational content, users, exams, certificates, pricing, and CMS-controlled website content.
- A **student-facing portal** supporting browsing, purchasing, video consumption, PDF access, exam-taking, and certificate download.
- A **database-driven CMS layer** allowing real-time, code-free updates to all public-facing website content.
- An **automated exam engine** with server-enforced timing, auto-evaluation, and conditional certificate generation.
- A **payment-ready e-commerce layer** supporting free and paid content with gateway abstraction for Stripe and Razorpay.

### 1.2 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js (React framework) | SSR, SSG, ISR support; optimal for CMS-driven pages; SEO-ready |
| **Backend** | .NET 8 (LTS) — ASP.NET Core Web API | Mature, high-performance, strong typing, EF Core ORM |
| **Database** | PostgreSQL 16 | Open-source, ACID-compliant, JSON support, excellent with EF Core |
| **Cache** | Redis | CMS content caching, session caching, rate limiting |
| **Object Storage** | AWS S3 (or compatible) | Video files, PDF documents, certificate PDFs, promotional images |
| **Auth** | JWT (access + refresh) + Google OAuth 2.0 | Stateless, scalable, industry standard |
| **PDF Generation** | QuestPDF (.NET library) | Open-source, code-first PDF generation for certificates |
| **Email** | SMTP / SendGrid | Transactional emails (welcome, purchase receipts, password reset) |
| **Reverse Proxy** | Nginx | SSL termination, request routing, static asset serving |
| **Containerization** | Docker + Docker Compose | Consistent environments across Dev, QA, Prod |

### 1.3 High-Level System Boundaries

```
External Users → CDN/Nginx → Next.js Frontend → ASP.NET Core API → PostgreSQL
                                                              ↘→ Redis Cache
                                                              ↘→ AWS S3
                                                              ↘→ Payment Gateway
                                                              ↘→ Email Service
```

---

## 2. Architecture Style

### 2.1 Clean Architecture

The backend follows **Clean Architecture** (also known as Onion Architecture), enforcing strict dependency rules:

```
┌─────────────────────────────────────────────────────┐
│                    API Layer                        │  ← Controllers, Middleware, Filters
│              (EducationPortal.API)                  │
├─────────────────────────────────────────────────────┤
│               Application Layer                     │  ← Use Cases, Commands, Queries, DTOs
│           (EducationPortal.Application)             │     MediatR Handlers, Validators
├─────────────────────────────────────────────────────┤
│                 Domain Layer                        │  ← Entities, Domain Events, Enums
│             (EducationPortal.Domain)                │     Business Rules, Interfaces
├─────────────────────────────────────────────────────┤
│              Infrastructure Layer                   │  ← EF Core, Repositories, S3 Client
│           (EducationPortal.Infrastructure)          │     Redis Client, Email, PDF Generator
└─────────────────────────────────────────────────────┘
```

**Dependency Rule:** Inner layers have zero knowledge of outer layers. All dependencies point inward toward the Domain.

### 2.2 Patterns Applied

| Pattern | Usage |
|---------|-------|
| **CQRS** | Commands (writes) and Queries (reads) are separated via MediatR |
| **Repository Pattern** | All data access abstracted through repository interfaces |
| **Mediator Pattern** | MediatR decouples API controllers from business logic handlers |
| **Options Pattern** | Configuration values injected via strongly typed options classes |
| **Result Pattern** | All service/handler returns use a Result<T> type to avoid exceptions in business flow |
| **Unit of Work** | Wraps EF Core DbContext for transactional consistency |
| **Domain Events** | Internal events fired on exam pass (triggers certificate generation) |

### 2.3 Frontend Architecture

Next.js with the **App Router** (Next.js 14+):

- **Server Components** — Used for CMS-driven pages (About, FAQ, Homepage sections) for SSR performance.
- **Client Components** — Used for interactive elements (video player, exam interface, payment flow).
- **Incremental Static Regeneration (ISR)** — Used for public CMS pages; revalidated on cache purge signal from API.
- **API Routes (Next.js)** — Used for BFF (Backend for Frontend) patterns where needed.
- **State Management** — Zustand or React Context for lightweight client-side state (auth token, cart).

---

## 3. Module Breakdown

### 3.1 Admin Module

Responsible for all back-office operations. Access is restricted to authenticated users with Admin-tier roles.

**Sub-modules:**
- Authentication & Session Management
- User Management (view, activate, deactivate students)
- Role & Permission Management
- Content Management (CRUD for Resources)
- Category Management
- Exam Management (create, schedule, manage questions)
- CMS Management (all CMS entities)
- Payment & Transaction Reporting
- Analytics & Dashboard
- Certificate Management (view issued certificates)
- Feature Flag Management
- Settings & Configuration

### 3.2 User Module

Responsible for the student-facing portal. Access controlled by authentication state and content entitlement.

**Sub-modules:**
- Authentication (register, login, Google OAuth, refresh)
- Profile Management
- Content Discovery & Browsing
- Content Access (video streaming proxy, PDF download)
- Enrollment & Purchase
- Exam Participation
- Result Viewing
- Certificate Download
- Dashboard (personal activity overview)

### 3.3 CMS Module

A dedicated module for dynamic website content management. All entities are managed exclusively by Admin roles and consumed publicly (or by authenticated users) through the User Portal.

**Sub-modules:**
- Banner Management
- Page Content Management (static pages)
- Section Visibility Management
- FAQ Management
- Footer Content Management
- Category Display Management
- Promotional Content
- Feature Flag Management
- Global Settings Key-Value Store
- Cache Invalidation Trigger

---

## 4. Detailed Functional Requirements

### 4.1 Authentication & Authorization

| ID | Requirement |
|----|-------------|
| AUTH-01 | The system shall authenticate users via email/password with bcrypt-hashed passwords. |
| AUTH-02 | The system shall issue a short-lived JWT access token (15 minutes expiry) and a long-lived refresh token (7 days, httpOnly cookie). |
| AUTH-03 | The system shall support Google OAuth 2.0 for social login. On first Google login, a new user record is created. On subsequent logins, the existing record is retrieved. |
| AUTH-04 | Access tokens shall be stored in memory (JavaScript variable) on the frontend, never in localStorage. |
| AUTH-05 | Refresh tokens shall be stored in httpOnly, Secure, SameSite=Strict cookies only. |
| AUTH-06 | The system shall support token refresh via a dedicated endpoint that accepts a valid refresh token cookie. |
| AUTH-07 | Logout shall revoke the refresh token (stored revocation list in Redis with TTL matching token expiry). |
| AUTH-08 | Failed login attempts shall be rate-limited (5 attempts per IP per 15 minutes). |

### 4.2 Admin — Content Management

| ID | Requirement |
|----|-------------|
| CONT-01 | Admin shall upload video files to AWS S3 via pre-signed URL upload flow. |
| CONT-02 | Admin shall embed a video from an external URL (YouTube, Vimeo) as an alternative to direct upload. |
| CONT-03 | Admin shall upload PDF files to AWS S3. |
| CONT-04 | Admin shall create, edit, publish, and unpublish blog posts with rich-text content. |
| CONT-05 | Each resource shall have a ResourceType enum: VIDEO, PDF, BLOG. |
| CONT-06 | Each resource shall have a Price field (decimal). Price = 0 means free. Price > 0 means paid. |
| CONT-07 | Each resource shall have a Status field: DRAFT, PUBLISHED, UNPUBLISHED. |
| CONT-08 | Resources shall be associated with one or more Categories. |
| CONT-09 | Admin shall edit any field of a resource post-creation. |
| CONT-10 | Admin shall permanently delete a resource (soft delete preferred — IsDeleted flag). |
| CONT-11 | Admin shall set a resource as Featured. |
| CONT-12 | Resource list in Admin shall support pagination, search, and filter by type/status/category. |

### 4.3 Admin — Exam Management

| ID | Requirement |
|----|-------------|
| EXAM-01 | Admin shall create an Exam with: Title, Description, Duration (minutes), PassingPercentage, ScheduledStartAt, ScheduledEndAt. |
| EXAM-02 | Admin shall add multiple-choice questions to an Exam. Each question has: QuestionText, 4 OptionTexts, CorrectOptionIndex. |
| EXAM-03 | Admin shall edit or delete questions before the exam goes live. |
| EXAM-04 | Admin shall publish or unpublish an exam. |
| EXAM-05 | Exam status shall auto-transition: SCHEDULED → ACTIVE (at ScheduledStartAt) → CLOSED (at ScheduledEndAt). |
| EXAM-06 | Admin shall view all exam attempts (user, score, pass/fail, timestamp). |

### 4.4 CMS Management

| ID | Requirement |
|----|-------------|
| CMS-01 | Admin shall update homepage banner (image URL, headline, subheadline, CTA button text and link). |
| CMS-02 | Admin shall edit content of static pages: About Us, Contact Us, Privacy Policy, Terms & Conditions. |
| CMS-03 | Admin shall manage FAQ entries (create, update, delete, reorder). |
| CMS-04 | Admin shall manage footer content (company text, columns, links, social links, copyright). |
| CMS-05 | Admin shall toggle section visibility (boolean flags per section key). |
| CMS-06 | Admin shall manage CmsSettings as a key-value store for global configuration. |
| CMS-07 | Admin shall upload promotional banners with start/end display dates. |
| CMS-08 | Admin shall manage Feature Flags to enable/disable platform features. |
| CMS-09 | All CMS save actions shall trigger a cache invalidation for the affected CMS keys in Redis. |
| CMS-10 | CMS changes shall be immediately reflected on the Student Portal without code deployment. |

### 4.5 User — Content Access

| ID | Requirement |
|----|-------------|
| USER-01 | Unauthenticated users shall be able to browse content listings and read blog posts. |
| USER-02 | Free resources shall be accessible to all authenticated users without payment. |
| USER-03 | Paid resources shall require a valid Enrollment record (created post-payment) to access. |
| USER-04 | Video playback shall be served via a time-limited pre-signed S3 URL (or proxied stream), not a direct public URL. |
| USER-05 | PDF downloads shall be served via a time-limited pre-signed S3 URL for enrolled/eligible users only. |
| USER-06 | Users shall be able to enroll in free content without a payment step (auto-enrollment on access). |

### 4.6 User — Exam & Certificate

| ID | Requirement |
|----|-------------|
| UEXAM-01 | Users shall see available exams on their dashboard. |
| UEXAM-02 | User can start an exam only once per exam cycle (configurable: allow retry or not). |
| UEXAM-03 | On exam start, an ExamAttempt record is created with StartedAt timestamp. |
| UEXAM-04 | Questions shall be presented in a randomized order per attempt. |
| UEXAM-05 | Server shall validate that submission occurs within the allowed time window. |
| UEXAM-06 | On submission (or timeout), all answers are evaluated server-side. |
| UEXAM-07 | Score = (CorrectAnswers / TotalQuestions) * 100. Pass if Score >= PassingPercentage. |
| UEXAM-08 | ExamAttempt record is updated with: Score, IsPassed, CompletedAt, all Answers. |
| UEXAM-09 | If IsPassed = true, a Certificate record is created and PDF generation is triggered asynchronously. |
| UEXAM-10 | Certificate PDF is stored in S3 and the URL stored in the Certificate record. |
| UEXAM-11 | User can download certificate via a pre-signed S3 URL from their dashboard. |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Target |
|--------|--------|
| API response time (p95) | < 300ms for non-file endpoints |
| CMS page load (SSR/ISR) | < 1.5s Time to First Byte |
| Concurrent users (launch) | 500 simultaneous active users |
| Video streaming | Delegated to S3 pre-signed URLs (CDN-accelerated) |
| Database query time (p95) | < 100ms with proper indexing |

### 5.2 Availability

| Metric | Target |
|--------|--------|
| Uptime SLA | 99.5% (excluding planned maintenance) |
| Planned maintenance | Off-peak hours with advance notification |
| Database backups | Daily automated backups, 30-day retention |

### 5.3 Security

- OWASP Top 10 compliance.
- All traffic over HTTPS (TLS 1.2 minimum).
- No PII logged in plaintext.
- Secrets managed via environment variables and secret managers (never in source code).

### 5.4 Maintainability

- Code test coverage: > 70% for Application layer (unit tests).
- All API endpoints documented via Swagger/OpenAPI 3.0.
- All database migrations version-controlled via EF Core migrations.
- Strict linting and code style enforcement (ESLint for frontend, EditorConfig + Roslyn Analyzers for backend).

### 5.5 Accessibility

- WCAG 2.1 AA compliance for key user-facing pages.
- Semantic HTML, ARIA labels on interactive elements.

---

## 6. RBAC Design

### 6.1 Role Hierarchy

```
SuperAdmin
    └── Admin
          └── ContentManager
          └── ExamManager
          └── Analyst
User (student-tier — separate role domain)
```

### 6.2 Role-Permission Matrix

| Permission | SuperAdmin | Admin | ContentManager | ExamManager | Analyst | User |
|------------|:---:|:---:|:---:|:---:|:---:|:---:|
| Manage Roles & Users | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| CRUD Resources (content) | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| CRUD Exams & Questions | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Manage CMS | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Analytics Dashboard | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| View Transaction Reports | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Manage Feature Flags | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Access Student Portal | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Enroll in Content | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Attempt Exams | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Download Certificates | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

### 6.3 Implementation

- Roles and permissions stored in the database (`Roles`, `Permissions`, `RolePermissions` tables).
- ASP.NET Core **Policy-Based Authorization** used (not role-string checks in controllers).
- Custom `IAuthorizationRequirement` and handlers defined per policy.
- JWT claims include `role` and `permissions[]` claims populated at token issuance.
- Middleware validates token and populates `ClaimsPrincipal` before hitting any controller.

### 6.4 Admin vs User Separation

Admin and User are treated as fundamentally separate identity domains. Admin users cannot access the User portal API endpoints and vice versa. This is enforced at the policy level. A separate admin login endpoint issues tokens with admin-domain claims.

---

## 7. Authentication Flow

### 7.1 Email/Password Login Flow

```
Client                          API                              DB / Redis
  │                               │                                  │
  │── POST /auth/login ──────────►│                                  │
  │   { email, password }         │── SELECT user WHERE email ──────►│
  │                               │◄── User record ─────────────────│
  │                               │── Verify bcrypt hash             │
  │                               │── Generate AccessToken (JWT, 15m)│
  │                               │── Generate RefreshToken (GUID)   │
  │                               │── Store RefreshToken in DB ─────►│
  │◄── 200 OK ───────────────────│                                  │
  │    { accessToken }            │                                  │
  │    Set-Cookie: refreshToken   │                                  │
```

### 7.2 Token Refresh Flow

```
Client                          API                              DB / Redis
  │                               │                                  │
  │── POST /auth/refresh ────────►│                                  │
  │   (Cookie: refreshToken)      │── Validate RefreshToken ────────►│
  │                               │── Check not revoked in Redis ───►│
  │                               │── Generate new AccessToken       │
  │                               │── Rotate RefreshToken            │
  │◄── 200 OK ───────────────────│                                  │
  │    { newAccessToken }         │                                  │
  │    Set-Cookie: newRefreshToken│                                  │
```

### 7.3 Google OAuth 2.0 Flow

```
Client                          API                         Google OAuth
  │                               │                               │
  │── GET /auth/google/redirect ─►│── Redirect to Google ────────►│
  │                               │                               │── User authenticates
  │                               │◄── Authorization Code ───────│
  │                               │── Exchange code for tokens ──►│
  │                               │◄── id_token + access_token ──│
  │                               │── Verify id_token             │
  │                               │── Extract: email, name, picture│
  │                               │── Upsert User in DB            │
  │                               │── Issue internal JWT + Refresh │
  │◄── Redirect to frontend ─────│                               │
  │    with AccessToken in fragment│                              │
```

### 7.4 JWT Token Structure

**Access Token Claims:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "Admin",
  "permissions": ["content:write", "cms:manage"],
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Signing:** HS256 with a 256-bit secret (RS256 for production with key rotation).

---

## 8. CMS Architecture Design

### 8.1 Design Philosophy

The CMS is **database-driven**, not file-driven. All website content that changes frequently is stored in PostgreSQL CMS tables. The frontend fetches CMS data via API at render time, with Redis caching to prevent repeated database round-trips.

This enables:
- Real-time updates without code deployment.
- Admin control over all public-facing content.
- Consistent rendering across all frontend rendering modes (SSR, ISR, CSR).

### 8.2 CMS Data Flow

```
Admin saves CMS change
        │
        ▼
API writes to PostgreSQL CMS table
        │
        ▼
API calls Redis cache invalidation for affected cache key(s)
        │
        ▼
Next.js frontend makes request for CMS content
        │
        ▼
API checks Redis cache for key
        │
   [Cache HIT] ─────────────────► Return cached data (fast)
        │
   [Cache MISS]
        │
        ▼
API queries PostgreSQL for CMS content
        │
        ▼
Result stored in Redis (TTL: 1 hour by default)
        │
        ▼
Data returned to frontend
        │
        ▼
Next.js renders content dynamically — visible to all visitors
```

### 8.3 Cache Invalidation Strategy

When Admin saves a CMS entity, the API:
1. Persists the change to PostgreSQL.
2. Identifies all Redis keys affected by this entity type (keyed by entity type + optional ID).
3. Issues `DEL` or `UNLINK` commands to Redis for those keys.
4. Next request from the frontend will trigger a fresh DB read and re-cache.

**Cache Key Naming Convention:**
```
cms:banner:homepage
cms:page:about-us
cms:page:privacy-policy
cms:faqs:all
cms:footer
cms:settings:global
cms:sections:visibility
cms:features:flags
cms:banners:promotional:active
```

For Next.js ISR pages (statically generated at build time), the API also calls Next.js `revalidatePath()` or `revalidateTag()` via an internal webhook on CMS update. This forces Next.js to re-generate the affected static page on the next request.

### 8.4 CMS Rendering in Next.js

**Public CMS Pages (About Us, Privacy Policy, FAQ):**
- Rendered as Server Components with ISR (`revalidate: 3600` or tag-based revalidation).
- On CMS save → API triggers `revalidateTag('cms-static-pages')` via Next.js revalidation API.
- Next request regenerates the static page with fresh data.

**Homepage Banners & Sections:**
- Server Component fetching CMS API on every request (dynamic rendering with Redis cache ensuring sub-100ms API response).

**Feature Flags:**
- Fetched at request time from CMS API.
- Conditionally render/hide UI sections based on flag values.

### 8.5 Content Versioning (Optional — Phase 2+)

A `CmsContentVersions` table tracks prior versions of any CMS entity:
- Each save creates a new version row.
- Admin can view version history and roll back to a previous version.
- Maximum 10 versions retained per entity key (older versions pruned).

### 8.6 CMS Key-Value Settings Store

A `CmsSettings` table stores arbitrary configuration as key-value pairs:

```
key                     | value
------------------------|-----------------------------
site_name               | "XYZ Learning Academy"
support_email           | "support@xyz.com"
default_currency        | "INR"
exam_retry_allowed      | "true"
max_exam_retries        | "3"
certificate_issuer_name | "XYZ Academy of Excellence"
```

Consumed by both the API (for runtime configuration) and the frontend (for display-level settings).

---

## 9. Payment Flow Architecture

### 9.1 Gateway Abstraction Layer

A `IPaymentGateway` interface in the Application layer decouples the business logic from the specific gateway implementation. Concrete implementations exist for `StripePaymentGateway` and `RazorpayPaymentGateway` in the Infrastructure layer. The active gateway is selected via configuration.

### 9.2 Payment Flow (Stripe Example)

```
User clicks "Buy Now" for ResourceId
           │
           ▼
POST /api/payments/initiate
  { resourceId }
           │
           ▼
API validates user + resource + price
           │
           ▼
API creates Stripe Payment Intent
  (amount, currency, metadata: {userId, resourceId})
           │
           ▼
Returns { clientSecret } to frontend
           │
           ▼
Frontend renders Stripe Elements UI
           │
           ▼
User enters card details → Stripe SDK submits to Stripe servers
           │
           ▼
Stripe confirms payment → calls webhook endpoint
           │
           ▼
POST /api/webhooks/stripe (verified signature)
           │
           ▼
API verifies Stripe signature
           │
           ▼
Creates Order record (Status: COMPLETED)
Creates Enrollment record for user + resource
           │
           ▼
User redirected to content — access is now authorized
```

### 9.3 Webhook Security

- Stripe webhooks validated using `Stripe-Signature` header and webhook secret.
- Razorpay webhooks validated using `X-Razorpay-Signature` HMAC verification.
- Idempotency: webhook event IDs are stored and checked to prevent duplicate processing.

### 9.4 Free Content Enrollment

For resources with Price = 0:
- No payment flow is initiated.
- On first access attempt, an Enrollment record is auto-created for the user.
- Subsequent access checks the Enrollment record.

### 9.5 Payment Data Storage

- No raw card data is ever stored on the platform (PCI DSS compliance delegated to Stripe/Razorpay).
- `Orders` table stores: OrderId, UserId, ResourceId, Amount, Currency, GatewayTransactionId, Status, CreatedAt.
- `Enrollments` table stores: UserId, ResourceId, EnrolledAt, OrderId (nullable for free).

---

## 10. Exam Engine Logic

### 10.1 Exam Lifecycle States

```
DRAFT → PUBLISHED → SCHEDULED → ACTIVE → CLOSED → ARCHIVED
```

- `DRAFT`: Being built by admin, not visible to users.
- `PUBLISHED`: Admin marked as ready, scheduled start time assigned.
- `SCHEDULED`: Visible to users but not yet startable.
- `ACTIVE`: Start time reached — users can begin attempts.
- `CLOSED`: End time reached — no new attempts accepted.
- `ARCHIVED`: Manually archived by admin.

A background service (Hosted Service / Quartz.NET job) transitions exams from `SCHEDULED → ACTIVE` and `ACTIVE → CLOSED` at the correct times.

### 10.2 Attempt Creation

When a user starts an exam:
1. API validates: exam is ACTIVE, user has not exceeded max attempts.
2. Creates `ExamAttempt` record: `{ UserId, ExamId, StartedAt: utcNow, Status: IN_PROGRESS }`.
3. Returns shuffled questions (without CorrectOptionIndex — never sent to client).
4. Returns `AttemptId` and `ServerDeadline` (StartedAt + DurationMinutes).

### 10.3 Answer Submission & Evaluation

On submit (or triggered by server deadline via background check):
1. API receives `{ attemptId, answers: [{questionId, selectedOptionIndex}] }`.
2. Validates submission is within `ServerDeadline` (rejecting late submissions beyond a 30-second grace period).
3. For each answer: compares `selectedOptionIndex` with `CorrectOptionIndex` from DB.
4. Calculates: `Score = (correctCount / totalQuestions) * 100`.
5. Sets `IsPassed = Score >= exam.PassingPercentage`.
6. Saves: all answers, score, isPassed, `CompletedAt = utcNow`.
7. If `IsPassed = true`: publishes a `ExamPassedDomainEvent`.
8. The domain event handler triggers asynchronous certificate generation.

### 10.4 Anti-Cheat Considerations

- Questions are shuffled server-side per attempt (different order for each student).
- Correct answer indices are never included in API responses.
- Server enforces the time deadline independently of client-side timer.
- Tab-visibility changes can be tracked on the frontend and flagged (optional configuration).

### 10.5 Retry Logic

Controlled by `CmsSettings`:
- `exam_retry_allowed` (bool) — global default.
- `max_exam_retries` (int) — how many additional attempts are allowed.
- Per-exam override possible via `Exam.MaxAttempts` field.

---

## 11. Certificate Generation Flow

### 11.1 Trigger

Certificate generation is triggered asynchronously by the `ExamPassedDomainEvent` published after a successful exam submission evaluation.

### 11.2 Generation Steps

```
ExamPassedDomainEvent published
           │
           ▼
CertificateGenerationHandler picks up event
           │
           ▼
Fetch: User details (name), Exam details (title), CmsSettings (issuer name)
           │
           ▼
Generate unique CertificateId (UUID)
           │
           ▼
Populate PDF template using QuestPDF:
  - Student Full Name
  - Exam Title
  - Issue Date
  - Certificate ID (for verification)
  - Organization Name & Logo
  - Score achieved (optional)
           │
           ▼
Upload PDF bytes to S3:
  Path: certificates/{userId}/{certificateId}.pdf
           │
           ▼
Create Certificate record in DB:
  { CertificateId, UserId, ExamAttemptId, S3Key, IssuedAt }
           │
           ▼
Update ExamAttempt.CertificateId = CertificateId
           │
           ▼
(Optional) Send email notification to user
```

### 11.3 Certificate Download

- User requests download via `GET /api/user/certificates/{certificateId}/download`.
- API validates ownership (certificate.UserId == requestingUserId).
- API generates a time-limited pre-signed S3 URL (5-minute expiry).
- Returns the pre-signed URL.
- Frontend redirects user to the URL for direct browser download.

### 11.4 Certificate Verification (Future)

A public endpoint `GET /api/certificates/verify/{certificateId}` can return certificate metadata for third-party verification without authentication.

---

## 12. High-Level Architecture — Textual Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│                                                                          │
│  ┌─────────────────────────┐    ┌────────────────────────────────────┐  │
│  │   Admin Panel (Next.js) │    │   Student Portal (Next.js)         │  │
│  │  - Server Components    │    │  - SSR / ISR for CMS pages         │  │
│  │  - Protected Routes     │    │  - Client components for video,    │  │
│  │  - Admin API calls      │    │    exam, payment flows             │  │
│  └────────────┬────────────┘    └──────────────┬─────────────────────┘  │
└───────────────┼──────────────────────────────────┼──────────────────────┘
                │ HTTPS                            │ HTTPS
                ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        NGINX REVERSE PROXY                               │
│          (SSL Termination, Load Balancing, Static Assets)                │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌───────────────────┐  ┌───────────────┐  ┌──────────────────────────────┐
│  Next.js Server   │  │ ASP.NET Core  │  │    Background Services       │
│  (Port 3000)      │  │ Web API       │  │  - Exam Status Scheduler     │
│                   │  │ (Port 5000)   │  │  - Certificate Generator     │
│  - Page Rendering │  │               │  │  - Email Dispatcher          │
│  - ISR Handling   │  │  Controllers  │  └──────────────────────────────┘
│  - API Routes     │  │  ↕ MediatR    │
└───────────────────┘  │  ↕ CQRS       │
                       │  ↕ Validators │
                       └───────┬───────┘
                               │
            ┌──────────────────┼──────────────────────┐
            ▼                  ▼                      ▼
┌───────────────────┐  ┌──────────────┐   ┌──────────────────────────────┐
│   PostgreSQL 16   │  │  Redis Cache │   │     External Services        │
│                   │  │              │   │  - AWS S3 (files, certs)     │
│  - Core tables    │  │  - CMS cache │   │  - Stripe / Razorpay         │
│  - CMS tables     │  │  - Token     │   │  - Google OAuth 2.0          │
│  - EF Core ORM    │  │    revocation│   │  - SendGrid (email)          │
└───────────────────┘  │  - Rate limit│   └──────────────────────────────┘
                       └──────────────┘
```

---

## 13. Database Design

### 13.1 Core Tables

#### `Users`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| Email | VARCHAR(255) UNIQUE | User email |
| PasswordHash | TEXT NULLABLE | Null for OAuth-only users |
| FullName | VARCHAR(255) | Display name |
| AvatarUrl | TEXT NULLABLE | Profile picture |
| AuthProvider | ENUM (LOCAL, GOOGLE) | Login provider |
| ExternalProviderId | TEXT NULLABLE | Google sub claim |
| IsActive | BOOL | Account active flag |
| CreatedAt | TIMESTAMPTZ | Record creation time |
| UpdatedAt | TIMESTAMPTZ | Last update time |

#### `Roles`
| Column | Type | Description |
|--------|------|-------------|
| Id | INT PK | Role identifier |
| Name | VARCHAR(50) UNIQUE | Role name |
| Description | TEXT | Role description |

#### `UserRoles`
| Column | Type | Description |
|--------|------|-------------|
| UserId | UUID FK → Users | User reference |
| RoleId | INT FK → Roles | Role reference |

#### `Permissions`
| Column | Type | Description |
|--------|------|-------------|
| Id | INT PK | Permission identifier |
| Key | VARCHAR(100) UNIQUE | e.g., `content:write` |
| Description | TEXT | Human-readable description |

#### `RolePermissions`
| Column | Type | Description |
|--------|------|-------------|
| RoleId | INT FK → Roles | Role reference |
| PermissionId | INT FK → Permissions | Permission reference |

#### `Categories`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| Name | VARCHAR(100) | Category name |
| Slug | VARCHAR(100) UNIQUE | URL-friendly identifier |
| Description | TEXT NULLABLE | Category description |
| IsVisible | BOOL | Display flag |
| SortOrder | INT | Display ordering |
| CreatedAt | TIMESTAMPTZ | Creation time |

#### `Resources`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| Title | VARCHAR(255) | Resource title |
| Description | TEXT | Full description |
| ResourceType | ENUM (VIDEO, PDF, BLOG) | Content type |
| FileKey | TEXT NULLABLE | S3 object key (for video/PDF) |
| ExternalUrl | TEXT NULLABLE | Embed URL (YouTube/Vimeo) |
| BlogContent | TEXT NULLABLE | Rich text for blog type |
| ThumbnailKey | TEXT NULLABLE | S3 thumbnail image key |
| Price | DECIMAL(10,2) | 0 = free |
| Status | ENUM (DRAFT, PUBLISHED, UNPUBLISHED) | Visibility state |
| IsFeatured | BOOL | Featured flag |
| CategoryId | UUID FK → Categories | Category reference |
| CreatedByAdminId | UUID FK → Users | Uploader reference |
| IsDeleted | BOOL | Soft delete flag |
| CreatedAt | TIMESTAMPTZ | Creation time |
| UpdatedAt | TIMESTAMPTZ | Last update time |

#### `Enrollments`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| UserId | UUID FK → Users | User reference |
| ResourceId | UUID FK → Resources | Resource reference |
| OrderId | UUID FK → Orders NULLABLE | Payment reference |
| EnrolledAt | TIMESTAMPTZ | Enrollment time |

#### `Orders`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| UserId | UUID FK → Users | Paying user |
| ResourceId | UUID FK → Resources | Purchased resource |
| Amount | DECIMAL(10,2) | Amount charged |
| Currency | VARCHAR(3) | Currency code (INR, USD) |
| GatewayName | VARCHAR(50) | STRIPE or RAZORPAY |
| GatewayTransactionId | TEXT | Gateway reference |
| GatewayEventId | TEXT UNIQUE | For idempotent webhook processing |
| Status | ENUM (PENDING, COMPLETED, FAILED, REFUNDED) | Order state |
| CreatedAt | TIMESTAMPTZ | Order time |

#### `Exams`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| Title | VARCHAR(255) | Exam title |
| Description | TEXT | Exam description |
| DurationMinutes | INT | Time limit |
| PassingPercentage | DECIMAL(5,2) | e.g., 70.00 |
| MaxAttempts | INT | 0 = unlimited |
| ScheduledStartAt | TIMESTAMPTZ NULLABLE | When exam goes live |
| ScheduledEndAt | TIMESTAMPTZ NULLABLE | When exam closes |
| Status | ENUM (DRAFT, PUBLISHED, SCHEDULED, ACTIVE, CLOSED, ARCHIVED) | Lifecycle state |
| CreatedByAdminId | UUID FK → Users | Creator reference |
| IsDeleted | BOOL | Soft delete |
| CreatedAt | TIMESTAMPTZ | Creation time |

#### `Questions`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| ExamId | UUID FK → Exams | Parent exam |
| QuestionText | TEXT | Question body |
| Option1 | TEXT | Answer option A |
| Option2 | TEXT | Answer option B |
| Option3 | TEXT | Answer option C |
| Option4 | TEXT | Answer option D |
| CorrectOptionIndex | INT | 0-based correct option |
| SortOrder | INT | Display order |

#### `ExamAttempts`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| UserId | UUID FK → Users | Attempting user |
| ExamId | UUID FK → Exams | Exam reference |
| StartedAt | TIMESTAMPTZ | Attempt start time |
| CompletedAt | TIMESTAMPTZ NULLABLE | Submission time |
| Status | ENUM (IN_PROGRESS, COMPLETED, TIMED_OUT, ABANDONED) | Attempt state |
| Score | DECIMAL(5,2) NULLABLE | Score percentage |
| IsPassed | BOOL NULLABLE | Pass/fail |
| CertificateId | UUID NULLABLE | FK → Certificates |

#### `AttemptAnswers`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| ExamAttemptId | UUID FK → ExamAttempts | Parent attempt |
| QuestionId | UUID FK → Questions | Question reference |
| SelectedOptionIndex | INT NULLABLE | Student's answer |
| IsCorrect | BOOL | Evaluated result |

#### `Certificates`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| UserId | UUID FK → Users | Certificate owner |
| ExamAttemptId | UUID FK → ExamAttempts | Issuing attempt |
| S3Key | TEXT | S3 object path for PDF |
| IssuedAt | TIMESTAMPTZ | Issue timestamp |

#### `RefreshTokens`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| UserId | UUID FK → Users | Token owner |
| Token | TEXT UNIQUE | Hashed token value |
| ExpiresAt | TIMESTAMPTZ | Expiry |
| RevokedAt | TIMESTAMPTZ NULLABLE | Revocation timestamp |
| CreatedAt | TIMESTAMPTZ | Issuance time |

### 13.2 CMS Tables

#### `CmsBanners`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| Key | VARCHAR(100) UNIQUE | e.g., `homepage_hero` |
| ImageKey | TEXT | S3 image key |
| Headline | TEXT | Banner headline |
| Subheadline | TEXT NULLABLE | Supporting text |
| CtaText | TEXT NULLABLE | Button label |
| CtaLink | TEXT NULLABLE | Button URL |
| IsActive | BOOL | Visibility flag |
| UpdatedAt | TIMESTAMPTZ | Last modified |
| UpdatedByAdminId | UUID FK → Users | Editor reference |

#### `CmsPages`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| Slug | VARCHAR(100) UNIQUE | e.g., `about-us` |
| Title | VARCHAR(255) | Page title |
| Content | TEXT | Rich text / HTML content |
| MetaTitle | TEXT NULLABLE | SEO title |
| MetaDescription | TEXT NULLABLE | SEO description |
| IsPublished | BOOL | Visibility flag |
| UpdatedAt | TIMESTAMPTZ | Last modified |

#### `CmsFaqs`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| Question | TEXT | FAQ question |
| Answer | TEXT | FAQ answer |
| SortOrder | INT | Display order |
| IsVisible | BOOL | Visibility flag |
| UpdatedAt | TIMESTAMPTZ | Last modified |

#### `CmsFooter`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK (single row) | Singleton |
| CompanyText | TEXT | Description text |
| CopyrightText | TEXT | Footer copyright |
| SocialLinks | JSONB | { platform, url } array |
| Columns | JSONB | Column title + links array |
| UpdatedAt | TIMESTAMPTZ | Last modified |

#### `CmsSections`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| Key | VARCHAR(100) UNIQUE | e.g., `show_testimonials` |
| IsVisible | BOOL | Section visibility |
| Label | VARCHAR(255) | Admin display label |

#### `CmsSettings`
| Column | Type | Description |
|--------|------|-------------|
| Key | VARCHAR(100) PK | Setting key |
| Value | TEXT | Setting value |
| DataType | ENUM (STRING, BOOL, INT, JSON) | For type-safe parsing |
| Description | TEXT NULLABLE | Admin hint |
| UpdatedAt | TIMESTAMPTZ | Last modified |

#### `CmsFeatureFlags`
| Column | Type | Description |
|--------|------|-------------|
| Key | VARCHAR(100) PK | Flag key |
| IsEnabled | BOOL | Feature enabled |
| Description | TEXT NULLABLE | Admin hint |
| UpdatedAt | TIMESTAMPTZ | Last modified |

#### `CmsPromoBanners`
| Column | Type | Description |
|--------|------|-------------|
| Id | UUID PK | Primary key |
| ImageKey | TEXT | S3 image key |
| Title | TEXT NULLABLE | Banner title |
| Link | TEXT NULLABLE | Click destination |
| StartDate | DATE NULLABLE | Display from |
| EndDate | DATE NULLABLE | Display until |
| IsActive | BOOL | Manual enable flag |
| SortOrder | INT | Display order |

### 13.3 Key Relationships

```
Users ──< UserRoles >── Roles ──< RolePermissions >── Permissions
Users ──< Enrollments >── Resources
Users ──< Orders >── Resources
Users ──< ExamAttempts >── Exams
ExamAttempts ──< AttemptAnswers >── Questions
Exams ──< Questions
ExamAttempts ──── Certificates
Users ──< Certificates
Resources >── Categories
```

### 13.4 Indexing Strategy

```
Users:         UNIQUE idx on (Email)
Resources:     idx on (Status, IsDeleted), idx on (CategoryId), idx on (Price)
Enrollments:   UNIQUE idx on (UserId, ResourceId)
ExamAttempts:  idx on (UserId, ExamId), idx on (Status)
Orders:        idx on (UserId), UNIQUE idx on (GatewayEventId)
Certificates:  idx on (UserId), idx on (ExamAttemptId)
CmsSettings:   PK on Key (already indexed)
RefreshTokens: UNIQUE idx on (Token), idx on (UserId, ExpiresAt)
```

---

## 14. API Structure — Grouped Endpoints

All API responses follow a consistent envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "pagination": { "page": 1, "pageSize": 20, "totalCount": 150 }
}
```

### 14.1 Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Email/password registration |
| POST | `/api/auth/login` | None | Email/password login |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | Bearer | Revoke refresh token |
| GET | `/api/auth/google/redirect` | None | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | None | Google OAuth callback |

### 14.2 Admin — User Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users` | Admin | List all users (paginated, filterable) |
| GET | `/api/admin/users/{id}` | Admin | Get user detail |
| PATCH | `/api/admin/users/{id}/activate` | Admin | Activate user |
| PATCH | `/api/admin/users/{id}/deactivate` | Admin | Deactivate user |
| GET | `/api/admin/users/{id}/enrollments` | Admin | User's enrollments |

### 14.3 Admin — Content Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/resources` | Admin | List resources (paginated, filtered) |
| POST | `/api/admin/resources` | Admin | Create resource metadata |
| GET | `/api/admin/resources/{id}` | Admin | Get resource detail |
| PUT | `/api/admin/resources/{id}` | Admin | Update resource |
| DELETE | `/api/admin/resources/{id}` | Admin | Soft delete resource |
| PATCH | `/api/admin/resources/{id}/publish` | Admin | Publish resource |
| PATCH | `/api/admin/resources/{id}/unpublish` | Admin | Unpublish resource |
| POST | `/api/admin/resources/upload-url` | Admin | Get S3 pre-signed upload URL |
| GET | `/api/admin/categories` | Admin | List categories |
| POST | `/api/admin/categories` | Admin | Create category |
| PUT | `/api/admin/categories/{id}` | Admin | Update category |
| DELETE | `/api/admin/categories/{id}` | Admin | Delete category |

### 14.4 Admin — Exam Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/exams` | Admin | List exams |
| POST | `/api/admin/exams` | Admin | Create exam |
| GET | `/api/admin/exams/{id}` | Admin | Get exam detail |
| PUT | `/api/admin/exams/{id}` | Admin | Update exam |
| DELETE | `/api/admin/exams/{id}` | Admin | Soft delete exam |
| PATCH | `/api/admin/exams/{id}/publish` | Admin | Publish exam |
| POST | `/api/admin/exams/{id}/questions` | Admin | Add question to exam |
| PUT | `/api/admin/exams/{id}/questions/{qId}` | Admin | Update question |
| DELETE | `/api/admin/exams/{id}/questions/{qId}` | Admin | Delete question |
| GET | `/api/admin/exams/{id}/attempts` | Admin | View all attempts |

### 14.5 Admin — Analytics & Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/dashboard/summary` | Admin | KPI summary cards |
| GET | `/api/admin/analytics/signups` | Admin | Signup trend data |
| GET | `/api/admin/analytics/revenue` | Admin | Revenue trend data |
| GET | `/api/admin/analytics/content-performance` | Admin | Content view/enroll counts |
| GET | `/api/admin/analytics/exam-stats` | Admin | Exam attempt statistics |
| GET | `/api/admin/transactions` | Admin | All transactions (paginated) |

### 14.6 Admin — CMS Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/cms/banners` | Admin | List all banners |
| PUT | `/api/admin/cms/banners/{key}` | Admin | Update banner by key |
| GET | `/api/admin/cms/pages` | Admin | List CMS pages |
| GET | `/api/admin/cms/pages/{slug}` | Admin | Get page by slug |
| PUT | `/api/admin/cms/pages/{slug}` | Admin | Update page content |
| GET | `/api/admin/cms/faqs` | Admin | List FAQs |
| POST | `/api/admin/cms/faqs` | Admin | Create FAQ |
| PUT | `/api/admin/cms/faqs/{id}` | Admin | Update FAQ |
| DELETE | `/api/admin/cms/faqs/{id}` | Admin | Delete FAQ |
| PATCH | `/api/admin/cms/faqs/reorder` | Admin | Reorder FAQs |
| GET | `/api/admin/cms/footer` | Admin | Get footer content |
| PUT | `/api/admin/cms/footer` | Admin | Update footer |
| GET | `/api/admin/cms/sections` | Admin | List section visibility toggles |
| PATCH | `/api/admin/cms/sections/{key}` | Admin | Toggle section visibility |
| GET | `/api/admin/cms/settings` | Admin | List all settings |
| PUT | `/api/admin/cms/settings/{key}` | Admin | Update setting value |
| GET | `/api/admin/cms/features` | Admin | List feature flags |
| PATCH | `/api/admin/cms/features/{key}` | Admin | Toggle feature flag |
| GET | `/api/admin/cms/promo-banners` | Admin | List promotional banners |
| POST | `/api/admin/cms/promo-banners` | Admin | Create promo banner |
| PUT | `/api/admin/cms/promo-banners/{id}` | Admin | Update promo banner |
| DELETE | `/api/admin/cms/promo-banners/{id}` | Admin | Delete promo banner |

### 14.7 Public — CMS Content (Consumed by Frontend)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cms/banner/{key}` | None | Get banner by key |
| GET | `/api/cms/page/{slug}` | None | Get static page content |
| GET | `/api/cms/faqs` | None | Get all visible FAQs |
| GET | `/api/cms/footer` | None | Get footer data |
| GET | `/api/cms/sections` | None | Get section visibility map |
| GET | `/api/cms/settings` | None | Get public settings |
| GET | `/api/cms/features` | None | Get feature flags |
| GET | `/api/cms/promo-banners/active` | None | Get active promo banners |

### 14.8 User — Profile & Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user/profile` | User | Get own profile |
| PUT | `/api/user/profile` | User | Update own profile |
| GET | `/api/user/dashboard` | User | Dashboard summary |
| GET | `/api/user/enrollments` | User | List enrolled resources |
| GET | `/api/user/certificates` | User | List earned certificates |

### 14.9 User — Content Access

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/resources` | None | List published resources |
| GET | `/api/resources/{id}` | None | Get resource details |
| GET | `/api/resources/{id}/access` | User | Get time-limited access URL |
| POST | `/api/resources/{id}/enroll` | User | Auto-enroll in free resource |

### 14.10 User — Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payments/initiate` | User | Create payment intent |
| GET | `/api/payments/success` | User | Verify post-payment (for redirect) |
| POST | `/api/webhooks/stripe` | None (sig verified) | Stripe event webhook |
| POST | `/api/webhooks/razorpay` | None (sig verified) | Razorpay event webhook |

### 14.11 User — Exams

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/exams` | User | List available (ACTIVE/SCHEDULED) exams |
| GET | `/api/exams/{id}` | User | Get exam metadata (no answers) |
| POST | `/api/exams/{id}/attempts` | User | Start exam — creates attempt |
| GET | `/api/exams/attempts/{attemptId}` | User | Get attempt + shuffled questions |
| POST | `/api/exams/attempts/{attemptId}/submit` | User | Submit answers |
| GET | `/api/exams/attempts/{attemptId}/result` | User | Get result + score |

### 14.12 User — Certificates

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user/certificates/{id}/download` | User | Get pre-signed download URL |
| GET | `/api/certificates/verify/{id}` | None | Public certificate verification |

---

## 15. Folder Structure

### 15.1 .NET Backend Structure

```
EducationPortal/
├── EducationPortal.API/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── Admin/
│   │   │   ├── AdminUsersController.cs
│   │   │   ├── AdminResourcesController.cs
│   │   │   ├── AdminExamsController.cs
│   │   │   ├── AdminCmsController.cs
│   │   │   └── AdminAnalyticsController.cs
│   │   ├── User/
│   │   │   ├── UserProfileController.cs
│   │   │   ├── UserResourcesController.cs
│   │   │   ├── UserExamsController.cs
│   │   │   └── UserCertificatesController.cs
│   │   ├── Public/
│   │   │   ├── CmsController.cs
│   │   │   └── ResourcesController.cs
│   │   └── Webhooks/
│   │       ├── StripeWebhookController.cs
│   │       └── RazorpayWebhookController.cs
│   ├── Middleware/
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   ├── RequestLoggingMiddleware.cs
│   │   └── RateLimitingMiddleware.cs
│   ├── Filters/
│   │   └── ValidationFilter.cs
│   ├── Extensions/
│   │   ├── ServiceCollectionExtensions.cs
│   │   └── ApplicationBuilderExtensions.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── appsettings.Production.json
│   └── Program.cs
│
├── EducationPortal.Application/
│   ├── Common/
│   │   ├── Result.cs
│   │   ├── PagedResult.cs
│   │   └── ICurrentUserService.cs
│   ├── Interfaces/
│   │   ├── IUserRepository.cs
│   │   ├── IResourceRepository.cs
│   │   ├── IExamRepository.cs
│   │   ├── ICmsRepository.cs
│   │   ├── IPaymentGateway.cs
│   │   ├── IStorageService.cs
│   │   ├── ICacheService.cs
│   │   ├── IPdfGeneratorService.cs
│   │   └── IEmailService.cs
│   ├── Features/
│   │   ├── Auth/
│   │   │   ├── Commands/
│   │   │   │   ├── LoginCommand.cs
│   │   │   │   ├── RegisterCommand.cs
│   │   │   │   └── RefreshTokenCommand.cs
│   │   │   └── Queries/
│   │   │       └── GetCurrentUserQuery.cs
│   │   ├── Resources/
│   │   │   ├── Commands/
│   │   │   └── Queries/
│   │   ├── Exams/
│   │   │   ├── Commands/
│   │   │   └── Queries/
│   │   ├── Cms/
│   │   │   ├── Commands/
│   │   │   └── Queries/
│   │   ├── Payments/
│   │   │   └── Commands/
│   │   └── Certificates/
│   │       └── EventHandlers/
│   │           └── ExamPassedEventHandler.cs
│   └── Validators/
│       ├── LoginCommandValidator.cs
│       └── CreateResourceCommandValidator.cs
│
├── EducationPortal.Domain/
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Role.cs
│   │   ├── Resource.cs
│   │   ├── Category.cs
│   │   ├── Exam.cs
│   │   ├── Question.cs
│   │   ├── ExamAttempt.cs
│   │   ├── Certificate.cs
│   │   ├── Order.cs
│   │   ├── Enrollment.cs
│   │   └── Cms/
│   │       ├── CmsBanner.cs
│   │       ├── CmsPage.cs
│   │       ├── CmsFaq.cs
│   │       ├── CmsFooter.cs
│   │       ├── CmsSection.cs
│   │       ├── CmsSetting.cs
│   │       ├── CmsFeatureFlag.cs
│   │       └── CmsPromoBanner.cs
│   ├── Enums/
│   │   ├── ResourceType.cs
│   │   ├── ResourceStatus.cs
│   │   ├── ExamStatus.cs
│   │   ├── OrderStatus.cs
│   │   └── AuthProvider.cs
│   ├── Events/
│   │   └── ExamPassedDomainEvent.cs
│   └── Exceptions/
│       ├── NotFoundException.cs
│       ├── UnauthorizedException.cs
│       └── BusinessRuleException.cs
│
├── EducationPortal.Infrastructure/
│   ├── Persistence/
│   │   ├── AppDbContext.cs
│   │   ├── Migrations/
│   │   ├── Configurations/ (EF Core entity configs)
│   │   └── Repositories/
│   │       ├── UserRepository.cs
│   │       ├── ResourceRepository.cs
│   │       ├── ExamRepository.cs
│   │       └── CmsRepository.cs
│   ├── Services/
│   │   ├── JwtTokenService.cs
│   │   ├── GoogleAuthService.cs
│   │   ├── StripePaymentGateway.cs
│   │   ├── RazorpayPaymentGateway.cs
│   │   ├── S3StorageService.cs
│   │   ├── RedisCache Service.cs
│   │   ├── QuestPdfCertificateGenerator.cs
│   │   └── SendGridEmailService.cs
│   ├── BackgroundJobs/
│   │   ├── ExamStatusSchedulerJob.cs
│   │   └── CertificateGenerationJob.cs
│   └── DependencyInjection.cs
│
└── EducationPortal.Tests/
    ├── Unit/
    │   ├── Application/
    │   │   ├── Auth/
    │   │   ├── Exams/
    │   │   └── Cms/
    │   └── Domain/
    └── Integration/
        ├── Api/
        └── Persistence/
```

### 15.2 Next.js Frontend Structure

```
education-portal-web/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                 # Homepage (SSR + CMS)
│   │   │   ├── about/page.tsx           # About Us (ISR + CMS)
│   │   │   ├── contact/page.tsx         # Contact (ISR + CMS)
│   │   │   ├── privacy-policy/page.tsx  # Privacy Policy (ISR + CMS)
│   │   │   ├── terms/page.tsx           # Terms (ISR + CMS)
│   │   │   ├── faq/page.tsx             # FAQ (ISR + CMS)
│   │   │   ├── resources/
│   │   │   │   ├── page.tsx             # Resource listing
│   │   │   │   └── [id]/page.tsx        # Resource detail
│   │   │   └── blog/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── google-callback/page.tsx
│   │   ├── (user)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── my-content/page.tsx
│   │   │   ├── exams/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [examId]/page.tsx
│   │   │   │   └── [examId]/attempt/page.tsx
│   │   │   ├── results/[attemptId]/page.tsx
│   │   │   └── certificates/page.tsx
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── content/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/edit/page.tsx
│   │   │   │   ├── exams/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── cms/
│   │   │   │   │   ├── banners/page.tsx
│   │   │   │   │   ├── pages/page.tsx
│   │   │   │   │   ├── faqs/page.tsx
│   │   │   │   │   ├── footer/page.tsx
│   │   │   │   │   ├── sections/page.tsx
│   │   │   │   │   ├── settings/page.tsx
│   │   │   │   │   └── features/page.tsx
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   └── transactions/page.tsx
│   │   ├── api/
│   │   │   └── revalidate/route.ts      # ISR revalidation endpoint
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                          # Base design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── UserSidebar.tsx
│   │   ├── cms/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── FaqSection.tsx
│   │   │   └── PromoBanner.tsx
│   │   ├── content/
│   │   │   ├── ResourceCard.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   └── PdfViewer.tsx
│   │   ├── exam/
│   │   │   ├── ExamTimer.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   └── ResultDisplay.tsx
│   │   └── admin/
│   │       ├── StatsCard.tsx
│   │       ├── ResourceForm.tsx
│   │       └── ExamForm.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                       # Axios/fetch client with interceptors
│   │   ├── auth.ts                      # Token management utilities
│   │   └── cms.ts                       # CMS API helpers
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useExamTimer.ts
│   │   └── useCmsSection.ts
│   │
│   ├── store/
│   │   ├── authStore.ts                 # Zustand auth state
│   │   └── examStore.ts                 # Zustand exam in-progress state
│   │
│   └── types/
│       ├── user.types.ts
│       ├── resource.types.ts
│       ├── exam.types.ts
│       ├── cms.types.ts
│       └── api.types.ts
│
├── public/
│   ├── images/
│   └── favicon.ico
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 16. Environment Strategy

### 16.1 Environment Definitions

| Environment | Purpose | Access |
|-------------|---------|--------|
| **Development (Local)** | Individual developer machines | Developer only |
| **QA / Staging** | Integration testing, UAT, client demos | Dev team + Client |
| **Production** | Live user-facing system | Public |

### 16.2 Configuration Per Environment

| Config | Development | QA | Production |
|--------|------------|-----|------------|
| Database | Local PostgreSQL | QA PostgreSQL instance | Managed PostgreSQL (RDS/Supabase) |
| Redis | Local Redis | QA Redis instance | Managed Redis (ElastiCache/Upstash) |
| S3 | LocalStack or Dev bucket | QA S3 bucket | Production S3 bucket |
| Payment Gateway | Stripe Test Mode | Stripe Test Mode | Stripe Live Mode |
| Email | MailHog (local capture) | SendGrid test | SendGrid production |
| JWT Secret | Dev secret (not secure) | Rotating QA secret | Vault-managed secret |
| Log Level | Debug | Information | Warning |
| HTTPS | HTTP acceptable | HTTPS required | HTTPS enforced |

### 16.3 Configuration Management

- `appsettings.json` — Base configuration (defaults, non-sensitive).
- `appsettings.{Environment}.json` — Environment overrides.
- Environment variables — Secrets (connection strings, API keys). Never in source control.
- `.env.local`, `.env.production` — Next.js environment variables. `.env.local` is git-ignored.
- Secret Manager — AWS Secrets Manager or Azure Key Vault for production secrets.

---

## 17. Deployment Strategy

### 17.1 Containerization

All services are containerized with Docker:

```
docker-compose.yml (local/QA)
├── api           (EducationPortal.API image)
├── web           (Next.js image)
├── postgres      (PostgreSQL 16)
├── redis         (Redis 7)
└── nginx         (Reverse proxy)
```

Production uses individual container services or Kubernetes (K8s) orchestration at scale.

### 17.2 CI/CD Pipeline

**Recommended: GitHub Actions**

```
On Push to main branch:
  ├── lint-and-test job
  │   ├── Run ESLint (frontend)
  │   ├── Run dotnet build + test
  │   └── Run integration tests
  │
  ├── build-and-push job (on test pass)
  │   ├── Build Docker images
  │   ├── Tag with commit SHA + latest
  │   └── Push to container registry (ECR/Docker Hub)
  │
  └── deploy job (on image push)
      ├── QA: Auto-deploy to QA environment
      └── Production: Manual approval gate → Deploy
```

### 17.3 Database Migrations

- EF Core migrations run automatically on API startup (or via a dedicated migration runner job before deployment).
- Migration scripts are version-controlled and reviewed before promotion to production.
- Migrations are backward-compatible (no destructive drops in the same release as code changes).

### 17.4 Zero-Downtime Deployment

- Health check endpoint: `GET /api/health` returns 200 when API is ready.
- Nginx performs rolling updates with health check validation.
- Database migrations designed to be additive (no breaking changes in production migrations).

---

## 18. Logging & Monitoring Strategy

### 18.1 Logging Framework

**Backend:** Serilog with structured logging.

**Sinks configured:**
- Console (development)
- File (rolling, QA)
- Seq or Elasticsearch (production — centralized log aggregation)

**Log levels by environment:**
- Development: Debug
- QA: Information
- Production: Warning (Error and above always logged)

### 18.2 What Is Logged

| Category | Events Logged |
|----------|--------------|
| Authentication | Login success/failure, token refresh, logout, OAuth events |
| Authorization | Forbidden access attempts |
| Payments | Payment intent creation, webhook receipt, order creation/failure |
| Exams | Attempt start, submission, evaluation result, deadline enforcement |
| Certificates | Generation trigger, S3 upload success/failure |
| CMS | Admin saves (entity type, changed by, timestamp) |
| API | All requests: method, path, status code, duration (no body/PII) |
| Errors | All unhandled exceptions with full stack trace |

**Never logged:** Raw passwords, full card numbers, JWT signing secrets, S3 pre-signed URLs.

### 18.3 Monitoring

| Tool | Purpose |
|------|---------|
| **Application Metrics** | Prometheus + Grafana (or Datadog) — API latency, error rate, throughput |
| **Uptime Monitoring** | Uptime Robot or Better Uptime — health endpoint checks every 1 minute |
| **Error Tracking** | Sentry — frontend and backend error capture with stack traces |
| **Database Monitoring** | pgBadger or AWS RDS Performance Insights |
| **Alerting** | PagerDuty / Slack integration — alert on error rate spike, downtime, slow queries |

### 18.4 Audit Trail

A separate `AuditLogs` table captures all state-changing admin actions:
```
AuditLogs: { Id, AdminUserId, EntityType, EntityId, Action, OldValue (JSON), NewValue (JSON), Timestamp }
```

This provides compliance-grade traceability for all CMS and content changes.

---

## 19. Security Considerations

### 19.1 Authentication Security

| Control | Implementation |
|---------|---------------|
| Password hashing | bcrypt (work factor 12) |
| Access token storage | In-memory JS variable — never localStorage or sessionStorage |
| Refresh token storage | httpOnly, Secure, SameSite=Strict cookie |
| Token refresh rotation | New refresh token issued on each refresh |
| Refresh token revocation | Redis revocation list with TTL |
| Brute force protection | Rate limiting on `/auth/login` (5 attempts / 15 min per IP) |

### 19.2 API Security

| Control | Implementation |
|---------|---------------|
| HTTPS enforcement | HSTS header, HTTP redirect to HTTPS |
| CORS | Whitelist of allowed origins only (no wildcard `*` in production) |
| Input validation | FluentValidation on all commands + model binding |
| SQL injection | EF Core parameterized queries exclusively (no raw SQL interpolation) |
| XSS prevention | Content-Security-Policy header; output encoding in frontend |
| CSRF protection | SameSite=Strict cookie attribute; custom CSRF header for state-changing requests |
| Rate limiting | Middleware rate limiting on auth endpoints and public APIs |
| Request size limiting | Max body size configured in Nginx and Kestrel |

### 19.3 File Upload Security

- File type validation: extension + MIME type check (reject executable types).
- Maximum file size enforced server-side (configurable per type: e.g., video < 2GB, PDF < 50MB).
- Files uploaded to S3 via pre-signed URLs — backend never handles file bytes directly.
- S3 bucket is private. All access via pre-signed URLs with short TTL.
- S3 bucket policy denies public access. ACLs disabled.

### 19.4 Payment Security

- No card data touches the application server (delegated to Stripe/Razorpay SDKs).
- Webhook signature verification on all payment webhooks.
- Idempotency key handling to prevent duplicate order creation.
- Order amounts validated server-side before payment intent creation (client-provided amounts not trusted).

### 19.5 Secrets Management

- All secrets (DB connection strings, JWT signing keys, S3 credentials, payment API keys) stored in environment variables.
- In production, fetched from AWS Secrets Manager or Azure Key Vault at startup.
- Zero secrets in source code or Docker images.
- Secret rotation plan documented for JWT signing keys (quarterly).

---

## 20. Performance Considerations

### 20.1 Database Performance

| Technique | Application |
|-----------|------------|
| Indexing | Compound indexes on high-query columns (see Section 13.4) |
| Pagination | All list endpoints use cursor or offset pagination (no full table scans) |
| Query optimization | EF Core `.AsNoTracking()` on all read-only queries |
| Connection pooling | Npgsql connection pooling (max pool size: 100 per API instance) |
| N+1 prevention | EF Core `.Include()` / `.ThenInclude()` for related data (audited) |
| Read replicas | Configured for production under high read load |

### 20.2 Caching Strategy

| Cache Target | Strategy | TTL |
|-------------|----------|-----|
| CMS content | Redis cache-aside | 1 hour (invalidated on CMS save) |
| User profile | Redis cache-aside | 15 minutes |
| Resource listing (public) | Redis cache-aside | 5 minutes |
| Feature flags | Redis cache-aside | 30 minutes |
| Exam questions (per attempt) | None — always fresh from DB | — |

### 20.3 Frontend Performance

| Technique | Application |
|-----------|------------|
| Server Components | Reduce client-side JS bundle for CMS pages |
| ISR | Static generation with periodic revalidation for CMS pages |
| Image optimization | Next.js `<Image>` component with WebP conversion |
| Code splitting | Automatic per-route with Next.js App Router |
| Bundle analysis | `@next/bundle-analyzer` in CI pipeline |
| CDN | Static assets and video files served via CloudFront CDN |

### 20.4 Video Delivery Performance

- Video files stored in S3 with CloudFront CDN distribution.
- Adaptive bitrate streaming considered for Phase 2+ (HLS via AWS MediaConvert).
- Pre-signed URLs have appropriate short TTLs (15–30 minutes) to prevent sharing while allowing viewing.

---

## 21. Scalability Considerations

### 21.1 Horizontal Scaling

| Layer | Scaling Approach |
|-------|----------------|
| API (ASP.NET Core) | Stateless — horizontal scale via container replicas behind load balancer |
| Next.js Frontend | Stateless — horizontal scale via Vercel or container replicas |
| PostgreSQL | Vertical scale initially; read replicas under read-heavy load |
| Redis | Redis Cluster for high availability and write scaling |
| Background Jobs | Separate worker service container (scaled independently) |

### 21.2 Stateless API Design

The API is fully stateless:
- No server-side session storage.
- All state (auth, user context) derived from JWT claims per request.
- Redis used for ephemeral shared state (token revocation, rate limit counters).

### 21.3 Multi-Tenant Readiness (Future)

The data model includes `OrganizationId` as a future field on core tables to support multi-tenant architecture if the platform evolves to support multiple organizations / SaaS model.

### 21.4 Database Partitioning (Future)

`ExamAttempts` and `AttemptAnswers` tables are candidates for range partitioning by `CreatedAt` when volume exceeds several million rows.

---

## 22. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Scope creep during CMS design | High | Medium | Lock CMS field definitions in Phase 2 kickoff |
| Payment gateway integration delays | Medium | High | Begin gateway account setup in parallel with Phase 1 |
| Video upload performance issues | Medium | High | Use S3 pre-signed direct upload (bypass API) and test large files early |
| Exam cheating / answer exposure | Medium | High | Never send correct answers in API response; server-side evaluation only |
| Certificate PDF quality mismatch | Low | Medium | Design and approve template before Phase 6 starts |
| Redis cache consistency bugs | Medium | Medium | Thorough cache invalidation unit tests; fallback to DB on cache miss |
| Database migration failures in production | Low | High | Test all migrations on QA with production-like data volume |
| Token revocation race condition on logout | Low | Low | Use Redis atomic operations; refresh token rotation on every use |
| Third-party OAuth changes | Low | Medium | Monitor Google OAuth changelog; abstract behind interface for swap |
| Regulatory compliance (GDPR/data privacy) | Medium | High | Design data deletion flow; pseudonymize PII in logs from Day 1 |

---

## 23. Phase-wise Development Plan

### Phase 1 — Foundation (Weeks 1–3)

**Backend:**
- Solution setup: Clean Architecture project structure
- PostgreSQL database setup + EF Core configuration
- User entity, Role entity, RefreshTokens table
- JWT authentication: login, register, refresh, logout endpoints
- Google OAuth 2.0 integration
- RBAC policy setup
- Health check endpoint
- Swagger/OpenAPI setup
- Docker Compose setup (API + PostgreSQL + Redis)
- Serilog logging configuration

**Frontend:**
- Next.js project setup with App Router, TypeScript, Tailwind CSS
- Public layout (Navbar, Footer shell)
- Auth pages: Login, Register, Google OAuth callback
- Auth state management (Zustand)
- Axios API client with token refresh interceptor
- Route protection middleware (Next.js middleware.ts)

**Deliverable:** Working authentication system. Users can register, log in (email + Google), and sessions are managed securely.

---

### Phase 2 — Content System & CMS Backend (Weeks 4–6)

**Backend:**
- Categories CRUD
- Resources CRUD (Video, PDF, Blog types)
- S3 pre-signed upload URL endpoint
- Resource status management (publish/unpublish/draft)
- All CMS database tables created + seeded
- Admin CMS CRUD endpoints (banners, pages, FAQs, footer, sections, settings, feature flags, promo banners)
- Redis cache layer for CMS endpoints
- Cache invalidation on CMS save
- ISR revalidation webhook endpoint (for Next.js)

**Frontend:**
- Admin Panel layout (sidebar navigation)
- Resource management pages (list, create, edit, upload flow)
- Category management pages
- CMS management pages (all sub-sections)
- Rich text editor integration for blogs and CMS pages
- S3 direct upload integration with progress indicator

**Deliverable:** Admins can manage all content and CMS. CMS changes are cached and invalidation works.

---

### Phase 3 — Student Portal (Weeks 7–9)

**Backend:**
- Public resources listing endpoint (paginated, filtered)
- Resource detail endpoint
- Free resource enrollment (auto-enrollment logic)
- Resource access endpoint (pre-signed S3 URL generation)
- CMS public endpoints (banner, pages, FAQs, footer, sections, features)

**Frontend:**
- Homepage (SSR + CMS banner, featured content, promo banners)
- CMS static pages (About, Contact, FAQ, Privacy Policy, Terms) — ISR
- Resource listing page
- Resource detail page
- Video player component (HTML5 + HLS.js if needed)
- PDF viewer / download component
- Blog listing and detail pages
- Student authentication guard
- Student dashboard (shell)
- CMS feature flag consumption (conditional UI rendering)

**Deliverable:** Students can browse and access free content. Homepage and static pages are CMS-controlled.

---

### Phase 4 — Payments (Weeks 10–11)

**Backend:**
- IPaymentGateway interface
- Stripe implementation (Payment Intent creation)
- Razorpay implementation (Order creation)
- Payment initiation endpoint
- Stripe webhook endpoint (with signature verification + idempotency)
- Razorpay webhook endpoint
- Orders table management
- Enrollment creation post-payment
- Entitlement check middleware for resource access

**Frontend:**
- Stripe Elements integration (card form)
- Razorpay JS SDK integration
- Checkout flow (initiate → payment UI → success/failure)
- Enrollment status reflected in UI
- My Purchases / Enrolled Content page
- Transaction history (user-facing)

**Deliverable:** Paid content purchase works end-to-end. Revenue is tracked in admin dashboard.

---

### Phase 5 — Exam Engine (Weeks 12–14)

**Backend:**
- Exams CRUD (admin)
- Questions CRUD (admin)
- Exam status lifecycle management
- ExamStatusSchedulerJob (background service)
- Student exam listing endpoint
- Exam attempt creation with question shuffling
- Answer submission + server-side evaluation
- Score calculation + pass/fail determination
- ExamPassedDomainEvent publication
- Retry logic enforcement

**Frontend:**
- Exam listing page (student)
- Exam start flow
- Exam interface: question display, answer selection, countdown timer
- Auto-submit on timer expiry
- Result display page (score, pass/fail, breakdown)
- Admin exam management pages (create, schedule, question bank, attempt review)

**Deliverable:** Full exam lifecycle works. Students can take timed exams and receive instant results.

---

### Phase 6 — Certificate Generation (Weeks 15–16)

**Backend:**
- QuestPDF certificate template design (parameterized)
- CertificateGenerationHandler (ExamPassedDomainEvent handler)
- S3 upload of generated PDF
- Certificate record creation
- Certificate download endpoint (pre-signed URL)
- Public certificate verification endpoint

**Frontend:**
- Certificate download button on result page
- Certificates section in student dashboard
- Certificate card (shows exam, date, download link)
- Admin certificate management view

**Deliverable:** Automatic certificate generation on exam pass. Students can download branded PDF certificates.

---

### Phase 7 — Dashboards & Analytics (Weeks 17–18)

**Backend:**
- Admin dashboard summary endpoint (KPIs)
- Analytics endpoints (signups trend, revenue trend, content performance, exam stats)
- Student dashboard summary endpoint
- Transaction reporting endpoint (admin)

**Frontend:**
- Admin dashboard: KPI cards, charts (Chart.js or Recharts), recent activity feed
- Revenue analytics with date range filter
- Student dashboard: enrolled content, exam results, certificates, profile completion
- Admin user management with search and filters
- Transaction log with export option

**Deliverable:** Complete analytics visibility for admin. Students have a useful personalized dashboard.

---

### Phase 8 — Testing & Launch (Weeks 19–21)

**Quality Assurance:**
- Unit test completion to 70%+ Application layer coverage
- Integration test suite for critical API flows (auth, payment webhooks, exam submission)
- End-to-end test (Playwright) for critical user journeys
- Performance/load testing (k6) — simulate 500 concurrent users
- Security audit: OWASP Top 10 checklist review
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsive testing (iOS Safari, Android Chrome)
- Accessibility audit (WCAG 2.1 AA)

**DevOps:**
- Production infrastructure provisioning
- CI/CD pipeline configuration
- SSL certificate setup
- CDN configuration (CloudFront)
- Database backup automation
- Monitoring dashboards (Grafana / Datadog)
- Alerting rules configured
- Runbook documentation

**Launch:**
- Staging environment UAT sign-off by client
- DNS cutover planning
- Go-live checklist execution
- Post-launch monitoring (48-hour elevated alerting)

**Deliverable:** Production-ready platform launched. Monitoring active. Post-launch support begins.

---

## 24. Development Complexity Analysis

### 24.1 Module Complexity Ratings

| Module | Complexity | Key Challenges |
|--------|-----------|---------------|
| Authentication (JWT + OAuth) | **Medium** | Token refresh race conditions, OAuth callback handling |
| RBAC System | **Medium** | Policy-based authorization wiring, permission inheritance |
| Resource Management | **Low-Medium** | S3 pre-signed upload flow, status state machine |
| CMS System | **Medium** | Cache invalidation consistency, ISR revalidation, key-value design |
| Payment Integration | **High** | Webhook idempotency, gateway abstraction, edge case handling |
| Exam Engine | **High** | Server-side timer enforcement, shuffle fairness, concurrent submission handling |
| Certificate Generation | **Medium** | PDF template precision, S3 async flow, domain event wiring |
| Analytics Dashboard | **Medium** | SQL aggregation queries, date range filtering, chart rendering |
| Admin Panel UI | **Medium** | Form complexity, rich text editor, file upload UX |
| Student Portal + CMS Rendering | **Medium** | SSR/ISR hybrid, CMS data hydration, video player |

### 24.2 High-Risk Development Items

| Item | Risk | Mitigation |
|------|------|-----------|
| Exam timer server enforcement | Race conditions on near-deadline submissions | Use server-computed deadline stored at attempt creation; allow 30s grace period |
| Webhook duplicate processing | Duplicate orders on retry | Idempotency key stored in DB — check before processing |
| CMS cache invalidation | Stale content served after admin update | Test invalidation flow with integration tests; monitor Redis cache hit/miss |
| S3 pre-signed URL security | URL leakage / sharing | Short TTL (15 min for video, 5 min for PDF download); user-specific URL not shareable |
| PDF certificate rendering | Layout breaks on long names | Test with edge case names; design template with overflow handling |

---

## 25. Future Enhancement Architecture Readiness

### 25.1 Live Classes (Zoom/Google Meet Integration)

**Readiness:** The Resource entity's `ResourceType` enum can be extended with `LIVE_SESSION`. A `LiveSessions` table would be added with meeting URL, scheduled time, and instructor reference. The frontend already has a routing structure to accommodate new resource types.

### 25.2 Multiple Instructors / Marketplace Model

**Readiness:** Add `InstructorId` FK to Resources table. Add `Instructors` table (profile, payout info). Revenue splitting logic added to payment flow. Admin approval workflow for instructor-submitted content via existing status state machine.

### 25.3 Subscription Plans

**Readiness:** Add `SubscriptionPlans` table (name, price, interval, features). Add `UserSubscriptions` table. Entitlement check in resource access middleware extended to check both Enrollments and active subscriptions. Stripe Subscriptions API replaces one-time Payment Intent.

### 25.4 Mobile App (React Native)

**Readiness:** The ASP.NET Core API is already mobile-ready — it is a pure REST API with JWT auth and JSON responses. A React Native app would consume the exact same API endpoints. No backend changes required for Phase 1 of a mobile app.

### 25.5 Multi-Language (i18n)

**Readiness:** CMS tables can have a `LanguageCode` column added to support multi-language content variants. Frontend uses `next-intl` library for i18n routing and translation keys. Resources can have translated versions stored as `ResourceTranslations` table.

### 25.6 AI-Powered Features

**Readiness:** The platform's clean service architecture allows injection of AI services (e.g., content recommendation via embeddings + vector DB, AI-generated quiz questions from PDF content) as new Infrastructure service implementations behind Application interfaces. No core module changes required.

### 25.7 Affiliate & Referral Program

**Readiness:** Add `ReferralCodes` table, `ReferralEvents` table. Extend Order creation to credit referrer. The IPaymentGateway abstraction already supports metadata on payment intents which can carry referral context.

### 25.8 Advanced Analytics (BI)

**Readiness:** PostgreSQL supports read replicas and can be connected to BI tools (Metabase, Grafana, Tableau) directly. An analytics schema (with pre-aggregated event tables via background jobs) can be added without affecting the operational database.

---

## Summary of Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture pattern | Clean Architecture + CQRS | Separation of concerns, testability, scalability |
| ORM | Entity Framework Core | Mature, EF migrations, LINQ, PostgreSQL support |
| Frontend framework | Next.js (App Router) | SSR + ISR for CMS, React ecosystem, Vercel-ready |
| CMS strategy | DB-driven + Redis cache + ISR | Real-time updates without code deployment |
| Auth strategy | JWT stateless + httpOnly refresh cookie | Security + scalability + XSS resistance |
| Payment abstraction | IPaymentGateway interface | Gateway-agnostic, swappable Stripe ↔ Razorpay |
| File storage | AWS S3 + pre-signed URLs | Security, cost-effective, scalable, CDN-compatible |
| PDF generation | QuestPDF | Open-source, code-first, no font/licensing issues |
| Background jobs | .NET Hosted Services | Exam scheduling, certificate generation, no external queue needed at launch |
| Caching | Redis | CMS cache, token revocation, rate limiting |

---

*This document is version 1.0 and represents the baseline technical specification. All sections are subject to revision based on engineering review, client feedback, and discovery findings during implementation.*

---

**Document Prepared By:** Solution Architecture Team
**Version:** 1.0 | **Date:** February 2026
**Next Step:** Engineering team review and story/ticket breakdown from Section 23 phases.

---
*End of Technical Specification Document*
