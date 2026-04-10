from __future__ import annotations

import json
import re as _re
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

import requests
import streamlit as st
import streamlit.components.v1 as components

from assets.tiera_styles import TIERA_STYLES
from components.leaflet_map_bridge import build_leaflet_map_html

# ── ORS ────────────────────────────────────────────────────────────────────────
ORS_DIRECTIONS_URL = (
    "https://api.openrouteservice.org/v2/directions/foot-walking/geojson"
)
ORS_GEOCODE_URL = "https://api.openrouteservice.org/geocode/search"

_ORS_STEP_TYPES: dict[int, str] = {
    0: "left", 1: "right", 2: "sharp-left", 3: "sharp-right",
    4: "slight-left", 5: "slight-right", 6: "straight", 7: "roundabout",
    8: "roundabout-exit", 9: "u-turn", 10: "destination", 11: "start",
    12: "keep-left", 13: "keep-right",
}


def fetch_ors_route(waypoints: list[tuple[float, float]], api_key: str):
    """POST to ORS GeoJSON endpoint. waypoints: [(lat, lng), ...]."""
    coords = [[lng, lat] for lat, lng in waypoints]
    resp = requests.post(
        ORS_DIRECTIONS_URL,
        headers={"Authorization": api_key, "Content-Type": "application/json"},
        json={"coordinates": coords},
        timeout=12,
    )
    resp.raise_for_status()
    feature = resp.json()["features"][0]
    raw = feature["geometry"]["coordinates"]          # [[lng, lat], ...]
    path = [{"lat": round(c[1], 6), "lng": round(c[0], 6)} for c in raw]
    nodes: list[dict[str, Any]] = []
    idx = 0
    for seg in feature["properties"].get("segments", []):
        for step in seg.get("steps", []):
            wi = step["way_points"][0]
            c  = raw[wi]
            nodes.append({
                "id":          f"node-{uuid.uuid4().hex[:8]}",
                "index":       idx,
                "lat":         round(c[1], 6),
                "lng":         round(c[0], 6),
                "instruction": step.get("instruction", ""),
                "type":        _ORS_STEP_TYPES.get(step.get("type", 0), "step"),
                "distance_m":  round(step.get("distance", 0)),
                "duration_s":  round(step.get("duration", 0)),
            })
            idx += 1
    return path, nodes


def search_candidates(query: str, api_key: str, size: int = 6) -> list[dict]:
    if not query or not api_key:
        return []
    try:
        r = requests.get(
            ORS_GEOCODE_URL,
            params={"api_key": api_key, "text": query, "size": size},
            timeout=8,
        )
        r.raise_for_status()
        return [
            {
                "label": f["properties"]["label"],
                "lat":   round(f["geometry"]["coordinates"][1], 6),
                "lng":   round(f["geometry"]["coordinates"][0], 6),
            }
            for f in r.json().get("features", [])
        ]
    except Exception:
        return []


def _reroute() -> tuple[bool, str]:
    """Re-route via ORS using current start/via/end from session_state."""
    try:
        key: str = st.secrets["ORS_API_KEY"]
    except Exception:
        return False, "ORS_API_KEY not found in Secrets."
    sc = st.session_state.start_coords
    ec = st.session_state.end_coords
    if not sc or not ec:
        return False, "Start or end not set."
    via = st.session_state.via_points
    wps = [tuple(sc)] + [(v["lat"], v["lng"]) for v in via] + [tuple(ec)]
    try:
        path, nodes = fetch_ors_route(wps, key)
        st.session_state.route_path = path
        st.session_state.nodes = nodes
        return True, f"{len(nodes)} steps generated."
    except requests.HTTPError as exc:
        return False, f"ORS error {exc.response.status_code}: {exc.response.text[:120]}"
    except Exception as exc:
        return False, f"Routing error: {exc}"


