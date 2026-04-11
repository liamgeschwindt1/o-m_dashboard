"""Leaflet map as a bi-directional Streamlit custom component.

Uses ``declare_component`` with a local ``index.html`` so the map can send
events (clicks, drags) back to Python via *setComponentValue* — the
officially supported communication channel.
"""
from __future__ import annotations

import os
from typing import Any

import streamlit.components.v1 as _components

_COMPONENT_DIR = os.path.dirname(os.path.abspath(__file__))
_leaflet_component = _components.declare_component("leaflet_map", path=_COMPONENT_DIR)


def leaflet_map(
    *,
    mode: str,
    nodes: list[dict[str, Any]],
    route_path: list[dict[str, Any]],
    start_coords: tuple[float, float] | list[float] | None,
    end_coords: tuple[float, float] | list[float] | None,
    via_points: list[dict[str, Any]],
    active_node_id: str | None,
    center_lat: float,
    center_lng: float,
    zoom: int,
    maptiler_key: str,
    key: str | None = None,
) -> dict | None:
    """Render the Leaflet map and return the latest event (or *None*)."""
    safe_nodes = [
        {
            "id": str(n["id"]),
            "index": int(n["index"]),
            "lat": float(n["lat"]),
            "lng": float(n["lng"]),
            "instruction": str(n.get("instruction", "")),
            "type": str(n.get("type", "step")),
            "distance_m": n.get("distance_m", 0),
        }
        for n in nodes
    ]
    safe_path = [[float(p["lat"]), float(p["lng"])] for p in route_path]

    return _leaflet_component(
        mode=mode,
        nodes=safe_nodes,
        route_path=safe_path,
        start_coords=list(start_coords) if start_coords else None,
        end_coords=list(end_coords) if end_coords else None,
        via_points=[
            {"id": v["id"], "lat": float(v["lat"]), "lng": float(v["lng"])}
            for v in via_points
        ],
        active_node_id=str(active_node_id) if active_node_id else None,
        center_lat=float(center_lat),
        center_lng=float(center_lng),
        zoom=int(zoom),
        maptiler_key=str(maptiler_key),
        key=key,
        default=None,
    )
