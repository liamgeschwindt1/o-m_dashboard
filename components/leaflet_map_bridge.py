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


# Colour tokens shared between Python and the injected JS
_GOLD = "#FFB100"
_BLUE = "#56A3FF"
_INK = "#060E14"
_CHARCOAL = "#02060A"


def build_leaflet_map_html(
    *,
    waypoints: list[dict[str, Any]],
    active_id: str | None,
    route_path: list[dict[str, float]],
    center_lat: float = 37.77606,
    center_lng: float = -122.41711,
    zoom: int = 16,
) -> str:
    """Return a self-contained HTML document that renders the Tiera tactical map.

    Three kinds of Streamlit bridge events are fired via the hidden input:
        { type: "marker_click",     pointId }
        { type: "map_click",        lat, lng }
        { type: "marker_drag_end",  pointId, lat, lng }
    """
    safe_points: list[dict[str, Any]] = [
        {
            "id":          str(p["id"]),
            "lat":         float(p["lat"]),
            "lng":         float(p["lng"]),
            "instruction": str(p.get("instruction", "")),
            "cue_type":    str(p.get("type", "cue")),
        }
        for p in waypoints
    ]

    # Route geometry as [[lat, lng], ...] for Leaflet
    safe_path: list[list[float]] = (
        [[float(p["lat"]), float(p["lng"])] for p in route_path]
        if route_path else []
    )

    center_lat_j = json.dumps(center_lat)
    center_lng_j = json.dumps(center_lng)
    zoom_j = json.dumps(zoom)
    points_j = json.dumps(safe_points)
    active_j = json.dumps(active_id)
    path_j = json.dumps(safe_path)
    gold_j = json.dumps(_GOLD)
    blue_j = json.dumps(_BLUE)
    ink_j = json.dumps(_INK)
    charcoal_j = json.dumps(_CHARCOAL)
    attr_j = json.dumps(CARTO_ATTRIBUTION)
    tile_j = json.dumps(CARTO_DARK)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    crossorigin=""
  />
  <style>
    html, body, #map {{
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: {_CHARCOAL};
    }}

    .leaflet-container {{
      background: {_CHARCOAL};
      font-family: 'Inter', sans-serif;
    }}

    /* ── Tactical dot markers ── */
    .tac-dot-shell {{
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 700;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }}
    .tac-dot-shell:hover {{
      transform: scale(1.18);
    }}
    .tac-dot-shell.is-default {{
      width: 26px;
      height: 26px;
      color: {_GOLD};
      background: {_INK};
      border: 2px solid {_GOLD};
      box-shadow: 0 0 0 1px rgba(255,177,0,0.14);
    }}
    .tac-dot-shell.is-active {{
      width: 30px;
      height: 30px;
      color: {_CHARCOAL};
      background: {_GOLD};
      border: 2px solid rgba(255,255,255,0.3);
      box-shadow: 0 0 14px rgba(255,177,0,0.48), 0 0 0 3px rgba(255,177,0,0.16);
    }}

    /* ── Popup ── */
    .leaflet-popup-content-wrapper {{
      background: {_INK};
      color: #EAF2FF;
      border: 1px solid rgba(255,177,0,0.28);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }}
    .leaflet-popup-tip {{
      background: {_INK};
    }}
    .leaflet-popup-content {{
      margin: 0;
    }}
    .pop-shell {{
      padding: 0.65rem 0.8rem;
      min-width: 200px;
    }}
    .pop-badge {{
      display: inline-block;
      margin-bottom: 0.35rem;
      padding: 0.15rem 0.4rem;
      border-radius: 999px;
      background: rgba(255,177,0,0.12);
      color: #FFF3CF;
      font-size: 0.7rem;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.1em;
    }}
    .pop-label {{
      color: {_GOLD};
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.2rem;
    }}
    .pop-text {{
      color: #C8D8F0;
      font-size: 0.82rem;
      line-height: 1.45;
    }}

    /* ── Leaflet control overrides ── */
    .leaflet-bar a {{
      background: {_INK};
      color: {_GOLD};
      border-color: rgba(255,177,0,0.22);
    }}
    .leaflet-bar a:hover {{ background: rgba(255,177,0,0.1); }}
    .leaflet-control-attribution {{
      background: rgba(2,6,10,0.7) !important;
      color: #5a7090;
      font-size: 0.68rem;
    }}
  </style>