# ── Session state ───────────────────────────────────────────────────────────────
def init():
    defaults: dict[str, Any] = {
        "step": 0,
        "metadata": {"route_name": "", "org_code": "", "owner": "", "contact": ""},
        "start_address":    "",
        "end_address":      "",
        "start_coords":     None,
        "end_coords":       None,
        "start_label":      "",
        "end_label":        "",
        "start_cands":      [],
        "end_cands":        [],
        "via_points":       [],
        "route_path":       [],
        "nodes":            [],
        "active_node_id":   None,
        "submit_email":     "",
        "submitted":        False,
        "route_status":     "",
        "tiera_bridge":     "",
        "_last_bridge_ts":  0,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def apply_bridge() -> bool:
    raw = st.session_state.get("tiera_bridge", "")
    if not raw:
        return False
    try:
        p = json.loads(raw)
    except json.JSONDecodeError:
        return False
    ts = p.get("ts", 0)
    if ts <= st.session_state._last_bridge_ts:
        return False
    st.session_state._last_bridge_ts = ts
    ev = p.get("type")

    if ev == "map_click" and st.session_state.step == 1:
        lat = round(float(p["lat"]), 6)
        lng = round(float(p["lng"]), 6)
        if st.session_state.start_coords is None:
            st.session_state.start_coords = (lat, lng)
            st.session_state.start_label  = f"{lat}, {lng}"
            st.session_state.route_status = "Start pinned — now click the end point."
        elif st.session_state.end_coords is None:
            st.session_state.end_coords = (lat, lng)
            st.session_state.end_label  = f"{lat}, {lng}"
            st.session_state.route_status = "End pinned — press Generate Route."
        return True

    if ev == "pin_drag_end" and st.session_state.step == 2:
        role = p.get("role")
        lat  = round(float(p["lat"]), 6)
        lng  = round(float(p["lng"]), 6)
        if role == "start":
            st.session_state.start_coords = (lat, lng)
        else:
            st.session_state.end_coords = (lat, lng)
        ok, msg = _reroute()
        st.session_state.route_status = msg
        return True

    if ev == "via_add" and st.session_state.step == 2:
        lat = round(float(p["lat"]), 6)
        lng = round(float(p["lng"]), 6)
        st.session_state.via_points.append(
            {"id": f"via-{uuid.uuid4().hex[:6]}", "lat": lat, "lng": lng}
        )
        ok, msg = _reroute()
        st.session_state.route_status = msg
        return True

    if ev == "via_drag_end" and st.session_state.step == 2:
        vid = p["id"]
        lat = round(float(p["lat"]), 6)
        lng = round(float(p["lng"]), 6)
        st.session_state.via_points = [
            ({**v, "lat": lat, "lng": lng} if v["id"] == vid else v)
            for v in st.session_state.via_points
        ]
        ok, msg = _reroute()
        st.session_state.route_status = msg
        return True

    if ev == "node_click" and st.session_state.step == 3:
        st.session_state.active_node_id = p.get("nodeId")
        return True

    if ev == "route_click" and st.session_state.step == 3:
        lat = round(float(p["lat"]), 6)
        lng = round(float(p["lng"]), 6)
        ins_idx = int(p.get("nearestIdx", len(st.session_state.nodes)))
        new_n = {
            "id":          f"node-{uuid.uuid4().hex[:8]}",
            "index":       ins_idx,
            "lat":         lat,
            "lng":         lng,
            "instruction": "Add instruction here.",
            "type":        "step",
            "distance_m":  0,
            "duration_s":  0,
        }
        st.session_state.nodes.insert(ins_idx, new_n)
        for i, n in enumerate(st.session_state.nodes):
            n["index"] = i
        st.session_state.active_node_id  = new_n["id"]
        st.session_state.route_status = "New node added. Edit its instruction in the sidebar."
        return True

    return False


def export_json() -> str:
    return json.dumps({
        "route_name": st.session_state.metadata.get("route_name", ""),
        "metadata": {
            **st.session_state.metadata,
            "exported_at": datetime.now(timezone.utc).isoformat(),
        },
        "nodes": [
            {"lat": n["lat"], "lng": n["lng"],
             "instruction": n["instruction"], "type": n["type"]}
            for n in st.session_state.nodes
        ],
    }, indent=2)


# ── Bootstrap ───────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Tiera",
    page_icon="▪",
    layout="wide",
    initial_sidebar_state="collapsed",
)
st.markdown(f"<style>{TIERA_STYLES}</style>", unsafe_allow_html=True)

