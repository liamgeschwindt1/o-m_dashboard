import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StudioSidebar from "./StudioSidebar";

const GH_KEY = "1e8939e3-07a3-4b03-83e2-8698c3b12586";

const startIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#1c1c1e;cursor:move;"></div>',
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const endIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #1c1c1e;box-sizing:border-box;cursor:move;"></div>',
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

async function fetchGHRoute(waypoints) {
  const params = waypoints.map((p) => `point=${p[0]},${p[1]}`).join("&");
  const url = `https://graphhopper.com/api/1/route?${params}&vehicle=foot&points_encoded=false&instructions=true&type=json&key=${GH_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GraphHopper error ${res.status}`);
  return res.json();
}

function FitBounds({ path }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 1) {
      const bounds = L.latLngBounds(path);
      map.fitBounds(bounds, { padding: [48, 48] });
    }
  }, [map, path]);
  return null;
}

export default function CalibrationStep({ currentStep, pins, onBack, onNext }) {
  const [waypoints, setWaypoints] = useState([pins.start, pins.end]);
  const [routePath, setRoutePath] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <StudioSidebar currentStep={currentStep}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#1c1c1e" }}>
            Path Calibration
          </div>
          <div style={{ fontSize: 12, color: "#999", lineHeight: 1.6 }}>
            Drag the Start ● or End ○ marker to adjust the path.
            The route snaps to pedestrian-friendly streets.
          </div>
        </div>

        {loading && (
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Calculating route…</div>
        )}
        {error && (
          <div style={{ fontSize: 12, color: "#c00", marginBottom: 12 }}>{error}</div>
        )}
        {routePath && !loading && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 0.5, marginBottom: 4 }}>ROUTE READY</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1c1c1e" }}>
              {instructions.length} turn instructions
            </div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
              Drag endpoints to recalibrate
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onBack}
            style={{
              flex: 1,
              padding: "11px 0",
              border: "1px solid #EDEDED",
              background: "#fff",
              borderRadius: 7,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              color: "#1c1c1e",
            }}
          >
            Back
          </button>
          <button
            onClick={() => routePath && onNext({ path: routePath, instructions, waypoints })}
            disabled={!routePath || loading}
            style={{
              flex: 1,
              padding: "11px 0",
              background: routePath && !loading ? "#1c1c1e" : "#e8e8e8",
              color: routePath && !loading ? "#fff" : "#aaa",
              border: "none",
              borderRadius: 7,
              fontWeight: 700,
              cursor: routePath && !loading ? "pointer" : "default",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Confirm Calibration
          </button>
        </div>
      </StudioSidebar>

      <div style={{ flex: 1, height: "100vh" }}>
        <MapContainer
          center={pins.start}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />
          {routePath && <FitBounds path={routePath} />}
          {routePath && (
            <Polyline
              positions={routePath}
              pathOptions={{ color: "#333", weight: 2, opacity: 0.9 }}
            />
          )}
          {waypoints.map((wp, idx) => (
            <Marker
              key={idx}
              position={wp}
              icon={idx === 0 ? startIcon : endIcon}
              draggable={true}
              eventHandlers={{ dragend: (e) => handleDragEnd(idx, e) }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
