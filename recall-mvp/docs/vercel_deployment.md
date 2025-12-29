# Vercel Deployment Guide

Complete step-by-step guide for deploying Recall to Vercel.

---

## Step 1: vercel.json Configuration

Your `vercel.json` should contain only:

```json
{
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "crons": [
        {
            "path": "/api/cron/process-jobs",
            "schedule": "*/5 * * * *"
        }
    ],
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "outputDirectory": ".next"
}
```

---

## Step 2: Vercel Dashboard Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add each variable below. For each, select environments: ✅ Production, ✅ Preview, ✅ Development

### Core Authentication
| Variable | Example Value |
|----------|---------------|
| `NODE_ENV` | `production` |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `JWT_SECRET` | Generate with `openssl rand -base64 32` |
| `CRON_SECRET` | Generate with `openssl rand -hex 16` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

### Database (CockroachDB)
| Variable | Example Value |
|----------|---------------|
| `DATABASE_URL` | `postgresql://user:pass@cluster.cockroachlabs.cloud:26257/defaultdb?sslmode=require` |

### Redis (Upstash)
| Variable | Example Value |
|----------|---------------|
| `REDIS_URL` | `rediss://default:password@host.upstash.io:6379` |

### LLM Provider (Google Vertex AI)
| Variable | Example Value |
|----------|---------------|
| `LLM_PROVIDER` | `vertex` |
| `GOOGLE_CLOUD_PROJECT` | `your-gcp-project-id` |
| `GOOGLE_CLOUD_LOCATION` | `us-central1` |
| `GOOGLE_APPLICATION_CREDENTIALS_BASE64` | Base64-encoded service account JSON |

### Speech (ElevenLabs)
| Variable | Example Value |
|----------|---------------|
| `SPEECH_PROVIDER` | `elevenlabs` |
| `ELEVENLABS_API_KEY` | `sk_your_api_key` |
| `ELEVENLABS_VOICE_ID` | `pNInz6obpgDQGcFmaJgB` |
| `ELEVENLABS_AGENT_ID` | `agent_your_agent_id` |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | Same as above |

### Vector Store (Pinecone)
| Variable | Example Value |
|----------|---------------|
| `PINECONE_API_KEY` | `pcsk_your_pinecone_key` |

### Feature Flags
| Variable | Value |
|----------|-------|
| `USE_MOCKS` | `false` |
| `NEXT_PUBLIC_USE_MOCKS` | `false` |
| `LOG_LEVEL` | `info` |

---

## Step 3: Database Setup (One-Time)

Before first deploy, create database tables locally:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://user:pass@cluster.cockroachlabs.cloud:26257/defaultdb?sslmode=require"

# Create tables (safe - won't delete existing data)
npm run db:push
```

> ⚠️ **Important**: Run this ONCE before first Vercel deploy. This creates tables in your cloud CockroachDB.

---

## Step 4: Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel auto-detects Next.js
4. Click **Deploy**

---

## Step 5: Verify Deployment

After deployment:

1. **Check logs**: Vercel Dashboard → Deployments → View Logs
2. **Verify services connected**:
   - `[DI] Using GoogleVertexAdapter` ✅
   - `[DI] Using PineconeStore` ✅
   - `[RedisService] Connected` ✅
3. **Test cron**: Check Functions tab for `/api/cron/process-jobs` executions

---

## Cron Job

The cron runs every 5 minutes (`*/5 * * * *`) and processes pending chapter generation jobs.

- **Endpoint**: `/api/cron/process-jobs`
- **Authentication**: Uses `CRON_SECRET` header
- **View logs**: Vercel Dashboard → Logs → Filter by `/api/cron`

---

## Staging vs Production

| Aspect | Docker Staging | Vercel Production |
|--------|----------------|-------------------|
| Database | Seeded with demo data | Empty (users create accounts) |
| Seed script | Runs on container start | **Never runs** |
| Cron | BackgroundWorker (10s poll) | Vercel Cron (5 min) |

---

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify `GOOGLE_APPLICATION_CREDENTIALS_BASE64` is valid base64

### Cron Not Running
- Verify `CRON_SECRET` is set
- Check Vercel Dashboard → Crons tab

### Database Connection Failed
- Verify `DATABASE_URL` includes `?sslmode=require`
- Run `npm run db:push` to create tables

---

## Quick Reference

```bash
# One-time database setup
npm run db:push

# Deploy via Git
git push origin main

# Deploy via CLI
vercel --prod
```
