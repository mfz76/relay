import smtplib
from email.mime.text import MIMEText
from email.header import Header
import logging
from config import settings

logger = logging.getLogger("relay.integrations.gmail")

def send_email(to: str, subject: str, body: str, context: dict = None) -> dict:
    """
    Sends email via Gmail SMTP.
    Uses GMAIL_SMTP_USER and GMAIL_SMTP_PASSWORD if configured.
    Otherwise returns a simulated success event.
    """
    to_email = (to or "").strip()
    if not to_email or to_email in ["support@company.com", "lead-responder@enterprise.com"]:
        to_email = (settings.SUPPORT_EMAIL or settings.GMAIL_SMTP_USER).strip()

    username = settings.GMAIL_SMTP_USER.strip()
    password = settings.GMAIL_SMTP_PASSWORD.strip()

    if username and password:
        try:
            msg = MIMEText(body, "plain", "utf-8")
            msg["Subject"] = Header(subject, "utf-8")
            msg["From"] = f"{settings.GMAIL_FROM_NAME} <{username}>"
            msg["To"] = to_email

            server = smtplib.SMTP(settings.GMAIL_SMTP_HOST, settings.GMAIL_SMTP_PORT, timeout=8)
            server.ehlo()
            server.starttls()
            server.login(username, password)
            server.sendmail(username, [to_email], msg.as_string())
            server.quit()

            return {
                "status": "delivered",
                "to": to_email,
                "subject": subject,
                "detail": f"Live email successfully dispatched to {to_email} via Gmail SMTP"
            }
        except Exception as e:
            logger.error(f"Failed to send email via Gmail SMTP: {e}")
            return {
                "status": "failed",
                "to": to_email,
                "subject": subject,
                "detail": f"SMTP dispatch failed: {str(e)}"
            }

    # Simulation fallback
    return {
        "status": "simulated",
        "to": to_email,
        "subject": subject,
        "detail": f"Simulated email dispatch to {to_email}: '{subject}' (Add Gmail SMTP credentials to .env for live email delivery)"
    }