</head>
<body>
  <div id="map"></div>
  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    crossorigin="">
  </script>
  <script>
    // ── Data injected from Python ──────────────────────────────────────────
    const MAP_POINTS  = {points_j};
    const ACTIVE_ID   = {active_j};
    const ROUTE_PATH  = {path_j};   // [[lat, lng], ...]
    const CENTER      = [{center_lat_j}, {center_lng_j}];
    const ZOOM        = {zoom_j};

    // ── Design tokens ──────────────────────────────────────────────────────
    const GOLD      = {gold_j};
    const BLUE      = {blue_j};
    const INK       = {ink_j};
    const CHARCOAL  = {charcoal_j};

    // ── Streamlit bridge ──────────────────────────────────────────────────
    function sendToStreamlit(payload) {{
      const pw = window.parent;
      const pd = pw?.document;
      const el = pd?.querySelector('input[aria-label="tiera-bridge"]');
      if (!el) return;
      const ev  = JSON.stringify({{ ...payload, ts: Date.now() }});
      const set = Object.getOwnPropertyDescriptor(
        pw.HTMLInputElement.prototype, 'value'
      ).set;
      set.call(el, ev);
      el.dispatchEvent(new pw.Event('input',  {{ bubbles: true }}));
      el.dispatchEvent(new pw.Event('change', {{ bubbles: true }}));
    }}

    // ── Escape helper ──────────────────────────────────────────────────────
    function esc(v) {{
      return String(v ?? '')
        .replaceAll('&','&amp;').replaceAll('<','&lt;')
        .replaceAll('>','&gt;').replaceAll('"','&quot;')
        .replaceAll("'",'&#039;');
    }}

    // ── Map init ──────────────────────────────────────────────────────────
    const map = L.map('map', {{
      center: CENTER,
      zoom:   ZOOM,
      zoomControl: true,
      attributionControl: true,
    }});

    L.tileLayer({tile_j}, {{
      attribution: {attr_j},
      maxZoom: 20,
      subdomains: 'abcd',
    }}).addTo(map);

    // ── Route polyline ─────────────────────────────────────────────────────
    let routeLayer = null;
    let clickLayer = null;  // wide transparent overlay for click-to-add

    function drawRoutePath(path) {{
      if (routeLayer) {{ routeLayer.remove(); routeLayer = null; }}
      if (clickLayer) {{ clickLayer.remove(); clickLayer = null; }}
      if (!path || !path.length) return;

      // Visible route line
      routeLayer = L.polyline(path, {{
        color: BLUE,
        weight: 5,
        opacity: 0.88,
        lineJoin: 'round',
      }}).addTo(map);

      // Wide invisible hit-area polyline to catch clicks anywhere on the route
      clickLayer = L.polyline(path, {{
        color: GOLD,
        weight: 16,
        opacity: 0.0,
        interactive: true,
      }}).addTo(map);

      clickLayer.on('click', function(e) {{
        L.DomEvent.stopPropagation(e);
        sendToStreamlit({{
          type: 'map_click',
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        }});
      }});
    }}

    drawRoutePath(ROUTE_PATH);

    // Auto-fit bounds
    if (ROUTE_PATH && ROUTE_PATH.length) {{
      map.fitBounds(L.latLngBounds(ROUTE_PATH), {{ padding: [36, 36] }});
    }}

    // ── Tactical markers ──────────────────────────────────────────────────
    let markerMap = {{}};  // id → L.Marker

    function makeDotIcon(index, isActive) {{
      return L.divIcon({{
        className: '',
        html: `<div class="tac-dot-shell ${{isActive ? 'is-active' : 'is-default'}}">${{index + 1}}</div>`,
        iconSize:   isActive ? [30, 30] : [26, 26],
        iconAnchor: isActive ? [15, 15] : [13, 13],
        popupAnchor: [0, isActive ? -18 : -16],
      }});
    }}

    function popupHtml(pt) {{
      return `
        <div class="pop-shell">
          <span class="pop-label">Tactical step</span>
          <span class="pop-badge">${{esc(pt.cue_type.toUpperCase())}}</span>
          <div class="pop-text">${{esc(pt.instruction || 'No instruction yet.')}}</div>
        </div>`;
    }}

    function buildMarkers() {{
      Object.values(markerMap).forEach(m => m.remove());
      markerMap = {{}};

      MAP_POINTS.forEach((pt, index) => {{
        const isActive = pt.id === ACTIVE_ID;
        const marker = L.marker([pt.lat, pt.lng], {{
          icon:      makeDotIcon(index, isActive),
          draggable: true,
          title:     `${{index + 1}}. ${{pt.cue_type}}`,
          zIndexOffset: isActive ? 200 : 0,
        }});

        marker.bindPopup(popupHtml(pt), {{ maxWidth: 280 }});

        marker.on('click', function(e) {{
          L.DomEvent.stopPropagation(e);
          sendToStreamlit({{ type: 'marker_click', pointId: pt.id }});
          this.openPopup();
        }});

        marker.on('dragend', function(e) {{
          const ll = this.getLatLng();
          sendToStreamlit({{
            type: 'marker_drag_end',
            pointId: pt.id,
            lat: ll.lat,
            lng: ll.lng,
          }});
        }});

        marker.addTo(map);
        markerMap[pt.id] = marker;
      }});
    }}

    buildMarkers();

    // ── Map background click → add new landmark ───────────────────────────
    map.on('click', function(e) {{
      sendToStreamlit({{
        type: 'map_click',
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      }});
    }});
  </script>
</body>
</html>"""
