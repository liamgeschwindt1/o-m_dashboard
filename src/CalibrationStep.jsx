import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StudioSidebar from "./StudioSidebar";

const GH_KEY = "1e8939e3-07a3-4b03-83e2-8698c3b12586";

function letterIcon(letter) {
  return L.divIcon({
    html: `<div style="width:22px;height:22px;border-radius:50%;background:#01B4AF;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px rgba(1,180,175,0.3);"><span style="color:#031119;font-size:10px;font-weight:700;font-family:Inter,sans-serif;line-height:1;">${letter}</span></div>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

const startIcon = letterIcon("A");
const endIcon = letterIcon("B");

function viaIcon(letter) {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#1B354F;border:1.5px solid #01B4AF;display:flex;align-items:center;justify-content:center;"><span style="color:#01B4AF;font-size:9px;font-weight:700;font-family:Inter,sans-serif;line-height:1;">${letter}</span></div>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

async function fetchGHRoute(waypoints) {
  const params = waypoints.map((p) => `point=${p[0]},${p[1]}`).join("&");
  const url = `https://graphhopper.com/api/1/route?${params}&vehicle=foot&points_encoded=false&instructions=true&type=json&key=${GH_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GraphHopper error ${res.status}`);
  return res.json();
}

function FitBounds({ path, trigger }) {
  const map = useMap();
  const didFit = useRef(false);
  useEffect(() => {
    if (!didFit.current && path && path.length > 1) {
      const bounds = L.latLngBounds(path);
      map.fitBounds(bounds, { padding: [48, 48] });
      didFit.current = true;
    }
  }, [map, path, trigger]);
  return null;
}

// Listens for map clicks when addMode is active
function MapClickListener({ addMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (addMode) onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function CalibrationStep({ currentStep, pins, onBack, onNext }) {
  // waypoints = [start, ...vias, end]
  const [waypoints, setWaypoints] = useState([pins.start, pins.end]);
  const [routePath, setRoutePath] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMode, setAddMode] = useState(false);

  async function loadRoute(wps) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGHRoute(wps);
      if (data.paths && data.paths[0]) {
        const path = data.paths[0].points.coordinates.map((c) => [c[1], c[0]]);
        setRoutePath(path);
        setInstructions(data.paths[0].instructions || []);
      } else {
        setError("No route found between these points.");
      }
    } catch (e) {
      setError("Could not calculate route. Check your connection.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRoute(waypoints);
  }, []);

  function handleDragEnd(idx, e) {
    const { lat, lng } = e.target.getLatLng();
    const newWps = [...waypoints];
    newWps[idx] = [lat, lng];
    setWaypoints(newWps);
    loadRoute(newWps);
  }

  function handleMapClick(latlng) {
    // Insert new via-point before the last point (end)
    const newWps = [...waypoints.slice(0, -1), latlng, waypoints[waypoints.length - 1]];
    setWaypoints(newWps);
    setAddMode(false);
    loadRoute(newWps);
  }

  function removeVia(idx) {
    const newWps = waypoints.filter((_, i) => i !== idx);
    setWaypoints(newWps);
    loadRoute(newWps);
  }

  const viaCount = waypoints.length - 2;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", cursor: addMode ? "crosshair" : "default" }}>
      <StudioSidebar currentStep={currentStep}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#F7F7F7" }}>
            Path Calibration
          </div>
          <div style={{ fontSize: 12, color: "rgba(247,247,247,0.55)", lineHeight: 1.6 }}>
            {addMode
              ? "Click anywhere on the map to insert a via-point."
              : "Drag any marker to adjust the path, or add a via-point."}
          </div>
        </div>

        {/* Add via-point button */}
        <button
          onClick={() => setAddMode((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            border: addMode ? "0.5px solid #01B4AF" : "0.5px solid rgba(255,255,255,0.15)",
            borderRadius: 6,
            background: addMode ? "rgba(1,180,175,0.12)" : "transparent",
            color: addMode ? "#01B4AF" : "rgba(247,247,247,0.7)",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            marginBottom: 16,
            width: "100%",
            justifyContent: "center",
            transition: "all 150ms ease",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          {addMode ? "Click map to place…" : "Add via-point"}
        </button>

        {/* Via-point list */}
        {viaCount > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "rgba(247,247,247,0.35)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
              Via points ({viaCount})
            </div>
            {waypoints.slice(1, -1).map((wp, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "5px 0",
                borderBottom: "0.5px solid rgba(255,255,255,0.08)",
                fontSize: 11,
                color: "rgba(247,247,247,0.55)",
                fontFamily: "JetBrains Mono, monospace",
              }}>
                <span>Via {i + 1} — {wp[0].toFixed(4)}, {wp[1].toFixed(4)}</span>
                <button
                  onClick={() => removeVia(i + 1)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(247,247,247,0.3)",
                    fontSize: 14,
                    lineHeight: 1,
                    padding: "0 2px",
                    fontFamily: "Inter, sans-serif",
                  }}
                  title="Remove"
                >×</button>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ fontSize: 12, color: "rgba(247,247,247,0.35)", marginBottom: 12 }}>Calculating route…</div>
        )}
        {error && (
          <div style={{ fontSize: 12, color: "#DC2626", marginBottom: 12 }}>{error}</div>
        )}
        {routePath && !loading && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "rgba(247,247,247,0.35)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Route ready</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#01B4AF" }}>
              {instructions.length} turn instructions
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onBack}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "0.5px solid rgba(255,255,255,0.15)",
              background: "transparent",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              color: "rgba(247,247,247,0.7)",
              transition: "background 150ms ease",
            }}
          >
            Back
          </button>
          <button
            onClick={() => routePath && onNext({ path: routePath, instructions, waypoints })}
            disabled={!routePath || loading}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "transparent",
              color: routePath && !loading ? "#FFB100" : "rgba(247,247,247,0.2)",
              border: routePath && !loading ? "0.5px solid rgba(255,177,0,0.55)" : "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              fontWeight: 500,
              cursor: routePath && !loading ? "pointer" : "default",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              transition: "border-color 200ms ease, color 200ms ease",
            }}
          >
            Confirm Calibration
          </button>
        </div>
      </StudioSidebar>

      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <MapContainer
          center={pins.start}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />
          <MapClickListener addMode={addMode} onMapClick={handleMapClick} />
          {routePath && <FitBounds path={routePath} trigger={pins} />}
          {routePath && (
            <Polyline
              positions={routePath}
              pathOptions={{ color: "#FF7230", weight: 1.5, opacity: 1 }}
            />
          )}
          {/* Start marker */}
          <Marker
            position={waypoints[0]}
            icon={startIcon}
            draggable={true}
            eventHandlers={{ dragend: (e) => handleDragEnd(0, e) }}
          />
          {/* Via markers */}
          {waypoints.slice(1, -1).map((wp, i) => (
            <Marker
              key={`via-${i}`}
              position={wp}
              icon={viaIcon(String.fromCharCode(67 + i))}
              draggable={true}
              eventHandlers={{ dragend: (e) => handleDragEnd(i + 1, e) }}
            />
          ))}
          {/* End marker */}
          <Marker
            position={waypoints[waypoints.length - 1]}
            icon={endIcon}
            draggable={true}
            eventHandlers={{ dragend: (e) => handleDragEnd(waypoints.length - 1, e) }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
