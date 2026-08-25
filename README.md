# CivicShield

**AI-Powered Secure Community Complaint & Incident Reporting Platform**
*“Report. Analyze. Protect. Resolve.”*

CivicShield is a comprehensive civic issue reporting and tracking platform designed for modern communities. It empowers citizens to securely report infrastructure and safety issues, while providing government officers with an AI-enhanced dashboard to efficiently track, manage, and resolve them.

## 🌟 Key Features

- **Citizen & Officer Dashboards:** Role-Based Access Control (RBAC) providing distinct views and privileges for Citizens, Officers, and Admins.
- **Secure Registration & OTP Verification:** Citizens can register and verify their accounts using Twilio-backed SMS OTP (with a built-in evaluation mode for testing).
- **Incident Reporting & Evidence Upload:** Users can drop pins on an interactive map, describe issues, and upload photographic evidence securely.
- **AI-Powered Analysis:** Integration with Google Gemini AI to automatically categorize issues, assign priorities, suggest the correct department, and propose next actions.
- **Real-Time Tracking & Notifications:** Citizens receive unique Tracking IDs to monitor their complaint's status timeline and get notified of updates via a notification center.
- **Officer ↔ Citizen Communication:** Secure two-way messaging directly within the complaint details page for clarifications.
- **Duplicate Detection:** Intelligent frontend duplicate detection prevents multiple reports of the same issue in the same area.
- **Feedback Loop:** Citizens can rate and review the resolution of their complaints.
- **Professional PDF Export:** Generate downloadable, formatted PDF reports of complaint details, timelines, and AI insights.
- **Impact Dashboard:** Public statistics showing total reports, resolution rates, and average response times to drive transparency.

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, jsPDF, Recharts, React Leaflet
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Alembic, Passlib, python-jose
- **Database:** PostgreSQL (Supabase)
- **AI Integration:** Google Generative AI (Gemini)
- **Deployment:** Render (Backend) & Vercel (Frontend)

## 🏗️ Architecture

```text
React Frontend (Vercel)
       ↓ (REST API / JWT Auth)
FastAPI Backend (Render)
       ↓ (SQLAlchemy)
PostgreSQL Database (Supabase)
```

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- PostgreSQL (Local or Supabase)

### 1. Database & Environment Setup
Clone the repository and set up your `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

**Environment Variables (.env)**
Ensure the following variables are configured without exposing real secrets:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/civicshield
DB_PASSWORD=your_password
JWT_SECRET=your_secure_random_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
OTP_PROVIDER=development  # or 'twilio'
OTP_DEMO_MODE=true
DEMO_OTP=123456
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## 🧪 Testing

The backend includes a comprehensive `pytest` suite testing authentication, authorization, endpoints, and security headers.

```bash
cd backend
pytest tests/
```

## 🔐 Demo / Evaluation Credentials

To ease the evaluation process, the application can be seeded with demo accounts.

**Database Seeding:**
```bash
cd backend
python seed.py
```

**Demo Accounts:**
- **Admin**: `admin@demo.local` / `admin_password`
- **Officer**: `officer@demo.local` / `officer_password`
- **Citizen**: `citizen@demo.local` / `citizen_password`

**OTP Evaluation Mode:**
When `OTP_DEMO_MODE=true` is set in the `.env` file, SMS delivery is bypassed and the system will accept the evaluation code defined in `DEMO_OTP` (default: `123456`). **Do not use this mode in production.**

---
*Developed as an academic assignment, focusing on secure software development, robust RBAC, and modern full-stack engineering.*
