"""
FastAPI server that serves identity data from the pipeline CSV/JSON outputs.
Run: uvicorn api_server:app --reload --port 8000
"""
import csv
import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="IdentitySphere AI API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATA_DIR = Path(__file__).parent / "identitysphere" / "data" / "generated"
FRONTEND_DATA = Path(__file__).parent / "frontend" / "public" / "data" / "platform_data.json"

_cache = {}


def _read_csv(name):
    path = DATA_DIR / name
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _read_json(path):
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _load():
    if _cache:
        return
    _cache["report"] = _read_json(DATA_DIR / "pipeline_report.json")
    _cache["platform"] = _read_json(FRONTEND_DATA)
    _cache["groups"] = _read_json(DATA_DIR / "groups.json")
    _cache["identities_csv"] = _read_csv("identities.csv")
    _cache["offboarding"] = _read_csv("offboarding.csv")
    _cache["memberships"] = _read_csv("memberships.csv")
    _cache["entitlements"] = _read_csv("entitlements.csv")
    _cache["audit_events"] = _read_csv("audit_events.csv")


@app.on_event("startup")
def startup():
    _load()


@app.get("/api/health")
def health():
    return {"status": "ok", "identities": len(_cache.get("platform", {}).get("identities", []))}


@app.get("/api/report")
def report():
    return _cache.get("report", {})


@app.get("/api/stats")
def stats():
    p = _cache.get("platform", {})
    return p.get("stats", {})


@app.get("/api/identities")
def identities():
    p = _cache.get("platform", {})
    return p.get("identities", [])


@app.get("/api/identities/{person_id}")
def identity_detail(person_id: str):
    p = _cache.get("platform", {})
    for ident in p.get("identities", []):
        if ident["person_id"] == person_id:
            ent = [e for e in _cache.get("entitlements", []) if e.get("person_id") == person_id]
            mem = [m for m in _cache.get("memberships", []) if m.get("person_id") == person_id]
            evt = [e for e in _cache.get("audit_events", []) if e.get("person_id") == person_id]
            off = [o for o in _cache.get("offboarding", []) if o.get("person_id") == person_id]
            return {**ident, "entitlements": ent, "memberships": mem, "audit_events": evt, "offboarding": off}
    raise HTTPException(404, f"Identity {person_id} not found")


@app.get("/api/risks")
def risks():
    r = _cache.get("report", {})
    return r.get("top_risky_identities", [])


@app.get("/api/compliance")
def compliance():
    r = _cache.get("report", {})
    return r.get("compliance_mapping", [])


@app.get("/api/blast-radius")
def blast_radius():
    r = _cache.get("report", {})
    return r.get("blast_radius_summary", {})


@app.get("/api/groups")
def groups():
    return _cache.get("groups", [])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
