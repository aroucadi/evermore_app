# 11. Deployment & Infrastructure

## 11.1 Infrastructure Overview

The infrastructure is fully **Serverless** to minimize ops overhead.

-   **Compute/Frontend:** Vercel (Next.js).
-   **Database:** Neon (Serverless Postgres).
-   **Vector DB:** Pinecone (Serverless).
-   **Storage:** AWS S3 or Vercel Blob (for Audio/Images).
-   **AI Inference:** Google Vertex AI + ElevenLabs API.

---

## 11.2 Deployment Strategy

-   **Zero-Downtime:** Vercel manages atomic deployments. Old version serves traffic until new version is healthy.
-   **Database Migrations:**
    -   Run `drizzle-kit push` or `migrate` *during* the build process or via a GitHub Action before deployment.
    -   *Rule:* All schema changes must be backward compatible (e.g., add column before populating it).

---

## 11.3 Secrets Management

-   **Production:** Secrets stored in Vercel Project Settings (encrypted).
-   **Development:** `.env.local` (git-ignored).
-   **Rotation:** Rotate API keys (ElevenLabs, Google) every 90 days or upon suspected breach.

---

## 11.4 Disaster Recovery

-   **Database Backups:** Neon provides Point-in-Time Recovery (PITR) for last 7 days.
-   **Code:** GitHub is the source of truth.
-   **RTO (Recovery Time Objective):** < 1 hour.
-   **RPO (Recovery Point Objective):** < 5 minutes (data loss).
