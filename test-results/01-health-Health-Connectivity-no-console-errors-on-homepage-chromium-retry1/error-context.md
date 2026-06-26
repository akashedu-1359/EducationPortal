# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-health.spec.ts >> Health & Connectivity >> no console errors on homepage
- Location: e2e\01-health.spec.ts:35:7

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 0
Received length: 3
Received array:  ["Access to font at 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2' from origin 'https://education-portal-rpvr.vercel.app' has been blocked by CORS policy: Request header field x-e2e-test is not allowed by Access-Control-Allow-Headers in preflight response.", "Failed to load resource: net::ERR_FAILED", "Failed to load resource: the server responded with a status of 401 ()"]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - navigation [ref=e5]:
        - link "EduPortal" [ref=e6] [cursor=pointer]:
          - /url: /
          - img [ref=e8]
          - generic [ref=e11]: EduPortal
        - generic [ref=e13]:
          - link "Sign In" [ref=e14] [cursor=pointer]:
            - /url: /auth/login
            - button "Sign In" [ref=e15]
          - link "Get Started" [ref=e16] [cursor=pointer]:
            - /url: /auth/register
            - button "Get Started" [ref=e17]
    - main [ref=e18]:
      - generic [ref=e19]:
        - text: free
        - link "pdf →" [ref=e20] [cursor=pointer]:
          - /url: https://education-portal-rpvr.vercel.app/resources?type=PDF
      - generic [ref=e23]:
        - generic [ref=e24]: Learn without limits
        - heading "Premium Education, Anywhere." [level=1] [ref=e26]
        - paragraph [ref=e27]: Access video courses, PDFs, and articles. Take exams and earn verifiable certificates — all in one place.
        - link "Create Free Account" [ref=e29] [cursor=pointer]:
          - /url: /auth/register
      - generic [ref=e32]:
        - generic [ref=e33]:
          - heading "Everything you need to learn and grow" [level=2] [ref=e34]
          - paragraph [ref=e35]: One platform, multiple content formats, real certifications.
        - generic [ref=e36]:
          - generic [ref=e37]:
            - img [ref=e39]
            - heading "Video Courses" [level=3] [ref=e41]
            - paragraph [ref=e42]: High-quality video lectures from industry experts, accessible anytime.
          - generic [ref=e43]:
            - img [ref=e45]
            - heading "PDF Resources" [level=3] [ref=e48]
            - paragraph [ref=e49]: Downloadable study materials, guides, and reference documents.
          - generic [ref=e50]:
            - img [ref=e52]
            - heading "Blog Articles" [level=3] [ref=e55]
            - paragraph [ref=e56]: In-depth articles keeping you up-to-date with industry trends.
          - generic [ref=e57]:
            - img [ref=e59]
            - heading "Certificates" [level=3] [ref=e62]
            - paragraph [ref=e63]: Earn verifiable certificates upon passing exams. Share on LinkedIn.
      - generic [ref=e65]:
        - generic [ref=e66]:
          - heading "How it works" [level=2] [ref=e67]
          - paragraph [ref=e68]: From sign-up to certified in four simple steps.
        - generic [ref=e69]:
          - generic [ref=e70]:
            - generic [ref=e72]: "01"
            - heading "Browse & Enroll" [level=3] [ref=e73]
            - paragraph [ref=e74]: Explore our library. Free content is available instantly.
          - generic [ref=e75]:
            - generic [ref=e77]: "02"
            - heading "Learn at Your Pace" [level=3] [ref=e78]
            - paragraph [ref=e79]: Watch videos, read PDFs, and study blog articles on your schedule.
          - generic [ref=e80]:
            - generic [ref=e82]: "03"
            - heading "Take the Exam" [level=3] [ref=e83]
            - paragraph [ref=e84]: Prove your knowledge with our timed, server-validated exams.
          - generic [ref=e85]:
            - generic [ref=e86]: "04"
            - heading "Earn Your Certificate" [level=3] [ref=e87]
            - paragraph [ref=e88]: Download and share your verifiable certificate upon passing.
      - generic [ref=e90]:
        - heading "Start learning today — it's free" [level=2] [ref=e91]
        - paragraph [ref=e92]: Join thousands of learners already growing their skills on EduPortal.
        - link "Create Free Account" [ref=e94] [cursor=pointer]:
          - /url: /auth/register
          - text: Create Free Account
          - img [ref=e95]
        - generic [ref=e97]:
          - generic [ref=e98]:
            - img [ref=e99]
            - text: No credit card required
          - generic [ref=e102]:
            - img [ref=e103]
            - text: Free content available
          - generic [ref=e106]:
            - img [ref=e107]
            - text: Cancel anytime
    - contentinfo [ref=e110]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - generic [ref=e113]:
            - link "EduPortal" [ref=e114] [cursor=pointer]:
              - /url: /
              - img [ref=e116]
              - generic [ref=e119]: EduPortal
            - paragraph [ref=e120]: Access premium educational content, take exams, and earn certificates. Learn without limits.
            - generic [ref=e121]:
              - link "Twitter" [ref=e122] [cursor=pointer]:
                - /url: "#"
                - img [ref=e123]
              - link "LinkedIn" [ref=e125] [cursor=pointer]:
                - /url: "#"
                - img [ref=e126]
              - link "YouTube" [ref=e130] [cursor=pointer]:
                - /url: "#"
                - img [ref=e131]
              - link "Facebook" [ref=e134] [cursor=pointer]:
                - /url: "#"
                - img [ref=e135]
              - link "Instagram" [ref=e137] [cursor=pointer]:
                - /url: "#"
                - img [ref=e138]
          - generic [ref=e141]:
            - heading "Company" [level=3] [ref=e142]
            - list [ref=e143]:
              - listitem [ref=e144]:
                - link "About Us" [ref=e145] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e146]:
                - link "Contact" [ref=e147] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e148]:
                - link "Careers" [ref=e149] [cursor=pointer]:
                  - /url: /careers
              - listitem [ref=e150]:
                - link "Press" [ref=e151] [cursor=pointer]:
                  - /url: /press
          - generic [ref=e152]:
            - heading "Legal" [level=3] [ref=e153]
            - list [ref=e154]:
              - listitem [ref=e155]:
                - link "Terms of Service" [ref=e156] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e157]:
                - link "Privacy Policy" [ref=e158] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e159]:
                - link "Cookie Policy" [ref=e160] [cursor=pointer]:
                  - /url: /cookies
              - listitem [ref=e161]:
                - link "Refund Policy" [ref=e162] [cursor=pointer]:
                  - /url: /refunds
          - generic [ref=e163]:
            - heading "Support" [level=3] [ref=e164]
            - list [ref=e165]:
              - listitem [ref=e166]:
                - link "Help Center" [ref=e167] [cursor=pointer]:
                  - /url: /help
              - listitem [ref=e168]:
                - link "FAQ" [ref=e169] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e170]:
                - link "Community" [ref=e171] [cursor=pointer]:
                  - /url: /community
              - listitem [ref=e172]:
                - link "Status" [ref=e173] [cursor=pointer]:
                  - /url: /status
        - generic [ref=e174]:
          - paragraph [ref=e175]: © 2026 EduPortal. All rights reserved.
          - generic [ref=e176]:
            - link "Terms" [ref=e177] [cursor=pointer]:
              - /url: /terms
            - link "Privacy" [ref=e178] [cursor=pointer]:
              - /url: /privacy
            - link "Cookies" [ref=e179] [cursor=pointer]:
              - /url: /cookies
  - alert [ref=e180]
