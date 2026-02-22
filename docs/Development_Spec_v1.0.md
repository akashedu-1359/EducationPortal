# Educational Web Platform — Development Task Spec
## Version 1.0 | February 2026

> This document breaks down every development task derived from the Technical Specification.
> Tasks are split into Frontend (FE) and Backend (BE), ordered by phase.
> Each task includes: ID, Phase, Summary, Acceptance Criteria, Dependencies, and Complexity.

---

## FRONTEND TASKS

---

### FE-01 · Project Setup & Configuration
**Phase:** 1 | **Complexity:** Low

**Summary:** Bootstrap the Next.js project with all required tooling and enforce a consistent code style baseline.

**Acceptance Criteria:**
- Next.js 14+ project scaffolded using `create-next-app` with App Router, TypeScript strict mode enabled
- Tailwind CSS configured with a custom design tokens file (colors, spacing, fonts — placeholders until brand assets provided)
- ESLint + Prettier configured; `.eslintrc` and `.prettierrc` committed
- Absolute import paths configured in `tsconfig.json` (`@/components`, `@/lib`, `@/hooks`, etc.)
- `next.config.ts` configured: image domains, environment variable types, security headers (CSP, HSTS, X-Frame-Options)
- `.env.local.example` committed with all required env var keys (no values)
- Folder structure created per spec Section 15.2 (empty index files as placeholders)
- `package.json` scripts: `dev`, `build`, `start`, `lint`, `type-check`
- Git hooks via Husky: pre-commit runs lint + type-check

**Dependencies:** None

---

### FE-02 · Design System — Base UI Component Library
**Phase:** 1 | **Complexity:** Low-Medium

**Summary:** Build the foundational reusable UI components that all pages will consume.

**Acceptance Criteria:**
- `Button` — variants: primary, secondary, outline, ghost, danger; sizes: sm, md, lg; loading state with spinner; disabled state
- `Input` — text, email, password (toggle visibility), textarea; error state with message; label + helper text
- `Modal` — accessible dialog with backdrop, close button, title slot, body slot, footer slot; focus trap; Escape key dismissal
- `Table` — sortable columns (client-side), pagination controls, empty state, loading skeleton rows
- `Badge` — variants: success, warning, error, info, neutral; with optional icon
- `Spinner` — loading indicator, multiple sizes
- `Toast` / notification system — success, error, warning; auto-dismiss; stackable
- `Dropdown` / `Select` — accessible, keyboard navigable
- `Card` — base container with optional header, footer, hover state
- `Skeleton` — placeholder loading for cards and table rows
- All components follow WCAG 2.1 AA (ARIA roles, keyboard nav, focus visible)
- Each component exported from `src/components/ui/index.ts`

**Dependencies:** FE-01

---

### FE-03 · Public Layout — Navbar & Footer
**Phase:** 1 | **Complexity:** Low-Medium

**Summary:** Persistent layout components rendered on all public-facing pages. CMS-aware for footer content.

**Acceptance Criteria:**
- `Navbar`: logo placeholder, navigation links (Home, Resources, Blog, FAQ), auth state conditional rendering (Login/Register vs. User avatar dropdown)
- Navbar collapses to hamburger menu on mobile (responsive)
- Navbar active link highlight based on current route
- `Footer`: renders CMS footer data (company text, columns, links, social icons, copyright). Fetches from `/api/cms/footer` at SSR time
- Footer social links render correct icons (Twitter/X, LinkedIn, YouTube placeholders)
- Both components are Server Components where possible
- Root `layout.tsx` wraps all public pages with Navbar + Footer

**Dependencies:** FE-01, FE-02

---

### FE-04 · API Client — Axios Instance with JWT Refresh Interceptor
**Phase:** 1 | **Complexity:** Medium

**Summary:** Centralized HTTP client with automatic token injection and silent refresh on 401.

**Acceptance Criteria:**
- Axios instance created at `src/lib/api.ts` with `baseURL` from `NEXT_PUBLIC_API_URL` env var
- Request interceptor attaches `Authorization: Bearer <accessToken>` from in-memory store
- Response interceptor catches 401 responses, calls `POST /api/auth/refresh`, retries the original request once with new token
- If refresh fails (expired/revoked), clears auth state and redirects to `/login`
- Separate `publicApi` client (no auth headers) for public/CMS endpoints
- TypeScript generic wrapper: `api.get<T>()`, `api.post<T>()` returning typed responses
- Token stored in-memory (closure variable in `src/lib/auth.ts`), never localStorage

**Dependencies:** FE-01

---

### FE-05 · Zustand Auth Store & Route Protection Middleware
**Phase:** 1 | **Complexity:** Medium

**Summary:** Global auth state management and Next.js middleware for route-level access control.

**Acceptance Criteria:**
- `authStore.ts` (Zustand): state fields: `accessToken`, `user` (id, email, fullName, role), `isAuthenticated`; actions: `setAuth`, `clearAuth`
- `useAuth` hook provides convenient access to store state + actions
- `src/middleware.ts` (Next.js Edge Middleware): protects `/dashboard/*`, `/exams/*`, `/certificates/*`, `/my-content/*` — redirects unauthenticated users to `/login`
- Admin routes `/admin/*` protected: redirects non-admin role users to `/dashboard`
- Auth pages `/login`, `/register` redirect already-authenticated users to `/dashboard`
- On app load, `POST /api/auth/refresh` is called silently to restore session from httpOnly cookie

**Dependencies:** FE-04

---

### FE-06 · Auth Pages — Login & Register
**Phase:** 1 | **Complexity:** Low-Medium

**Summary:** Email/password authentication forms with validation and Google OAuth entry point.

**Acceptance Criteria:**
- `/login`: email + password fields; client-side validation (required, email format, password min 8 chars); submit calls `POST /api/auth/login`; on success stores token and redirects to `/dashboard`; displays server error messages inline; "Forgot password?" link (placeholder); Google sign-in button
- `/register`: full name + email + password + confirm password; client-side validation; submit calls `POST /api/auth/register`; on success redirects to `/login` with success toast; Google sign-up button
- Both forms: loading state on submit, disable button during request
- Google button: redirects to `GET /api/auth/google/redirect`
- Forms use `react-hook-form` + `zod` for validation
- Responsive layout; works on mobile

**Dependencies:** FE-04, FE-05

---

### FE-07 · Google OAuth Callback Handler
**Phase:** 1 | **Complexity:** Low-Medium

**Summary:** Handle the redirect back from Google OAuth, extract token, and establish session.

**Acceptance Criteria:**
- `/google-callback` page reads `accessToken` from URL fragment (`#access_token=...`) or query param depending on API implementation
- Stores token in Zustand auth store
- Calls `GET /api/user/profile` to hydrate user object into store
- Redirects to `/dashboard` on success; shows error page on failure with retry link
- Loading spinner shown while processing

**Dependencies:** FE-05, FE-06

---

### FE-08 · Admin Panel Layout — Sidebar & Shell
**Phase:** 2 | **Complexity:** Low-Medium

**Summary:** Persistent admin layout with collapsible sidebar navigation covering all admin sub-modules.

**Acceptance Criteria:**
- `AdminSidebar` with grouped navigation sections: Dashboard, Users, Content (Resources, Categories), Exams, CMS (Banners, Pages, FAQs, Footer, Sections, Settings, Features), Analytics, Transactions
- Active route highlighted in sidebar
- Collapsible sidebar on tablet; hidden drawer on mobile with hamburger toggle
- Admin shell layout wraps all `/admin/*` routes via route group layout
- Breadcrumb component at top of each admin page
- User avatar + name in sidebar footer with logout action
- Role-based nav item visibility (ExamManager does not see CMS nav items)

**Dependencies:** FE-05, FE-02

---

### FE-09 · Admin — Category Management Pages
**Phase:** 2 | **Complexity:** Low

**Summary:** CRUD interface for content categories.

**Acceptance Criteria:**
- List page: table of categories (Name, Slug, Visible, Sort Order, Actions); pagination; search by name
- Create modal/page: Name (auto-generates slug), Description, IsVisible toggle, SortOrder input; validation; POST to `/api/admin/categories`
- Edit inline or modal: pre-populated form; PUT to `/api/admin/categories/{id}`
- Delete: confirmation dialog; DELETE to `/api/admin/categories/{id}`
- Drag-to-reorder sort order (optional, can use numeric input)
- Success/error toasts on all actions

**Dependencies:** FE-08

---

### FE-10 · Admin — Resource Management Pages
**Phase:** 2 | **Complexity:** Medium

**Summary:** Full CRUD UI for managing educational resources (Videos, PDFs, Blogs) with type-specific form fields.

**Acceptance Criteria:**
- List page: table with columns (Title, Type badge, Category, Price, Status badge, Featured, Created, Actions); pagination; search; filter by Type, Status, Category; bulk select (future)
- Create page: Resource Type selector (VIDEO, PDF, BLOG) — form fields change based on type:
  - VIDEO: Title, Description, Category, Price, Thumbnail upload, choose Upload File or External URL
  - PDF: Title, Description, Category, Price, Thumbnail upload, File upload
  - BLOG: Title, Description, Category, Price, Rich text editor for content, Thumbnail
- All types: IsFeatured toggle, Status selector (DRAFT default)
- Edit page: pre-populated with existing data; same fields as create
- Publish / Unpublish action buttons with confirmation
- Soft delete with confirmation dialog
- List shows "Published", "Draft", "Unpublished" badges with distinct colors

**Dependencies:** FE-08, FE-09, FE-11, FE-12

---

### FE-11 · S3 Direct File Upload with Progress Indicator
**Phase:** 2 | **Complexity:** Medium

**Summary:** Upload video and PDF files directly to S3 using pre-signed URLs, with real-time progress feedback.

