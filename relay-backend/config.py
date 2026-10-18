import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from the backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    # App
    APP_NAME: str = "Relay Automation Backend"
    DATABASE_PATH: str = str(Path(__file__).resolve().parent / "relay.db")

    # AI Classification (Gemini)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Slack Integration
    SLACK_WEBHOOK_URL: str = os.getenv("SLACK_WEBHOOK_URL", "")

    # Gmail SMTP Integration
    GMAIL_SMTP_USER: str = os.getenv("GMAIL_SMTP_USER", "")
    GMAIL_SMTP_PASSWORD: str = os.getenv("GMAIL_SMTP_PASSWORD", "")
    GMAIL_FROM_NAME: str = os.getenv("GMAIL_FROM_NAME", "Relay Customer Support")
    GMAIL_SMTP_HOST: str = "smtp.gmail.com"
    GMAIL_SMTP_PORT: int = 587
    SUPPORT_EMAIL: str = os.getenv("SUPPORT_EMAIL", "") or os.getenv("GMAIL_SMTP_USER", "")

    # Google Sheets / Calendar (Service Account)
    GOOGLE_SERVICE_ACCOUNT_FILE: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "")
    GOOGLE_SHEET_ID: str = os.getenv("GOOGLE_SHEET_ID", "")
    GOOGLE_CALENDAR_ID: str = os.getenv("GOOGLE_CALENDAR_ID", "primary")

    @classmethod
    def get_integrations_status(cls):
        return {
            "gemini": {
                "configured": bool(cls.GEMINI_API_KEY),
                "description": "Google Gemini AI for smart triage & sentiment"
            },
            "slack": {
                "configured": bool(cls.SLACK_WEBHOOK_URL),
                "description": "Slack incoming webhooks for urgent alerts"
            },
            "gmail": {
                "configured": bool(cls.GMAIL_SMTP_USER and cls.GMAIL_SMTP_PASSWORD),
                "description": "Gmail SMTP for email notifications"
            },
            "google_sheets": {
                "configured": bool(cls.GOOGLE_SERVICE_ACCOUNT_FILE and cls.GOOGLE_SHEET_ID),
                "description": "Google Sheets API for inquiry logging"
            },
            "google_calendar": {
                "configured": bool(cls.GOOGLE_SERVICE_ACCOUNT_FILE),
                "description": "Google Calendar API for follow-up scheduling"
            }
        }

settings = Settings()