```

# Test source

```ts
  1  | import { test, expect, request } from "@playwright/test";
  2  | 
  3  | const API = process.env.PLAYWRIGHT_API_URL || "http://localhost:5000";
  4  | 
  5  | test.describe("Health & Connectivity", () => {
  6  |   test("frontend loads and returns 200", async ({ page }) => {
  7  |     const res = await page.goto("/");
  8  |     expect(res?.status()).toBe(200);
  9  |   });
  10 | 
  11 |   test("page title contains EduPortal", async ({ page }) => {
  12 |     await page.goto("/");
  13 |     await expect(page).toHaveTitle(/EduPortal/i);
  14 |   });
  15 | 
  16 |   test("backend health endpoint returns healthy", async () => {
  17 |     const ctx = await request.newContext({ baseURL: API });
  18 |     const res = await ctx.get("/api/health");
  19 |     expect(res.status()).toBe(200);
  20 |     const body = await res.json();
  21 |     expect(body.status ?? body.Status).toMatch(/healthy|ok/i);
  22 |     await ctx.dispose();
  23 |   });
  24 | 
  25 |   test("navbar is visible", async ({ page }) => {
  26 |     await page.goto("/");
  27 |     await expect(page.locator("nav")).toBeVisible();
  28 |   });
  29 | 
  30 |   test("footer is visible", async ({ page }) => {
  31 |     await page.goto("/");
  32 |     await expect(page.locator("footer")).toBeVisible();
  33 |   });
  34 | 
  35 |   test("no console errors on homepage", async ({ page }) => {
  36 |     const errors: string[] = [];
  37 |     page.on("console", (msg) => {
  38 |       if (msg.type() === "error") errors.push(msg.text());
  39 |     });
  40 |     await page.goto("/");
  41 |     await page.waitForLoadState("networkidle");
  42 |     const critical = errors.filter(
  43 |       (e) => !e.includes("favicon") && !e.includes("hydrat")
  44 |     );
> 45 |     expect(critical).toHaveLength(0);
     |                      ^ Error: expect(received).toHaveLength(expected)
  46 |   });
  47 | });
  48 | 
```