"""Lightweight FastAPI backend that proxies GraphHopper requests so API keys stay server-side."""
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

GH_ROUTE = "https://graphhopper.com/api/1/route"
GH_GEOCODE = "https://graphhopper.com/api/1/geocode"

SIGN_MAP: dict[int, str] = {
    -3: "sharp-left", -2: "left", -1: "slight-left",
    0: "straight",
    1: "slight-right", 2: "right", 3: "sharp-right",
    4: "destination", 5: "destination",
    6: "roundabout",
}


def _gh_key() -> str:
    key = os.environ.get("GRAPHHOPPER_API_KEY", "")
    if not key:
        raise HTTPException(503, "GRAPHHOPPER_API_KEY not configured")
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
        "has_routing_key": bool(os.environ.get("GRAPHHOPPER_API_KEY")),
    }


@app.post("/api/route")
def compute_route(body: RouteRequest):
    key = _gh_key()
    # GraphHopper expects points as lat,lng strings
    params: dict[str, Any] = {
        "key": key,
        "vehicle": "foot",
        "locale": "en",
        "instructions": "true",
        "points_encoded": "false",
        "type": "json",
    }
    # Add each waypoint as a point parameter
    point_params = [f"{lat},{lng}" for lat, lng in body.waypoints]

    try:
        resp = requests.get(
            GH_ROUTE,
            params={**params, "point": point_params},
            timeout=12,
        )
        resp.raise_for_status()
    except requests.HTTPError as exc:
        detail = ""
        try:
            detail = exc.response.text[:300]
        except Exception:
            pass
        raise HTTPException(502, f"GraphHopper error {exc.response.status_code}: {detail}") from exc
    except Exception as exc:
        raise HTTPException(502, str(exc)) from exc

    data = resp.json()
    if "paths" not in data or len(data["paths"]) == 0:
        raise HTTPException(502, "No route returned from GraphHopper")

    best = data["paths"][0]
    raw_coords = best["points"]["coordinates"]  # [[lng, lat, alt?], ...]
    path = [{"lat": round(c[1], 6), "lng": round(c[0], 6)} for c in raw_coords]

    nodes: list[dict[str, Any]] = []
    idx = 0
    for instr in best.get("instructions", []):
        interval = instr.get("interval", [0])
        ci = interval[0]
        if ci < len(raw_coords):
            c = raw_coords[ci]
        else:
            c = raw_coords[-1]

        sign = instr.get("sign", 0)
        step_type = SIGN_MAP.get(sign, "step")

        nodes.append({
            "id": f"node-{uuid.uuid4().hex[:8]}",
            "index": idx,
            "lat": round(c[1], 6),
            "lng": round(c[0], 6),
            "instruction": instr.get("text", ""),
            "type": step_type,
            "distance_m": round(instr.get("distance", 0)),
            "duration_s": round(instr.get("time", 0) / 1000),
        })
        idx += 1

    return {"path": path, "nodes": nodes}


@app.post("/api/geocode")
def geocode(body: GeoSearchRequest):
    key = _gh_key()
    try:
        r = requests.get(
            GH_GEOCODE,
            params={"key": key, "q": body.query, "limit": body.size, "locale": "en"},
            timeout=8,
        )
        r.raise_for_status()
    except Exception as exc:
        raise HTTPException(502, str(exc)) from exc

    return [
        {
            "label": hit.get("name", "") + (", " + hit.get("city", "") if hit.get("city") else "") + (", " + hit.get("country", "") if hit.get("country") else ""),
            "lat": round(hit["point"]["lat"], 6),
            "lng": round(hit["point"]["lng"], 6),
        }
        for hit in r.json().get("hits", [])
        if "point" in hit
    ]
