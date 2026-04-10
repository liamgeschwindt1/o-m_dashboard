from __future__ import annotations

import json
from typing import Any

# Fallback tiles (no key required)
CARTO_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
CARTO_ATTR = (
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
    'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
)

_GOLD     = "#FFB100"
_BLUE     = "#56A3FF"
_INK      = "#060E14"
_CHARCOAL = "#02060A"
_WHITE    = "#EAF2FF"
_MUTED    = "#8EA2B8"


def build_leaflet_map_html(
    *,
    nodes: list[dict[str, Any]],
    route_path: list[dict[str, float]],
    start_coords: tuple[float, float] | None,
    end_coords: tuple[float, float] | None,
    active_idx: int | None,
    center_lat: float = 37.77606,
    center_lng: float = -122.41711,
    zoom: int = 15,
    maptiler_key: str = "",
) -> str:
    """Return a self-contained HTML document for the Tiera tactical map.

    Bridge events fired via the hidden Streamlit input:
        { type: "step_click",        index }
        { type: "waypoint_drag_end", role: "start"|"end", lat, lng }
    """
    safe_nodes: list[dict] = [
        {
            "index":       i,
            "lat":         float(n["lat"]),
            "lng":         float(n["lng"]),
            "instruction": str(n.get("instruction", "")),
            "type":        str(n.get("type", "step")),
            "distance_m":  int(n.get("distance_m", 0)),
        }
        for i, n in enumerate(nodes)
    ]
    safe_path: list[list[float]] = (
        [[float(p["lat"]), float(p["lng"])] for p in route_path] if route_path else []
    )

    start_j = json.dumps(list(start_coords) if start_coords else None)
    end_j   = json.dumps(list(end_coords)   if end_coords   else None)

    nodes_j      = json.dumps(safe_nodes)
    path_j       = json.dumps(safe_path)
    active_idx_j = json.dumps(active_idx)
    center_lat_j = json.dumps(center_lat)
    center_lng_j = json.dumps(center_lng)
    zoom_j       = json.dumps(zoom)

    if maptiler_key:
        tile_url_j = json.dumps(
            f"https://api.maptiler.com/maps/darkmatter/{{z}}/{{x}}/{{y}}.png?key={maptiler_key}"
        )
        tile_attr_j = json.dumps(
            '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> '
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        )
    else:
        tile_url_j  = json.dumps(CARTO_DARK)
        tile_attr_j = json.dumps(CARTO_ATTR)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <style>
    /* ── Base ── */
    html, body, #map {{
      margin: 0; padding: 0;
      width: 100%; height: 100%;
      background: {_CHARCOAL};
    }}
    .leaflet-container {{ background: {_CHARCOAL}; font-family: 'Inter', sans-serif; }}

    /* ── Leaflet control skin ── */
    .leaflet-bar a {{
      background: {_INK} !important;
      color: {_GOLD} !important;
      border-color: rgba(255,177,0,0.22) !important;
    }}
    .leaflet-bar a:hover {{ background: rgba(255,177,0,0.1) !important; }}
    .leaflet-control-attribution {{
      background: rgba(2,6,10,0.75) !important;
      color: #4a6280; font-size: 0.67rem;
    }}

    /* ── Popup chrome ── */
    .leaflet-popup-content-wrapper {{
      background: {_INK};
      border: 1px solid rgba(255,177,0,0.28);
      border-radius: 14px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.55);
      color: {_WHITE};
    }}
    .leaflet-popup-tip {{ background: {_INK}; }}
    .leaflet-popup-content {{ margin: 0; }}
    .pop {{ padding: 0.65rem 0.85rem; min-width: 210px; }}
    .pop-num {{
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 50%;
      font-size: 0.72rem; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      background: {_GOLD}; color: {_CHARCOAL};
      margin-right: 0.4rem;
    }}
    .pop-type {{
      color: {_GOLD}; font-size: 0.71rem; font-weight: 700;
      letter-spacing: 0.13em; text-transform: uppercase;
    }}
    .pop-text {{
      margin-top: 0.3rem;
      color: #C0D0E8; font-size: 0.83rem; line-height: 1.5;
    }}
    .pop-dist {{
      margin-top: 0.25rem;
      color: {_MUTED}; font-size: 0.74rem;
      font-family: 'JetBrains Mono', monospace;
    }}

    /* ── Step circles on polyline ── */
    .step-dot {{
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700; cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }}
    .step-dot:hover {{ transform: scale(1.2); }}
    .step-dot.idle {{
      width: 28px; height: 28px; font-size: 11px;
      color: {_GOLD};
      background: {_INK};
      border: 2px solid {_GOLD};
      box-shadow: 0 0 0 2px rgba(255,177,0,0.12);
    }}
    .step-dot.active {{
      width: 32px; height: 32px; font-size: 12px;
      color: {_CHARCOAL};
      background: {_GOLD};
      border: 2px solid rgba(255,255,255,0.35);
      box-shadow: 0 0 18px rgba(255,177,0,0.65), 0 0 0 4px rgba(255,177,0,0.18);
      animation: pulse 1.8s ease-in-out infinite;
    }}
    @keyframes pulse {{
      0%,100% {{ box-shadow: 0 0 18px rgba(255,177,0,0.65), 0 0 0 4px rgba(255,177,0,0.18); }}
      50%      {{ box-shadow: 0 0 28px rgba(255,177,0,0.85), 0 0 0 7px rgba(255,177,0,0.10); }}
    }}

    /* ── Start / End pins ── */
    .pin {{
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      font-size: 14px; font-weight: 700; cursor: grab;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      transition: transform 0.15s;
    }}
    .pin:hover {{ transform: scale(1.15); }}
    .pin.start-pin {{
      background: linear-gradient(160deg,#00c97a,#007d4a);
      border: 2px solid rgba(255,255,255,0.3);
    }}
    .pin.end-pin {{
      background: linear-gradient(160deg,#ff6363,#b01c1c);
      border: 2px solid rgba(255,255,255,0.3);
    }}
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script>
  // ── Constants injected from Python ──────────────────────────────────────
  const NODES      = {nodes_j};
  const ROUTE_PATH = {path_j};      // [[lat,lng],...]
  const ACTIVE_IDX = {active_idx_j};
  const START_PT   = {start_j};     // [lat,lng] or null
  const END_PT     = {end_j};       // [lat,lng] or null
  const CENTER     = [{center_lat_j}, {center_lng_j}];
  const ZOOM       = {zoom_j};
  const TILE_URL   = {tile_url_j};
  const TILE_ATTR  = {tile_attr_j};

  // ── Streamlit bridge ────────────────────────────────────────────────────
  function sendBridge(payload) {{
    const pw = window.parent;
    const el = pw?.document?.querySelector('input[aria-label="tiera-bridge"]');
    if (!el) return;
    const set = Object.getOwnPropertyDescriptor(pw.HTMLInputElement.prototype, 'value').set;
    set.call(el, JSON.stringify({{ ...payload, ts: Date.now() }}));
    el.dispatchEvent(new pw.Event('input',  {{ bubbles: true }}));
    el.dispatchEvent(new pw.Event('change', {{ bubbles: true }}));
  }}

  function esc(v) {{
    return String(v ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;')
      .replaceAll('>','&gt;').replaceAll('"','&quot;');
  }}

  // ── Map init ────────────────────────────────────────────────────────────
  const map = L.map('map', {{ center: CENTER, zoom: ZOOM, zoomControl: true }});
  L.tileLayer(TILE_URL, {{
    attribution: TILE_ATTR,
    maxZoom: 20,
    subdomains: TILE_URL.includes('cartocdn') ? 'abcd' : '',
  }}).addTo(map);

  // ── Route polyline ──────────────────────────────────────────────────────
  if (ROUTE_PATH.length) {{
    // Glow shadow
    L.polyline(ROUTE_PATH, {{
      color: 'rgba(86,163,255,0.18)', weight: 12, opacity: 1,
    }}).addTo(map);
    // Main line
    L.polyline(ROUTE_PATH, {{
      color: '#56A3FF', weight: 4, opacity: 0.9, lineJoin: 'round', lineCap: 'round',
    }}).addTo(map);
    map.fitBounds(L.latLngBounds(ROUTE_PATH), {{ padding: [42, 42] }});
  }}

  // ── Step-circle markers ─────────────────────────────────────────────────
  function makeStepIcon(index, isActive) {{
    const cls = isActive ? 'active' : 'idle';
    const sz  = isActive ? 32 : 28;
    const label = index + 1;
    return L.divIcon({{
      className: '',
      html: `<div class="step-dot ${{cls}}">${{label}}</div>`,
      iconSize:   [sz, sz],
      iconAnchor: [sz/2, sz/2],
      popupAnchor:[0, -(sz/2 + 6)],
    }});
  }}

  function popupContent(n) {{
    const dist = n.distance_m ? `<div class="pop-dist">${{n.distance_m}} m</div>` : '';
    return `<div class="pop">
      <div style="display:flex;align-items:center;margin-bottom:0.2rem">
        <span class="pop-num">${{n.index + 1}}</span>
        <span class="pop-type">${{esc(n.type)}}</span>
      </div>
      <div class="pop-text">${{esc(n.instruction || 'No instruction.')}}</div>
      ${{dist}}</div>`;
  }}

  NODES.forEach(n => {{
    const isActive = n.index === ACTIVE_IDX;
    const marker = L.marker([n.lat, n.lng], {{
      icon: makeStepIcon(n.index, isActive),
      zIndexOffset: isActive ? 300 : 0,
    }});
    marker.bindPopup(popupContent(n), {{ maxWidth: 300 }});
    marker.on('click', function(e) {{
      L.DomEvent.stopPropagation(e);
      sendBridge({{ type: 'step_click', index: n.index }});
      this.openPopup();
    }});
    marker.addTo(map);
  }});

  // ── Draggable start / end pins ──────────────────────────────────────────
  function makePinIcon(cls, label) {{
    return L.divIcon({{
      className: '',
      html: `<div class="pin ${{cls}}">${{label}}</div>`,
      iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -20],
    }});
  }}

  if (START_PT) {{
    const startMarker = L.marker(START_PT, {{
      icon: makePinIcon('start-pin', 'S'),
      draggable: true, zIndexOffset: 500,
    }}).addTo(map);
    startMarker.on('dragend', function() {{
      const ll = this.getLatLng();
      sendBridge({{ type: 'waypoint_drag_end', role: 'start', lat: ll.lat, lng: ll.lng }});
    }});
  }}

  if (END_PT) {{
    const endMarker = L.marker(END_PT, {{
      icon: makePinIcon('end-pin', 'E'),
      draggable: true, zIndexOffset: 500,
    }}).addTo(map);
    endMarker.on('dragend', function() {{
      const ll = this.getLatLng();
      sendBridge({{ type: 'waypoint_drag_end', role: 'end', lat: ll.lat, lng: ll.lng }});
    }});
  }}
</script>
</body>
</html>"""

