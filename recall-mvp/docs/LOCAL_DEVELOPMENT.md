# 🚀 Local Development Guide

> **ONE COMMAND. ALL MAGIC. EVERYTHING RUNNING.**

---

## ⚡ Quick Start

```bash
cd d:\rouca\DVM\workPlace\recall\recall-mvp

docker-compose -f docker-compose.dev.yml up
```

**That's it.** Open http://localhost:3000 🎉

---

## 🐳 What Happens Automatically

When you run `docker-compose -f docker-compose.dev.yml up`:

1. ✅ PostgreSQL database starts and waits to be healthy
2. ✅ Database migrations run automatically  
3. ✅ Sample data gets seeded
4. ✅ Next.js dev server starts with hot-reload
5. ✅ pgAdmin starts for database management
6. ✅ MailHog starts for email testing

**No npm install. No manual migrations. No configuration.**

---

## 🌐 All Your Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Recall App** | http://localhost:3000 | Main application |
| **pgAdmin** | http://localhost:5050 | Database UI (admin@recall.dev / admin) |
| **MailHog** | http://localhost:8025 | Email testing UI |
| **PostgreSQL** | localhost:5432 | Database |

---

## 🆓 100% FREE Mode with HuggingFace

When `USE_MOCKS=false` and `LLM_PROVIDER=huggingface`, you get **REAL AI** for FREE:

| Service | Provider | Cost |
|---------|----------|------|
| **LLM (AI Brain)** | HuggingFace (Mistral-7B) | FREE |
| **Speech-to-Text** | HuggingFace (Whisper) | FREE |
| **Text-to-Speech** | HuggingFace (MMS-TTS) | FREE |
| **Database** | PostgreSQL (Docker) | FREE |
| **Vector Store** | In-memory fallback | FREE |

### Alternative FREE LLM: Google AI Studio

If you want to use **Gemini** (faster, better quality):

1. Get FREE API key at: https://aistudio.google.com/apikey
2. Add to `.env.local`:
   ```env
   GOOGLE_AI_API_KEY=your-key-here
   LLM_PROVIDER=google_ai
   ```
3. **1,500 requests/day FREE** with Gemini 1.5 Flash!

---

## 📋 Commands Reference

```bash
# Start everything
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop everything
docker-compose -f docker-compose.dev.yml down

# Reset database (fresh start)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

---

## 🔧 Optional: Run Without Docker

If you prefer running Next.js locally (faster hot-reload on Windows):

```bash
# Terminal 1: Just the database
docker-compose -f docker-compose.dev.yml up db pgadmin mailhog

# Terminal 2: Next.js locally
npm install
npm run db:push
npm run seed
npm run dev
```

---

## 🔄 Moving to Production

When you have API keys:

1. Copy `docs/env-template.txt` to `.env.local`
2. Add your real API keys
3. Set `USE_MOCKS=false`
4. Restart the app

Same code, real APIs. **Clean architecture FTW!** 🏎️

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `docker-compose -f docker-compose.dev.yml down` then retry |
| Port 5432 in use | Stop other Postgres instances |
| Container won't start | Check logs: `docker-compose -f docker-compose.dev.yml logs app` |
| Changes not reflecting | Hot-reload should work; if not, restart app container |

---

**Happy coding! 🏁**
