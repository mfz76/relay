from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
import json
from datetime import datetime

from config import settings
from database import get_db, init_db, get_integration_states, toggle_integration_state
from engine import run_workflow_execution

# Initialize database on startup
init_db()

app = FastAPI(
    title="Relay Automation API",
    description="Backend engine for visual AI-driven support automation pipelines",
    version="2.0.0"
)

# Enable CORS for frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas
class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    is_active: Optional[bool] = True
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[Dict[str, Any]]] = None


class InquiryRequest(BaseModel):
    message: str
    customer_name: Optional[str] = "Valued Customer"
    customer_email: Optional[str] = "customer@example.com"
    workflow_id: Optional[int] = None


class TestRunRequest(BaseModel):
    message: str
    nodes: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[Dict[str, Any]]] = None
    workflow_id: Optional[int] = None


# Endpoints
@app.get("/")
def home():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "2.0.0",
        "integrations": settings.get_integrations_status()
    }


@app.get("/integrations/status")
def integrations_status():
    """Returns configuration status of 3rd party integrations."""
    return settings.get_integrations_status()


@app.get("/integrations/states")
def get_all_integration_states():
    """Returns enabled/disabled toggle states for all integrations."""
    return get_integration_states()


@app.patch("/integrations/{name}/toggle")
def toggle_integration(name: str):
    """Toggles an integration service ON or OFF."""
    valid_names = ["gemini", "slack", "gmail", "google_sheets", "google_calendar"]
    if name not in valid_names:
        raise HTTPException(status_code=404, detail=f"Unknown integration: {name}")
    new_state = toggle_integration_state(name)
    return {"name": name, "enabled": new_state}


# ==================== WORKFLOWS CRUD ====================

@app.get("/workflows")
def list_workflows():
    """Lists all saved workflow pipelines."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM workflows ORDER BY id DESC")
    rows = cursor.fetchall()
    db.close()

    workflows = []
    for r in rows:
        w = dict(r)
        w["is_active"] = bool(w["is_active"])
        try:
            w["nodes"] = json.loads(w["nodes"])
        except Exception:
            pass
        try:
            w["edges"] = json.loads(w["edges"])
        except Exception:
            pass
        workflows.append(w)
    return workflows


@app.post("/workflows", status_code=status.HTTP_201_CREATED)
def create_workflow(payload: WorkflowCreate):
    """Creates a new workflow pipeline."""
    db = get_db()
    cursor = db.cursor()
    now = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO workflows (name, description, is_active, nodes, edges, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.name,
        payload.description or "",
        1 if payload.is_active else 0,
        json.dumps(payload.nodes),
        json.dumps(payload.edges),
        now,
        now
    ))
    db.commit()
    new_id = cursor.lastrowid
    db.close()

    return {
        "id": new_id,
        "name": payload.name,
        "description": payload.description,
        "is_active": payload.is_active,
        "nodes": payload.nodes,
        "edges": payload.edges,
        "created_at": now,
        "updated_at": now
    }


@app.get("/workflows/{workflow_id}")
def get_workflow(workflow_id: int):
    """Retrieves a single workflow by ID."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,))
    row = cursor.fetchone()
    db.close()

    if not row:
        raise HTTPException(status_code=404, detail="Workflow not found")

    w = dict(row)
    w["is_active"] = bool(w["is_active"])
    try:
        w["nodes"] = json.loads(w["nodes"])
    except Exception:
        pass
    try:
        w["edges"] = json.loads(w["edges"])
    except Exception:
        pass
    return w


@app.put("/workflows/{workflow_id}")
def update_workflow(workflow_id: int, payload: WorkflowUpdate):
    """Updates an existing workflow."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,))
    row = cursor.fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Workflow not found")

    existing = dict(row)
    name = payload.name if payload.name is not None else existing["name"]
    description = payload.description if payload.description is not None else existing["description"]
    is_active = (1 if payload.is_active else 0) if payload.is_active is not None else existing["is_active"]
    nodes = json.dumps(payload.nodes) if payload.nodes is not None else existing["nodes"]
    edges = json.dumps(payload.edges) if payload.edges is not None else existing["edges"]
    now = datetime.now().isoformat()

    cursor.execute("""
    UPDATE workflows
    SET name = ?, description = ?, is_active = ?, nodes = ?, edges = ?, updated_at = ?
    WHERE id = ?
    """, (name, description, is_active, nodes, edges, now, workflow_id))

    db.commit()
    db.close()

    return {"message": "Workflow updated successfully", "id": workflow_id}


@app.patch("/workflows/{workflow_id}/activate")
def toggle_workflow_activation(workflow_id: int):
    """Toggles active/paused status of a workflow."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT is_active FROM workflows WHERE id = ?", (workflow_id,))
    row = cursor.fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Workflow not found")

    new_state = 0 if row["is_active"] else 1
    cursor.execute("UPDATE workflows SET is_active = ?, updated_at = ? WHERE id = ?", (
        new_state, datetime.now().isoformat(), workflow_id
    ))
    db.commit()
    db.close()

    return {"id": workflow_id, "is_active": bool(new_state)}


@app.delete("/workflows/{workflow_id}")
def delete_workflow(workflow_id: int):
    """Deletes a workflow."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM workflows WHERE id = ?", (workflow_id,))
    db.commit()
    db.close()
    return {"message": "Workflow deleted successfully", "id": workflow_id}


# ==================== EXECUTION & INQUIRIES ====================

@app.post("/inquiry")
def create_inquiry(inquiry: InquiryRequest):
    """
    Primary Customer Helpdesk Endpoint.
    Receives inquiry, triggers AI classification and executes active workflow.
    """
    try:
        result = run_workflow_execution(
            message=inquiry.message,
            customer_name=inquiry.customer_name,
            customer_email=inquiry.customer_email,
            workflow_id=inquiry.workflow_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/test-run")
def test_workflow_run(req: TestRunRequest):
    """
    Test Run Endpoint for Visual Builder Canvas.
    Simulates or executes a run using custom nodes and edges provided in request.
    """
    custom_wf = None
    if req.nodes and req.edges:
        custom_wf = {
            "name": "Canvas Sandbox Test",
            "nodes": req.nodes,
            "edges": req.edges
        }

    try:
        result = run_workflow_execution(
            message=req.message,
            customer_name="Test User",
            customer_email="test@company.com",
            workflow_id=req.workflow_id,
            custom_workflow=custom_wf
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/executions")
def get_executions():
    """Lists recent execution logs."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM executions ORDER BY id DESC LIMIT 50")
    rows = cursor.fetchall()
    db.close()

    results = []
    for r in rows:
        item = dict(r)
        if item.get("steps_log"):
            try:
                item["steps_log"] = json.loads(item["steps_log"])
            except Exception:
                pass
        results.append(item)

    return {"executions": results}