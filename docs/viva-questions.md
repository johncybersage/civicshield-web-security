# Viva Questions & Answers

1. **What is XSS?**
   Cross-Site Scripting (XSS) is a vulnerability where an attacker injects malicious client-side scripts into web pages viewed by other users.

2. **What is Stored XSS?**
   Stored XSS occurs when a malicious script is permanently stored on the target server (e.g., in a database) and served to users who view that data later.

3. **How does Stored XSS work in this project context?**
   If a citizen submits a complaint containing `<script>alert('hacked')</script>`, and an officer views it on their dashboard, the script would execute in the officer's browser if the output wasn't sanitized.

4. **What is the difference between Stored and Reflected XSS?**
   Stored XSS payload is saved on the server. Reflected XSS is when the payload is immediately returned (reflected) by the web application in an error message or search result, requiring the victim to click a crafted link.

5. **Why is XSS dangerous?**
   It allows attackers to execute arbitrary JavaScript in the victim's session, leading to session hijacking, credential theft, or unauthorized actions on behalf of the user.

6. **Why is input validation alone insufficient?**
   Attackers can bypass frontend validation, and backend validation might miss complex encoded payloads. Therefore, output encoding and sanitization are necessary.

7. **What is output encoding?**
   Converting special characters into their corresponding HTML entities (e.g., `<` becomes `&lt;`) so the browser treats them as text, not executable code.

8. **Why should dangerouslySetInnerHTML be avoided in React?**
   It bypasses React's default output encoding, exposing the application to XSS if the injected HTML contains malicious scripts.

9. **What is CSP?**
   Content Security Policy (CSP) is an HTTP header that allows site operators to restrict the resources (such as JavaScript, CSS, Images) that the browser is allowed to load for a given page.

10. **What happens if an attacker submits JavaScript through a complaint in CivicShield?**
    The backend `bleach` library sanitizes the input, stripping the dangerous tags. React then safely encodes any remaining text, preventing execution.

11. **Why must server-side validation be used?**
    Client-side validation can easily be bypassed by intercepting requests (e.g., using Burp Suite) or using API tools like Postman.

12. **Why shouldn't frontend authorization be trusted?**
    Frontend code is fully visible and modifiable by the client. An attacker can alter the frontend state to appear as an Admin, but the server must independently verify their JWT token.

13. **Why use password hashing?**
    To ensure that even if the database is compromised, attackers cannot see the plaintext passwords. We use Argon2/Bcrypt for cryptographic security.

14. **Why use PostgreSQL?**
    It's a robust, production-ready relational database that enforces strict schemas, ensuring data integrity.

15. **Why use FastAPI?**
    It provides high performance, automatic OpenAPI documentation, and strict type checking using Pydantic, which inherently aids in input validation.

16. **Why use React?**
    It provides a dynamic UI and natively mitigates XSS by automatically encoding string variables before rendering them.

17. **Why use Gemini AI?**
    To automatically categorize and prioritize unstructured text (citizen complaints), saving time for administrative officers.

18. **What happens if Gemini API fails?**
    The system relies on a deterministic fallback function (mock AI) that scans for keywords to ensure the application remains functional.

19. **What is RBAC?**
    Role-Based Access Control. Users are assigned roles (Citizen, Officer, Admin), and the server restricts endpoint access based on these roles.

20. **What is STRIDE?**
    A threat modeling framework evaluating Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.

21. **What is an audit log?**
    A secure, immutable record of critical events in the system, used for tracing actions (like who updated a complaint and when).

22. **What is a trust boundary?**
    The point where data moves from an untrusted zone (e.g., user browser) to a trusted zone (e.g., backend server). Data crossing this boundary must be validated.

23. **How did you test the XSS defense?**
    By implementing an isolated "Security Lab" that explicitly attempts to render an XSS payload, comparing a vulnerable implementation against our protected one, and using automated tests.

24. **What is the limitation of your XSS defense?**
    If the application ever requires rendering rich HTML from users, simple text encoding isn't enough, requiring complex DOM purification logic.

25. **What would you improve in production?**
    I would add WAF (Web Application Firewall) integration, rate limiting, and stricter Content Security Policies.

26. **What is the purpose of the Security Lab?**
    To safely demonstrate the mechanics of the Stored XSS attack and visually prove that the implemented defense mechanism successfully blocks it.

27. **How does Bleach work?**
    It's an HTML sanitizing library for Python that parses HTML and strips out tags and attributes that are not in a predefined whitelist.

28. **Why not just remove `<script>` tags manually with regex?**
    Attackers use various obscure methods to bypass regex (e.g., `<scr<script>ipt>`, different casing, using `onload` attributes on non-script tags). A dedicated parser like Bleach handles these edge cases.

29. **How do JWT tokens work for auth?**
    The server signs a payload (containing the user ID) with a secret key. The client stores it and sends it with each request. The server verifies the signature to authenticate the user statelessly.

30. **Why are HTTP Security Headers important?**
    They instruct the browser on how to behave securely, such as forcing HTTPS (HSTS), preventing MIME-sniffing, and stopping clickjacking (X-Frame-Options).
