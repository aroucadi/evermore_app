# Recall Product Documentation

Welcome to the comprehensive documentation for **Recall**, the Agentic AI Biographer for seniors.

## 📚 Documentation Map

### 🏗️ [Architecture](./ARCHITECTURE/README.md)
Deep dive into how the system is built.
- **[System Design](./ARCHITECTURE/SYSTEM_DESIGN.md)** - High-level diagrams, Cognitive Architecture (AoT), and Service layers.
- **[Algorithms & AoT](./ARCHITECTURE/ALGORITHMS_AOT.md)** - Detailed explanation of the "Atom of Thought" pattern used for Chapter and Storybook generation.
- **[Data Model](./ARCHITECTURE/DATA_MODEL.md)** - Entity relationships, Schema design (Users, Storybooks, Sessions).

### 🛠️ [Technical Guide](./TECHNICAL/README.md)
For developers building and maintaining Recall.
- **[Tech Stack](./TECHNICAL/TECH_STACK.md)** - Next.js 14, Drizzle ORM, Tailwind, etc.
- **[External Services](./TECHNICAL/EXTERNAL_SERVICES.md)** - Setup guides for **Google Vertex AI** (Gemini), **ElevenLabs** (Voice), and **Pinecone** (Memory).
- **[Prompt Engineering](./TECHNICAL/PROMPTING_GUIDE.md)** - The secret sauce: Personas, recursive prompts, and story transformation techniques.

### 🚀 [Deployment](./DEPLOYMENT/README.md)
Getting Recall from localhost to production.
- **[Vercel Deployment](./DEPLOYMENT/VERCEL.md)** - Production deployment guide (Serverless).
- **[Docker Staging](./DEPLOYMENT/DOCKER.md)** - Running the containerized staging environment.
- **[Production Readiness](./DEPLOYMENT/PRODUCTION_CHECKLIST.md)** - Security, observability, and launch checklist.

### 📖 [Guides](./GUIDES/README.md)
Step-by-step instructions.
- **[Local Setup](./GUIDES/SETUP_LOCAL.md)** - fast track to `npm run dev`.
- **[Database Management](./GUIDES/DATABASE.md)** - Migrations, seeding, and CockroachDB setup.

---

---

## 🧠 Strategic Architecture

For the comprehensive breakdown of how Recall works, see the **[ARCHITECTURE](./ARCHITECTURE/README.md)** folder:

- **[Cognitive Architecture](./ARCHITECTURE/COGNITIVE_ARCHITECTURE.md)** - Deep dive into patterns (FSM, ReAct, CoT, AoT).
- **[Algorithm of Thought](./ARCHITECTURE/ALGORITHMS_AOT.md)** - How we generate coherent books.
- **[Security & Safety](./ARCHITECTURE/SECURITY_AND_SAFETY.md)** - Threat model and Wellbeing Guard.
- **[FinOps & Costs](./ARCHITECTURE/FINOPS_AND_COSTS.md)** - Unit economics and model routing.

---

## 🎯 Product Vision
Recall is an **empathetic AI biographer** that helps seniors preserve their life stories through natural voice conversations. It is **Agentic**, meaning it plans, interviews, and compiles stories autonomously.

For detailed Product Strategy (Vision, User Research, GTM), see the **[PRODUCT](./PRODUCT/README.md)** folder.

---

*Documentation Version: 2.1 (December 2024)*
