🛡️ CivicShield

Report. Track. Resolve.

CivicShield is a full-stack, AI-powered civic complaint reporting and tracking platform that enables citizens to report community issues, attach evidence, track complaint progress, and receive AI-assisted priority analysis.

Built as a project for Web Exploitation and Defence, CivicShield combines a modern user interface with secure backend APIs, authentication, evidence handling, complaint tracking, and AI-assisted complaint analysis.

⸻

✨ Key Features

👤 Citizen Features

* 🔐 Secure user registration and authentication
* 📝 Multi-step complaint submission workflow
* 🏷️ Structured complaint categories
* 📍 Location selection for complaints
* 📞 Contact/phone number collection
* 📸 Evidence and image upload
* 🆔 Unique complaint tracking ID
* 📊 Personal citizen complaint dashboard
* 🔎 Detailed complaint information
* 🕒 Date and time visibility
* 📍 Complaint location details
* 🗑️ Complaint deletion with confirmation
* 📄 Downloadable complaint report
* 📈 Complaint status timeline and history

🤖 AI-Assisted Analysis

CivicShield integrates AI-assisted complaint analysis to help evaluate submitted complaints.

AI can assist in identifying:

* Priority level
* Complaint category
* Important complaint context

Priority levels include:

* 🔴 High
* 🟡 Medium
* 🟢 Low

👮 Officer Features

* 🔐 Dedicated officer authentication
* 📊 Officer dashboard
* 📋 Centralized complaint management
* 🔍 View detailed citizen complaints
* 🔄 Update complaint status
* 📜 Track complaint history
* ⚡ Manage complaints according to priority

⸻

🖥️ Application Workflow

Citizen Registration / Login
            │
            ▼
     Create Complaint
            │
            ▼
 Add Issue Details & Category
            │
            ▼
       Select Location
            │
            ▼
Upload Evidence + Contact Info
            │
            ▼
    Submit Complaint
            │
            ▼
 Generate Tracking ID
            │
            ▼
     AI-Assisted Analysis
            │
            ▼
 Citizen Complaint Dashboard
            │
            ▼
Complaint Details & Timeline
            │
            ▼
   Officer Review & Management
            │
            ▼
      Status Updates

⸻

📸 Screenshots

🏠 Landing Page

CivicShield provides a clean and responsive interface for reporting and managing community incidents.

📷 Add your landing page screenshot here.

⸻

📝 Complaint Registration

Citizens can submit civic complaints through a structured multi-step reporting process.

📷 Add your complaint registration screenshots here.

⸻

📍 Location Selection

Users can provide the location associated with a complaint.

📷 Add your location selection screenshot here.

⸻

📸 Evidence Upload

Citizens can attach supporting evidence and provide contact information.

📷 Add your evidence upload screenshot here.

⸻

🆔 Complaint Tracking

Each complaint receives a unique tracking ID for easier identification and monitoring.

📷 Add your complaint success/tracking ID screenshot here.

⸻

🤖 AI Civic Analysis

AI-assisted analysis helps identify complaint priority and relevant classification information.

📷 Add your AI analysis screenshot here.

⸻

📊 Citizen Dashboard

Users can view and manage their submitted complaints from a centralized dashboard.

📷 Add your citizen dashboard screenshot here.

⸻

🔎 Complaint Details

The detailed complaint page provides access to complaint information, evidence, AI analysis, location, contact information, and status history.

📷 Add your complaint details screenshot here.

⸻

🕒 Complaint Timeline

Users can track the progress and status history of their complaint.

📷 Add your tracking timeline screenshot here.

⸻

👮 Officer Dashboard

Authorized officers can review and manage complaints through a dedicated management interface.

📷 Add your officer dashboard screenshot here.

⸻

🧰 Technology Stack

Frontend

* React
* TypeScript
* Vite
* React Router
* Axios
* Lucide React
* Modern responsive CSS/UI components

Backend

* FastAPI
* Python
* SQLAlchemy
* Pydantic
* Uvicorn
* RESTful APIs

Database

* PostgreSQL
* Supabase
* Alembic migrations

Security

* JWT-based authentication
* Password hashing
* Protected API endpoints
* Role-based access control
* Secure evidence access
* Environment-based configuration

AI

* Google Gemini API

Deployment

* Frontend: Vercel
* Backend: Render
* Database: Supabase PostgreSQL