**Acceptance Criteria:**
- `FileUpload` component: file drag-and-drop zone + click-to-browse
- On file select: calls `POST /api/admin/resources/upload-url` to get pre-signed S3 URL
- Uploads file directly to S3 using the pre-signed URL (PUT request, no API proxy)
- Progress bar shows upload percentage using `XMLHttpRequest` progress event or `axios` upload progress
- File type validation: VIDEO accepts `.mp4`, `.mov`, `.webm`; PDF accepts `.pdf`; image accepts `.jpg`, `.jpeg`, `.png`, `.webp`
- File size display during upload
- Cancel upload support
- On completion, stores the returned `fileKey` in parent form state
- Error handling: S3 network failures, invalid file type, oversized file

**Dependencies:** FE-02

---

### FE-12 · Rich Text Editor Integration
**Phase:** 2 | **Complexity:** Low-Medium

**Summary:** WYSIWYG editor for blog content and CMS static page content editing.

**Acceptance Criteria:**
- Use Tiptap (or equivalent) as the rich text editor
- Toolbar: Bold, Italic, Underline, Strikethrough, Headings (H1-H4), Bullet list, Numbered list, Blockquote, Code block, Link, Image (URL), Horizontal rule, Undo/Redo
- Output format: HTML string stored and served as-is (sanitized on display)
- `RichTextEditor` component accepts `value` and `onChange` props (controlled)
- `RichTextDisplay` component renders HTML safely (using DOMPurify)
- Works within React Hook Form as a controlled field

**Dependencies:** FE-01

---

### FE-13 · Admin CMS — Banner & Promo Banner Management
**Phase:** 2 | **Complexity:** Low-Medium

**Summary:** UI for managing homepage hero banners and promotional banners.

**Acceptance Criteria:**
- Banner list page: shows all CMS banners by key; each row has Edit button
- Banner edit form: ImageKey (with image upload using FE-11), Headline, Subheadline, CtaText, CtaLink, IsActive toggle; PUT to `/api/admin/cms/banners/{key}`
- Image preview shown after upload
- Promo Banners list: table with Image preview, Title, StartDate, EndDate, IsActive, SortOrder, Actions
- Create / Edit promo banner form; POST/PUT to `/api/admin/cms/promo-banners`
- Delete promo banner with confirmation
- Success toast on save; immediate visual confirmation

**Dependencies:** FE-08, FE-11

---

### FE-14 · Admin CMS — Static Pages Editor
**Phase:** 2 | **Complexity:** Low-Medium

**Summary:** Rich text editor interface for editing static pages (About, Contact, Privacy Policy, Terms).

**Acceptance Criteria:**
- Pages list: shows slugs with last-updated timestamp and Published status
- Edit page: Page Title, Content (RichTextEditor), MetaTitle, MetaDescription, IsPublished toggle; PUT to `/api/admin/cms/pages/{slug}`
- Preview button opens the live page in a new tab
- Character count for Meta Description (max 160 chars with warning)
- Success toast; ISR revalidation triggered via `/api/revalidate` on save

**Dependencies:** FE-08, FE-12

---

### FE-15 · Admin CMS — FAQ Management
**Phase:** 2 | **Complexity:** Low

**Summary:** Create, edit, delete, and reorder FAQs from the admin panel.

**Acceptance Criteria:**
- FAQ list with drag-and-drop reordering (using `@dnd-kit/core` or similar)
- Create FAQ: Question + Answer (textarea); POST to `/api/admin/cms/faqs`
- Edit inline or modal: PUT to `/api/admin/cms/faqs/{id}`
- Delete with confirmation: DELETE to `/api/admin/cms/faqs/{id}`
- IsVisible toggle per FAQ
- Save order button calls `PATCH /api/admin/cms/faqs/reorder`
- Empty state with "Add your first FAQ" prompt

**Dependencies:** FE-08

---

### FE-16 · Admin CMS — Footer, Sections, Settings & Feature Flags
**Phase:** 2 | **Complexity:** Low-Medium

**Summary:** Admin interfaces for the remaining CMS sub-modules.

**Acceptance Criteria:**
- **Footer editor**: CompanyText (textarea), CopyrightText, SocialLinks (add/remove rows: platform + URL), Footer Columns (add column with title + links list); PUT to `/api/admin/cms/footer`
- **Section Visibility**: list of all section keys with label + IsVisible toggle; individual PATCH calls on toggle
- **Settings**: key-value table; inline edit for Value field; DataType shown as badge; PUT to `/api/admin/cms/settings/{key}`
- **Feature Flags**: list with key, description, IsEnabled toggle; individual PATCH calls on toggle; clear visual ON/OFF indicator
- All sub-sections accessible from CMS sidebar group

**Dependencies:** FE-08

---

### FE-17 · Homepage — SSR with CMS Content
**Phase:** 3 | **Complexity:** Medium

**Summary:** The public-facing homepage rendered server-side, consuming CMS data for dynamic sections.

**Acceptance Criteria:**
- Rendered as a Next.js Server Component (dynamic, not cached at page level — Redis cache on API side handles performance)
- Sections (each conditionally shown based on CmsSection visibility flags):
  - Hero Banner: image, headline, subheadline, CTA button (from `cms:banner:homepage`)
  - Featured Resources: grid of ResourceCards fetched from public resources endpoint (IsFeatured=true)
  - Active Promo Banner: rendered if active promo exists
  - Category Browse section
  - Stats row (configurable from CmsSettings: e.g., "1000+ students")
  - CTA section (join/signup prompt)
- `ResourceCard` component: thumbnail, title, type badge, category, price ("Free" or formatted currency), enroll CTA
- Page is fully responsive
- SEO: `<title>`, `<meta description>` from CmsSettings `site_name` / homepage meta

**Dependencies:** FE-03, FE-04, FE-19

---

### FE-18 · CMS Static Pages — ISR Rendering
**Phase:** 3 | **Complexity:** Low

**Summary:** About, Contact, FAQ, Privacy Policy, and Terms pages rendered with ISR, content from CMS API.

**Acceptance Criteria:**
- Each page is a Server Component with `export const revalidate = 3600` (or tag-based: `unstable_cache` with `cms-static-pages` tag)
- Fetches content from `/api/cms/page/{slug}` at build/revalidation time
- Renders `<title>` and `<meta description>` from page's MetaTitle / MetaDescription fields
- FAQ page renders accordion component (expand/collapse per question) from `/api/cms/faqs`
- Contact page renders contact information from page content
- If page `IsPublished = false`, returns 404
- After CMS admin save triggers revalidation webhook, page regenerates on next request

**Dependencies:** FE-03, FE-19

---

### FE-19 · ISR Revalidation API Route
**Phase:** 3 | **Complexity:** Low

**Summary:** Next.js API route that the backend calls to trigger ISR revalidation of CMS pages.

**Acceptance Criteria:**
- Route: `POST /api/revalidate` in Next.js App Router (`src/app/api/revalidate/route.ts`)
- Validates a shared secret header `x-revalidation-secret` against `REVALIDATION_SECRET` env var; returns 401 if mismatch
- Body: `{ "tag": "cms-static-pages" }` or `{ "path": "/about" }`
- Calls `revalidateTag()` or `revalidatePath()` accordingly
- Returns `{ revalidated: true, now: timestamp }`

**Dependencies:** FE-01

---

### FE-20 · Resource Listing Page — Public
**Phase:** 3 | **Complexity:** Low-Medium

**Summary:** Browsable, filterable public resource catalogue.

**Acceptance Criteria:**
- Server Component fetching `/api/resources` with query params forwarded (category, type, search, page)
- Filter sidebar/top-bar: Category dropdown, Type tabs (All, Video, PDF, Blog), Price filter (Free / Paid / All)
- Search input with debounce (300ms)
- Pagination controls (page numbers + next/prev)
- `ResourceCard` grid (3 columns desktop, 2 tablet, 1 mobile)
- Empty state when no results
- "Free" badge vs. price display on each card
- URL query params updated on filter change (shareable/bookmarkable URLs)

**Dependencies:** FE-03, FE-17

---

### FE-21 · Resource Detail Page
**Phase:** 3 | **Complexity:** Medium

**Summary:** Individual resource page with metadata, preview, and enrollment/purchase CTA.

**Acceptance Criteria:**
- Server Component for metadata (title, description, thumbnail, price, category, type)
- For BLOG type: renders blog content (RichTextDisplay) directly on page (publicly accessible)
- For VIDEO/PDF: shows thumbnail + description; locked content preview
- Enrollment CTA logic:
  - Free + Not enrolled → "Enroll for Free" button → calls `POST /api/resources/{id}/enroll` → shows video/PDF
  - Free + Enrolled → "Watch Now" / "Download" button
  - Paid + Not purchased → "Buy Now — ₹{price}" button → checkout flow (FE-29)
  - Paid + Purchased → "Watch Now" / "Download" button
- Enrolled state checked via `/api/user/enrollments` (client-side after auth check)
- Related resources section (same category)

**Dependencies:** FE-20, FE-22, FE-23

---

### FE-22 · Video Player Component
**Phase:** 3 | **Complexity:** Medium

**Summary:** Secure embedded video player that plays from S3 pre-signed URLs.

**Acceptance Criteria:**
- Client Component (`'use client'`)
- On mount: calls `GET /api/resources/{id}/access` to get pre-signed video URL
- Renders HTML5 `<video>` element with controls; HLS.js loaded for `.m3u8` streams; fallback for direct MP4
- For YouTube/Vimeo external URLs: renders iframe embed
- Controls: play/pause, volume, mute, fullscreen, playback speed (0.75x, 1x, 1.25x, 1.5x, 2x)
- Pre-signed URL TTL awareness: if URL near expiry (15-min TTL), re-fetches on resumed play
- Video never downloads by disabling right-click context menu and `controlsList="nodownload"` attribute
- Loading skeleton shown while URL fetched
- Error state if access denied (not enrolled)