init()
apply_bridge()

try:
    ors_key: str = st.secrets["ORS_API_KEY"]
except Exception:
    ors_key = ""

try:
    maptiler_key: str = st.secrets["MAPTILER_API_KEY"]
except Exception:
    maptiler_key = ""

# Hidden bridge input
st.text_input("tiera-bridge", key="tiera_bridge", label_visibility="collapsed")

step = st.session_state.step

# ── Two-column layout ───────────────────────────────────────────────────────────
left_col, right_col = st.columns([1, 5], gap="small")

# ══════════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ══════════════════════════════════════════════════════════════════════════════════
with left_col:
    st.markdown(
        '<div class="t-brand"><div class="t-brand-name">TIERA</div>'
        '<div class="t-brand-sub">powered by Touchpulse</div></div>',
        unsafe_allow_html=True,
    )

    # Stepper
    STEP_LABELS = ["Identity", "Destination", "Calibration", "Refinement", "Uplink"]
    dots = ""
    for i, label in enumerate(STEP_LABELS):
        if i < step:
            cls = "done"
        elif i == step:
            cls = "active"
        else:
            cls = "idle"
        dots += (
            f'<div class="t-step t-step--{cls}">'
            f'<div class="t-step-dot"></div>'
            f'<span class="t-step-label">{label}</span>'
            f'</div>'
        )
    st.markdown(f'<div class="t-stepper">{dots}</div>', unsafe_allow_html=True)
    st.markdown('<div class="t-divider"></div>', unsafe_allow_html=True)

    # ── Step 0: Identity ──────────────────────────────────────────────────────
    if step == 0:
        st.markdown('<div class="t-section">Route Identity</div>', unsafe_allow_html=True)
        meta = st.session_state.metadata
        rn = st.text_input("Route Name",        value=meta["route_name"], placeholder="e.g. Highgate Loop A",   key="m_rn")
        oc = st.text_input("Organization Code", value=meta["org_code"],   placeholder="e.g. TP-001",            key="m_oc")
        ow = st.text_input("Owner Name",        value=meta["owner"],      placeholder="e.g. J. Smith",          key="m_ow")
        ct = st.text_input("Contact",           value=meta["contact"],    placeholder="e.g. j@org.com",         key="m_ct")
        st.session_state.metadata = {"route_name": rn, "org_code": oc, "owner": ow, "contact": ct}
        if st.button("Continue →", key="s0_next", use_container_width=True):
            st.session_state.step = 1
            st.rerun()

    # ── Step 1: Destination ────────────────────────────────────────────────────
    elif step == 1:
        st.markdown('<div class="t-section">Destination Planning</div>', unsafe_allow_html=True)
        if not ors_key:
            st.markdown(
                '<div class="t-warn">Add <code>ORS_API_KEY</code> to Streamlit Secrets.</div>',
                unsafe_allow_html=True,
            )

        # START
        st.markdown('<div class="t-field-label">START</div>', unsafe_allow_html=True)
        s1, s2 = st.columns([0.8, 0.2])
        sq = s1.text_input("S", value=st.session_state.start_address,
                           placeholder="Address or place…", label_visibility="collapsed", key="sq")
        if s2.button("↵", key="s_srch", use_container_width=True, disabled=not ors_key):
            st.session_state.start_cands   = search_candidates(sq, ors_key)
            st.session_state.start_address = sq

        if st.session_state.start_coords:
            st.markdown(
                f'<div class="t-coord">✓ {st.session_state.start_label[:42]}</div>',
                unsafe_allow_html=True,
            )
        if st.session_state.start_cands:
            chosen = st.selectbox(" ", [c["label"] for c in st.session_state.start_cands],
                                  key="s_pick", label_visibility="collapsed")
            if st.button("Set as Start", key="s_set", use_container_width=True):
                c = next(x for x in st.session_state.start_cands if x["label"] == chosen)
                st.session_state.start_coords = (c["lat"], c["lng"])
                st.session_state.start_label  = chosen
                st.session_state.start_cands  = []
                st.rerun()
        else:
            st.markdown('<div class="t-hint">Or click the map to pin start.</div>', unsafe_allow_html=True)

        st.markdown('<div class="t-gap"></div>', unsafe_allow_html=True)

        # END
        st.markdown('<div class="t-field-label">END</div>', unsafe_allow_html=True)
        e1, e2 = st.columns([0.8, 0.2])
        eq = e1.text_input("E", value=st.session_state.end_address,
                           placeholder="Address or place…", label_visibility="collapsed", key="eq")
        if e2.button("↵", key="e_srch", use_container_width=True, disabled=not ors_key):
            st.session_state.end_cands   = search_candidates(eq, ors_key)
            st.session_state.end_address = eq

        if st.session_state.end_coords:
            st.markdown(
                f'<div class="t-coord">✓ {st.session_state.end_label[:42]}</div>',
                unsafe_allow_html=True,
            )
        if st.session_state.end_cands:
            echosen = st.selectbox(" ", [c["label"] for c in st.session_state.end_cands],
                                   key="e_pick", label_visibility="collapsed")
            if st.button("Set as End", key="e_set", use_container_width=True):
                c = next(x for x in st.session_state.end_cands if x["label"] == echosen)
                st.session_state.end_coords = (c["lat"], c["lng"])
                st.session_state.end_label  = echosen
                st.session_state.end_cands  = []
                st.rerun()
        else:
            st.markdown('<div class="t-hint">Or click the map to pin end.</div>', unsafe_allow_html=True)

        can_gen = bool(ors_key and st.session_state.start_coords and st.session_state.end_coords)
        if st.session_state.route_status:
            st.markdown(
                f'<div class="t-status">{st.session_state.route_status}</div>',
                unsafe_allow_html=True,
            )

        st.markdown('<div class="t-gap"></div>', unsafe_allow_html=True)
        if st.button("Generate Route", key="s1_gen", use_container_width=True,
                     disabled=not can_gen, type="primary"):
            with st.spinner("Fetching route…"):
                ok, msg = _reroute()
            if ok:
                st.session_state.step = 2
                st.session_state.route_status = msg
                st.rerun()
            else:
                st.error(msg)

        if st.button("← Back", key="s1_back", use_container_width=True):
            st.session_state.step = 0
            st.rerun()

    # ── Step 2: Calibration ────────────────────────────────────────────────────
    elif step == 2:
        st.markdown('<div class="t-section">Path Calibration</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="t-hint">Drag the <strong>S</strong> or <strong>E</strong> pins to adjust endpoints. '
            'Click the route line to add an intermediate waypoint.</div>',
            unsafe_allow_html=True,
        )
        if st.session_state.route_status:
            st.markdown(
                f'<div class="t-status">{st.session_state.route_status}</div>',
                unsafe_allow_html=True,
            )

        if st.session_state.via_points:
            st.markdown('<div class="t-field-label">VIA POINTS</div>', unsafe_allow_html=True)
            for i, v in enumerate(st.session_state.via_points):
                vc1, vc2 = st.columns([0.8, 0.2])
                vc1.markdown(
                    f'<div class="t-via">V{i + 1} · {v["lat"]}, {v["lng"]}</div>',
                    unsafe_allow_html=True,
                )
                if vc2.button("×", key=f"del_via_{i}", use_container_width=True):
                    st.session_state.via_points.pop(i)
                    ok, msg = _reroute()
                    st.session_state.route_status = msg
                    st.rerun()

        st.markdown('<div class="t-gap"></div>', unsafe_allow_html=True)
        c1, c2 = st.columns(2)
        if c1.button("Confirm Calibration →", key="s2_next", use_container_width=True, type="primary"):
            st.session_state.step = 3
            st.rerun()
        if c2.button("← Back", key="s2_back", use_container_width=True):
            st.session_state.step = 1
            st.rerun()

    # ── Step 3: Refinement ──────────────────────────────────────────────────────
    elif step == 3:
        st.markdown('<div class="t-section">Tactical Refinement</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="t-hint">Click a circle to select and edit. Click the route line to add a node.</div>',
            unsafe_allow_html=True,
        )

        active_id = st.session_state.active_node_id

        with st.container(height=420, border=False):
            for i, node in enumerate(st.session_state.nodes):
                is_active = node["id"] == active_id
                ac = "t-node--active" if is_active else ""
                r1, r2 = st.columns([0.85, 0.15])
                r1.markdown(
                    f'<div class="t-node {ac}">'
                    f'<div class="t-node-num">{i + 1}</div>'
                    f'<div class="t-node-meta">{node["type"].upper()}</div>'
                    f'</div>',
                    unsafe_allow_html=True,
                )
                if r2.button("▶", key=f"sel_{node['id']}", use_container_width=True):
                    st.session_state.active_node_id = node["id"]
                    st.rerun()
                if is_active:
                    new_txt = st.text_area(
                        "Instruction", value=node["instruction"],
                        height=68, key=f"instr_{node['id']}",
                        label_visibility="collapsed",
                    )
                    st.session_state.nodes[i] = {**node, "instruction": new_txt}
                else:
                    st.markdown(
                        f'<div class="t-node-text">{node["instruction"]}</div>',
                        unsafe_allow_html=True,
                    )

        c1, c2 = st.columns(2)
        if c1.button("Continue to Submit →", key="s3_next", use_container_width=True, type="primary"):
            st.session_state.step = 4
            st.rerun()
        if c2.button("← Back", key="s3_back", use_container_width=True):
            st.session_state.step = 2
            st.rerun()

    # ── Step 4: Uplink ──────────────────────────────────────────────────────────
    elif step == 4:
        if st.session_state.submitted:
            st.markdown(
                '<div class="t-success">'
                "Your custom route has been submitted successfully and will be reviewed. "
                "You will receive a confirmation once this is available in the app."
                '</div>',
                unsafe_allow_html=True,
            )
        else:
            st.markdown('<div class="t-section">Uplink</div>', unsafe_allow_html=True)
            st.markdown(
                '<div class="t-hint">Enter your email address to receive a confirmation.</div>',
                unsafe_allow_html=True,
            )
            email_v = st.text_input(
                "Email", value=st.session_state.submit_email,
                placeholder="you@organisation.com", key="email_in",
                label_visibility="collapsed",
            )
            st.session_state.submit_email = email_v

            def _valid(s: str) -> bool:
                return bool(_re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", s.strip()))

            st.markdown('<div class="t-gap"></div>', unsafe_allow_html=True)
            if st.button("Submit custom route", key="submit_btn",
                         use_container_width=True, type="primary",
                         disabled=not _valid(email_v)):
                # TODO: integrate with submission API / email service
                st.session_state.submitted = True
                st.rerun()

            st.download_button(
                "Export JSON", data=export_json(),
                file_name="tiera-route.json", mime="application/json",
                use_container_width=True,
            )

            if st.button("← Back", key="s4_back", use_container_width=True):
                st.session_state.step = 3
                st.rerun()

# ══════════════════════════════════════════════════════════════════════════════════
# MAP
# ══════════════════════════════════════════════════════════════════════════════════
with right_col:
    MAP_MODES = {0: "idle", 1: "plan", 2: "calibrate", 3: "refine", 4: "review"}
    mode = MAP_MODES[step]

    if st.session_state.start_coords:
        clat, clng, czoom = *st.session_state.start_coords, 15
    elif st.session_state.nodes:
        clat = st.session_state.nodes[0]["lat"]
        clng = st.session_state.nodes[0]["lng"]
        czoom = 15
    else:
        clat, clng, czoom = 51.5099, -0.1181, 13

    map_html = build_leaflet_map_html(
        mode=mode,
        nodes=st.session_state.nodes,
        route_path=st.session_state.route_path,
        start_coords=st.session_state.start_coords,
        end_coords=st.session_state.end_coords,
        via_points=st.session_state.via_points,
        active_node_id=st.session_state.active_node_id,
        center_lat=clat,
        center_lng=clng,
        zoom=czoom,
        maptiler_key=maptiler_key,
    )
    components.html(map_html, height=900, scrolling=False)
