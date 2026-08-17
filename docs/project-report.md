# CivicShield Project Report
## AI-Powered Secure Community Complaint & Incident Reporting Platform

### Chapter 1 — Introduction
**Background:** Modern cities require efficient mechanisms for citizens to report infrastructure issues.
**Problem:** Traditional reporting is fragmented and existing web portals often suffer from severe security flaws, making citizen data vulnerable.
**Motivation:** To create an accessible, secure platform that leverages AI for efficiency while enforcing strict web security standards.
**Objectives:** Build a functional complaint portal with role-based access, integrate AI for prioritization, and demonstrate robust defense against Stored XSS.

### Chapter 2 — Existing System
**Existing Approaches:** Email-based reporting, legacy web forms.
**Problems:** Manual triage is slow; legacy systems lack modern security headers and input sanitization, leading to XSS vulnerabilities.
**Limitations:** No automated prioritization, poor security posture.

### Chapter 3 — Proposed System
**Proposed Architecture:** A React frontend communicating via REST with a FastAPI Python backend, backed by PostgreSQL.
**Features:** Secure Authentication, Dashboard overviews, AI-Assisted classification, Security Event Logging.
**Users:** Citizens (Reporters), Officers (Responders), Administrators (Managers).
**Workflow:** Citizen submits complaint -> AI classifies -> Officer reviews/updates -> Resolution.

### Chapter 4 — Technology Stack
- **React & Tailwind CSS:** For a responsive, modern UI.
- **FastAPI:** High-performance async Python backend.
- **PostgreSQL:** Reliable relational data storage.
- **Google Gemini:** Advanced LLM for semantic text classification.

### Chapter 5 — Web Security (Core Focus)
**5.1 What is XSS?** Cross-Site Scripting allows attackers to inject malicious scripts into trusted websites.
**5.2 Types of XSS:** Reflected, Stored, and DOM-based.
**5.3 Stored XSS:** The payload is permanently stored on the server (e.g., in a database) and served to victims.
**5.4 Attack Scenario:** A malicious citizen enters `<script>alert('Steal Cookie')</script>` in a complaint description. When an officer views the complaint, the script executes in the officer's browser.
**5.5 Root Cause:** Insufficient input validation and unsafe output rendering.
**5.6 Exploitation Demonstration:** Provided in the application's "Security Lab" (Mode A).
**5.7 Defense Mechanism:** Defense-in-depth approach utilizing Server-Side Sanitization (Bleach) and Context-Aware Output Encoding (React defaults).
**5.8 Secure Implementation:** Demonstrated in the "Security Lab" (Mode B) and implemented globally across all endpoints.
**5.9 Testing:** Automated tests confirm `bleach` successfully strips malicious tags.
**5.10 Results:** XSS execution is entirely mitigated across the platform.

### Chapter 6 — System Implementation
The backend exposes RESTful APIs, securing them with JWT. The `ai_service.py` securely calls Gemini, falling back to deterministic logic if needed. The frontend consumes these APIs and manages state using React hooks.

### Chapter 7 — Testing
Automated testing via `pytest` covers security mechanisms (verifying sanitization and security headers). Manual testing verifies the RBAC matrix.

### Chapter 8 — Results
The platform successfully processes complaints, integrates AI seamlessly, and completely neutralizes injected XSS payloads as proven in the Security Lab.

### Chapter 9 — Limitations
- Missing physical image uploads (to prioritize scope on text-based XSS vectors).
- AI fallback is rules-based rather than a local ML model.

### Chapter 10 — Future Enhancements
Integration of image metadata sanitization (Exif cleaning) and a more advanced local classification model.

### Chapter 11 — Conclusion
CivicShield proves that modern web applications can be both feature-rich (utilizing AI) and highly secure. By prioritizing defense-in-depth against Stored XSS, it protects administrative users from client-side exploitation.
