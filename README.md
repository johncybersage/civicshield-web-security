# CivicShield

**AI-Powered Secure Community Complaint & Incident Reporting Platform**
*“Report. Analyze. Protect. Resolve.”*

## 1. Problem Statement
Local communities often struggle to report public infrastructure and safety issues effectively. Existing methods are fragmented, slow, and lack transparency. Moreover, platforms that handle community data are often vulnerable to common web application attacks, compromising user security.

## 2. Solution
CivicShield is a centralized, AI-enhanced platform where citizens can report issues (e.g., broken streetlights, potholes). The system uses Google Gemini AI to automatically categorize and prioritize complaints, streamlining the workflow for local officers. Importantly, the platform is built with a defense-in-depth security architecture, specifically designed to mitigate Stored Cross-Site Scripting (XSS) attacks.

## 3. Key Features
- **Role-Based Access Control (RBAC):** Distinct dashboards for Citizens, Officers, and Administrators.
- **AI-Powered Classification:** Automatic categorization and prioritization of complaints using Google Gemini.
- **Audit Logging:** Comprehensive tracking of all critical system actions.
- **Security Event Monitoring:** Dedicated admin view to monitor blocked security threats.
- **Interactive Security Lab:** An educational module demonstrating a controlled Stored XSS vulnerability and its mitigation.

## 4. Web Security Technique: Stored XSS Prevention
The primary web security focus of this academic project is preventing Stored XSS.
- **Attack Surface:** Complaint titles, descriptions, and comments.
- **Defense Mechanism:** 
  1. Strict input validation using Pydantic.
  2. Server-side HTML sanitization using `bleach` to neutralize malicious tags.
  3. Context-aware safe output rendering via React.
  4. Robust Content Security Policy (CSP) headers via FastAPI middleware.

## 5. Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Passlib (Argon2), python-jose
- **Database:** PostgreSQL (with Alembic for migrations)
- **AI Integration:** Google Generative AI (Gemini)
- **Infrastructure:** Docker & Docker Compose

## 6. Installation & Running Instructions

### Prerequisites
- Docker and Docker Compose (Recommended)
- Node.js & npm (for manual frontend run)
- Python 3.11+ (for manual backend run)
- PostgreSQL (if running manually)

### Using Docker (Recommended)
1. Clone the repository and navigate to the project root.
2. Copy `.env.example` to `.env` and add your Gemini API Key if you want AI features (otherwise it falls back to mock logic).
   ```bash
   cp .env.example .env
   ```
3. Run docker-compose:
   ```bash
   docker compose up --build -d
   ```
4. Access the frontend at `http://localhost:5173` and the backend API at `http://localhost:8000`.

### Database Seeding (Demo Accounts)
If running locally (without docker), you can seed the database:
```bash
cd backend
source venv/bin/activate
python seed.py
```
**Demo Accounts:**
- Admin: `admin@demo.local` / `admin_password`
- Officer: `officer@demo.local` / `officer_password`
- Citizen: `citizen@demo.local` / `citizen_password`

## 7. Automated Security Testing
The project includes automated Pytest suites verifying the XSS defenses and security headers.
```bash
cd backend
pytest tests/
```

## 8. Limitations & Future Improvements
- Currently skips image uploads to focus entirely on XSS text vectors. Future versions can incorporate secure S3-backed image uploads with strict MIME-type validation.
- The AI fallback mock is simplistic; integrating a local NLP model could improve offline capabilities.

---
*This project was developed as an academic assignment for Web Exploitation and Defense, highlighting real-world secure software development practices.*
