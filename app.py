from __future__ import annotations

import json
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

import requests
import streamlit as st
import streamlit.components.v1 as components

from assets.tiera_styles import TIERA_STYLES
from components.leaflet_map_bridge import build_leaflet_map_html

# ── Constants ─────────────────────────────────────────────────────────────────
ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/foot-walking"
ORS_GEOCODE_URL    = "https://api.openrouteservice.org/geocode/search"

_ORS_STEP_TYPES: dict[int, str] = {
    0: "left", 1: "right", 2: "sharp-left", 3: "sharp-right",
    4: "slight-left", 5: "slight-right", 6: "straight", 7: "roundabout",
    8: "roundabout-exit", 9: "u-turn", 10: "destination", 11: "start",
    12: "keep-left", 13: "keep-right",
}
_STEP_ICON: dict[str, str] = {
    "start": "▶", "destination": "⬛", "left": "↰", "right": "↱",
    "sharp-left": "↺", "sharp-right": "↻", "slight-left": "↖",
    "slight-right": "↗", "straight": "↑", "u-turn": "⟲",
    "roundabout": "⟳", "roundabout-exit": "⟳", "keep-left": "↖",
    "keep-right": "↗", "step": "•",
}

DEFAULT_ROUTE_NAME = "tiera-route-001"
DEFAULT_METADATA: dict[str, str] = {
    "trainer": "",
    "client": "",
    "environment": "Urban",
    "conditions": "Daytime / light traffic",
    "session_objective": "Coach safe shoreline alignment and turn timing.",
}

DEFAULT_METADATA: dict[str, str] = {
    "trainer": "",
    "client": "",
    "environment": "Urban",
    "conditions": "Daytime / light traffic",
    "session_objective": (
        "Coach safe shoreline alignment, landmark identification, and turn timing."
    ),
}

# ── Helpers ───────────────────────────────────────────────────────────────────


# ── Helpers ───────────────────────────────────────────────────────────────────

def fetch_ors_route(slat: float, slng: float, elat: float, elng: float, api_key: str):
    """Fetch ORS walking route. Returns (path, nodes).
    path: list of {lat, lng} for the polyline.
    nodes: list of step dicts {id, lat, lng, instruction, type, distance_m, duration_s}.
    """
    resp = requests.get(
        ORS_DIRECTIONS_URL,
        params={"api_key": api_key, "start": f"{slng},{slat}", "end": f"{elng},{elat}"},
        timeout=12,
    )
    resp.raise_for_status()
    feature = resp.json()["features"][0]
    coords = feature["geometry"]["coordinates"]  # [[lng, lat], ...]
    path = [{"lat": round(c[1], 6), "lng": round(c[0], 6)} for c in coords]

    nodes: list[dict[str, Any]] = []
    for seg in feature["properties"].get("segments", []):
        for step in seg.get("steps", []):
            wp_start = step["way_points"][0]
            c = coords[wp_start]
            step_type = _ORS_STEP_TYPES.get(step.get("type", 0), "step")
            nodes.append({
                "id":          f"step-{uuid.uuid4().hex[:8]}",
                "lat":         round(c[1], 6),
                "lng":         round(c[0], 6),
                "instruction": step.get("instruction", ""),
                "type":        step_type,
                "distance_m":  round(step.get("distance", 0)),
                "duration_s":  round(step.get("duration", 0)),
            })
    return path, nodes


def search_address_candidates(query: str, api_key: str, size: int = 6) -> list[dict]:
    if not query or not api_key:
        return []
    try:
        resp = requests.get(
            ORS_GEOCODE_URL,
            params={"api_key": api_key, "text": query, "size": size},
            timeout=8,
        )
        resp.raise_for_status()
        return [
            {
                "label": f["properties"]["label"],
                "lat":   round(f["geometry"]["coordinates"][1], 6),
                "lng":   round(f["geometry"]["coordinates"][0], 6),
            }
            for f in resp.json().get("features", [])
        ]
    except Exception:
        return []


# ── Session state ─────────────────────────────────────────────────────────────

