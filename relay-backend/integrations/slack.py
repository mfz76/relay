import httpx
import logging
from config import settings

logger = logging.getLogger("relay.integrations.slack")

def send_slack_message(channel: str, message: str, context: dict = None) -> dict:
    """
    Sends message to Slack.
    Uses SLACK_WEBHOOK_URL from settings if configured.
    Otherwise gracefully records a simulated broadcast.
    """
    webhook_url = settings.SLACK_WEBHOOK_URL.strip()

    if webhook_url:
        try:
            payload = {
                "text": message,
                "mrkdwn": True,
            }
            with httpx.Client(timeout=6.0) as client:
                res = client.post(webhook_url, json=payload)
                if res.status_code in [200, 204]:
                    return {
                        "status": "delivered",
                        "channel": channel or "#customer-support-urgent",
                        "detail": "Live Slack alert delivered via incoming webhook"
                    }
                else:
                    return {
                        "status": "failed",
                        "channel": channel,
                        "detail": f"Slack webhook returned status {res.status_code}: {res.text}"
                    }
        except Exception as e:
            logger.error(f"Error posting to Slack: {e}")
            return {
                "status": "failed",
                "channel": channel,
                "detail": f"Slack connection error: {str(e)}"
            }

    # Simulation fallback
    preview = message.replace("\n", " ")[:60]
    return {
        "status": "simulated",
        "channel": channel or "#customer-support-urgent",
        "detail": f"Simulated Slack post to {channel or '#general'}: '{preview}...' (Add SLACK_WEBHOOK_URL to .env for live Slack delivery)"
    }
