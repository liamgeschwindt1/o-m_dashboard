from __future__ import annotations

import json
from typing import Any

# ── Tile sources ───────────────────────────────────────────────────────────────
_CARTO_POSITRON = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
_CARTO_ATTR     = (
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
    'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
)
_MAPTILER_TPLT  = "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key={key}"
_MAPTILER_ATTR  = (
    '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> '
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
)


def build_leaflet_map_html(
    *,
    mode: str,
    nodes: list[dict[str, Any]],
    route_path: list[dict[str, float]],
    start_coords: tuple[float, float] | None,
    end_coords: tuple[float, float] | None,
    via_points: list[dict[str, Any]],
    active_node_id: str | None,
    center_lat: float = 51.5099,
    center_lng: float = -0.1181,
    zoom: int = 14,
    maptiler_key: str = "",
) -> str:
    """Return a self-contained Leaflet HTML map document.

    Bridge events (fired via the hidden tiera-bridge input):
      { type: "map_click",      lat, lng }              — step 1
      { type: "pin_drag_end",   role: "start"|"end", lat, lng } — step 2
      { type: "via_add",        lat, lng }               — step 2 (route click)
      { type: "via_drag_end",   id, lat, lng }           — step 2
      { type: "node_click",     nodeId }                 — step 3
      { type: "route_click",    lat, lng, nearestIdx }   — step 3
    """
    if maptiler_key:
        tile_url  = _MAPTILER_TPLT.replace("{key}", maptiler_key)
        tile_attr = _MAPTILER_ATTR
        subdomains_opt = ""
    else:
        tile_url   = _CARTO_POSITRON
        tile_attr  = _CARTO_ATTR
        subdomains_opt = ", subdomains: 'abcd'"

    safe_nodes = [
        {
            "id":          str(n["id"]),
            "index":       int(n["index"]),
            "lat":         float(n["lat"]),
            "lng":         float(n["lng"]),
            "instruction": str(n.get("instruction", "")),
            "type":        str(n.get("type", "step")),
            "distance_m":  int(n.get("distance_m", 0)),
        }
        for n in nodes
    ]
    safe_path = [
        [float(p["lat"]), float(p["lng"])] for p in route_path
    ] if route_path else []

    safe_via = [
        {"id": str(v["id"]), "lat": float(v["lat"]), "lng": float(v["lng"])}
        for v in via_points
    ]

    # JSON-encode for injection
    j_mode       = json.dumps(mode)
    j_nodes      = json.dumps(safe_nodes)
    j_path       = json.dumps(safe_path)
    j_start      = json.dumps(list(start_coords) if start_coords else None)
    j_end        = json.dumps(list(end_coords)   if end_coords   else None)
    j_via        = json.dumps(safe_via)
    j_active     = json.dumps(active_node_id)
    j_center_lat = json.dumps(center_lat)
    j_center_lng = json.dumps(center_lng)
    j_zoom       = json.dumps(zoom)
    j_tile_url   = json.dumps(tile_url)
    j_tile_attr  = json.dumps(tile_attr)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    html, body, #map {{ width: 100%; height: 100vh; background: #fff; }}
    .leaflet-container {{ background: #f8f8f8; font-family: "Inter", sans-serif; }}

    /* Leaflet controls */
    .leaflet-bar a {{
      background: #fff !important; color: #111 !important;
      border-color: #ddd !important; font-size: 16px !important;
    }}
    .leaflet-bar a:hover {{ background: #f0f0f0 !important; }}
    .leaflet-control-attribution {{
      background: rgba(255,255,255,0.85) !important;
      color: #999; font-size: 10px !important;
    }}

    /* Popup */
    .leaflet-popup-content-wrapper {{
      background: #fff; border: 1px solid #ddd;
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      color: #111;
    }}
    .leaflet-popup-tip {{ background: #fff; }}
    .leaflet-popup-content {{ margin: 0; }}
    .pop {{ padding: 0.6rem 0.75rem; min-width: 200px; }}
    .pop-num {{
      display: inline-flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border-radius: 50%;
      background: #111; color: #fff;
      font-size: 10px; font-weight: 700; margin-right: 6px;
      font-family: "JetBrains Mono", monospace;
    }}
    .pop-type {{
      font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: #666;
    }}
    .pop-text {{
      margin-top: 4px; font-size: 12px; line-height: 1.5; color: #333;
    }}
    .pop-dist {{ margin-top: 3px; font-size: 10px; color: #999; font-family: "JetBrains Mono", monospace; }}

    /* Step circles */
    .step-circle {{
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      font-family: "JetBrains Mono", monospace;
      font-weight: 700; cursor: pointer;
      transition: transform 0.12s;
      background: #fff;
      border: 2px solid #111;
      color: #111;
    }}
    .step-circle:hover {{ transform: scale(1.15); }}
    .step-circle.active {{
      background: #111; color: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.28);
    }}

    /* Start / end pins */
    .pin {{
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%; cursor: grab;
      font-size: 11px; font-weight: 700;
      font-family: "JetBrains Mono", monospace;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: transform 0.12s;
    }}
    .pin:hover {{ transform: scale(1.12); }}
    .pin-start {{ background: #111; color: #fff; border: 2px solid #111; }}
    .pin-end   {{ background: #fff; color: #111; border: 2px solid #111; }}

    /* Via-point markers */
    .via-dot {{
      width: 12px; height: 12px; border-radius: 50%;
      background: #666; border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      cursor: grab;
    }}

    /* Route click hint */
    .leaflet-container.mode-calibrate {{ cursor: crosshair; }}
    .leaflet-container.mode-refine    {{ cursor: crosshair; }}
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script>
  // ── Data from Python ──────────────────────────────────────────────────────
  const MODE       = {j_mode};
  const NODES      = {j_nodes};
  const ROUTE_PATH = {j_path};
  const START_PT   = {j_start};
  const END_PT     = {j_end};
  const VIA_PTS    = {j_via};
  const ACTIVE_ID  = {j_active};
  const CENTER     = [{j_center_lat}, {j_center_lng}];
  const ZOOM       = {j_zoom};

  // ── Bridge ────────────────────────────────────────────────────────────────
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

  // ── Set iframe to fill viewport ───────────────────────────────────────────
  try {{
    const fr = window.frameElement;
    if (fr) {{ fr.style.height = window.parent.innerHeight + 'px'; fr.height = window.parent.innerHeight; }}
  }} catch(e) {{}}

  // ── Map ───────────────────────────────────────────────────────────────────
  const map = L.map('map', {{ center: CENTER, zoom: ZOOM, zoomControl: true }});

  // Apply mode class to container
  map.getContainer().classList.add('mode-' + MODE);

  L.tileLayer({j_tile_url}, {{
    attribution: {j_tile_attr},
    maxZoom: 20{subdomains_opt},
  }}).addTo(map);

  // ── Route polyline ────────────────────────────────────────────────────────
  let routeLayer = null;

  function drawRoute() {{
    if (routeLayer) {{ routeLayer.remove(); routeLayer = null; }}
    if (!ROUTE_PATH.length) return;

    routeLayer = L.polyline(ROUTE_PATH, {{
      color: '#111', weight: 3, opacity: 0.85,
      lineJoin: 'round', lineCap: 'round',
      interactive: (MODE === 'calibrate' || MODE === 'refine'),
    }}).addTo(map);

    if (MODE === 'calibrate') {{
      routeLayer.on('click', function(e) {{
        L.DomEvent.stopPropagation(e);
        sendBridge({{ type: 'via_add', lat: e.latlng.lat, lng: e.latlng.lng }});
      }});
    }}

    if (MODE === 'refine') {{
      routeLayer.on('click', function(e) {{
        L.DomEvent.stopPropagation(e);
        // Find nearest node index for insertion
        let best = NODES.length;
        let bestD = Infinity;
        NODES.forEach(function(n, i) {{
          const d = Math.hypot(n.lat - e.latlng.lat, n.lng - e.latlng.lng);
          if (d < bestD) {{ bestD = d; best = i + 1; }}
        }});
        sendBridge({{ type: 'route_click', lat: e.latlng.lat, lng: e.latlng.lng, nearestIdx: best }});
      }});
    }}

    if (MODE === 'review' || MODE === 'calibrate' || MODE === 'refine') {{
      map.fitBounds(L.latLngBounds(ROUTE_PATH), {{ padding: [48, 48] }});
    }}
  }}

  drawRoute();

  // ── Step-node circles ─────────────────────────────────────────────────────
  function makeCircleIcon(n, isActive) {{
    const sz  = isActive ? 24 : 20;
    const cls = isActive ? 'step-circle active' : 'step-circle';
    return L.divIcon({{
      className: '',
      html: `<div class="${{cls}}" style="width:${{sz}}px;height:${{sz}}px;font-size:${{isActive ? 10 : 9}}px">${{n.index + 1}}</div>`,
      iconSize:   [sz, sz],
      iconAnchor: [sz / 2, sz / 2],
      popupAnchor:[0, -(sz / 2 + 6)],
    }});
  }}

  function popHtml(n) {{
    const dist = n.distance_m ? `<div class="pop-dist">${{n.distance_m}} m</div>` : '';
    return `<div class="pop"><div style="display:flex;align-items:center;margin-bottom:3px">
      <span class="pop-num">${{n.index + 1}}</span>
      <span class="pop-type">${{esc(n.type)}}</span></div>
      <div class="pop-text">${{esc(n.instruction || 'No instruction.')}}</div>
      ${{dist}}</div>`;
  }}

  if (MODE === 'refine' || MODE === 'review') {{
    NODES.forEach(function(n) {{
      const isActive = (n.id === ACTIVE_ID);
      const m = L.marker([n.lat, n.lng], {{
        icon: makeCircleIcon(n, isActive),
        zIndexOffset: isActive ? 400 : 0,
      }});
      m.bindPopup(popHtml(n), {{ maxWidth: 280 }});
      m.on('click', function(e) {{
        L.DomEvent.stopPropagation(e);
        sendBridge({{ type: 'node_click', nodeId: n.id }});
        this.openPopup();
      }});
      m.addTo(map);
    }});
  }}

  // ── Start / End pins ──────────────────────────────────────────────────────
  function makePinIcon(cls, label) {{
    return L.divIcon({{
      className: '',
      html: `<div class="pin ${{cls}}" style="width:28px;height:28px">${{label}}</div>`,
      iconSize:   [28, 28],
      iconAnchor: [14, 14],
      popupAnchor:[0, -18],
    }});
  }}

  if (START_PT) {{
    const sm = L.marker(START_PT, {{
      icon: makePinIcon('pin-start', 'S'),
      draggable: (MODE === 'calibrate'),
      zIndexOffset: 600,
    }}).addTo(map);
    if (MODE === 'calibrate') {{
      sm.on('dragend', function() {{
        const ll = this.getLatLng();
        sendBridge({{ type: 'pin_drag_end', role: 'start', lat: ll.lat, lng: ll.lng }});
      }});
    }}
  }}

  if (END_PT) {{
    const em = L.marker(END_PT, {{
      icon: makePinIcon('pin-end', 'E'),
      draggable: (MODE === 'calibrate'),
      zIndexOffset: 600,
    }}).addTo(map);
    if (MODE === 'calibrate') {{
      em.on('dragend', function() {{
        const ll = this.getLatLng();
        sendBridge({{ type: 'pin_drag_end', role: 'end', lat: ll.lat, lng: ll.lng }});
      }});
    }}
  }}

  // ── Via-point markers ─────────────────────────────────────────────────────
  if (MODE === 'calibrate') {{
    VIA_PTS.forEach(function(v) {{
      const vm = L.marker([v.lat, v.lng], {{
        icon: L.divIcon({{
          className: '',
          html: '<div class="via-dot"></div>',
          iconSize:   [12, 12],
          iconAnchor: [6, 6],
        }}),
        draggable: true,
        zIndexOffset: 500,
      }}).addTo(map);
      vm.on('dragend', function() {{
        const ll = this.getLatLng();
        sendBridge({{ type: 'via_drag_end', id: v.id, lat: ll.lat, lng: ll.lng }});
      }});
    }});
  }}

  // ── Map click (step 1: set start/end) ────────────────────────────────────
  if (MODE === 'plan') {{
    map.on('click', function(e) {{
      sendBridge({{ type: 'map_click', lat: e.latlng.lat, lng: e.latlng.lng }});
    }});
  }}
</script>
</body>
</html>"""
