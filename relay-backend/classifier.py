import json
import logging
import httpx
from config import settings

logger = logging.getLogger("relay.classifier")

# Available Google Gemini models in order of priority/speed
GEMINI_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
]

def classify_inquiry(message: str) -> dict:
    """
    Classifies a customer inquiry into priority, category, and sentiment.
    If GEMINI_API_KEY is configured in .env, calls Google Gemini AI.
    Otherwise, uses the built-in deterministic NLP rule engine.
    """
    if settings.GEMINI_API_KEY:
        for model in GEMINI_MODELS:
            try:
                res = _classify_with_gemini(message, model)
                if res:
                    return res
            except Exception as e:
                logger.warning(f"Gemini API model {model} attempt failed: {e}. Trying next fallback.")

    return _classify_with_rules(message)


def _classify_with_gemini(message: str, model_name: str = "gemini-3.5-flash-lite") -> dict:
    """Uses Google Gemini API for intelligent context-aware classification."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
    
    prompt = f"""
You are an AI customer support triage engine for an enterprise platform.
Analyze the following customer inquiry and respond ONLY with a valid JSON object matching this schema:
{{
  "priority": "high" or "medium" or "low",
  "category": "payment" or "account" or "technical" or "shipping" or "general",
  "sentiment": "frustrated" or "satisfied" or "neutral",
  "reasoning": "brief 1-sentence explanation"
}}

Customer Inquiry:
\"\"\"{message}\"\"\"
"""
    
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1
        }
    }

    with httpx.Client(timeout=12.0) as client:
        response = client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(raw_text.strip())
        result["provider"] = f"gemini ({model_name})"
        return result


def _classify_with_rules(message: str) -> dict:
    """High-accuracy deterministic fallback rule classifier."""
    lower = message.lower()

    # Priority Scoring
    high_keywords = [
        "urgent", "emergency", "asap", "immediately", "blocked", "critical",
        "charged twice", "cannot login", "outage", "broken", "stolen", 
        "unauthorized", "cancel immediately", "fail", "failed", "crash"
    ]
    medium_keywords = [
        "question", "wondering", "inquiry", "pricing", "help", "assistance",
        "update", "follow-up", "invoice", "feature", "change", "timeline"
    ]

    priority = "low"
    if any(kw in lower for kw in high_keywords):
        priority = "high"
    elif any(kw in lower for kw in medium_keywords):
        priority = "medium"

    # Category Scoring
    category_map = {
        "payment": ["payment", "billing", "charge", "refund", "invoice", "credit card", "pricing", "subscription", "cost", "money", "receipt"],
        "account": ["account", "password", "login", "sign in", "username", "email", "profile", "auth", "2fa", "verification", "access"],
        "technical": ["bug", "error", "crash", "broken", "glitch", "not working", "fails", "api", "slow", "down", "outage", "exception"],
        "shipping": ["shipping", "delivery", "order", "package", "tracking", "arrived", "courier", "transit", "delayed"],
    }

    category = "general"
    for cat, keywords in category_map.items():
        if any(kw in lower for kw in keywords):
            category = cat
            break

    # Sentiment Scoring
    frustrated_keywords = [
        "angry", "furious", "frustrated", "terrible", "awful", "horrible",
        "unacceptable", "worst", "useless", "bad", "disappointed", "ridiculous", "hate"
    ]
    satisfied_keywords = [
        "great", "awesome", "thanks", "thank you", "excellent", "love",
        "good job", "perfect", "fast", "helpful", "appreciated"
    ]

    sentiment = "neutral"
    if any(kw in lower for kw in frustrated_keywords):
        sentiment = "frustrated"
    elif any(kw in lower for kw in satisfied_keywords):
        sentiment = "satisfied"

    return {
        "priority": priority,
        "category": category,
        "sentiment": sentiment,
        "provider": "rule-engine",
        "reasoning": "Deterministic rule-based classification matched keywords in inquiry."
    }
