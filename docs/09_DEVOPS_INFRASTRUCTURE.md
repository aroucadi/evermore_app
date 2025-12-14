# 09. DevOps & Infrastructure

## 1. Development Workflow

-   **Branching:** GitHub Flow (Feature Branches -> PR -> Main).
-   **Commits:** Conventional Commits (feat, fix, chore, docs).
-   **Reviews:** Mandatory Code Review for all PRs. CI must pass.

## 2. CI/CD Pipeline (GitHub Actions)

### Triggers
-   Push to `main`.
-   Pull Request open/synchronize.

### Steps
1.  **Lint:** `npm run lint` (ESLint).
2.  **Type Check:** `tsc --noEmit`.
3.  **Unit Tests:** `npm run test:unit` (Vitest).
4.  **Integration Tests:** `npm run test:integration`.
5.  **Build:** `npm run build` (Ensures Next.js build passes).
6.  **E2E:** `npm run test:e2e` (Playwright) - *On deployment or nightly*.

## 3. Infrastructure Overview

-   **Hosting:** Vercel Pro.
    -   Frontend: Edge Network.
    -   Functions: AWS Lambda (via Vercel).
-   **Database:** Neon (Serverless Postgres) or Supabase.
-   **Storage:** Vercel Blob or AWS S3.
-   **AI:** Google Cloud Vertex AI (Service Account Creds) + ElevenLabs API.

## 4. Environment Management

-   **Development:** Localhost + `.env.local`. Connected to Dev DB branch.
-   **Preview:** Vercel Preview Deployments (Ephemereal). Connected to Staging DB.
-   **Production:** `recall.com`. Connected to Prod DB.

## 5. Secrets Management

-   **Local:** `.env.local` (Gitignored).
-   **Cloud:** Vercel Project Environment Variables.
-   **Rotation:** Manual rotation of API Keys every 90 days.