**Dependencies:** FE-21

---

### FE-23 · PDF Viewer / Download Component
**Phase:** 3 | **Complexity:** Low

**Summary:** PDF access handler for enrolled users.

**Acceptance Criteria:**
- Client Component
- On mount: calls `GET /api/resources/{id}/access` to get pre-signed PDF URL (5-minute TTL)
- Download button triggers browser download via the pre-signed URL (opens in new tab with `Content-Disposition: attachment`)
- Optional inline viewer using `<iframe>` or `react-pdf` for preview
- Error state if not enrolled

**Dependencies:** FE-21

---

### FE-24 · Blog Listing & Detail Pages
**Phase:** 3 | **Complexity:** Low

**Summary:** Public blog section displaying all published blog resources.

**Acceptance Criteria:**
- `/blog` listing: grid of blog cards (thumbnail, title, description snippet, category, date); Server Component; pagination
- `/blog/{id}` detail: Server Component; renders full blog content via `RichTextDisplay`; SEO meta from title + description
- Publicly accessible without login (USER-01)
- Related blogs sidebar (same category)

**Dependencies:** FE-20

---

### FE-25 · Student Dashboard Shell
**Phase:** 3 | **Complexity:** Low-Medium

**Summary:** Authenticated student-facing dashboard layout with sidebar navigation.

**Acceptance Criteria:**
- `UserSidebar`: links to Dashboard, My Content, Exams, Certificates, Profile
- Active link highlighted
- Mobile responsive (hamburger drawer)
- Dashboard landing page: placeholder cards for enrolled content count, exams taken, certificates earned (populated in FE-46)
- Protected by auth middleware (redirects to `/login` if unauthenticated)

**Dependencies:** FE-05, FE-02

---

### FE-26 · CMS Feature Flag Conditional Rendering
**Phase:** 3 | **Complexity:** Low

**Summary:** Consume feature flags from CMS API to show/hide platform sections.

**Acceptance Criteria:**
- `useCmsSection` hook: accepts a section key string, returns `isVisible: boolean` from fetched `/api/cms/sections`
- Feature flags fetched from `/api/cms/features` and sections from `/api/cms/sections` at layout/page level (Server Component)
- Sections wrapped in conditional: `{isVisible && <SectionComponent />}`
- Flag values cached client-side for session duration (no repeated fetches)
- Covers: blog section visibility, FAQ section, testimonials, stats row

**Dependencies:** FE-17

---

### FE-27 · Stripe Elements Checkout Integration
**Phase:** 4 | **Complexity:** High

**Summary:** Stripe card payment form embedded in the checkout flow.

**Acceptance Criteria:**
- `@stripe/stripe-js` and `@stripe/react-stripe-js` installed
- `loadStripe()` called with `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `<Elements>` provider wraps checkout page
- `<CardElement>` or `<PaymentElement>` rendered for card input
- On submit: `stripe.confirmCardPayment(clientSecret)` called
- Handles payment confirmation states: succeeded, processing, failed
- Shows inline error messages from Stripe (e.g., "Card declined")
- Loading spinner during payment processing
- On success: redirects to resource with success query param

**Dependencies:** FE-04, FE-25

---

### FE-28 · Razorpay JS SDK Integration
**Phase:** 4 | **Complexity:** Medium

**Summary:** Alternative payment flow using Razorpay for Indian market.

**Acceptance Criteria:**
- Razorpay JS loaded dynamically from CDN (`https://checkout.razorpay.com/v1/checkout.js`)
- `useRazorpay` hook: loads script, opens Razorpay checkout modal with order details from API
- Handler options: `key`, `amount`, `currency`, `order_id`, `handler` callback, `theme`
- On payment success: calls verification endpoint or relies on webhook
- Error modal shown on payment failure
- Configured via `NEXT_PUBLIC_RAZORPAY_KEY_ID` env var

**Dependencies:** FE-04

---

### FE-29 · Checkout Flow — Initiate, Payment UI, Success/Failure
**Phase:** 4 | **Complexity:** Medium

**Summary:** Full end-to-end checkout UX for purchasing paid content.

**Acceptance Criteria:**
- "Buy Now" click calls `POST /api/payments/initiate` with `resourceId`
- API returns `{ clientSecret, gatewayName }` — component chooses Stripe or Razorpay UI accordingly
- Checkout page shows: resource title, price, payment form
- Success state: "Payment successful! You now have access." with "Start Learning" CTA
- Failure state: "Payment failed. Please try again." with retry button
- Already-enrolled guard: if user already owns content, skip checkout and redirect to resource
- Redirect to `/resources/{id}` on success

**Dependencies:** FE-27, FE-28, FE-21

---

### FE-30 · My Content — Enrolled Courses Page
**Phase:** 4 | **Complexity:** Low

**Summary:** Student's library of all enrolled/purchased content.

**Acceptance Criteria:**
- Fetches `/api/user/enrollments` and displays ResourceCards
- Tabs or filter: All, Videos, PDFs, Blogs
- Each card shows enrollment date and "Continue" / "Watch" / "Download" CTA
- Empty state: "You haven't enrolled in any content yet. Browse resources →"
- Pagination if > 20 items

**Dependencies:** FE-25, FE-20

---

### FE-31 · User Transaction History Page
**Phase:** 4 | **Complexity:** Low

**Summary:** Student-facing list of all payment transactions.

**Acceptance Criteria:**
- Fetches user's own transactions (derived from orders linked to their account)
- Table: Resource Title, Amount, Currency, Date, Status badge (Completed/Failed/Refunded)
- Empty state for users with no purchases
- Pagination

**Dependencies:** FE-25

---

### FE-32 · Exam Listing Page — Student View
**Phase:** 5 | **Complexity:** Low

**Summary:** Student-facing list of available and upcoming exams.

**Acceptance Criteria:**
- Fetches `/api/exams` showing ACTIVE and SCHEDULED exams
- Exam card shows: Title, Description, Duration, Passing %, Status badge (Available / Upcoming / Closed), Scheduled date/time
- "Start Exam" button enabled only for ACTIVE exams
- "Coming Soon" display for SCHEDULED exams with countdown (optional)
- Attempt history per exam shown (score, passed/failed, date) if the user has attempted
- "Retake" button shown if retry is allowed and user failed

**Dependencies:** FE-25

---

### FE-33 · Exam Interface — Questions, Answer Selection & Timer
**Phase:** 5 | **Complexity:** High

**Summary:** The core exam-taking UI with server-synchronized countdown timer.

**Acceptance Criteria:**
- Client Component; exam state managed via Zustand `examStore`
- On page load: calls `GET /api/exams/attempts/{attemptId}` to fetch shuffled questions + `serverDeadline`
- Timer counts down from `serverDeadline - now` (server time, not duration); displayed as MM:SS
- Timer color: green → yellow (< 20%) → red (< 10%); pulsing animation at < 10%
- Questions displayed: one per page with Next/Prev, or all at once (configurable)
- Answer selection: radio buttons; selected answer highlighted; deselectable
- Question navigation sidebar: shows question numbers; answered vs. unanswered indicator
- "Submit Exam" button with confirmation modal ("Are you sure? You cannot change answers after submission.")
- Auto-submits when timer reaches zero (calls submit endpoint automatically)
- Prevent page navigation/refresh during exam (browser `beforeunload` warning)
- Answers stored in `examStore` locally as user progresses (not saved to server mid-exam)

**Dependencies:** FE-32

---

### FE-34 · Exam Auto-Submit & Zustand Exam Store
**Phase:** 5 | **Complexity:** Medium

**Summary:** Exam state persistence and automatic submission logic.

**Acceptance Criteria:**
- `examStore` fields: `attemptId`, `examId`, `questions[]`, `answers{}` (questionId → selectedOptionIndex), `serverDeadline`, `status`
- Auto-submit triggered when countdown reaches 0: calls `POST /api/exams/attempts/{attemptId}/submit` with all current answers
- If submit fails (network error), retries once; if retry fails, shows error with "Your answers may not have been saved" warning
- After submit success: clears exam store, redirects to `/results/{attemptId}`
- Tab visibility change tracked (optional): if exam config has anti-cheat flag, records tab-leave count and displays warning

**Dependencies:** FE-33

---

### FE-35 · Exam Result Display Page
**Phase:** 5 | **Complexity:** Low-Medium

**Summary:** Post-exam result page showing score, pass/fail status, and answer breakdown.

**Acceptance Criteria:**
- Fetches `GET /api/exams/attempts/{attemptId}/result`
- Shows: Score percentage (large display), Pass ✓ / Fail ✗ indicator, Passing threshold, Number correct / total
- Score animated on page load (counter animation from 0 to score)
- If passed: "Download Certificate" button (FE-39) + celebratory UI element
- If failed: "You needed {passing}% to pass. You scored {score}%." + retry button if allowed
- Question breakdown accordion: each question with selected answer highlighted (correct = green, incorrect = red + show correct)
- "Back to Exams" link

**Dependencies:** FE-34

---

### FE-36 · Admin — Exam Management Pages
**Phase:** 5 | **Complexity:** Medium

**Summary:** Admin interface to create, configure, schedule, and publish exams.

**Acceptance Criteria:**
- Exam list: table (Title, Status badge, Questions count, Duration, Passing %, Scheduled Start, Actions); search + filter by status
- Create exam form: Title, Description, Duration (minutes), PassingPercentage (0–100), MaxAttempts (0=unlimited), ScheduledStartAt (datetime picker), ScheduledEndAt (datetime picker)
- Edit exam: same form pre-populated
- Publish / Unpublish action with status badge update
- Delete (soft) with confirmation
- Exam detail page: shows exam info + tabs: Questions, Attempts

