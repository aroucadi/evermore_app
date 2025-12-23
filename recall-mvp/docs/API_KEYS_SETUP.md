# 🔑 Recall MVP - API Keys Setup Guide

> **Get your Agentic AI running for FREE!** This guide walks you through obtaining all the API keys needed to run Recall.

---

## 📋 Quick Reference

| Service | Purpose | Free Tier | Priority |
|---------|---------|-----------|----------|
| **Google Cloud (Gemini)** | LLM / AI Brain | $300 credit for 90 days | ⭐ REQUIRED |
| **ElevenLabs** | Voice Synthesis | 10,000 chars/month | Optional |
| **Pinecone** | Vector Memory | 100K vectors free | Optional |
| **PostgreSQL** | Database | Free with Docker | REQUIRED |

---

## 🧠 1. Google Cloud / Gemini (Primary AI)

**Why**: Powers all AI reasoning, planning, and conversation.

### Step-by-Step:

1. **Go to**: [console.cloud.google.com](https://console.cloud.google.com)

2. **Sign up** with your Google account
   - You get **$300 FREE credit** for 90 days! 🎉

3. **Create a new project**:
   - Click "Select Project" → "New Project"
   - Name it: `recall-ai` (or anything you like)
   - Note your **Project ID** (you'll need this!)

4. **Enable Vertex AI API**:
   - Go to: APIs & Services → Library
   - Search "Vertex AI API" → **Enable**

5. **Enable Generative AI API**:
   - Search "Generative Language API" → **Enable**

6. **Authenticate locally**:
   ```bash
   # Install gcloud CLI if you haven't
   # https://cloud.google.com/sdk/docs/install
   
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   gcloud auth application-default login
   ```

7. **Add to `.env.local`**:
   ```env
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   GOOGLE_PROJECT_ID=your-project-id
   ```

### 💰 Free Tier Details:
- **$300 credit** for first 90 days
- After that: Gemini 1.5 Flash is very cheap (~$0.075/1M tokens)

---

## 🎙️ 2. ElevenLabs (Voice Synthesis)

**Why**: Gives your agent a natural, warm voice for seniors.

### Step-by-Step:

1. **Go to**: [elevenlabs.io](https://elevenlabs.io)

2. **Sign up** for a free account

3. **Get your API key**:
   - Click your profile icon → "Profile + API key"
   - Copy your API key

4. **Create a Conversational AI Agent** (optional but recommended):
   - Go to "Conversational AI" in the sidebar
   - Create a new agent
   - Copy the **Agent ID**

5. **Choose a voice** (optional):
   - Go to "Voices" → Browse voices
   - Pick one (or use default)
   - Copy the **Voice ID** from the URL

6. **Add to `.env.local`**:
   ```env
   ELEVENLABS_API_KEY=your-api-key-here
   ELEVENLABS_AGENT_ID=your-agent-id-here
   ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB  # Optional, this is "Adam"
   ```

### 💰 Free Tier Details:
- **10,000 characters/month** free
- That's roughly ~15-20 minutes of speech
- Great for development and demos!

---

## 🔍 3. Pinecone (Vector Memory Store)

**Why**: Stores and searches semantic memories for your agent.

### Step-by-Step:

1. **Go to**: [pinecone.io](https://www.pinecone.io)

2. **Sign up** for a free account

3. **Create an index**:
   - Click "Create Index"
   - Name: `recall-memories`
   - Dimensions: `768` (for Google embeddings) or `1536` (for OpenAI)
   - Metric: `cosine`
   - Cloud: Choose "Starter" (free!)

4. **Get your API key**:
   - Go to "API Keys" in the sidebar
   - Copy your API key

5. **Add to `.env.local`**:
   ```env
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_INDEX_NAME=recall-memories
   ```

### 💰 Free Tier Details:
- **100,000 vectors** free forever! 🎉
- That's thousands of memories for your users
- No credit card required

---

## 🗄️ 4. Database (Database-Agnostic Architecture)

**Why**: Stores users, sessions, and structured data.

> **🔌 PLUG & PLAY ARCHITECTURE**: Recall uses Dependency Injection and the Repository Pattern. You can swap databases without changing application code!

### Option A: Docker PostgreSQL (Recommended for Local Dev)

```bash
cd d:\rouca\DVM\workPlace\recall\recall-mvp

# Start the database
docker-compose up -d

# Your .env.local:
DATABASE_URL=postgres://postgres:postgres@localhost:5432/recall_mvp
DB_PROVIDER=postgres
```

### Option B: CockroachDB Serverless ⭐ (Recommended for Production)

**Why CockroachDB**: Distributed, auto-scaling, PostgreSQL-compatible, generous free tier!

1. **Go to**: [cockroachlabs.cloud](https://cockroachlabs.cloud)

2. **Sign up** for a free account

3. **Create a Serverless cluster**:
   - Choose "Serverless" (free tier)
   - Pick your cloud/region (closest to you)
   - Name: `recall-db`

4. **Create a SQL user**:
   - Go to "SQL Users" → Create User
   - Save your password!

5. **Get connection string**:
   - Go to "Connect" → Get your connection string
   - Select "Connection string" format

6. **Add to `.env.local`**:
   ```env
   DATABASE_URL=postgresql://your-user:your-password@your-cluster.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full
   DB_PROVIDER=cockroachdb
   ```

### 💰 CockroachDB Free Tier:
- **10 GiB storage** free forever! 🎉
- **50M Request Units/month** free
- No credit card required
- Auto-scales to zero (no idle costs)

---

### Option C: Other Supported Databases

Thanks to our **database-agnostic architecture**, you can also use:

| Provider | Connection String Format | Notes |
|----------|-------------------------|-------|
| **Supabase** | `postgres://...@db.xxx.supabase.co:5432/postgres` | 500MB free |
| **AWS RDS** | `postgres://...@xxx.rds.amazonaws.com:5432/recall` | Requires AWS account |
| **Azure Postgres** | `postgres://...@xxx.postgres.database.azure.com:5432/recall` | $200 credit |
| **Neon** | `postgres://...@xxx.neon.tech:5432/neondb` | 3GB free |
| **Railway** | `postgres://...@xxx.railway.app:5432/railway` | $5 credit |

Just set `DATABASE_URL` and `DB_PROVIDER` accordingly!

---

## 🔐 5. OpenAI (Optional Fallback)

**Why**: Backup if Google Cloud isn't available.

### Step-by-Step:

1. **Go to**: [platform.openai.com](https://platform.openai.com)

2. **Sign up** and add billing (they give you some free credits)

3. **Get API key**:
   - Go to API Keys → Create new secret key

4. **Add to `.env.local`**:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

### 💰 Free Tier Details:
- **$5 credit** for first 3 months (new accounts)
- After that: Pay-as-you-go

---

## 🤗 6. HuggingFace (Alternative Voice)

**Why**: Free alternative for speech-to-text and text-to-speech.

### Step-by-Step:

1. **Go to**: [huggingface.co](https://huggingface.co)

2. **Sign up** for a free account

3. **Get access token**:
   - Go to Settings → Access Tokens
   - Create a new token with "Read" access

4. **Add to `.env.local`**:
   ```env
   SPEECH_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=hf_your-token-here
   HF_TTS_MODEL=facebook/mms-tts-eng
   HF_STT_MODEL=openai/whisper-tiny.en
   ```

### 💰 Free Tier Details:
- **Unlimited** inference API calls (rate limited)
- Completely free!

---

## 🧪 Development Mode (No Keys Needed!)

Just want to test the UI and logic without real AI? Use mock mode:

```env
USE_MOCKS=true
```

This will use simulated responses - perfect for UI development!

---

## 📝 Complete `.env.local` Template

Create `d:\rouca\DVM\workPlace\recall\recall-mvp\.env.local`:

```env
# ===========================================
# RECALL MVP - ENVIRONMENT CONFIGURATION
# ===========================================

# 🧠 AI/LLM (Google Cloud - PRIMARY)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_PROJECT_ID=your-project-id

# 🧠 AI/LLM (OpenAI - FALLBACK)
# OPENAI_API_KEY=sk-your-key

# 🎙️ VOICE (ElevenLabs)
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_AGENT_ID=your-agent-id
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB

# 🔍 VECTOR STORE (Pinecone)
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=recall-memories

# 🗄️ DATABASE (Drizzle ORM - supports any PostgreSQL-compatible DB)
# Drizzle ORM is our query layer. The DATABASE_URL determines which provider.
DATABASE_URL=postgres://postgres:postgres@localhost:5432/recall_mvp
DB_PROVIDER=postgres  # Options: postgres, cockroachdb, supabase, aws_rds, azure_postgres, neon

# 🔒 SECURITY
CRON_SECRET=generate-a-random-string-here

# 🧪 DEVELOPMENT
# USE_MOCKS=true
```

> **💡 Architecture Note**: We use **Drizzle ORM** as our SQL query layer. Drizzle works with any PostgreSQL-compatible database. Just change `DATABASE_URL` and `DB_PROVIDER` to swap providers - your application code stays the same thanks to our Repository Pattern + Dependency Injection!

---

## 🚀 Launch Checklist

```
✅ Google Cloud account + project created
✅ Vertex AI API enabled
✅ gcloud CLI authenticated
✅ ElevenLabs API key (optional but recommended)
✅ Pinecone index created (optional)
✅ Database running (Docker locally OR CockroachDB for prod)
✅ .env.local file created with all keys
```

### Ready to go?

```bash
cd d:\rouca\DVM\workPlace\recall\recall-mvp
npm install
docker-compose up -d
npm run db:push
npm run dev
```

**Then open http://localhost:3000 and START TALKING TO YOUR AGENTIC AI! 🎉**

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| `GOOGLE_CLOUD_PROJECT not set` | Run `gcloud auth application-default login` |
| `ElevenLabs API key missing` | Add key or set `USE_MOCKS=true` |
| `Cannot connect to database` | Run `docker-compose up -d` |
| `Pinecone index not found` | Create index at pinecone.io or skip (uses fallback) |

---

**Questions? Issues? You've built an Agentic AI - you got this! 🏎️💨**
