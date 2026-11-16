# ResolveX-AI interface

Inspired by the supplied Baseline reference: navy, editorial typography, inset rounded marketing sections, numbered explanations and restrained entrances.

- Product: campus issue reporting for students and facility administrators.
- Character: assured, approachable, precise.
- World: campus buildings, wayfinding and maintenance records.
- Moments: campus photography on the landing page; meaningful operations charts.
- Signature: a numbered route from report to resolution.

The primary landing action is reporting an issue; tracking is secondary. Preserve authentication and roles. Student data uses the complaint context; administrator data uses existing APIs. Label marketing examples. Use Onest, navy and warm white, neutral application surfaces and semantic statuses. Responsive layouts must cover 320, 768, 1024 and 1440px. Include keyboard focus, reduced motion, loading, empty, filtered-empty and error states. No blocking intro loader, decorative glows or invented claims.

Design refinement informed by [unslop by Damir Sokolovsky](https://heydamir.design/unslop), CC BY 4.0.

## Verification — 17 November 2026

- Production build: `npm --prefix frontend run build` passed (TypeScript and Vite).
- Backend regression suite: 19 passed, using a separate verification SQLite database.
- Browser checks: student/admin demo sign-in, student role rejection at admin routes,
  student search/filtered empty state/pagination, category filters, critical queue,
  extended analytics, report analysis, submission, persisted history, tracking,
  administrator triage transition and its audit entry, theme switching, registration
  password mismatch feedback, mobile navigation and Escape.
- Responsive checks covered 320, 768, 1024 and 1440px. Tables scroll inside their panels.
- The sample report used for manual verification is explicitly titled
  `QA check: projector does not turn on` in the local demo backend.
- Frontend authentication continues to use the existing AuthContext, including
  Google sign-in and password reset when Firebase is configured. Those external
  account flows were not exercised; their entry points remain available.
- Backend tests emitted existing dependency deprecation warnings. No backend source
  or schema changes were required by this redesign.
- The marketing page no longer fetches protected complaint data for guests.
- Routes are lazy loaded; the initial JavaScript bundle is about 110 KB gzipped.

## Local development

From `frontend`, run `npm run dev`. The existing Vite proxy targets the backend
at `http://127.0.0.1:8000`. Protected workspaces require sign-in; the sign-in pages
include the project's existing student and administrator demos.

The hero photograph is stored locally at `frontend/public/campus.jpg`.
Source: [Unsplash campus photograph](https://images.unsplash.com/photo-1562774053-701939374585).


Onest is bundled locally as a variable WOFF2 with its SIL Open Font License in public/fonts. The interface does not require a Google Fonts request.

## Motion update
Hero lines reveal in sequence, the campus photograph eases into place and follows scroll, sections enter as they come into view, dashboard metrics count up, and interactive controls respond to hover and press. All effects respect reduced-motion preferences. Existing storage keys, login credentials and API contracts are retained.
