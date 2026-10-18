import json
import time
import random
from datetime import datetime
from config import settings
from database import get_db, get_integration_states
from classifier import classify_inquiry
from integrations.slack import send_slack_message
from integrations.gmail import send_email
from integrations.sheets import append_sheet_row
from integrations.calendar import create_calendar_event

def substitute_variables(text: str, context: dict) -> str:
    """Replaces {{variable_name}} tokens with actual context values."""
    if not isinstance(text, str):
        return text
    result = text
    for key, val in context.items():
        placeholder = f"{{{{{key}}}}}"
        result = result.replace(placeholder, str(val))
    return result

def evaluate_condition(node_config: dict, context: dict) -> bool:
    """Evaluates a condition node's rule against the execution context."""
    field = (node_config.get("field") or "priority").strip().lower()
    operator = (node_config.get("operator") or "equals").strip().lower()
    target_value = (node_config.get("value") or "high").strip().lower()

    actual_value = str(context.get(field, "")).strip().lower()

    if operator == "equals":
        return actual_value == target_value
    elif operator == "not_equals":
        return actual_value != target_value
    elif operator == "contains":
        return target_value in actual_value
    return actual_value == target_value

def run_workflow_execution(
    message: str,
    customer_name: str = "Valued Customer",
    customer_email: str = "customer@example.com",
    workflow_id: int = None,
    custom_workflow: dict = None
) -> dict:
    """
    Executes an active workflow pipeline for an incoming inquiry.
    """
    start_time = time.time()
    ticket_id = f"INQ-{random.randint(1000, 9999)}"

    # 1. AI / NLP Triage
    classification = classify_inquiry(message)
    priority = classification["priority"]
    category = classification["category"]
    sentiment = classification["sentiment"]

    context = {
        "ticket_id": ticket_id,
        "customer_name": customer_name or "Valued Customer",
        "customer_email": customer_email or "customer@example.com",
        "support_email": settings.SUPPORT_EMAIL,
        "message": message,
        "priority": priority,
        "category": category,
        "sentiment": sentiment,
    }

    # 2. Retrieve Workflow Definition
    db = get_db()
    workflow = None
    if custom_workflow:
        workflow = custom_workflow
    elif workflow_id:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,))
        row = cursor.fetchone()
        if row:
            workflow = dict(row)
    
    if not workflow:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM workflows WHERE is_active = 1 ORDER BY id ASC LIMIT 1")
        row = cursor.fetchone()
        if row:
            workflow = dict(row)

    if not workflow:
        db.close()
        raise ValueError("No active workflow found to execute inquiry.")

    workflow_name = workflow.get("name", "Default Relay Workflow")
    workflow_id_val = workflow.get("id")

    nodes = workflow.get("nodes", [])
    edges = workflow.get("edges", [])
    if isinstance(nodes, str):
        nodes = json.loads(nodes)
    if isinstance(edges, str):
        edges = json.loads(edges)

    node_by_id = {n["id"]: n for n in nodes}
    steps_log = []

    # Step 1: Trigger
    steps_log.append({
        "node": "1. Trigger: Customer Inquiry",
        "type": "trigger",
        "status": "success",
        "time": "10ms",
        "detail": f"Received inquiry from {context['customer_name']} ({context['customer_email']})"
    })

    # Step 2: Analyze
    steps_log.append({
        "node": "2. AI Logic: NLP Classifier",
        "type": "analyze",
        "status": "success",
        "time": f"{int((time.time() - start_time) * 1000)}ms",
        "detail": f"Priority: {priority.upper()} | Category: {category} | Sentiment: {sentiment} ({classification.get('provider', 'rule-engine')})"
    })

    # Step 3: Condition & Flow Branching
    condition_nodes = [n for n in nodes if n.get("type") == "condition"]
    passed_condition = True

    if condition_nodes:
        cond_node = condition_nodes[0]
        cfg = cond_node.get("data", {}).get("config", {})
        passed_condition = evaluate_condition(cfg, context)

        cond_label = cond_node.get("data", {}).get("label", "Condition Filter")
        field_name = cfg.get("field", "priority")
        target_val = cfg.get("value", "high")
        steps_log.append({
            "node": f"3. Filter: {cond_label}",
            "type": "condition",
            "status": "success",
            "time": "2ms",
            "detail": f"Rule [{field_name} == '{target_val}'] -> {'MATCHED (Path A)' if passed_condition else 'NO MATCH (Path B)'}"
        })

    # Determine which action nodes to execute based on graph edges
    active_action_nodes = []
    if condition_nodes:
        cond_id = condition_nodes[0]["id"]
        target_handle = "match" if passed_condition else "no-match"

        # Outgoing edges from condition
        first_level_targets = [
            e["target"] for e in edges 
            if e["source"] == cond_id and (e.get("sourceHandle") == target_handle or not e.get("sourceHandle"))
        ]

        # Follow chained edges
        visited = set(first_level_targets)
        queue = list(first_level_targets)
        while queue:
            curr = queue.pop(0)
            next_targets = [e["target"] for e in edges if e["source"] == curr and e["target"] not in visited]
            visited.update(next_targets)
            queue.extend(next_targets)

        active_action_nodes = [node_by_id[nid] for nid in visited if nid in node_by_id and node_by_id[nid].get("type") == "action"]
    else:
        active_action_nodes = [n for n in nodes if n.get("type") == "action"]

    # Step 4+: Execute Actions
    integration_states = get_integration_states()

    for idx, act in enumerate(active_action_nodes, start=4):
        action_data = act.get("data", {})
        integration = action_data.get("integration", "generic")
        label = action_data.get("label", f"Action: {integration}")
        config = action_data.get("config", {})

        # Check if this integration is enabled by admin
        if not integration_states.get(integration, True):
            steps_log.append({
                "node": f"{idx}. {integration.replace('_', ' ').title()}: {label}",
                "type": "action",
                "integration": integration,
                "status": "skipped",
                "time": "0ms",
                "detail": f"SKIPPED - {integration.replace('_', ' ').title()} is disabled by admin"
            })
            continue

        action_start = time.time()
        res = {"status": "success", "detail": "Action processed"}

        if integration == "slack":
            channel = substitute_variables(config.get("channel", "#customer-support-urgent"), context)
            msg = substitute_variables(config.get("message", "Ticket {{ticket_id}} received"), context)
            res = send_slack_message(channel, msg, context)

        elif integration == "gmail":
            configured_to = (config.get("to") or "").strip()
            if not configured_to or configured_to in ["lead-responder@enterprise.com", "support@company.com"]:
                to_addr = settings.SUPPORT_EMAIL
            else:
                to_addr = substitute_variables(configured_to, context)
            subject = substitute_variables(config.get("subject", "Support Inquiry {{ticket_id}}"), context)
            body = substitute_variables(config.get("body", "Thank you for contacting us.\n\n{{message}}"), context)
            res = send_email(to_addr, subject, body, context)

        elif integration == "google_sheets":
            sheet = substitute_variables(config.get("spreadsheet", "Support Inquiries 2026"), context)
            row_data = substitute_variables(config.get("row_data", "{{ticket_id}}, {{priority}}, {{category}}"), context)
            res = append_sheet_row(sheet, row_data, context)

        elif integration == "google_calendar":
            event_title = substitute_variables(config.get("event_title", "Support Call - {{ticket_id}}"), context)
            duration = config.get("duration", 15)
            res = create_calendar_event(event_title, duration, context)

        elapsed = f"{int((time.time() - action_start) * 1000) + 12}ms"
        steps_log.append({
            "node": f"{idx}. {integration.replace('_', ' ').title()}: {label}",
            "type": "action",
            "integration": integration,
            "status": "success" if res.get("status") in ["delivered", "simulated"] else "failed",
            "time": elapsed,
            "detail": res.get("detail", "Dispatched")
        })

    # Primary summary action string
    primary_action_summary = "Auto-Escalated (Slack + Gmail Alert Dispatched)" if priority == "high" else "Logged to Support Database (Google Sheets)"

    # Save to SQLite database
    now_iso = datetime.now().isoformat()
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO executions (
        workflow_id, ticket_id, customer_name, customer_email, message, 
        priority, category, sentiment, status, action, steps_log, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        workflow_id_val,
        ticket_id,
        context["customer_name"],
        context["customer_email"],
        message,
        priority,
        category,
        sentiment,
        "completed",
        primary_action_summary,
        json.dumps(steps_log),
        now_iso
    ))
    db.commit()
    db.close()

    return {
        "ticket_id": ticket_id,
        "customer_name": context["customer_name"],
        "customer_email": context["customer_email"],
        "message": message,
        "priority": priority,
        "category": category,
        "sentiment": sentiment,
        "status": primary_action_summary,
        "workflow_name": workflow_name,
        "steps": steps_log,
        "created_at": now_iso
    }
