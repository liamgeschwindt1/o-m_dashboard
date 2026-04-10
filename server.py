"""Lightweight FastAPI backend that proxies ORS requests so API keys stay server-side."""
from __future__ import annotations

import os
import uuid
from typing import Any

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Tiera API", docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ORS_DIRECTIONS = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson"
ORS_GEOCODE = "https://api.openrouteservice.org/geocode/search"

STEP_TYPES: dict[int, str] = {
    0: "left", 1: "right", 2: "sharp-left", 3: "sharp-right",
    4: "slight-left", 5: "slight-right", 6: "straight", 7: "roundabout",
    8: "roundabout-exit", 9: "u-turn", 10: "destination", 11: "start",
    12: "keep-left", 13: "keep-right",
}


def _ors_key() -> str:
    key = os.environ.get("ORS_API_KEY", "")
    if not key:
        raise HTTPException(503, "ORS_API_KEY not configured")
    return key


def _maptiler_key() -> str:
    return os.environ.get("MAPTILER_API_KEY", "")


# ── Models ──────────────────────────────────────────────────────────────────────

class RouteRequest(BaseModel):
    waypoints: list[list[float]]  # [[lat, lng], ...]


class GeoSearchRequest(BaseModel):
    query: str
    size: int = 6


# ── Endpoints ───────────────────────────────────────────────────────────────────

@app.get("/api/config")
def get_config():
    return {
        "maptiler_key": _maptiler_key(),
        "has_ors_key": bool(os.environ.get("ORS_API_KEY")),
    }


@app.post("/api/route")
def compute_route(body: RouteRequest):
    key = _ors_key()
    coords = [[lng, lat] for lat, lng in body.waypoints]
    try:
        resp = requests.post(
            ORS_DIRECTIONS,
            headers={"Authorization": key, "Content-Type": "application/json"},
            json={"coordinates": coords},
            timeout=12,
        )
        resp.raise_for_status()
    except requests.HTTPError as exc:
        raise HTTPException(502, f"ORS error {exc.response.status_code}") from exc
    except Exception as exc:
        raise HTTPException(502, str(exc)) from exc

    feature = resp.json()["features"][0]
    raw = feature["geometry"]["coordinates"]
    path = [{"lat": round(c[1], 6), "lng": round(c[0], 6)} for c in raw]

    nodes: list[dict[str, Any]] = []
    idx = 0
    for seg in feature["properties"].get("segments", []):
        for step in seg.get("steps", []):
            wi = step["way_points"][0]
            c = raw[wi]
            nodes.append({
                "id": f"node-{uuid.uuid4().hex[:8]}",
                "index": idx,
                "lat": round(c[1], 6),
                "lng": round(c[0], 6),
                "instruction": step.get("instruction", ""),
                "type": STEP_TYPES.get(step.get("type", 0), "step"),
                "distance_m": round(step.get("distance", 0)),
                "duration_s": round(step.get("duration", 0)),
            })
            idx += 1

    return {"path": path, "nodes": nodes}


@app.post("/api/geocode")
def geocode(body: GeoSearchRequest):
    key = _ors_key()
    try:
        r = requests.get(
            ORS_GEOCODE,
            params={"api_key": key, "text": body.query, "size": body.size},
            timeout=8,
        )
        r.raise_for_status()
    except Exception as exc:
        raise HTTPException(502, str(exc)) from exc

    return [
        {
            "label": f["properties"]["label"],
            "lat": round(f["geometry"]["coordinates"][1], 6),
            "lng": round(f["geometry"]["coordinates"][0], 6),
        }
        for f in r.json().get("features", [])
    ]
