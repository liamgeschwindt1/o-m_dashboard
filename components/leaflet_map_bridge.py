from __future__ import annotations

import json
from typing import Any

CARTO_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
CARTO_ATTRIBUTION = (
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
    'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
)

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
