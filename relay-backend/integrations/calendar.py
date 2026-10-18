import logging
from datetime import datetime, timedelta, timezone
from config import settings

logger = logging.getLogger("relay.integrations.calendar")

def create_calendar_event(event_title: str, duration: int = 15, context: dict = None) -> dict:
    """
    Schedules a calendar event.
    If Google service account is configured and Calendar API is enabled,
    creates a real event in Google Calendar.
    Otherwise records a simulated calendar hold.
    """
    title = event_title or "Customer Support Triage"
    mins = int(duration or 15)
    start_dt = datetime.now(timezone.utc) + timedelta(minutes=15)
    end_dt = start_dt + timedelta(minutes=mins)
    time_str = start_dt.strftime("%Y-%m-%d %H:%M UTC")

    has_creds = bool(settings.GOOGLE_SERVICE_ACCOUNT_FILE)

    if has_creds:
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build

            SCOPES = ['https://www.googleapis.com/auth/calendar']
            creds = service_account.Credentials.from_service_account_file(
                settings.GOOGLE_SERVICE_ACCOUNT_FILE, scopes=SCOPES
            )
            service = build('calendar', 'v3', credentials=creds)

            # Build event payload
            description = "Automated support war room triage scheduled by Relay."
            if context:
                description = (
                    f"Ticket ID: {context.get('ticket_id')}\n"
                    f"Customer: {context.get('customer_name')} ({context.get('customer_email')})\n"
                    f"Priority: {context.get('priority')}\n"
                    f"Category: {context.get('category')}\n"
                    f"Query: {context.get('message')}"
                )

            event = {
                'summary': title,
                'description': description,
                'start': {
                    'dateTime': start_dt.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_dt.isoformat(),
                    'timeZone': 'UTC',
                },
            }

            # Attempt to insert into primary or user calendar
            calendar_id = settings.GOOGLE_CALENDAR_ID or 'primary'
            created_event = service.events().insert(calendarId=calendar_id, body=event).execute()

            return {
                "status": "delivered",
                "title": title,
                "duration": mins,
                "detail": f"Live calendar event created: '{title}' at {time_str} ({mins} mins)"
            }
        except Exception as e:
            logger.warning(f"Google Calendar API notice: {e}")
            # If API is disabled or calendar not shared yet, return clear simulated detail
            return {
                "status": "simulated",
                "title": title,
                "duration": mins,
                "detail": f"Reserved {mins}-min calendar hold for {time_str}: '{title}' (Enable Google Calendar API in Cloud Console to sync live)"
            }

    # Simulation fallback
    return {
        "status": "simulated",
        "title": title,
        "duration": mins,
        "detail": f"Reserved {mins}-min calendar hold for {time_str}: '{title}'"
    }
