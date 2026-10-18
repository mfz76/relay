import logging
from datetime import datetime
import gspread
from config import settings

logger = logging.getLogger("relay.integrations.sheets")

def append_sheet_row(spreadsheet: str = "", row_data: str = "", context: dict = None) -> dict:
    """
    Appends a row to Google Sheets.
    If service account credentials and GOOGLE_SHEET_ID are provided, executes live append.
    Matches sheet schema: ['Timestamp', 'Customer Query', 'Priority', 'Category', 'Sentiment', 'Status']
    """
    has_creds = bool(settings.GOOGLE_SERVICE_ACCOUNT_FILE and settings.GOOGLE_SHEET_ID)

    if has_creds:
        try:
            gc = gspread.service_account(filename=settings.GOOGLE_SERVICE_ACCOUNT_FILE)
            sh = gc.open_by_key(settings.GOOGLE_SHEET_ID)
            ws = sh.get_worksheet(0)

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            if context:
                query = context.get("message", row_data)
                priority = (context.get("priority") or "low").upper()
                category = context.get("category") or "general"
                sentiment = context.get("sentiment") or "neutral"
                status = "Auto-Escalated (Slack/Gmail)" if priority == "HIGH" else "Logged to Database"
                row_values = [timestamp, query, priority, category, sentiment, status]
            elif row_data:
                # If explicit row_data passed as comma separated string
                parts = [p.strip() for p in row_data.split(",")]
                row_values = [timestamp] + parts
            else:
                row_values = [timestamp, "Test customer inquiry", "LOW", "general", "neutral", "Logged to Database"]

            ws.append_row(row_values)

            return {
                "status": "delivered",
                "spreadsheet": sh.title,
                "detail": f"Appended row to live Google Sheet '{sh.title}'"
            }
        except Exception as e:
            logger.error(f"Failed to append to Google Sheet: {e}")
            return {
                "status": "failed",
                "spreadsheet": spreadsheet or "Google Sheet",
                "detail": f"Google Sheets API error: {str(e)}"
            }

    # Simulation fallback
    sheet_name = spreadsheet or "Support Inquiries 2026"
    return {
        "status": "simulated",
        "spreadsheet": sheet_name,
        "detail": f"Appended row to '{sheet_name}': [{row_data}] (Add Google Service Account to .env for live Sheet sync)"
    }
