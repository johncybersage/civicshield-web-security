<div align="center">
  <h1>🛡️ CivicShield</h1>
  <p><strong>AI-Powered Secure Community Complaint & Incident Reporting Platform</strong></p>
  <p><em>“Report. Analyze. Protect. Resolve.”</em></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  </p>

  <p>
    <a href="https://civicshield-web-security.vercel.app/"><strong>Live Application</strong></a> | 
    <a href="https://github.com/johncybersage/civicshield-web-security"><strong>GitHub Repository</strong></a>
  </p>
</div>

---

## 📖 About The Project

**CivicShield** is a comprehensive civic issue reporting and tracking platform designed for modern communities. It empowers citizens to securely report infrastructure and safety issues, while providing government officers with an AI-enhanced dashboard to efficiently track, manage, and resolve them. 

*Developed as an academic project for Web Exploitation and Defence, focusing on secure software development, robust RBAC, and modern full-stack engineering.*

## 🌟 Key Features

- **Citizen & Officer Dashboards:** Role-Based Access Control (RBAC) providing distinct views and privileges for Citizens, Officers, and Admins.
- **Secure Registration & OTP Verification:** Citizens can register and verify their accounts using Twilio-backed SMS OTP (with a built-in evaluation mode for testing).
- **Incident Reporting & Evidence Upload:** Users can drop pins on an interactive map, describe issues, and upload photographic evidence securely.
- **AI-Powered Analysis:** Integration with Google Gemini AI to automatically categorize issues, assign priorities (High, Medium, Low), suggest the correct department, and propose next actions.
- **Real-Time Tracking & Notifications:** Citizens receive unique Tracking IDs to monitor their complaint's status timeline and get notified of updates via a notification center.
- **Officer ↔ Citizen Communication:** Secure two-way messaging directly within the complaint details page for clarifications.
- **Duplicate Detection:** Intelligent frontend duplicate detection prevents multiple reports of the same issue in the same area.
- **Feedback Loop:** Citizens can rate and review the resolution of their complaints.
- **Professional PDF Export:** Generate downloadable, formatted PDF reports of complaint details, timelines, and AI insights.
- **Impact Dashboard:** Public statistics showing total reports, resolution rates, and average response times to drive transparency.

## 🖼️ UI Previews
*Check out the `screenshots/` directory to view high-quality previews of the citizen and officer dashboards, AI analysis, mapping features, and more!*

## 🛠️ Technology Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, jsPDF, Recharts, React Leaflet |
| **Backend** | Python, FastAPI, SQLAlchemy, Pydantic, Alembic, Passlib, python-jose |
| **Database** | PostgreSQL (Supabase) |
| **AI Integration** | Google Generative AI (Gemini) |
| **Deployment** | Render (Backend) & Vercel (Frontend) |

## 🏗️ Architecture

```mermaid
graph TD
    A[React Frontend Vercel] -->|REST API / JWT Auth| B(FastAPI Backend Render)
    B -->|SQLAlchemy ORM| C[(PostgreSQL Database Supabase)]
    B -.->|API Calls| D[Google Gemini AI]
    B -.->|SMS OTP| E[Twilio]
```

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
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
SECRET_KEY=your_secure_random_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
BACKEND_CORS_ORIGINS=http://localhost:5173
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
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Setup
Open another terminal:
```bash
cd frontend
npm install

# Create environment file
echo "VITE_API_URL=http://127.0.0.1:8000" > .env

# Start dev server
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## 🧪 Testing

Run backend tests:
```bash
cd backend
pytest tests/
```

Build the frontend:
```bash
cd frontend
npm run build
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

## ⚠️ Disclaimer
CivicShield is an academic and demonstration project created for educational purposes. It is not an official government grievance portal and does not claim affiliation with any government organization or municipal authority.

## 📄 License
This project is for academic evaluation. All rights reserved.

---
<div align="center">
  <i>Built with ❤️ by Raj K</i>
</div>
