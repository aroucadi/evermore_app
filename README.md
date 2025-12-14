# Recall MVP - Documentation

Welcome to the Recall MVP technical documentation. This repository contains the source code for the Recall application, an AI-powered voice companion for preserving senior memories.

## 📚 Documentation Suite

This project follows a strict "Zero-Trust" documentation policy. All definitive documentation is located in the `docs/` directory.

### Core Product
-   [01. Executive & Product Vision](docs/01_EXECUTIVE_VISION.md)
-   [02. User Experience & Functional Design](docs/02_USER_EXPERIENCE.md)
-   [03. System Architecture](docs/03_SYSTEM_ARCHITECTURE.md)
-   [04. Technical Architecture](docs/04_TECHNICAL_ARCHITECTURE.md)
-   [05. Core Logic & Algorithms](docs/05_CORE_LOGIC.md)
-   [06. Data & Database Design](docs/06_DATA_MODEL.md)

### Operations & Scale
-   [07. Performance & Scalability](docs/07_PERFORMANCE_SCALABILITY.md)
-   [08. Security & Compliance](docs/08_SECURITY_COMPLIANCE.md)
-   [09. DevOps & Infrastructure](docs/09_DEVOPS_INFRASTRUCTURE.md)
-   [10. Operations & Observability](docs/10_OPERATIONS_OBSERVABILITY.md)

### Future
-   [11. Launch Roadmap & Evolution](docs/11_LAUNCH_ROADMAP.md)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

## 🏗️ Project Structure

-   `recall-mvp/app`: Next.js App Router (Frontend + API)
-   `recall-mvp/lib`: Core Logic (Hexagonal Architecture)
    -   `core/domain`: Entities
    -   `core/application`: Use Cases
    -   `infrastructure`: Adapters (DB, AI, Email)
-   `recall-mvp/components`: React Components
-   `recall-mvp/tests`: Test Suites