def initialize_state():
    defaults: dict[str, Any] = {
        "route_name":        DEFAULT_ROUTE_NAME,
        "route_metadata":    deepcopy(DEFAULT_METADATA),
        "nodes":             [],      # ORS step nodes
        "route_path":        [],      # [{lat, lng}, ...] full polyline geometry
        "selected_step_idx": None,    # int index into nodes
        "start_address":     "",
        "end_address":       "",
        "start_coords":      None,    # (lat, lng)
        "end_coords":        None,
        "start_label":       "",
        "end_label":         "",
        "start_candidates":  [],
        "end_candidates":    [],
        "route_status":      "Enter start and end addresses, then press Plot Route.",
        "tiera_bridge":      "",
        "_last_bridge_ts":   0,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def _reroute_with_current_coords():
    """Re-fetch ORS route using current start/end coords. Call after drag events."""
    try:
        api_key: str = st.secrets["ORS_API_KEY"]
    except Exception:
        return
    sc = st.session_state.start_coords
    ec = st.session_state.end_coords
    if not sc or not ec:
        return
    try:
        path, nodes = fetch_ors_route(sc[0], sc[1], ec[0], ec[1], api_key)
        st.session_state.route_path = path
        st.session_state.nodes = nodes
        st.session_state.selected_step_idx = 0 if nodes else None
        st.session_state.route_status = f"Route updated \u2014 {len(nodes)} steps."
    except Exception as exc:
        st.session_state.route_status = f"Re-routing failed: {exc}"


def apply_bridge_event():
    raw = st.session_state.get("tiera_bridge", "")
    if not raw:
        return
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return
    ts = payload.get("ts", 0)
    if ts <= st.session_state.get("_last_bridge_ts", 0):
        return
    st.session_state._last_bridge_ts = ts
    event = payload.get("type")

    if event == "step_click":
        idx = payload.get("index")
        if idx is not None:
            st.session_state.selected_step_idx = int(idx)
            st.session_state.route_status = f"Step {int(idx) + 1} selected on map."

    elif event == "waypoint_drag_end":
        role = payload.get("role")   # "start" or "end"
        lat = round(float(payload.get("lat", 0)), 6)
        lng = round(float(payload.get("lng", 0)), 6)
        if role == "start":
            st.session_state.start_coords = (lat, lng)
            st.session_state.route_status = "Start pin moved. Fetching updated route\u2026"
        elif role == "end":
            st.session_state.end_coords = (lat, lng)
            st.session_state.route_status = "End pin moved. Fetching updated route\u2026"
        _reroute_with_current_coords()


def build_export_payload():
    return {
        "route_name": st.session_state.route_name,
        "metadata": {
            **st.session_state.route_metadata,
            "exported_at": datetime.now(timezone.utc).isoformat(),
        },
        "nodes": [
            {
                "lat":         n["lat"],
                "lng":         n["lng"],
                "instruction": n["instruction"],
                "type":        n["type"],
            }
            for n in st.session_state.nodes
        ],
    }


# ── Page bootstrap ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Tiera O&M Training Studio",
    page_icon="\U0001f9ed",
    layout="wide",
    initial_sidebar_state="collapsed",
)
st.markdown(f"<style>{TIERA_STYLES}</style>", unsafe_allow_html=True)

initialize_state()
apply_bridge_event()

try:
    ors_api_key: str = st.secrets["ORS_API_KEY"]
except Exception:
    ors_api_key = ""

try:
    maptiler_key: str = st.secrets["MAPTILER_API_KEY"]
except Exception:
    maptiler_key = ""

# Hidden bridge widget — hidden via CSS
st.text_input("tiera-bridge", key="tiera_bridge", label_visibility="collapsed")

# ── Derived values ────────────────────────────────────────────────────────────
node_count = len(st.session_state.nodes)
total_dist = sum(n.get("distance_m", 0) for n in st.session_state.nodes)
dist_str = f"{total_dist / 1000:.2f} km" if total_dist > 0 else "\u2014"

# ── Header ────────────────────────────────────────────────────────────────────
st.markdown(
    f"""<div class="tiera-banner">
      <div class="tiera-banner__top">
        <div class="tiera-banner__brand">NAVCORE</div>
      </div>
      <div class="tiera-banner__head">
        <h1>Tiera O&amp;M Training Studio</h1>
        <span class="tiera-banner__sub">powered by OpenRouteService spatial intelligence</span>
      </div>
      <div class="hud-grid">
        <div class="hud-chip"><strong>{node_count}</strong><span>Route steps</span></div>
        <div class="hud-chip"><strong>{dist_str}</strong><span>Total distance</span></div>
        <div class="hud-chip"><strong>ORS FOSS</strong><span>Pedestrian engine</span></div>
      </div>
    </div>""",
    unsafe_allow_html=True,
)

left_col, right_col = st.columns([1.0, 1.55], gap="medium")

