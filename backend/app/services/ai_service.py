import json
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=settings.GEMINI_API_KEY)
    ai_available = True
else:
    ai_available = False
    logger.warning("Gemini API Key is missing or invalid. AI features will run in Mock Fallback Mode.")

def analyze_complaint(title: str, description: str) -> dict:
    """
    Analyzes a complaint to suggest a category and priority.
    Returns a dict with 'category' and 'priority' (LOW, MEDIUM, HIGH, CRITICAL).
    """
    prompt = f"""
    Analyze the following community complaint and suggest a 'category' (e.g., Infrastructure, Safety, Sanitation, etc.) 
    and a 'priority' (must be exactly one of: LOW, MEDIUM, HIGH, CRITICAL).
    
    Complaint Title: {title}
    Complaint Description: {description}
    
    Return ONLY a valid JSON object in this format:
    {{"category": "Suggested Category", "priority": "HIGH"}}
    """
    
    if not ai_available:
        return _mock_analyze_complaint(title, description)
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Strip potential markdown formatting if returned
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        data = json.loads(text)
        return data
    except Exception as e:
        logger.error(f"Error during AI analysis: {e}")
        return _mock_analyze_complaint(title, description)

def _mock_analyze_complaint(title: str, description: str) -> dict:
    text = (title + " " + description).lower()
    
    priority = "LOW"
    if "emergency" in text or "accident" in text or "fire" in text or "crime" in text:
        priority = "CRITICAL"
    elif "water leakage" in text or "broken" in text:
        priority = "HIGH"
    elif "pothole" in text or "street light" in text or "garbage" in text:
        priority = "MEDIUM"
        
    category = "General"
    if "light" in text or "road" in text or "pothole" in text:
        category = "Infrastructure"
    elif "garbage" in text or "waste" in text or "sanitation" in text:
        category = "Sanitation"
    elif "water" in text or "leak" in text:
        category = "Water Supply"
    elif "crime" in text or "safety" in text:
        category = "Public Safety"
        
    return {"category": category, "priority": priority}
