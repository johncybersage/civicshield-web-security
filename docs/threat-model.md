# CivicShield Threat Model (STRIDE)

This lightweight threat model outlines the primary risks to the CivicShield platform, prioritizing the Web Exploitation and Defense focus of the project (Stored XSS).

| Threat Category | Asset | Description (Attack Surface) | Risk Level | Mitigation Implemented |
| :--- | :--- | :--- | :--- | :--- |
| **Spoofing** | Authentication | An attacker uses stolen credentials to log in as an Officer or Admin. | High | Strong password hashing (Argon2), secure JWT implementation. (Future: MFA). |
| **Tampering** | Complaints DB | An attacker modifies the priority or status of a complaint via API manipulation. | High | Server-side Role-Based Access Control (RBAC). Only Officers/Admins can patch complaints. |
| **Tampering (Stored XSS)** | User Browsers | An attacker injects malicious JS into a complaint description, executing when an Admin views it. | **CRITICAL** | Strict server-side validation, `bleach` sanitization, React contextual output encoding, CSP headers. Demonstrated in Security Lab. |
| **Repudiation** | System Actions | A malicious insider (Officer) maliciously closes complaints and denies doing so. | Medium | Comprehensive Audit Logging (`audit_logs` table) records `user_id`, `action`, `timestamp`, and `ip_address` for all state changes. |
| **Information Disclosure** | Database | Attackers steal the database dump to extract citizen passwords. | High | Passwords are never stored in plaintext; salted and hashed using Argon2/Bcrypt. |
| **Denial of Service** | Application | Attacker spams the complaint creation endpoint to exhaust DB resources. | Medium | (Future: Implement rate limiting on FastAPI endpoints). |
| **Elevation of Privilege** | API Endpoints | A Citizen attempts to access the `/api/admin/audit-logs` endpoint directly. | High | FastAPI dependency injection (`get_current_active_admin`) enforces server-side role verification for every request. |

### Attack Path Analysis: Stored XSS

**Vulnerable Path:**
1. Attacker (Citizen) logs in.
2. Creates complaint with payload: `<img src=x onerror=alert('cookie')>`.
3. Backend saves directly to DB without sanitization.
4. Officer logs in and views the complaint dashboard.
5. React uses `dangerouslySetInnerHTML` to render the description.
6. The `onerror` event fires, executing JavaScript in the Officer's session context.

**Defended Path (Implemented):**
1. Attacker (Citizen) logs in.
2. Creates complaint with payload: `<img src=x onerror=alert('cookie')>`.
3. Backend `sanitize_text` function uses `bleach` to strip all HTML tags.
4. The cleaned string `""` (or safe text) is saved to DB.
5. Officer logs in and views the dashboard.
6. React safely encodes any residual characters as text.
7. Attack neutralised. Officer sees literal text or nothing. Security Event is logged.