# ══════════════════════════════════════════════════════════════════════════════
# LEFT — ROUTE PLANNER + INSTRUCTION LOG
# ══════════════════════════════════════════════════════════════════════════════
with left_col:

    # ── Route Planner ──────────────────────────────────────────────────────
    st.markdown("<div class='panel-label'>ROUTE PLANNER</div>", unsafe_allow_html=True)

    with st.container(border=True):
        if not ors_api_key:
            st.info(
                "Add `ORS_API_KEY` in **Streamlit Settings \u2192 Secrets** to enable live routing.",
                icon="\U0001f511",
            )

        # START
        st.caption("START")
        sc1, sc2 = st.columns([0.78, 0.22])
        start_query = sc1.text_input(
            "Start", value=st.session_state.start_address,
            placeholder="e.g. Het Eeuwsel 57, Eindhoven",
            label_visibility="collapsed",
        )
        if sc2.button("Search", key="btn_srch_start", use_container_width=True, disabled=not ors_api_key):
            st.session_state.start_candidates = search_address_candidates(start_query, ors_api_key)
            st.session_state.start_address = start_query
        if st.session_state.start_candidates:
            labels = [c["label"] for c in st.session_state.start_candidates]
            chosen = st.selectbox(
                "Pick start", labels,
                index=labels.index(st.session_state.start_label)
                      if st.session_state.start_label in labels else 0,
                key="start_pick",
            )
            st.session_state.start_label = chosen
            sc = next(x for x in st.session_state.start_candidates if x["label"] == chosen)
            st.session_state.start_coords = (sc["lat"], sc["lng"])
        else:
            st.caption("_Type an address and press **Search**._")

        st.markdown("<hr style='margin:0.3rem 0;border-color:rgba(255,177,0,0.1)'>", unsafe_allow_html=True)

        # END
        st.caption("END")
        ec1, ec2 = st.columns([0.78, 0.22])
        end_query = ec1.text_input(
            "End", value=st.session_state.end_address,
            placeholder="e.g. Lichttoren 37, Eindhoven",
            label_visibility="collapsed",
        )
        if ec2.button("Search", key="btn_srch_end", use_container_width=True, disabled=not ors_api_key):
            st.session_state.end_candidates = search_address_candidates(end_query, ors_api_key)
            st.session_state.end_address = end_query
        if st.session_state.end_candidates:
            elabels = [c["label"] for c in st.session_state.end_candidates]
            echosen = st.selectbox(
                "Pick end", elabels,
                index=elabels.index(st.session_state.end_label)
                      if st.session_state.end_label in elabels else 0,
                key="end_pick",
            )
            st.session_state.end_label = echosen
            ec = next(x for x in st.session_state.end_candidates if x["label"] == echosen)
            st.session_state.end_coords = (ec["lat"], ec["lng"])
        else:
            st.caption("_Type an address and press **Search**._")

        st.markdown("<hr style='margin:0.3rem 0;border-color:rgba(255,177,0,0.1)'>", unsafe_allow_html=True)

        can_fetch = bool(
            ors_api_key
            and st.session_state.start_coords is not None
            and st.session_state.end_coords   is not None
        )
        fc1, fc2 = st.columns(2)
        fetch_clicked = fc1.button("Plot Route", use_container_width=True, disabled=not can_fetch)
        clear_clicked = fc2.button("Clear", use_container_width=True)

        if fetch_clicked:
            slat_v, slng_v = st.session_state.start_coords
            elat_v, elng_v = st.session_state.end_coords
            with st.spinner("Fetching ORS foot-walking route\u2026"):
                try:
                    path, nodes = fetch_ors_route(slat_v, slng_v, elat_v, elng_v, ors_api_key)
                    st.session_state.route_path = path
                    st.session_state.nodes = nodes
                    st.session_state.selected_step_idx = 0 if nodes else None
                    st.session_state.route_status = (
                        f"Route loaded: {st.session_state.start_label} \u2192 "
                        f"{st.session_state.end_label}. "
                        f"{len(nodes)} steps. Drag the start/end pins to adjust."
                    )
                    st.rerun()
                except requests.HTTPError as exc:
                    st.error(
                        f"ORS error ({exc.response.status_code}): {exc.response.text[:200]}",
                        icon="\U0001f6a8",
                    )
                except Exception as exc:
                    st.error(f"Routing error: {exc}", icon="\U0001f6a8")

        if clear_clicked:
            st.session_state.update({
                "route_path": [], "nodes": [],
                "start_coords": None, "end_coords": None,
                "start_candidates": [], "end_candidates": [],
                "start_label": "", "end_label": "",
                "selected_step_idx": None,
                "route_status": "Route cleared.",
            })
            st.rerun()

    st.markdown(
        f"<div class='status-banner'>{st.session_state.route_status}</div>",
        unsafe_allow_html=True,
    )

    # ── Instruction Log ────────────────────────────────────────────────────
    st.markdown("<div class='panel-label'>INSTRUCTION LOG</div>", unsafe_allow_html=True)

    with st.container(height=460, border=False):
        if not st.session_state.nodes:
            st.markdown(
                "<div class='log-empty'>Plot a route above to populate the step-by-step instruction log.</div>",
                unsafe_allow_html=True,
            )
        else:
            for i, node in enumerate(st.session_state.nodes):
                is_active = (st.session_state.selected_step_idx == i)
                icon = _STEP_ICON.get(node["type"], "\u2022")
                dist_label = f"{node.get('distance_m', 0)} m" if node.get("distance_m") else ""
                active_cls = "active" if is_active else ""

                col_step, col_btn = st.columns([0.88, 0.12])
                col_step.markdown(
                    f"""<div class="log-step {active_cls}">
                          <div class="log-step__num">{i + 1}</div>
                          <div class="log-step__body">
                            <div class="log-step__type">{icon} {node['type'].upper()}</div>
                            <div class="log-step__text">{node['instruction']}</div>
                            {f'<div class="log-step__dist">{dist_label}</div>' if dist_label else ''}
                          </div>
                        </div>""",
                    unsafe_allow_html=True,
                )
                if col_btn.button("\u25b6", key=f"focus_{i}", help="Focus on map", use_container_width=True):
                    st.session_state.selected_step_idx = i
                    st.rerun()

    # ── Export + metadata ──────────────────────────────────────────────────
    ex1, ex2 = st.columns(2)
    ex1.download_button(
        "Export JSON",
        data=json.dumps(build_export_payload(), indent=2),
        file_name=f"{st.session_state.route_name or 'tiera-route'}.json",
        mime="application/json",
        use_container_width=True,
        disabled=not st.session_state.nodes,
    )
    with ex2.expander("Session metadata"):
        st.session_state.route_name = st.text_input(
            "Route name", value=st.session_state.route_name, label_visibility="collapsed"
        )
        mc1, mc2 = st.columns(2)
        trainer_v = mc1.text_input("Trainer", value=st.session_state.route_metadata.get("trainer", ""))
        client_v  = mc2.text_input("Client",  value=st.session_state.route_metadata.get("client", ""))
        env_opts  = ["Urban", "Campus", "Transit", "Indoor"]
        env_v     = st.selectbox(
            "Environment", env_opts,
            index=env_opts.index(st.session_state.route_metadata.get("environment", "Urban")),
        )
        cond_v = st.text_input("Conditions", value=st.session_state.route_metadata.get("conditions", ""))
        st.session_state.route_metadata = {
            "trainer": trainer_v, "client": client_v,
            "environment": env_v, "conditions": cond_v,
            "session_objective": st.session_state.route_metadata.get("session_objective", ""),
        }