**Dependencies:** FE-08

---

### FE-37 · Admin — Question Bank Management
**Phase:** 5 | **Complexity:** Low-Medium

**Summary:** Add, edit, and delete questions within an exam from the admin panel.

**Acceptance Criteria:**
- Questions tab on Exam detail page
- List: QuestionText (truncated), 4 options, correct option highlighted (admin view only), SortOrder, Edit/Delete actions
- Add question form: QuestionText (textarea), Option 1–4 inputs, CorrectOption radio selector (A/B/C/D), SortOrder
- Edit question: pre-populated form; PUT to `/api/admin/exams/{id}/questions/{qId}`
- Delete question: confirmation; disabled if exam is ACTIVE or CLOSED
- Bulk upload placeholder (CSV import — future)
- Question count shown in exam detail header

**Dependencies:** FE-36

---

### FE-38 · Admin — Exam Attempt Review Page
**Phase:** 5 | **Complexity:** Low

**Summary:** Admin view of all attempts for an exam.

**Acceptance Criteria:**
- Attempts tab on Exam detail page
- Table: Student Name, Email, Score, Pass/Fail badge, Start Time, Completion Time, Status
- Sortable by score, date
- Pagination
- Filter by Pass/Fail
- Row click → modal showing question-by-question breakdown for that attempt (optional detail)
- Export CSV (optional, Phase 7+)

**Dependencies:** FE-36

---

### FE-39 · Certificate Download Button
**Phase:** 6 | **Complexity:** Low

**Summary:** Certificate download trigger on the result page and dashboard.

**Acceptance Criteria:**
- "Download Certificate" button calls `GET /api/user/certificates/{id}/download` to get pre-signed S3 URL
- On response: triggers browser download (`window.open(url, '_blank')` or `<a href={url} download>`)
- Button shows loading spinner while fetching URL
- Error toast if download fails
- Button disabled after successful download (or stays active for re-download)

**Dependencies:** FE-35

---

### FE-40 · Student — Certificates Dashboard Section
**Phase:** 6 | **Complexity:** Low

**Summary:** Certificate library in the student dashboard.

**Acceptance Criteria:**
- Fetches `/api/user/certificates` and displays certificate cards
- Certificate card: Exam Name, Issue Date, Score achieved, "Download PDF" button (FE-39)
- Empty state: "No certificates yet. Pass an exam to earn your first certificate."
- Cards show a certificate icon/thumbnail

**Dependencies:** FE-25, FE-39

---

### FE-41 · Admin — Certificate Management View
**Phase:** 6 | **Complexity:** Low

**Summary:** Admin read-only view of all issued certificates.

**Acceptance Criteria:**
- Table: Student Name, Exam Title, Issue Date, Certificate ID, Download link
- Search by student name or exam
- Pagination
- No delete/revoke in Phase 1 (view only)

**Dependencies:** FE-08

---

### FE-42 · Admin Dashboard — KPI Cards & Activity Feed
**Phase:** 7 | **Complexity:** Medium

**Summary:** Admin landing dashboard with key business metrics.

**Acceptance Criteria:**
- Fetches `GET /api/admin/dashboard/summary`
- KPI Stat Cards (using `StatsCard` component): Total Users, Total Revenue, Total Enrollments, Active Exams, Certificates Issued, New Users This Month
- Each card: metric value, label, percentage change vs. last period (up/down arrow with color)
- Recent Activity feed: last 10 events (new signup, new purchase, exam passed) with timestamps
- Date range selector (Today, This Week, This Month, Custom) — filters KPI data

**Dependencies:** FE-08

---

### FE-43 · Admin Analytics — Charts & Trends
**Phase:** 7 | **Complexity:** Medium

**Summary:** Visual analytics charts for revenue, signups, content performance, and exam stats.

**Acceptance Criteria:**
- Charts library: Recharts (lightweight, React-native)
- Revenue trend: line chart, daily/weekly/monthly toggle, date range picker
- Signup trend: bar chart, same time grouping options
- Content performance: table ranked by enrollment count + view count
- Exam stats: pass rate per exam, average score bar chart
- All charts show loading skeleton while fetching
- Charts responsive on mobile (simplified view)

**Dependencies:** FE-42

---

### FE-44 · Admin — User Management Table
**Phase:** 7 | **Complexity:** Low-Medium

**Summary:** Admin interface for viewing and managing student accounts.

**Acceptance Criteria:**
- Table: Avatar, Full Name, Email, Auth Provider badge, Status badge (Active/Inactive), Enrolled Count, Joined Date, Actions
- Search by name or email
- Filter by status, auth provider
- Activate / Deactivate user with confirmation
- Row click → User detail drawer/page: profile info, enrollment list, exam history, transaction history
- Pagination (20 per page)

**Dependencies:** FE-08

---

### FE-45 · Admin — Transaction Log
**Phase:** 7 | **Complexity:** Low

**Summary:** Paginated admin view of all payment transactions.

**Acceptance Criteria:**
- Table: Transaction ID, Student Name, Resource Title, Amount, Currency, Gateway badge, Status badge, Date
- Filter by status, gateway, date range
- Search by student email or transaction ID
- Pagination
- Total revenue sum shown in table header

**Dependencies:** FE-08

---

### FE-46 · Student Dashboard — Complete Implementation
**Phase:** 7 | **Complexity:** Medium

**Summary:** Fully populated student dashboard replacing the Phase 3 shell.

**Acceptance Criteria:**
- Fetches `GET /api/user/dashboard` for summary data
- Summary section: enrolled courses count, exams taken, passed exams count, certificates count
- "Continue Learning" section: last 3 accessed resources with progress indicator
- Upcoming Exams widget: next scheduled exam with countdown
- Recent Certificates widget: last 2 earned certificates with download buttons
- Profile completion nudge: "Complete your profile" if avatar/name missing
- All sections reflect real data from API

**Dependencies:** FE-25, FE-30, FE-32, FE-40

---

### FE-47 · End-to-End Tests — Playwright
**Phase:** 8 | **Complexity:** Medium

**Summary:** Automated E2E tests covering the most critical user journeys.

**Acceptance Criteria:**
- Playwright installed and configured with test environment base URL
- Test suites:
  1. **Auth flow**: Register → Login → Dashboard access → Logout
  2. **Content access**: Browse resources → Enroll in free resource → Watch video
  3. **Payment flow**: View paid content → Initiate checkout → Complete test payment → Access content
  4. **Exam flow**: Start exam → Answer questions → Submit → View result
  5. **Certificate flow**: Pass exam → See certificate → Download
  6. **CMS flow (admin)**: Login as admin → Update homepage banner → Verify change on public site
- Tests run in CI pipeline on every push to main
- Screenshots captured on failure

**Dependencies:** FE-46

---

### FE-48 · Accessibility & Cross-Browser Testing
**Phase:** 8 | **Complexity:** Low-Medium

**Summary:** Validate WCAG 2.1 AA compliance and cross-browser/device compatibility.

**Acceptance Criteria:**
- Axe accessibility audit run on all major pages (automated via `@axe-core/playwright`)
- Issues resolved: color contrast ratios, ARIA labels, keyboard navigation, focus management
- Manual testing checklist completed: Tab navigation order, screen reader announcement for dynamic content, form error announcements
- Cross-browser testing matrix: Chrome, Firefox, Safari, Edge (latest stable)
- Mobile device testing: iOS Safari (iPhone 14), Android Chrome (Pixel)
- Responsive breakpoints verified: 320px, 768px, 1024px, 1440px

**Dependencies:** FE-47

---

---

## BACKEND TASKS

---

### BE-01 · Solution Setup — Clean Architecture Structure
**Phase:** 1 | **Complexity:** Low

**Summary:** Initialize the .NET 8 solution with all four projects and correct project references.

