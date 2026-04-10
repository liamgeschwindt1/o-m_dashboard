from __future__ import annotations

import json
import math
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

import requests
import streamlit as st

from assets.tiera_styles import TIERA_STYLES
from components.leaflet_map_bridge import build_leaflet_map_html

# ── Constants ─────────────────────────────────────────────────────────────────
CUE_TYPES = ["start", "cue", "turn", "landmark", "hazard", "destination"]

ORS_DIRECTIONS_URL   = "https://api.openrouteservice.org/v2/directions/foot-walking"
ORS_GEOCODE_URL      = "https://api.openrouteservice.org/geocode/search"
ORS_GEOCODE_AUTO_URL = "https://api.openrouteservice.org/geocode/autocomplete"

DEFAULT_METADATA: dict[str, str] = {
    "trainer": "",
    "client": "",
    "environment": "Urban",
    "conditions": "Daytime / light traffic",
    "session_objective": (
        "Coach safe shoreline alignment, landmark identification, and turn timing."
    ),
}

DEFAULT_WAYPOINTS: list[dict[str, Any]] = [
    {
        "id": "start-1",
        "lat": 37.776060,
        "lng": -122.417110,
        "instruction": "Start at the tactile paving and align with the building line on the right.",
        "type": "start",
    },
    {
        "id": "cue-1",
        "lat": 37.776480,
        "lng": -122.416030,
        "instruction": "Shoreline the curb edge until the audible crossing cue is strongest directly ahead.",
        "type": "cue",
    },
    {
        "id": "turn-1",
        "lat": 37.775620,
        "lng": -122.414780,
        "instruction": "Turn left once the surface shifts from smooth concrete to textured brick.",
        "type": "turn",
    },
    {
        "id": "destination-1",
        "lat": 37.774930,
        "lng": -122.414080,
        "instruction": "Destination is on the right past the recessed doorway and bus-stop audio cue.",
        "type": "destination",
    },
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_waypoint(lat: float, lng: float, point_type: str = "landmark") -> dict[str, Any]:
    return {
        "id":          f"wp-{uuid.uuid4().hex[:8]}",
        "lat":         round(float(lat), 6),
        "lng":         round(float(lng), 6),
        "instruction": "Listen for the echo off the brick wall and confirm the curb line before moving.",
        "type":        point_type,
    }


def _project(lat: float, lng: float) -> tuple[float, float]:
    return lng * math.cos(math.radians(lat)), lat


def _snap_to_segment(plat, plng, alat, alng, blat, blng):
    px, py = _project(plat, plng)
    ax, ay = _project(alat, alng)
    bx, by = _project(blat, blng)
    abx, aby = bx - ax, by - ay
    mag = abx * abx + aby * aby
    if mag == 0:
        return alat, alng, math.dist((px, py), (ax, ay))
    t = max(0.0, min(1.0, ((px - ax) * abx + (py - ay) * aby) / mag))
    cx, cy = ax + t * abx, ay + t * aby
    cos_v = math.cos(math.radians(cy)) or 1e-9
    return cy, cx / cos_v, math.dist((px, py), (cx, cy))


def find_insertion_point(waypoints, lat, lng):
    if len(waypoints) < 2:
        return len(waypoints), lat, lng
    best = (1, lat, lng, float("inf"))
    for i in range(len(waypoints) - 1):
        s, e = waypoints[i], waypoints[i + 1]
        sl, sn, d = _snap_to_segment(lat, lng, s["lat"], s["lng"], e["lat"], e["lng"])
        if d < best[3]:
            best = (i + 1, sl, sn, d)
    return best[0], round(best[1], 6), round(best[2], 6)


# ── ORS API (server-side — key never sent to browser) ─────────────────────────

def fetch_ors_route(slat, slng, elat, elng, api_key):
    resp = requests.get(
        ORS_DIRECTIONS_URL,
        params={"api_key": api_key, "start": f"{slng},{slat}", "end": f"{elng},{elat}"},
        timeout=12,
    )
    resp.raise_for_status()
    coords = resp.json()["features"][0]["geometry"]["coordinates"]
    return [{"lat": round(c[1], 6), "lng": round(c[0], 6)} for c in coords]


def geocode_address(address, api_key):
    resp = requests.get(
        ORS_GEOCODE_URL,
        params={"api_key": api_key, "text": address, "size": 1},
        timeout=10,
    )
    resp.raise_for_status()
    feat = resp.json()["features"][0]
    lng_v, lat_v = feat["geometry"]["coordinates"]
    return round(lat_v, 6), round(lng_v, 6), feat["properties"]["label"]


def search_address_candidates(
    query: str, api_key: str, size: int = 6
) -> list[dict]:
    """Return up to `size` candidate places from ORS geocode search.
    Each entry: {label, lat, lng}
    """
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
    defaults = {
        "route_id":            "tiera-demo-001",
        "route_metadata":      deepcopy(DEFAULT_METADATA),
        "waypoints":           deepcopy(DEFAULT_WAYPOINTS),
        "selected_waypoint_id": DEFAULT_WAYPOINTS[0]["id"],
        "route_path":          [{"lat": p["lat"], "lng": p["lng"]} for p in DEFAULT_WAYPOINTS],
        "start_address":       "",
        "end_address":         "",
        "start_coords":        None,
        "end_coords":          None,
        "route_status":        "Tactical HUD armed. Click the map to drop a landmark, or drag a node to refine it.",
        "tiera_bridge":           "",
        "_last_bridge_ts":         0,
        "start_candidates":        [],
        "end_candidates":          [],
        "start_selected_label":    "",
        "end_selected_label":      "",
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


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

    if event == "marker_click":
        pid = payload.get("pointId")
        if pid:
            st.session_state.selected_waypoint_id = pid
            st.session_state.route_status = "Tactical node selected from the map. Sidebar entry is now armed for editing."

    elif event in ("map_click",):
        lat, lng = float(payload.get("lat", 0)), float(payload.get("lng", 0))
        idx, sl, sn = find_insertion_point(st.session_state.waypoints, lat, lng)
        wp = make_waypoint(sl, sn, "landmark")
        st.session_state.waypoints.insert(idx, wp)
        st.session_state.selected_waypoint_id = wp["id"]
        st.session_state.route_status = "New tactical node injected. Type the trainer cue while the step is highlighted."

    elif event == "marker_drag_end":
        pid = payload.get("pointId")
        lat, lng = float(payload.get("lat", 0)), float(payload.get("lng", 0))
        st.session_state.waypoints = [
            ({**wp, "lat": round(lat, 6), "lng": round(lng, 6)} if wp["id"] == pid else wp)
            for wp in st.session_state.waypoints
        ]
        st.session_state.selected_waypoint_id = pid
        st.session_state.route_status = "Node dragged. Coordinates updated in the JSON payload."


def build_export_payload():
    meta = deepcopy(st.session_state.route_metadata)
    meta["updated_at"] = datetime.now(timezone.utc).isoformat()
    return {
        "route_id": st.session_state.route_id,
        "metadata": meta,
        "landmarks": [
            {
                "lat":         round(float(wp["lat"]), 6),
                "lng":         round(float(wp["lng"]), 6),
                "instruction": wp["instruction"].strip(),
                "cue_type":    wp["type"],
            }
            for wp in st.session_state.waypoints
        ],
    }


def reset_demo():
    st.session_state.route_id            = "tiera-demo-001"
    st.session_state.route_metadata      = deepcopy(DEFAULT_METADATA)
    st.session_state.waypoints           = deepcopy(DEFAULT_WAYPOINTS)
    st.session_state.selected_waypoint_id = DEFAULT_WAYPOINTS[0]["id"]
    st.session_state.route_path          = [{"lat": p["lat"], "lng": p["lng"]} for p in DEFAULT_WAYPOINTS]
    st.session_state.start_address       = ""
    st.session_state.end_address         = ""
    st.session_state.start_coords        = None
    st.session_state.end_coords          = None
    st.session_state.route_status        = "Demo route restored. Tactical HUD is ready for the next session."
    st.session_state.tiera_bridge        = ""
    st.session_state._last_bridge_ts     = 0


# ── Page bootstrap ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Tiera O&M Training Studio",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="collapsed",
)
st.markdown(f"<style>{TIERA_STYLES}</style>", unsafe_allow_html=True)

initialize_state()
apply_bridge_event()

# Keep fallback path in sync with manual coord edits
st.session_state.route_path = st.session_state.route_path  # preserve ORS path across reruns

try:
    ors_api_key: str = st.secrets["ORS_API_KEY"]
except Exception:
    ors_api_key = ""

# Hidden bridge widget — visually suppressed via CSS
st.text_input("tiera-bridge", key="tiera_bridge", label_visibility="collapsed")

# ── Derived values ────────────────────────────────────────────────────────────
waypoint_count = len(st.session_state.waypoints)
selected_waypoint = next(
    (wp for wp in st.session_state.waypoints if wp["id"] == st.session_state.selected_waypoint_id),
    st.session_state.waypoints[0],
)

# ── Top banner ────────────────────────────────────────────────────────────────
st.markdown(
    f"""
    <div class="tiera-banner">
      <div class="tiera-banner__eyebrow">Tiera O&amp;M Training Studio // Powered by Touchpulse</div>
      <h1>Pedestrian-first tactical routing dashboard</h1>
      <p>Set a start &amp; end address, fetch the ORS walking route, then click the map to drop landmark
         cues — all synced to the exportable JSON payload.</p>
      <div class="hud-grid">
        <div class="hud-chip"><strong>{waypoint_count}</strong><span>Tactical nodes armed</span></div>
        <div class="hud-chip"><strong>{selected_waypoint['type'].upper()}</strong><span>Active cue type</span></div>
        <div class="hud-chip"><strong>ORS FOSS</strong><span>Pedestrian routing engine</span></div>
      </div>
    </div>
    """,
    unsafe_allow_html=True,
)

left_col, right_col = st.columns([0.95, 1.55], gap="medium")

# ══════════════════════════════════════════════════════════════════════════════
# LEFT — TRAINER CONSOLE
# ══════════════════════════════════════════════════════════════════════════════
with left_col:
    st.markdown("<div class='panel-label'>ROUTE PLANNER</div>", unsafe_allow_html=True)

    with st.expander("OpenRouteService walking route", expanded=True):
        if not ors_api_key:
            st.info(
                "Add `ORS_API_KEY` in **Streamlit Cloud app settings → Secrets** to enable live pedestrian routing. "
                "The map shows a straight-line fallback until then.",
                icon="🔑",
            )

        # ── Start address search ───────────────────────────────────────────
        st.caption("START")
        sc1, sc2 = st.columns([0.78, 0.22])
        start_query = sc1.text_input(
            "Start address",
            value=st.session_state.start_address,
            placeholder="e.g. Het Eeuwsel 57, Eindhoven",
            label_visibility="collapsed",
        )
        search_start = sc2.button(
            "Search", key="search_start_btn",
            use_container_width=True, disabled=not ors_api_key,
        )
        if search_start and start_query:
            st.session_state.start_candidates = search_address_candidates(start_query, ors_api_key)
            st.session_state.start_address    = start_query
        if st.session_state.start_candidates:
            labels = [c["label"] for c in st.session_state.start_candidates]
            chosen = st.selectbox(
                "Pick start location",
                options=labels,
                index=labels.index(st.session_state.start_selected_label)
                      if st.session_state.start_selected_label in labels else 0,
                key="start_pick",
            )
            st.session_state.start_selected_label = chosen
            start_coord = next(c for c in st.session_state.start_candidates if c["label"] == chosen)
            st.session_state.start_coords = (start_coord["lat"], start_coord["lng"])
        else:
            st.caption("_Type an address and press **Search** to see matches._")

        st.markdown("<hr style='margin:0.4rem 0;border-color:rgba(255,177,0,0.12)'>", unsafe_allow_html=True)

        # ── End address search ─────────────────────────────────────────────
        st.caption("END")
        ec1, ec2 = st.columns([0.78, 0.22])
        end_query = ec1.text_input(
            "End address",
            value=st.session_state.end_address,
            placeholder="e.g. De Lampendriessen 31, Eindhoven",
            label_visibility="collapsed",
        )
        search_end = ec2.button(
            "Search", key="search_end_btn",
            use_container_width=True, disabled=not ors_api_key,
        )
        if search_end and end_query:
            st.session_state.end_candidates = search_address_candidates(end_query, ors_api_key)
            st.session_state.end_address    = end_query
        if st.session_state.end_candidates:
            elabels = [c["label"] for c in st.session_state.end_candidates]
            echosen = st.selectbox(
                "Pick end location",
                options=elabels,
                index=elabels.index(st.session_state.end_selected_label)
                      if st.session_state.end_selected_label in elabels else 0,
                key="end_pick",
            )
            st.session_state.end_selected_label = echosen
            end_coord = next(c for c in st.session_state.end_candidates if c["label"] == echosen)
            st.session_state.end_coords = (end_coord["lat"], end_coord["lng"])
        else:
            st.caption("_Type an address and press **Search** to see matches._")

        st.markdown("<hr style='margin:0.4rem 0;border-color:rgba(255,177,0,0.12)'>", unsafe_allow_html=True)

        # ── Fetch / clear ──────────────────────────────────────────────────
        can_fetch = (
            ors_api_key
            and st.session_state.start_coords is not None
            and st.session_state.end_coords   is not None
        )
        fc1, fc2 = st.columns(2)
        fetch_clicked = fc1.button(
            "Fetch walking route", use_container_width=True, disabled=not can_fetch
        )
        clear_clicked = fc2.button("Clear route", use_container_width=True)

        if fetch_clicked:
            slat, slng = st.session_state.start_coords
            elat, elng = st.session_state.end_coords
            with st.spinner("Fetching ORS foot-walking route…"):
                try:
                    path = fetch_ors_route(slat, slng, elat, elng, ors_api_key)
                    st.session_state.route_path   = path
                    st.session_state.route_status = (
                        f"ORS walking route loaded: "
                        f"{st.session_state.start_selected_label} → "
                        f"{st.session_state.end_selected_label}. "
                        "Click the blue line to drop a tactical node."
                    )
                    st.rerun()
                except requests.HTTPError as exc:
                    st.error(f"ORS request failed ({exc.response.status_code}): "
                             f"{exc.response.text[:200]}", icon="🚨")
                except Exception as exc:
                    st.error(f"Routing error: {exc}", icon="🚨")

        if clear_clicked:
            st.session_state.route_path          = [{"lat": wp["lat"], "lng": wp["lng"]} for wp in st.session_state.waypoints]
            st.session_state.start_coords        = None
            st.session_state.end_coords          = None
            st.session_state.start_candidates    = []
            st.session_state.end_candidates      = []
            st.session_state.start_selected_label = ""
            st.session_state.end_selected_label   = ""
            st.session_state.route_status        = "Route geometry cleared. Fallback path restored."
            st.rerun()

    with st.expander("Session metadata", expanded=False):
        rid_val = st.text_input("Route ID", value=st.session_state.route_id)
        mc1, mc2 = st.columns(2)
        trainer_val = mc1.text_input("Trainer",         value=st.session_state.route_metadata.get("trainer", ""))
        client_val  = mc2.text_input("Client / learner", value=st.session_state.route_metadata.get("client",  ""))
        mc3, mc4 = st.columns(2)
        env_opts = ["Urban", "Campus", "Transit", "Indoor"]
        env_val  = mc3.selectbox("Environment", options=env_opts,
                                 index=env_opts.index(st.session_state.route_metadata.get("environment", "Urban")))
        cond_val = mc4.text_input("Conditions", value=st.session_state.route_metadata.get("conditions", ""))
        obj_val  = st.text_area("Session objective",
                                value=st.session_state.route_metadata.get("session_objective", ""), height=82)
        st.session_state.route_id = rid_val
        st.session_state.route_metadata = {
            "trainer": trainer_val, "client": client_val,
            "environment": env_val, "conditions": cond_val, "session_objective": obj_val,
        }

    st.markdown(
        f"<div class='status-banner'><strong>Route status:</strong> {st.session_state.route_status}</div>",
        unsafe_allow_html=True,
    )

    st.markdown("<div class='panel-label'>TACTICAL NODES</div>", unsafe_allow_html=True)

    with st.container(height=520, border=False):
        for index, wp in enumerate(st.session_state.waypoints):
            is_active = wp["id"] == st.session_state.selected_waypoint_id
            with st.container(border=True):
                title_col, focus_col = st.columns([0.78, 0.22])
                title_col.markdown(
                    f"""<div class="waypoint-title {'active' if is_active else ''}">
                          <div>
                            <div class="waypoint-label">Node {index + 1}</div>
                            <strong>{wp['type'].upper()}</strong>
                          </div>
                          <div class="waypoint-meta">{wp['id']}</div>
                        </div>""",
                    unsafe_allow_html=True,
                )
                if focus_col.button("Focus", key=f"focus_{wp['id']}", use_container_width=True):
                    st.session_state.selected_waypoint_id = wp["id"]
                    st.session_state.route_status = "Node focused. The map dot is highlighted on the next render."

                type_val  = st.selectbox("Cue type", options=CUE_TYPES,
                                         index=CUE_TYPES.index(wp["type"]) if wp["type"] in CUE_TYPES else 0,
                                         key=f"type_{wp['id']}")
                instr_val = st.text_area("Trainer instruction", value=wp["instruction"], height=86, key=f"instr_{wp['id']}")
                cc1, cc2 = st.columns(2)
                lat_val = cc1.number_input("Latitude",  value=float(wp["lat"]), format="%.6f", key=f"lat_{wp['id']}")
                lng_val = cc2.number_input("Longitude", value=float(wp["lng"]), format="%.6f", key=f"lng_{wp['id']}")

                st.session_state.waypoints[index] = {
                    **wp,
                    "type":        type_val,
                    "instruction": instr_val,
                    "lat":         round(float(lat_val), 6),
                    "lng":         round(float(lng_val), 6),
                }

    export_payload = build_export_payload()
    act1, act2 = st.columns(2)
    act1.download_button(
        "Export tactical JSON",
        data=json.dumps(export_payload, indent=2),
        file_name=f"{st.session_state.route_id or 'tiera-route'}.json",
        mime="application/json",
        use_container_width=True,
    )
    if act2.button("Reset demo route", use_container_width=True):
        reset_demo()
        st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# RIGHT — LEAFLET MAP + JSON PREVIEW
# ══════════════════════════════════════════════════════════════════════════════
selected_waypoint = next(
    (wp for wp in st.session_state.waypoints if wp["id"] == st.session_state.selected_waypoint_id),
    st.session_state.waypoints[0],
)

if st.session_state.start_coords:
    map_center_lat, map_center_lng = st.session_state.start_coords
else:
    map_center_lat = selected_waypoint["lat"]
    map_center_lng = selected_waypoint["lng"]

with right_col:
    st.markdown("<div class='panel-label'>LEAFLET MAP CANVAS</div>", unsafe_allow_html=True)

    if not ors_api_key:
        st.warning(
            "Add `ORS_API_KEY` in your Streamlit Cloud app settings → Secrets to enable live pedestrian routing.",
            icon="🔑",
        )

    st.markdown("<div class='map-card'>", unsafe_allow_html=True)
    st.iframe(
        build_leaflet_map_html(
            waypoints=st.session_state.waypoints,
            active_id=st.session_state.selected_waypoint_id,
            route_path=st.session_state.route_path,
            center_lat=map_center_lat,
            center_lng=map_center_lng,
        ),
        height=640,
        scrolling=False,
    )
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<div class='panel-label'>ACTIVE JSON PAYLOAD</div>", unsafe_allow_html=True)
    with st.container(height=210, border=False):
        st.code(
            json.dumps(
                {
                    "route_id": st.session_state.route_id,
                    "active_node": {
                        "lat":         selected_waypoint["lat"],
                        "lng":         selected_waypoint["lng"],
                        "instruction": selected_waypoint["instruction"],
                        "cue_type":    selected_waypoint["type"],
                    },
                    "total_landmarks": waypoint_count,
                },
                indent=2,
            ),
            language="json",
        )
