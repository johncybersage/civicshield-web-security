# CivicShield Demonstration Script

**Estimated Duration: 5–7 Minutes**

---

## 00:00–00:30 | Introduction
"Good morning, Professor. For my Web Exploitation and Defense assignment, I built **CivicShield**: an AI-Powered Secure Community Complaint Platform. The main objective was to create a functional platform that solves a real-world problem—reporting local issues—while demonstrating a robust defense against Stored Cross-Site Scripting (XSS)."

## 00:30–01:15 | Citizen Workflow (Complaint Creation)
"I'll start by logging in as a Citizen. On the dashboard, I can see my previous reports. Let's create a new complaint. I'll report a 'Broken Streetlight on 5th Avenue' and provide a brief description. As I submit this, the data is being sent to the backend API."

## 01:15–02:00 | AI Classification
"At the backend, the system intercepts the request before saving it to the database and sends the text to the Google Gemini AI. You'll see that it has automatically categorized this as 'Infrastructure' and suggested a priority of 'Medium' based on semantic analysis. This saves administrative time."

## 02:00–02:45 | Officer Dashboard Workflow
"Now, I'll log out and log back in as an Officer. The interface changes—this is enforced by Role-Based Access Control on the backend, not just hiding UI elements. I can see the complaint we just created. I review the AI's recommendation and decide to mark the status as 'IN_PROGRESS'."

## 02:45–03:15 | Web Security Focus Introduction
"While building this, the primary security concern was **Stored XSS**. Because citizens can submit arbitrary text, a malicious user could submit JavaScript payloads. If an officer views it, that script executes, potentially stealing their session token."

## 03:15–04:45 | The Security Lab (Vulnerable vs Protected)
"To demonstrate this clearly for the assignment, I built a dedicated **Security Lab**. I am now logged in as an Administrator and accessing the lab. 
1. I will input a harmless XSS payload: `<img src="x" onerror="alert('Stored XSS Executed!')">`.
2. First, let's look at **Mode A: Vulnerable Implementation**. This simulates what happens if we directly reflect database content into the DOM using unsafe React methods. As you can see, the alert box pops up. The script executed. This is highly dangerous.
3. Now, let's look at **Mode B: Protected Implementation**. Here, you can see the text is either safely displayed as a literal string or stripped entirely. Why? Because I implemented a defense-in-depth approach. On the backend, a library called `bleach` sanitizes the HTML, stripping malicious tags. On the frontend, React safely encodes outputs by default."

## 04:45–05:30 | Security Monitoring & Tests
"As an Admin, I can also go to the **Admin Dashboard**. Here you can see the **Security Events** log. It flagged the payload I just submitted in the Security Lab, marking it as a HIGH severity event that was BLOCKED. 
Additionally, I have written automated tests using `pytest` that programmatically verify the backend correctly sanitizes XSS payloads and enforces Content Security Policy headers."

## 05:30–06:00 | Conclusion
"In conclusion, CivicShield integrates modern web development (React, FastAPI, PostgreSQL), AI (Gemini), and rigorous cybersecurity practices. I successfully mitigated the primary threat of Stored XSS, verified it through testing, and proved it in the isolated Security Lab environment. Thank you."