**Acceptance Criteria:**
- Solution: `EducationPortal.sln` with 4 projects: `API`, `Application`, `Domain`, `Infrastructure`, `Tests`
- Project references enforced: API → Application + Infrastructure; Application → Domain; Infrastructure → Application + Domain; Tests → all
- NuGet packages installed per project:
  - Domain: none (pure C#)
  - Application: MediatR, FluentValidation, AutoMapper
  - Infrastructure: EF Core, Npgsql, StackExchange.Redis, AWSSDK.S3, QuestPDF, Serilog, Stripe.net
  - API: Swashbuckle (Swagger), Microsoft.AspNetCore.Authentication.JwtBearer
- `.editorconfig` and `Directory.Build.props` for consistent build settings
- Global `using` directives configured
- `.gitignore` covering `bin/`, `obj/`, `*.user`, `appsettings.*.json` (except Development)

**Dependencies:** None

---

### BE-02 · Domain Layer — Entities, Enums & Domain Events
**Phase:** 1 | **Complexity:** Low-Medium

**Summary:** All domain entities, enumerations, domain events, and custom exceptions defined in the Domain project.

**Acceptance Criteria:**
- All entities implemented as per Section 13 of the Technical Spec (Users, Roles, UserRoles, Permissions, RolePermissions, Categories, Resources, Enrollments, Orders, Exams, Questions, ExamAttempts, AttemptAnswers, Certificates, RefreshTokens)
- All CMS entities (CmsBanner, CmsPage, CmsFaq, CmsFooter, CmsSection, CmsSetting, CmsFeatureFlag, CmsPromoBanner)
- `AuditLog` entity with fields: Id, AdminUserId, EntityType, EntityId, Action, OldValueJson, NewValueJson, Timestamp
- Enums: `ResourceType`, `ResourceStatus`, `ExamStatus`, `OrderStatus`, `AuthProvider`, `AttemptStatus`, `CmsDataType`
- Domain events: `ExamPassedDomainEvent { UserId, ExamId, AttemptId, Score }`
- Custom exceptions: `NotFoundException`, `UnauthorizedException`, `BusinessRuleException`, `ConflictException`
- Entities use private setters where appropriate; no public parameterless constructors on domain entities
- `BaseEntity` abstract class: `Id (UUID)`, `CreatedAt`, `UpdatedAt`

**Dependencies:** BE-01

---

### BE-03 · Application Layer Foundation — MediatR, Result, Validators
**Phase:** 1 | **Complexity:** Low-Medium

**Summary:** Set up the Application layer scaffolding: pipeline behaviors, result type, common interfaces.

**Acceptance Criteria:**
- `Result<T>` class: static factory methods `Success(T value)`, `Failure(string error, int statusCode)`, `NotFound(string message)`
- `PagedResult<T>`: wraps `IEnumerable<T>` with `Page`, `PageSize`, `TotalCount`, `TotalPages`
- MediatR registered in DI; `IPipelineBehavior` implementations:
  - `ValidationBehavior<TRequest, TResponse>`: runs FluentValidation, returns 400 result on failure
  - `LoggingBehavior<TRequest, TResponse>`: logs request name + duration
- `ICurrentUserService` interface: `UserId`, `Email`, `Role`, `IsAuthenticated`; implementation reads from `IHttpContextAccessor`
- All repository interfaces defined: `IUserRepository`, `IResourceRepository`, `IExamRepository`, `ICmsRepository`, `IOrderRepository`, `IEnrollmentRepository`
- All service interfaces: `ITokenService`, `ICacheService`, `IStorageService`, `IEmailService`, `IPdfGeneratorService`, `IPaymentGateway`
- `DomainEventDispatcher` service for publishing `INotification` domain events via MediatR

**Dependencies:** BE-01, BE-02

---

### BE-04 · Infrastructure — AppDbContext, EF Core & Migrations
**Phase:** 1 | **Complexity:** Medium

**Summary:** Database context, entity type configurations, and all initial migrations.

**Acceptance Criteria:**
- `AppDbContext : DbContext` with all `DbSet<T>` properties
- Entity type configurations in separate `IEntityTypeConfiguration<T>` classes (one per entity)
- All column types, lengths, constraints, and indexes applied as per Section 13.4:
  - UNIQUE index on `Users.Email`
  - Composite UNIQUE on `Enrollments(UserId, ResourceId)`
  - UNIQUE on `Orders.GatewayEventId`
  - UNIQUE on `RefreshTokens.Token`
  - Standard indexes per Section 13.4
- `TIMESTAMPTZ` columns for all datetime fields (PostgreSQL-aware)
- JSONB columns for `CmsFooter.SocialLinks` and `CmsFooter.Columns`
- Initial migration created and verified: `dotnet ef migrations add InitialCreate`
- `HasConversion` used for enum → string storage in PostgreSQL
- Seeder class populates: default Roles, Permissions, RolePermissions, initial CmsSettings, CmsFeatureFlags, CmsSections, CmsPages (empty slugs)

**Dependencies:** BE-02, BE-03

---

### BE-05 · Infrastructure — Redis Cache Service
**Phase:** 1 | **Complexity:** Low-Medium

**Summary:** Redis-backed cache service implementation for the CMS and general caching needs.

**Acceptance Criteria:**
- `RedisCacheService : ICacheService` using `StackExchange.Redis`
- Methods: `GetAsync<T>(key)`, `SetAsync<T>(key, value, ttl)`, `DeleteAsync(key)`, `DeleteByPatternAsync(pattern)`
- JSON serialization using `System.Text.Json`
- Connection string from `appsettings.json` (`Redis:ConnectionString`)
- Graceful degradation: if Redis is unavailable, log warning and fall through to DB (no unhandled exception)
- `IServiceCollection` extension method to register Redis connection multiplexer as singleton

**Dependencies:** BE-03

---

### BE-06 · Auth — Register & Login Endpoints
**Phase:** 1 | **Complexity:** Medium

**Summary:** Email/password registration and login with JWT issuance and refresh token storage.

**Acceptance Criteria:**
- `RegisterCommand`: validates email uniqueness, hashes password with bcrypt (work factor 12), creates User + assigns User role; returns 201
- `LoginCommand`: looks up user by email, verifies bcrypt hash, generates JWT access token (15-min expiry, HS256), generates refresh token (GUID), stores hashed refresh token in `RefreshTokens` table, sets httpOnly + Secure + SameSite=Strict cookie
- JWT claims: `sub`, `email`, `role`, `permissions[]`, `iat`, `exp`
- `JwtTokenService`: reads secret + issuer + audience from `JwtSettings` options; generates and validates tokens
- Rate limiting applied to login: 5 attempts per IP per 15 minutes (using `Microsoft.AspNetCore.RateLimiting`)
- Validators: email format, password min 8 chars, required fields
- Returns: `{ accessToken, user: { id, email, fullName, role } }`

**Dependencies:** BE-03, BE-04, BE-05

---

### BE-07 · Auth — Token Refresh & Logout
**Phase:** 1 | **Complexity:** Medium

**Summary:** Secure token refresh with rotation and logout with Redis-based revocation.

**Acceptance Criteria:**
- `RefreshTokenCommand`: reads refresh token from httpOnly cookie, validates against DB record (not expired, not revoked), checks Redis revocation list, issues new access token, rotates refresh token (old revoked in Redis + DB, new stored)
- `LogoutCommand`: marks refresh token as revoked in DB, adds token hash to Redis with TTL = remaining token expiry time
- Refresh endpoint returns new access token in JSON body, sets new refresh token cookie
- If refresh token invalid/expired: returns 401, clears cookie
- Token rotation: one refresh token valid at a time per user (previous invalidated on refresh)

**Dependencies:** BE-06

---

### BE-08 · Google OAuth 2.0 Integration
**Phase:** 1 | **Complexity:** Medium

**Summary:** Google social login flow — redirect, callback, user upsert, JWT issuance.

**Acceptance Criteria:**
- `GET /api/auth/google/redirect`: builds Google OAuth authorization URL with required scopes (`openid email profile`), returns redirect
- `GET /api/auth/google/callback`: receives authorization code, exchanges for Google tokens, verifies `id_token`, extracts claims (sub, email, name, picture)
- User upsert: if email exists → update `AvatarUrl`, `ExternalProviderId` if null; if not exists → create new User with `AuthProvider=GOOGLE`, `PasswordHash=null`
- Issues internal JWT + refresh token same as email login flow
- Redirects to frontend callback URL with access token as URL fragment
- `GoogleAuthOptions`: ClientId, ClientSecret, RedirectUri from config

**Dependencies:** BE-06

---

### BE-09 · RBAC — Roles, Permissions & Policy-Based Authorization
**Phase:** 1 | **Complexity:** Medium

**Summary:** Full policy-based authorization system enforcing role-permission separation.

**Acceptance Criteria:**
- All roles and permissions seeded via `DataSeeder` (SuperAdmin, Admin, ContentManager, ExamManager, Analyst, User per Section 6.2)
- Custom `IAuthorizationRequirement` per policy: `ContentWriteRequirement`, `CmsManageRequirement`, `ExamManageRequirement`, `AnalyticsViewRequirement`, `UserManageRequirement`
- `IAuthorizationHandler` implementations that check `permissions[]` claim from JWT
- Policies registered in `Program.cs` via `AddAuthorization(options => options.AddPolicy(...))`
- `[Authorize(Policy = "ContentWrite")]` applied to resource management controllers
- `[Authorize(Policy = "CmsManage")]` applied to CMS admin controllers
- Admin vs. User domain separation: admin endpoints verify role is admin-tier; user endpoints verify role is User

**Dependencies:** BE-06

---

### BE-10 · Middleware — Exception Handling, Logging & Rate Limiting
**Phase:** 1 | **Complexity:** Low-Medium

**Summary:** Cross-cutting middleware for consistent error handling, request tracing, and brute-force protection.

**Acceptance Criteria:**
- `ExceptionHandlingMiddleware`: catches all unhandled exceptions; maps `NotFoundException → 404`, `UnauthorizedException → 401`, `BusinessRuleException → 422`, `ConflictException → 409`, all others → 500; returns consistent JSON error envelope: `{ success: false, error: { code, message } }`
- `RequestLoggingMiddleware`: logs `{Method} {Path} {StatusCode} {Duration}ms` at Info level; never logs request/response body
- Rate limiting via `Microsoft.AspNetCore.RateLimiting`: sliding window limiter on `/api/auth/login` (5 req / 15 min per IP); fixed window on all API routes (100 req / 1 min per IP for public endpoints)
- CORS configured: whitelist of frontend origins from config; `AllowCredentials()` for cookie support
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, CSP

**Dependencies:** BE-03

---

### BE-11 · Swagger, Health Check & Docker Compose
**Phase:** 1 | **Complexity:** Low

**Summary:** API documentation, health endpoint, and local development environment setup.

**Acceptance Criteria:**
- Swagger UI available at `/swagger` in Development environment; disabled in Production
- OpenAPI spec includes all endpoints with request/response schemas, auth requirements
- `GET /api/health`: returns `{ status: "healthy", timestamp, version }` with 200; checks DB connection + Redis connection; returns 503 if either unhealthy
- `docker-compose.yml`: services for `api` (port 5000), `web` (port 3000), `postgres` (port 5432), `redis` (port 6379), `nginx` (port 80/443)
- Volume mounts for PostgreSQL data persistence
- Environment variable injection via `.env` file (`.env.example` committed)
- `docker-compose.override.yml` for Development-specific settings

**Dependencies:** BE-04

---

### BE-12 · Serilog Logging Configuration
**Phase:** 1 | **Complexity:** Low

**Summary:** Structured logging setup with environment-specific sinks.

**Acceptance Criteria:**
- Serilog configured in `Program.cs` replacing default `ILogger`
- Development: Console sink with colored output, minimum level Debug
- QA: File sink (rolling daily, `logs/log-.txt`), minimum level Information
- Production: Console sink + Seq/Elasticsearch sink (URL from config), minimum level Warning
- Log enrichment: `FromLogContext()`, `WithMachineName()`, `WithThreadId()`, `WithRequestId` (from `X-Correlation-ID` header)
- Sensitive data filters: never log passwords, tokens, or card numbers
- Unhandled exception logs include: message, stack trace, request path, user ID if authenticated

**Dependencies:** BE-01

---

### BE-13 · Admin — Categories CRUD
**Phase:** 2 | **Complexity:** Low

**Summary:** Category management endpoints for admin.

**Acceptance Criteria:**
- `GET /api/admin/categories`: returns all categories with IsVisible, SortOrder; sorted by SortOrder
- `POST /api/admin/categories`: creates category; auto-generates slug from Name (lowercase, hyphenated); validates unique slug
- `PUT /api/admin/categories/{id}`: updates all fields; slug regenerated if name changed
- `DELETE /api/admin/categories/{id}`: prevents delete if resources are assigned to this category (returns 409 with message)
- All endpoints protected by `ContentWrite` policy
- FluentValidation: Name required, max 100 chars; Slug max 100 chars

**Dependencies:** BE-09, BE-04

---

### BE-14 · Admin — Resources CRUD & Status Management
**Phase:** 2 | **Complexity:** Medium

**Summary:** Full resource lifecycle management for Video, PDF, and Blog types.

**Acceptance Criteria:**
- `GET /api/admin/resources`: paginated list; supports `?search=`, `?type=`, `?status=`, `?categoryId=`, `?page=`, `?pageSize=` query params; returns total count for pagination
- `POST /api/admin/resources`: creates resource with ResourceType-specific validation (VIDEO/PDF require FileKey or ExternalUrl; BLOG requires BlogContent); sets Status=DRAFT; sets CreatedByAdminId from current user
- `GET /api/admin/resources/{id}`: full detail including S3 thumbnail URL (pre-signed)
- `PUT /api/admin/resources/{id}`: updates all editable fields; does not change CreatedByAdminId
- `DELETE /api/admin/resources/{id}`: sets IsDeleted=true (soft delete); cannot delete if PUBLISHED
- `PATCH /api/admin/resources/{id}/publish`: sets Status=PUBLISHED; requires FileKey or ExternalUrl or BlogContent present
- `PATCH /api/admin/resources/{id}/unpublish`: sets Status=UNPUBLISHED
- All mapped via CQRS commands/queries in Application layer

**Dependencies:** BE-13, BE-09

---

### BE-15 · S3 Storage Service — Pre-Signed Upload & Read URLs
**Phase:** 2 | **Complexity:** Medium

**Summary:** AWS S3 integration for secure file storage with pre-signed URL generation.

**Acceptance Criteria:**
- `S3StorageService : IStorageService` using `AWSSDK.S3`
- `GenerateUploadUrlAsync(key, contentType, expiryMinutes)`: generates PUT pre-signed URL; validates contentType against allowlist
- `GenerateDownloadUrlAsync(key, expiryMinutes)`: generates GET pre-signed URL
- `DeleteObjectAsync(key)`: deletes S3 object
- `POST /api/admin/resources/upload-url`: accepts `{ fileName, contentType, resourceType }`; validates file type (PDF: `application/pdf`; VIDEO: `video/*`; IMAGE: `image/*`); returns `{ uploadUrl, fileKey }`
- S3 bucket name, region, access key, secret key from `S3Settings` options (environment variables in prod)
- File keys follow pattern: `resources/{type}/{uuid}/{fileName}`, `thumbnails/{uuid}/{fileName}`, `certificates/{userId}/{certId}.pdf`
- S3 bucket: private, no public access, versioning enabled

**Dependencies:** BE-03, BE-09

---

### BE-16 · CMS Domain — Tables, Configs & Seed Data
**Phase:** 2 | **Complexity:** Low-Medium

**Summary:** CMS entities added to AppDbContext with entity configurations and initial seed data.

**Acceptance Criteria:**
- All CMS entities added to `AppDbContext` and their `IEntityTypeConfiguration` created
- `CmsFooter` configured as singleton (PK Id with fixed value or unique constraint)
- `CmsSettings.Key` and `CmsFeatureFlags.Key` use Key as PK (not UUID)
- Migration created for all CMS tables
- Seeder populates:
  - `CmsPages`: slugs `about-us`, `contact`, `privacy-policy`, `terms` with empty content + IsPublished=false
  - `CmsSections`: 5 default keys (show_testimonials, show_stats, show_featured, show_blog, show_promo) with IsVisible=true
  - `CmsSettings`: site_name, support_email, default_currency, exam_retry_allowed, max_exam_retries, certificate_issuer_name
  - `CmsFeatureFlags`: blog_enabled, exams_enabled, payments_enabled with IsEnabled=true
  - `CmsBanners`: homepage_hero with empty placeholder values

**Dependencies:** BE-04

---

### BE-17 · Admin CMS CRUD — Banners, Pages & FAQs
**Phase:** 2 | **Complexity:** Low-Medium

**Summary:** Admin endpoints for managing the three most-used CMS entities.

**Acceptance Criteria:**
- **Banners**: `GET /api/admin/cms/banners` (list all), `PUT /api/admin/cms/banners/{key}` (update by key); updates `UpdatedByAdminId` + `UpdatedAt`
- **Pages**: `GET /api/admin/cms/pages` (list slugs + status), `GET /api/admin/cms/pages/{slug}` (full content), `PUT /api/admin/cms/pages/{slug}` (update content + meta + IsPublished)
- **FAQs**: full CRUD (`GET` list, `POST` create, `PUT /{id}` update, `DELETE /{id}` delete); `PATCH /api/admin/cms/faqs/reorder` accepts `[{ id, sortOrder }]` array and bulk updates
- All admin CMS endpoints protected by `CmsManage` policy
- All save operations trigger: Redis cache invalidation for affected key(s) + call Next.js ISR revalidation webhook (fire-and-forget, non-blocking)
- `AuditLog` entry written for every CMS mutation (entity type, old value JSON, new value JSON, admin user ID)

**Dependencies:** BE-16, BE-09, BE-05

---

### BE-18 · Admin CMS CRUD — Footer, Sections, Settings, Flags & Promo Banners
**Phase:** 2 | **Complexity:** Low-Medium

**Summary:** Remaining CMS admin endpoints.

**Acceptance Criteria:**
- **Footer**: `GET /api/admin/cms/footer`, `PUT /api/admin/cms/footer`; JSONB fields for SocialLinks and Columns validated as valid JSON arrays
- **Sections**: `GET /api/admin/cms/sections`, `PATCH /api/admin/cms/sections/{key}` (updates IsVisible only)
- **Settings**: `GET /api/admin/cms/settings`, `PUT /api/admin/cms/settings/{key}` (updates Value; validates against DataType)
- **Feature Flags**: `GET /api/admin/cms/features`, `PATCH /api/admin/cms/features/{key}` (toggles IsEnabled)
- **Promo Banners**: full CRUD; `GET /api/admin/cms/promo-banners/active` returns only IsActive=true banners where today is within StartDate–EndDate range
- Same cache invalidation + audit logging requirements as BE-17

**Dependencies:** BE-17

---

### BE-19 · CMS Public Endpoints with Redis Caching
**Phase:** 2 | **Complexity:** Medium

**Summary:** All publicly consumed CMS API endpoints with Redis cache-aside pattern.

**Acceptance Criteria:**
- All endpoints in `CmsController` (no auth required): `GET /api/cms/banner/{key}`, `GET /api/cms/page/{slug}`, `GET /api/cms/faqs`, `GET /api/cms/footer`, `GET /api/cms/sections`, `GET /api/cms/settings`, `GET /api/cms/features`, `GET /api/cms/promo-banners/active`
- Each endpoint: check Redis for cache key → if HIT return cached → if MISS query DB → store in Redis with TTL → return
- Cache keys per naming convention in Section 8.3 of Technical Spec
- TTL values: CMS content = 1 hour; feature flags = 30 minutes
- `GET /api/cms/page/{slug}` returns 404 if `IsPublished=false`
- Response DTOs are flat/simplified for frontend consumption (no navigation properties)

**Dependencies:** BE-18, BE-05

---

### BE-20 · ISR Revalidation Webhook
**Phase:** 2 | **Complexity:** Low

**Summary:** API endpoint that triggers Next.js ISR revalidation when CMS content is updated.

**Acceptance Criteria:**
- `IRevalidationService` interface with `TriggerRevalidationAsync(string tag)` method
- `NextJsRevalidationService` implementation: HTTP POST to `{FRONTEND_URL}/api/revalidate` with body `{ tag }` and header `x-revalidation-secret: {REVALIDATION_SECRET}`
- Called fire-and-forget after every CMS admin save (wrapped in try/catch; failure does not fail the admin save operation)
- Tags used: `cms-static-pages` (for About, FAQ, Privacy, Terms), `cms-homepage` (for banner changes)
- Frontend URL and secret configured in `appsettings.json` (`Frontend:BaseUrl`, `Frontend:RevalidationSecret`)

**Dependencies:** BE-17

---

### BE-21 · Public Resource Listing & Detail Endpoints
**Phase:** 3 | **Complexity:** Low-Medium

**Summary:** Publicly accessible endpoints for browsing published resources.

**Acceptance Criteria:**
- `GET /api/resources`: returns paginated list of PUBLISHED, non-deleted resources; supports `?search=`, `?type=`, `?categoryId=`, `?featured=true`, `?page=`, `?pageSize=20`; response includes: Id, Title, Description, ResourceType, Price, IsFeatured, CategoryName, ThumbnailUrl (pre-signed, 1hr TTL); total count for pagination
- `GET /api/resources/{id}`: full resource detail; if ResourceType=BLOG includes BlogContent; for VIDEO/PDF does NOT include FileKey (security); includes Category, Price, Status
- Both endpoints available without authentication
- Redis cache for listing results: 5-minute TTL; invalidated when any resource is published/unpublished
- `AsNoTracking()` on all read queries

**Dependencies:** BE-15, BE-09

---

### BE-22 · Free Enrollment & Resource Access Endpoints
**Phase:** 3 | **Complexity:** Medium

**Summary:** Auto-enrollment logic for free content and pre-signed URL generation for resource access.

**Acceptance Criteria:**
- `POST /api/resources/{id}/enroll`: authenticated users only; validates resource is PUBLISHED and free (Price=0); checks if enrollment already exists (idempotent — returns 200 if already enrolled); creates `Enrollment` record with `OrderId=null`; returns 201
- `GET /api/resources/{id}/access`: authenticated users only; validates user is enrolled (Enrollment record exists) OR resource is free (auto-enroll inline); for VIDEO: generates pre-signed S3 URL (15-min TTL) for `FileKey`; for PDF: generates pre-signed S3 URL (5-min TTL); for ExternalUrl resources: returns the external URL directly; for BLOG: returns 400 (blog content in detail endpoint); returns `{ accessUrl, resourceType, expiresAt }`
- Entitlement check: free → enrolled (auto-enroll); paid → must have Enrollment from completed Order

**Dependencies:** BE-21, BE-15

---

### BE-23 · CMS Public Endpoints (verified)
**Phase:** 3 | **Complexity:** Low

**Summary:** Verify all CMS public endpoints are working correctly for SSR/ISR consumption.

**Acceptance Criteria:**
- All endpoints from BE-19 integration-tested with Redis running
- Response format verified for each endpoint
- Cache hit/miss behavior verified
- 404 response for unpublished pages verified
- Empty array response (not null) for empty FAQ/sections lists

**Dependencies:** BE-19

---

### BE-24 · Payment — IPaymentGateway Interface & Stripe Implementation
**Phase:** 4 | **Complexity:** High

**Summary:** Payment gateway abstraction and Stripe Payment Intent implementation.

**Acceptance Criteria:**
- `IPaymentGateway` interface: `CreatePaymentIntentAsync(amount, currency, metadata)` → `{ clientSecret, intentId }`; `ValidateWebhookSignature(payload, signature, secret)` → `WebhookEvent`
- `StripePaymentGateway : IPaymentGateway` using `Stripe.net` NuGet package
- `POST /api/payments/initiate`: authenticated user; receives `{ resourceId }`; validates resource exists and is PUBLISHED and paid (Price > 0); validates user not already enrolled; retrieves price from DB (never from client); calls gateway `CreatePaymentIntentAsync`; stores pending `Order` record; returns `{ clientSecret, gatewayName, amount, currency }`
- Amount in smallest currency unit (cents for USD, paise for INR)
- `StripeSettings` options: ApiKey, WebhookSecret from environment variables

**Dependencies:** BE-22, BE-09

---

### BE-25 · Payment — Razorpay Implementation
**Phase:** 4 | **Complexity:** Medium

**Summary:** Razorpay gateway implementation for Indian market payments.

**Acceptance Criteria:**
- `RazorpayPaymentGateway : IPaymentGateway` using Razorpay .NET SDK or HTTP client
- `CreatePaymentIntentAsync` → creates Razorpay Order; returns `{ orderId (as clientSecret), intentId }`
- `ValidateWebhookSignature`: HMAC-SHA256 of `{razorpay_order_id}|{razorpay_payment_id}` with webhook secret
- Active gateway selected via `PaymentSettings:ActiveGateway` config value (`STRIPE` or `RAZORPAY`)
- Both gateways registered in DI; factory pattern selects correct implementation

**Dependencies:** BE-24

---

### BE-26 · Payment Webhooks — Stripe & Razorpay
**Phase:** 4 | **Complexity:** High

**Summary:** Webhook endpoints for payment confirmation with signature verification and idempotency.

**Acceptance Criteria:**
- `POST /api/webhooks/stripe`: reads raw body (no JSON parsing before signature check); validates `Stripe-Signature` header using `StripeClient.ConstructEvent`; on failure returns 400
- On `payment_intent.succeeded` event: checks `Orders.GatewayEventId` for this event ID (idempotency — skip if already processed); updates Order to COMPLETED; creates `Enrollment` record; logs payment event
- `POST /api/webhooks/razorpay`: validates `X-Razorpay-Signature` HMAC; same idempotency + Order + Enrollment logic
- Both webhook controllers bypass JWT auth middleware (but validate gateway signatures)
- Webhook endpoints return 200 immediately (even if processing queued) to prevent gateway retry storms
- `GatewayEventId` UNIQUE constraint prevents duplicate enrollment on retry

**Dependencies:** BE-25

---

### BE-27 · Entitlement Check — Resource Access Guard
**Phase:** 4 | **Complexity:** Low-Medium

**Summary:** Ensures only authorized users (enrolled or free access) can retrieve resource access URLs.

**Acceptance Criteria:**
- `IEntitlementService.IsEntitledAsync(userId, resourceId)` checks: resource is free → true; resource is paid → check Enrollment record exists for userId + resourceId
- Used in `GET /api/resources/{id}/access` before generating pre-signed URL
- Returns 403 with message "Purchase required to access this resource" if not entitled
- Entitlement check uses DB query with `AsNoTracking()`; result NOT cached (must be real-time post-payment)

**Dependencies:** BE-26

---

### BE-28 · Admin — Exams & Questions CRUD
**Phase:** 5 | **Complexity:** Medium

**Summary:** Full exam and question management endpoints for admin.

**Acceptance Criteria:**
- **Exams**: `GET /api/admin/exams` (paginated, filterable by status), `POST` (create), `GET /{id}` (detail with question count), `PUT /{id}` (update; cannot change ScheduledStartAt if status is ACTIVE), `DELETE /{id}` (soft delete; only if DRAFT or ARCHIVED), `PATCH /{id}/publish` (DRAFT → PUBLISHED)
- **Questions**: `POST /api/admin/exams/{id}/questions` (add question; cannot add if exam ACTIVE/CLOSED), `PUT /api/admin/exams/{id}/questions/{qId}` (update), `DELETE /api/admin/exams/{id}/questions/{qId}` (delete; same restriction)
- Exam cannot be published without at least 1 question
- `GET /api/admin/exams/{id}/attempts`: paginated list of all attempts with user info, score, pass/fail, timestamps

**Dependencies:** BE-09, BE-04

---

### BE-29 · Exam Status Lifecycle — Background Scheduler
**Phase:** 5 | **Complexity:** Medium

**Summary:** Background hosted service that auto-transitions exam statuses at scheduled times.

**Acceptance Criteria:**
- `ExamStatusSchedulerService : BackgroundService` runs every 60 seconds
- Query: all exams with Status=SCHEDULED where `ScheduledStartAt <= utcNow` → update to ACTIVE
- Query: all exams with Status=ACTIVE where `ScheduledEndAt <= utcNow` → update to CLOSED
- Each transition logged at Info level: `Exam {ExamId} transitioned from {OldStatus} to {NewStatus}`
- Mutations use a dedicated `IServiceScopeFactory` to create scoped DbContext (BackgroundService is singleton)
- Graceful cancellation on app shutdown

**Dependencies:** BE-28

---

### BE-30 · Exam Attempt — Creation & Question Delivery
**Phase:** 5 | **Complexity:** High

**Summary:** Exam attempt initiation with server-side question shuffling and deadline calculation.

**Acceptance Criteria:**
- `POST /api/exams/{id}/attempts`: authenticated user; validates exam status is ACTIVE; counts user's prior attempts for this exam; enforces MaxAttempts (if > 0); creates `ExamAttempt` record with `Status=IN_PROGRESS`, `StartedAt=utcNow`
- Returns: `{ attemptId, serverDeadline (utcNow + DurationMinutes), questions[] }` — questions are shuffled using `Random.Shuffle()` with server-side seed; each question has `{ id, questionText, options[] }` — `CorrectOptionIndex` is NEVER included in response
- `GET /api/exams/attempts/{attemptId}`: authenticated user; validates attempt belongs to current user; returns same structure (for page refresh recovery); if `Status != IN_PROGRESS` returns 400

**Dependencies:** BE-29, BE-22

---

### BE-31 · Exam Answer Submission & Evaluation
**Phase:** 5 | **Complexity:** High

**Summary:** Server-side answer evaluation, score calculation, pass/fail determination, and domain event publication.

**Acceptance Criteria:**
- `POST /api/exams/attempts/{attemptId}/submit`: validates attempt is IN_PROGRESS and belongs to current user; validates submission time <= `StartedAt + DurationMinutes + 30 seconds` (grace period); if late submission: return 400 "Submission window has closed"
- Evaluation: for each answer in payload, compare `selectedOptionIndex` with `CorrectOptionIndex` from DB; save `AttemptAnswer` records with `IsCorrect` flag
- Score = `(correctCount / totalQuestions) * 100`; `IsPassed = Score >= exam.PassingPercentage`
- Updates `ExamAttempt`: `Score`, `IsPassed`, `CompletedAt=utcNow`, `Status=COMPLETED`
- If `IsPassed=true`: publish `ExamPassedDomainEvent` via MediatR
- Returns: `{ score, isPassed, correctCount, totalQuestions, attemptId }` immediately (certificate generation is async)
- `GET /api/exams/attempts/{attemptId}/result`: returns full result with per-question breakdown (now shows correct answers)

**Dependencies:** BE-30

---

### BE-32 · Exam Retry Logic
**Phase:** 5 | **Complexity:** Low

**Summary:** Enforce configurable retry limits on exam attempts.

**Acceptance Criteria:**
- Retry settings read from `CmsSettings`: `exam_retry_allowed` (bool), `max_exam_retries` (int)
- Per-exam override: `Exam.MaxAttempts` (0 = unlimited; > 0 = max attempts)
- In `POST /api/exams/{id}/attempts`: count existing COMPLETED + TIMED_OUT attempts for this user + exam; if count >= maxAttempts (and MaxAttempts != 0) → return 409 "Maximum attempts reached"
- `GET /api/exams` for user: include `{ userAttemptCount, canAttempt }` per exam in response

**Dependencies:** BE-31

---

### BE-33 · Certificate Generation — QuestPDF + S3 Upload
**Phase:** 6 | **Complexity:** Medium

**Summary:** Async certificate PDF generation triggered by ExamPassedDomainEvent.

**Acceptance Criteria:**
- `ExamPassedDomainEventHandler : INotificationHandler<ExamPassedDomainEvent>` (MediatR notification handler)
- Handler: fetches User (FullName), Exam (Title), CmsSettings (certificate_issuer_name, site_name)
- Generates unique `CertificateId` (UUID)
- `QuestPdfCertificateGenerator : IPdfGeneratorService`: creates certificate PDF using QuestPDF; template includes: Organization name (top), "Certificate of Achievement" heading, student name (large), "has successfully completed" body, Exam title, Score achieved (optional), Issue date, Certificate ID (bottom), placeholder logo space
- Uploads PDF bytes to S3 at key `certificates/{userId}/{certificateId}.pdf`
- Creates `Certificate` record: `{ Id=CertificateId, UserId, ExamAttemptId, S3Key, IssuedAt=utcNow }`
- Updates `ExamAttempt.CertificateId = CertificateId`
- Entire handler wrapped in try/catch — failure logged but does not propagate exception (certificate can be regenerated)

**Dependencies:** BE-31, BE-15

---

### BE-34 · Certificate Download & Verification Endpoints
**Phase:** 6 | **Complexity:** Low

**Summary:** Endpoints for certificate download and public verification.

**Acceptance Criteria:**
- `GET /api/user/certificates/{id}/download`: authenticated user; validates `certificate.UserId == requestingUserId` (403 if not owner); generates S3 pre-signed GET URL (5-minute TTL); returns `{ downloadUrl, expiresAt }`
- `GET /api/user/certificates`: returns list of user's certificates (Id, ExamTitle, IssuedAt, Score); sorted by IssuedAt desc
- `GET /api/certificates/verify/{id}`: public (no auth); returns `{ certificateId, studentName, examTitle, issuedAt, isValid: true }` if found; 404 if not found

**Dependencies:** BE-33, BE-15

---

### BE-35 · Email Notifications — SendGrid Integration
**Phase:** 6 | **Complexity:** Low-Medium

**Summary:** Transactional email service for welcome, purchase receipt, and certificate issued notifications.

**Acceptance Criteria:**
- `SendGridEmailService : IEmailService` using `SendGrid` NuGet package
- `SendAsync(to, subject, htmlBody)` base method
- Pre-built email types:
  - **WelcomeEmail**: sent on Register; "Welcome to {site_name}" with login link
  - **CertificateIssuedEmail**: sent from `ExamPassedDomainEventHandler` after certificate generated; "Congratulations! Your certificate is ready" with dashboard link
  - **PurchaseReceiptEmail**: sent after successful Order creation; resource title, amount, date
- `SendGridSettings`: ApiKey, FromEmail, FromName from environment variables
- Graceful failure: email errors logged but never fail the main operation
- Development: skip actual send, log email content to console (configurable via `Email:Mode: skip`)

**Dependencies:** BE-33, BE-26

---

### BE-36 · Admin Dashboard Summary & Analytics Endpoints
**Phase:** 7 | **Complexity:** Medium

**Summary:** Aggregation queries powering the admin analytics dashboard.

**Acceptance Criteria:**
- `GET /api/admin/dashboard/summary`: returns `{ totalUsers, totalRevenue, totalEnrollments, activeExams, certificatesIssued, newUsersThisMonth, revenueThisMonth }`; all via single optimized query set; cached in Redis for 5 minutes
- `GET /api/admin/analytics/signups?from=&to=&groupBy=day|week|month`: returns `[{ date, count }]` array
- `GET /api/admin/analytics/revenue?from=&to=&groupBy=day|week|month`: returns `[{ date, amount }]` array; only COMPLETED orders
- `GET /api/admin/analytics/content-performance`: returns resources ranked by enrollment count + distinct user count; top 20
- `GET /api/admin/analytics/exam-stats`: returns per-exam `{ examId, title, totalAttempts, passCount, failCount, avgScore }`
- `GET /api/admin/transactions?page=&pageSize=&status=&from=&to=`: paginated transaction list with user + resource info joined
- All analytics endpoints protected by `AnalyticsView` policy

**Dependencies:** BE-09, BE-05

---

### BE-37 · Student Dashboard & User Profile Endpoints
**Phase:** 7 | **Complexity:** Low-Medium

**Summary:** Personalized data endpoints for the student-facing dashboard.

**Acceptance Criteria:**
- `GET /api/user/dashboard`: returns `{ enrolledCount, examsAttempted, examsPassed, certificatesEarned, recentEnrollments[], upcomingExams[], recentCertificates[] }`
- `GET /api/user/profile`: returns user's own profile (Id, FullName, Email, AvatarUrl, AuthProvider, CreatedAt)
- `PUT /api/user/profile`: updates FullName, AvatarUrl (S3 key); email cannot be changed; validates FullName not empty, max 255 chars
- `GET /api/user/enrollments`: paginated list of user's enrolled resources with resource details
- All user endpoints protected by User-tier auth; users cannot access other users' data

**Dependencies:** BE-22, BE-32

---

### BE-38 · Admin User Management Endpoints
**Phase:** 7 | **Complexity:** Low

**Summary:** Admin-only endpoints for viewing and managing student accounts.

**Acceptance Criteria:**
- `GET /api/admin/users`: paginated list; `?search=` (name or email), `?status=active|inactive`, `?authProvider=`; returns Id, FullName, Email, AuthProvider, IsActive, CreatedAt, enrollmentCount
- `GET /api/admin/users/{id}`: full detail; includes enrollments list, exam attempt summary, transaction list
- `PATCH /api/admin/users/{id}/activate`: sets IsActive=true
- `PATCH /api/admin/users/{id}/deactivate`: sets IsActive=false; user's JWT will fail on next request (middleware checks IsActive)
- `GET /api/admin/users/{id}/enrollments`: user's full enrollment list with resource details
- Protected by `UserManage` policy

**Dependencies:** BE-09, BE-36

---

### BE-39 · Unit Tests — Application Layer
**Phase:** 8 | **Complexity:** Medium

**Summary:** Comprehensive unit tests for Application layer handlers and business logic.

**Acceptance Criteria:**
- Test project uses xUnit + Moq + FluentAssertions
- Coverage target: ≥ 70% of Application layer
- Test suites:
  - **Auth**: Register (success, duplicate email, weak password); Login (success, wrong password, inactive user); Refresh (success, expired token, revoked token)
  - **Exams**: CreateAttempt (success, max attempts exceeded, exam not active); SubmitAnswers (success, late submission, correct scoring); Score calculation edge cases (0%, 100%, rounding)
  - **CMS**: UpdateBanner (cache invalidated after save); UpdatePage (ISR revalidation triggered); ToggleFeatureFlag (cache invalidated)
  - **Payments**: InitiatePayment (success, already enrolled, resource free/not found); Webhook idempotency (same event processed twice → one enrollment)
  - **Certificates**: ExamPassedEventHandler (success, S3 upload failure graceful handling)
- CI pipeline runs tests on every pull request; merge blocked if tests fail

**Dependencies:** BE-37, BE-35

---

### BE-40 · Integration Tests & CI/CD Pipeline
**Phase:** 8 | **Complexity:** Medium

**Summary:** Integration tests for critical API flows and GitHub Actions CI/CD pipeline setup.

**Acceptance Criteria:**
- Integration test project using `Microsoft.AspNetCore.Mvc.Testing` + `Testcontainers` (real PostgreSQL + Redis in Docker for tests)
- Integration test suites:
  - Full auth flow: register → login → access protected endpoint → refresh → logout
  - Payment webhook: simulate Stripe webhook → verify Order created → verify Enrollment created → verify idempotency on second call
  - Exam flow: create attempt → submit answers → verify score → verify certificate triggered
- GitHub Actions workflow (`.github/workflows/ci.yml`):
  - Trigger: push to `main` and all PRs
  - Jobs: `lint-frontend` (ESLint), `type-check-frontend` (tsc --noEmit), `test-backend` (dotnet test), `build-frontend` (next build), `build-backend` (dotnet build --configuration Release)
  - All jobs must pass before merge to main is allowed (branch protection)
- Deployment job (manual trigger): builds Docker images, pushes to registry, deploys to target environment

**Dependencies:** BE-39

---
*End of Development Spec v1.0*
