# Future Tech Recommendations

**Date:** 2024-05-22

This document outlines strategic recommendations for the evolution of the Recall platform. These recommendations are **deferred** for the current MVP release to prioritize stability and speed of delivery, but should be considered for the next major milestone (V2).

## 1. Technology Stack Stabilization

**Current State:** Next.js 16 (Canary/Beta) + React 19.
**Risk:** Potential instability in production; breaking changes in minor updates; limited community support for edge cases.

**Recommendation:**
*   **Trigger:** If we encounter inexplicable rendering bugs or compiler crashes in production.
*   **Action:** Downgrade to the latest LTS release of Next.js (v15 or v14) and React 18.
*   **Why Deferred:** The current features (Server Actions, Compiler) are utilized in the codebase. Rewriting to remove them now would destabilize the MVP launch.

## 2. Authentication & Identity

**Current State:** Custom/MVP session handling.
**Risk:** Maintenance burden; security complexity.

**Recommendation:**
*   **Trigger:** Post-MVP launch or Requirement for multi-tenancy/Social Login.
*   **Action:** Migrate to a managed Auth provider like **Clerk**, **NextAuth.js (Auth.js)**, or **Supabase Auth**.
*   **Benefit:** Out-of-the-box handling of MFA, Session management, and OAuth providers.

## 3. Asynchronous Worker Architecture

**Current State:** Next.js API Routes + Cron.
**Risk:** Timeout limitations on serverless functions; loss of jobs during restarts.

**Recommendation:**
*   **Trigger:** Long-running jobs (book generation) failing due to timeouts.
*   **Action:** Extract worker logic to a dedicated service (e.g., Temporal.io, BullMQ on Redis, or separate Node.js worker service).
*   **Benefit:** Reliable execution of long-running AI workflows.

## 4. Observability & Monitoring

**Current State:** Structured Logs (File/Console).
**Risk:** limited visibility into distributed traces across AI services.

**Recommendation:**
*   **Trigger:** Difficulty debugging latency or failures in production.
*   **Action:** Integrate a dedicated observability platform (Datadog, Honeycomb, or OpenTelemetry with Prometheus/Grafana).
