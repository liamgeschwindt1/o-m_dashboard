from __future__ import annotations

import json
from html import escape
from typing import Any


TACTICAL_MAP_STYLE: list[dict[str, Any]] = [
    {"elementType": "geometry", "stylers": [{"color": "#02060A"}]},
    {"elementType": "labels.text.fill", "stylers": [{"color": "#9FC3FF"}]},
    {"elementType": "labels.text.stroke", "stylers": [{"color": "#02060A"}]},
    {"featureType": "road", "elementType": "geometry", "stylers": [{"color": "#12324A"}]},
    {"featureType": "road", "elementType": "geometry.stroke", "stylers": [{"color": "#1E4C6F"}]},
    {"featureType": "road.highway", "elementType": "geometry", "stylers": [{"color": "#274763"}]},
    {"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#061824"}]},
    {"featureType": "poi", "elementType": "labels.text.fill", "stylers": [{"color": "#7FA3C7"}]},
    {"featureType": "transit", "stylers": [{"visibility": "off"}]},
]


def build_google_maps_html(
    *,
    api_key: str,
    waypoints: list[dict[str, Any]],
    active_id: str | None,
) -> str:
    safe_points = [
        {
            "id": point["id"],
            "lat": float(point["lat"]),
            "lng": float(point["lng"]),
            "instruction": point.get("instruction", ""),
            "type": point.get("type", "cue"),
        }
        for point in waypoints
    ]

    if not api_key:
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            html, body {
              margin: 0;
              height: 100%;
              background: #02060A;
              color: #EAF2FF;
              font-family: Inter, sans-serif;
            }
            .empty-state {
              height: 100%;
              display: grid;
              place-items: center;
              padding: 1rem;
              text-align: center;
              border: 1px solid rgba(255, 177, 0, 0.22);
              border-radius: 16px;
              background: linear-gradient(180deg, rgba(6, 14, 20, 0.96), rgba(3, 9, 13, 0.92));
            }
            strong { color: #FFB100; }
          </style>
        </head>
        <body>
          <div class="empty-state">
            <div>
              <strong>Google Maps bridge is waiting for a key.</strong>
              <p>Add <code>GOOGLE_MAPS_API_KEY</code> to <code>.streamlit/secrets.toml</code> and rerun Tiera.</p>
            </div>
          </div>
        </body>
        </html>
        """

    return f"""
<!DOCTYPE html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <style>
      html, body, #map {{
        margin: 0;
        width: 100%;
        height: 100%;
        background: #02060A;
        color: #EAF2FF;
        font-family: Inter, sans-serif;
      }}

      #map {{
        border-radius: 16px;
        overflow: hidden;
      }}

      .gm-style .gm-style-iw-c {{
        padding: 0 !important;
        border-radius: 12px;
        background: #060E14;
      }}

      .gm-style .gm-style-iw-d {{
        overflow: hidden !important;
        color: #EAF2FF;
      }}

      .gm-style .gm-style-iw-tc::after {{
        background: #060E14;
      }}

      .info-shell {{
        min-width: 220px;
        padding: 0.75rem 0.8rem;
        background: #060E14;
        color: #EAF2FF;
      }}

      .info-shell strong {{
        display: block;
        margin-bottom: 0.35rem;
        color: #FFB100;
        font-size: 0.78rem;
        letter-spacing: 0.12em;
      }}

      .badge {{
        display: inline-block;
        margin-bottom: 0.45rem;
        padding: 0.18rem 0.42rem;
        border-radius: 999px;
        background: rgba(255, 177, 0, 0.12);
        color: #FFF3CF;
        font-size: 0.7rem;
      }}
    </style>
  </head>
  <body>
    <div id=\"map\"></div>

    <script>
      const MAP_POINTS = {json.dumps(safe_points)};
      const ACTIVE_ID = {json.dumps(active_id)};
      const MAP_STYLE = {json.dumps(TACTICAL_MAP_STYLE)};

      let map;
      let infoWindow;
      let directionsService;
      let directionsRenderer;
      let routeOverlay;
      let instructionMarkers = [];
      let bootstrapped = false;

      function escapeHtml(value) {{
        return String(value ?? '')
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#039;');
      }}

      function sendToStreamlit(payload) {{
        const parentWindow = window.parent;
        const parentDocument = parentWindow?.document;
        const bridgeInput = parentDocument?.querySelector('input[aria-label="tiera-bridge"]');

        if (!bridgeInput) {{
          return;
        }}

        const serialized = JSON.stringify({{ ...payload, ts: Date.now() }});
        const setter = Object.getOwnPropertyDescriptor(
          parentWindow.HTMLInputElement.prototype,
          'value',
        ).set;

        setter.call(bridgeInput, serialized);
        bridgeInput.dispatchEvent(new parentWindow.Event('input', {{ bubbles: true }}));
        bridgeInput.dispatchEvent(new parentWindow.Event('change', {{ bubbles: true }}));
      }}

      function clearInstructionMarkers() {{
        instructionMarkers.forEach((marker) => marker.setMap(null));
        instructionMarkers = [];
      }}

      function createInstructionDots() {{
        clearInstructionMarkers();

        MAP_POINTS.forEach((point, index) => {{
          const isActive = point.id === ACTIVE_ID;
          const marker = new google.maps.Marker({{
            map,
            position: {{ lat: point.lat, lng: point.lng }},
            title: `${{index + 1}}. ${{point.instruction}}`,
            label: {{
              text: String(index + 1),
              color: isActive ? '#02060A' : '#FFB100',
              fontWeight: '700',
              fontSize: '12px',
            }},
            icon: {{
              path: google.maps.SymbolPath.CIRCLE,
              scale: isActive ? 11 : 8.5,
              fillColor: isActive ? '#FFB100' : '#060E14',
              fillOpacity: 1,
              strokeColor: '#FFB100',
              strokeWeight: isActive ? 3 : 2,
            }},
            zIndex: isActive ? 200 : 120,
          }});

          marker.addListener('click', () => {{
            sendToStreamlit({{ type: 'marker_selected', pointId: point.id }});

            if (infoWindow) {{
              infoWindow.close();
            }}

            infoWindow = new google.maps.InfoWindow({{
              content: `
                <div class=\"info-shell\">
                  <strong>TACTICAL STEP</strong>
                  <span class=\"badge\">${{escapeHtml(point.type.toUpperCase())}}</span>
                  <div>${{escapeHtml(point.instruction)}}</div>
                </div>
              `,
            }});

            infoWindow.open({{ map, anchor: marker }});
          }});

          instructionMarkers.push(marker);
        }});
      }}

      function fitToPath(points) {{
        if (!points.length) {{
          return;
        }}

        const bounds = new google.maps.LatLngBounds();
        points.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds, 52);
      }}

      function buildRouteOverlay(path) {{
        if (routeOverlay) {{
          routeOverlay.setMap(null);
        }}

        routeOverlay = new google.maps.Polyline({{
          map,
          path,
          clickable: true,
          geodesic: true,
          strokeColor: '#FFB100',
          strokeWeight: 14,
          strokeOpacity: 0.01,
          zIndex: 90,
        }});

        routeOverlay.addListener('click', (event) => {{
          sendToStreamlit({{
            type: 'add_instruction',
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          }});
        }});
      }}

      function syncRouteGeometry(directions, notifyPython = false) {{
        const overviewPath = directions?.routes?.[0]?.overview_path ?? [];

        if (!overviewPath.length) {{
          return;
        }}

        const path = overviewPath.map((point) => ({
          lat: point.lat(),
          lng: point.lng(),
        }));

        buildRouteOverlay(path);
        createInstructionDots();
        fitToPath(path);

        if (notifyPython) {{
          sendToStreamlit({{
            type: 'route_changed',
            overviewPath: path,
            summary: directions?.routes?.[0]?.summary ?? 'Walking route updated.',
          }});
        }}
      }}

      function drawFallbackPath() {{
        const path = MAP_POINTS.map((point) => ({ lat: point.lat, lng: point.lng }));
        buildRouteOverlay(path);
        createInstructionDots();
        fitToPath(path);
      }}

      function requestWalkingRoute() {{
        if (MAP_POINTS.length < 2) {{
          drawFallbackPath();
          return;
        }}

        const routeRequest = {{
          origin: {{ lat: MAP_POINTS[0].lat, lng: MAP_POINTS[0].lng }},
          destination: {{
            lat: MAP_POINTS[MAP_POINTS.length - 1].lat,
            lng: MAP_POINTS[MAP_POINTS.length - 1].lng,
          }},
          travelMode: google.maps.TravelMode.WALKING,
          provideRouteAlternatives: false,
          optimizeWaypoints: false,
          waypoints: MAP_POINTS.slice(1, -1).map((point) => ({
            location: {{ lat: point.lat, lng: point.lng }},
            stopover: true,
          })),
        }};

        directionsService.route(routeRequest, (result, status) => {{
          if (status === 'OK' && result) {{
            directionsRenderer.setDirections(result);
            syncRouteGeometry(result, false);
            bootstrapped = true;
            return;
          }}

          drawFallbackPath();
        }});
      }}

      function initMap() {{
        const center = MAP_POINTS[0]
          ? {{ lat: MAP_POINTS[0].lat, lng: MAP_POINTS[0].lng }}
          : {{ lat: 37.77606, lng: -122.41711 }};

        map = new google.maps.Map(document.getElementById('map'), {{
          center,
          zoom: 16,
          disableDefaultUI: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: MAP_STYLE,
          clickableIcons: false,
          gestureHandling: 'greedy',
        }});

        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({{
          draggable: true,
          map,
          suppressMarkers: true,
          polylineOptions: {{
            strokeColor: '#56A3FF',
            strokeWeight: 6,
            strokeOpacity: 0.92,
          }},
        }});

        directionsRenderer.addListener('directions_changed', () => {{
          const result = directionsRenderer.getDirections();
          syncRouteGeometry(result, bootstrapped);
        }});

        requestWalkingRoute();
      }}

      window.initMap = initMap;
    </script>
    <script async src=\"https://maps.googleapis.com/maps/api/js?key={escape(api_key)}&callback=initMap\"></script>
  </body>
</html>
"""
