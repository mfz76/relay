import sqlite3
import json
from datetime import datetime
from config import settings

def get_db():
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Create Workflows Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        nodes TEXT NOT NULL,
        edges TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
    )
    """)

    # 2. Create or Upgrade Executions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id INTEGER,
        ticket_id TEXT,
        customer_name TEXT,
        customer_email TEXT,
        message TEXT,
        priority TEXT,
        category TEXT,
        sentiment TEXT,
        status TEXT,
        action TEXT,
        steps_log TEXT,
        created_at TEXT
    )
    """)

    # 3. Create Integration Settings Table (Allows user to toggle third-party services ON/OFF)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS integration_settings (
        name TEXT PRIMARY KEY,
        enabled INTEGER DEFAULT 1
    )
    """)

    # Default all 5 services to ON if not set
    default_integrations = ["gemini", "slack", "gmail", "google_sheets", "google_calendar"]
    for integ in default_integrations:
        cursor.execute("INSERT OR IGNORE INTO integration_settings (name, enabled) VALUES (?, 1)", (integ,))

    # 4. Seed Default Workflow if Workflows table is empty
    cursor.execute("SELECT COUNT(*) as count FROM workflows")
    count = cursor.fetchone()["count"]

    if count == 0:
        default_nodes = [
            {
                "id": "trigger-1",
                "type": "trigger",
                "position": {"x": 340, "y": 30},
                "data": {"label": "New Customer Ticket", "description": "Triggers on incoming customer inquiry"}
            },
            {
                "id": "analyze-1",
                "type": "analyze",
                "position": {"x": 340, "y": 190},
                "data": {"label": "AI Triage & Categorizer"}
            },
            {
                "id": "condition-1",
                "type": "condition",
                "position": {"x": 330, "y": 360},
                "data": {
                    "label": "Urgency Filter",
                    "config": {"field": "priority", "operator": "equals", "value": "high"}
                }
            },
            {
                "id": "action-slack",
                "type": "action",
                "position": {"x": 120, "y": 550},
                "data": {
                    "integration": "slack",
                    "label": "Post #urgent-incidents",
                    "config": {
                        "channel": "#customer-support-urgent",
                        "message": "🚨 CRITICAL ESCALATION\nTicket: {{ticket_id}}\nPriority: {{priority}}\nCategory: {{category}}\nSentiment: {{sentiment}}\nMessage: {{message}}"
                    }
                }
            },
            {
                "id": "action-gmail",
                "type": "action",
                "position": {"x": 120, "y": 720},
                "data": {
                    "integration": "gmail",
                    "label": "Email Support Lead",
                    "config": {
                        "to": "{{support_email}}",
                        "subject": "🚨 SLA Alert: Urgent Inquiry {{ticket_id}}",
                        "body": "Customer message requires immediate triage:\n\n{{message}}\n\nPriority: {{priority}}\nCategory: {{category}}\nSentiment: {{sentiment}}"
                    }
                }
            },
            {
                "id": "action-calendar",
                "type": "action",
                "position": {"x": 120, "y": 890},
                "data": {
                    "integration": "google_calendar",
                    "label": "Hold 15-min War Room",
                    "config": {
                        "event_title": "Emergency Customer Triage: {{ticket_id}}",
                        "duration": 15
                    }
                }
            },
            {
                "id": "action-sheets",
                "type": "action",
                "position": {"x": 550, "y": 550},
                "data": {
                    "integration": "google_sheets",
                    "label": "Log Standard Queue",
                    "config": {
                        "spreadsheet": "Support Inquiries 2026",
                        "row_data": "{{ticket_id}}, {{priority}}, {{category}}, {{sentiment}}, {{message}}"
                    }
                }
            }
        ]

        default_edges = [
            {"id": "e-trigger-analyze", "source": "trigger-1", "target": "analyze-1"},
            {"id": "e-analyze-condition", "source": "analyze-1", "target": "condition-1"},
            {"id": "e-cond-slack", "source": "condition-1", "target": "action-slack", "sourceHandle": "match"},
            {"id": "e-slack-gmail", "source": "action-slack", "target": "action-gmail"},
            {"id": "e-gmail-cal", "source": "action-gmail", "target": "action-calendar"},
            {"id": "e-cond-sheets", "source": "condition-1", "target": "action-sheets", "sourceHandle": "no-match"}
        ]

        now = datetime.now().isoformat()
        cursor.execute("""
        INSERT INTO workflows (name, description, is_active, nodes, edges, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "Critical Incident Auto-Responder",
            "Automated triage, SLA notification on Slack & Gmail, and Google Sheets queue sync",
            1,
            json.dumps(default_nodes),
            json.dumps(default_edges),
            now,
            now
        ))

        # Secondary template
        cursor.execute("""
        INSERT INTO workflows (name, description, is_active, nodes, edges, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "General Inquiries & Feedback Sync to Sheets",
            "Logs all incoming feedback and non-critical requests to Google Sheets",
            1,
            json.dumps(default_nodes),
            json.dumps(default_edges),
            now,
            now
        ))

    conn.commit()
    conn.close()

def get_integration_states():
    """Retrieves enabled/disabled states for all 5 integrations."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT name, enabled FROM integration_settings")
    rows = cursor.fetchall()
    conn.close()
    states = {}
    for r in rows:
        states[r["name"]] = bool(r["enabled"])
    return states

def toggle_integration_state(name: str):
    """Toggles the enabled status of an integration service."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT enabled FROM integration_settings WHERE name = ?", (name,))
    row = cursor.fetchone()
    if not row:
        new_state = 0
        cursor.execute("INSERT INTO integration_settings (name, enabled) VALUES (?, ?)", (name, new_state))
    else:
        new_state = 0 if row["enabled"] else 1
        cursor.execute("UPDATE integration_settings SET enabled = ? WHERE name = ?", (new_state, name))
    conn.commit()
    conn.close()
    return bool(new_state)

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")