# ══════════════════════════════════════════════════════════════════════════════
# RIGHT — MAP CANVAS
# ══════════════════════════════════════════════════════════════════════════════
with right_col:
    st.markdown("<div class='panel-label'>MAP CANVAS</div>", unsafe_allow_html=True)

    if not ors_api_key:
        st.warning(
            "Add `ORS_API_KEY` in Streamlit Secrets to enable live pedestrian routing.",
            icon="\U0001f511",
        )

    # Determine map center
    if st.session_state.start_coords:
        map_lat, map_lng, map_zoom = st.session_state.start_coords[0], st.session_state.start_coords[1], 15
    elif st.session_state.nodes:
        map_lat, map_lng, map_zoom = st.session_state.nodes[0]["lat"], st.session_state.nodes[0]["lng"], 15
    else:
        map_lat, map_lng, map_zoom = 37.77606, -122.41711, 14

    map_html = build_leaflet_map_html(
        nodes=st.session_state.nodes,
        route_path=st.session_state.route_path,
        start_coords=st.session_state.start_coords,
        end_coords=st.session_state.end_coords,
        active_idx=st.session_state.selected_step_idx,
        center_lat=map_lat,
        center_lng=map_lng,
        zoom=map_zoom,
        maptiler_key=maptiler_key,
    )
    components.html(map_html, height=720, scrolling=False)