⸻

🏗️ Project Structure

CivicShield/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   │
│   ├── public/
│   ├── package.json
│   └── vercel.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── alembic.ini
│
├── README.md
└── render.yaml

⸻

🚀 Getting Started

Prerequisites

Make sure you have:

* Python 3.10+
* Node.js 18+
* npm
* PostgreSQL or Supabase PostgreSQL

⸻

1️⃣ Clone the Repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>

⸻

2️⃣ Backend Setup

cd backend
python -m venv venv

Activate the virtual environment

macOS/Linux

source venv/bin/activate

Windows

venv\Scripts\activate

Install dependencies

pip install -r requirements.txt

Create your environment configuration:

cp .env.example .env

Configure the required environment variables:

DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
BACKEND_CORS_ORIGINS=http://localhost:5173

Run database migrations:

alembic upgrade head

Start the backend:

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

⸻

3️⃣ Frontend Setup

Open another terminal:

cd frontend
npm install

Create your frontend environment file:

VITE_API_URL=http://127.0.0.1:8000

Start the development server:

npm run dev

Open:

http://localhost:5173

⸻

🔐 Environment Variables

Backend

DATABASE_URL=
SECRET_KEY=
GEMINI_API_KEY=
BACKEND_CORS_ORIGINS=

Depending on your deployment configuration, additional variables may be required.

Important

Never commit the following to GitHub:

.env
API keys
JWT secrets
Database passwords
Service credentials
Production tokens

Add .env to .gitignore.

⸻

📡 Core API Areas

CivicShield uses RESTful APIs for the major application workflows.

Authentication

POST /api/auth/register
POST /api/auth/login

Complaints

GET    /api/complaints/
POST   /api/complaints/
GET    /api/complaints/{id_or_tracking_id}

Evidence

POST /api/complaints/{id}/evidence
GET  /api/complaints/evidence/{id}

The complete API documentation is available through FastAPI Swagger/OpenAPI when running the backend.

⸻

🧠 AI-Assisted Priority Analysis

CivicShield uses AI to assist in the evaluation of civic complaints.

The system processes relevant complaint information and helps generate useful analysis such as priority classification.

Complaint
    ↓
AI Analysis
    ↓
Priority Assessment
    ↓
HIGH / MEDIUM / LOW
    ↓
Officer Management

Note: AI assistance is designed to support the complaint management workflow. Human review and system validation remain important for real-world decisions.

⸻

🔒 Security Considerations

This project incorporates security-focused practices including:

* JWT authentication
* Password hashing
* Protected routes
* Authenticated API access
* Role-based workflows
* Environment variable management
* Secure handling of application secrets
* Database migrations through Alembic
* Input validation through Pydantic/FastAPI schemas

⸻

🧪 Testing

Run backend tests:

cd backend
pytest

Build the frontend:

cd frontend
npm run build

⸻

🌐 Live Deployment

[🔗 Live Application](https://civicshield-web-security.vercel.app/)

Add your verified live URL here

https://civicshield-web-security.vercel.app/

💻 GitHub Repository

Add your verified public GitHub URL here

[<YOUR_GITHUB_REPOSITORY_URL>](https://github.com/johncybersage/civicshield-web-security)

⸻

🎯 Project Objective

The objective of CivicShield is to provide a centralized and transparent platform for civic complaint reporting and management.

The project aims to improve:

* Accessibility
* Complaint reporting
* Evidence collection
* Complaint tracking
* Transparency
* Status visibility
* Administrative management
* AI-assisted prioritization

⸻

📈 Advantages of CivicShield

Feature	CivicShield
Complaint Reporting	✅ Structured multi-step reporting
Evidence Upload	✅ Supported
Contact Information	✅ Supported
Unique Tracking ID	✅ Supported
AI-Assisted Analysis	✅ Supported
Priority Classification	✅ High / Medium / Low
Citizen Dashboard	✅ Available
Complaint Details	✅ Available
Status Tracking	✅ Timeline-based
Officer Management	✅ Available
PDF Complaint Report	✅ Available
Public Deployment	✅ Supported

⸻

⚠️ Disclaimer

CivicShield is an academic and demonstration project created for educational purposes.

It is not an official government grievance portal and does not claim affiliation with any government organization or municipal authority.

⸻



🛡️ CivicShield

Report • Track • Resolve

Made by Raj K

</div>
