import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StudioSidebar from "./StudioSidebar";

const startIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#1c1c1e;"></div>',
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const endIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #1c1c1e;box-sizing:border-box;"></div>',
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapClicker({ active, onPlace }) {
  useMapEvents({
    click(e) {
      if (active) onPlace([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function PlanningStep({ currentStep, onBack, onNext }) {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [placing, setPlacing] = useState("start"); // "start" | "end" | null

  function handlePlace(latlng) {
    if (placing === "start") {
      setStart(latlng);
      setPlacing("end");
    } else if (placing === "end") {
      setEnd(latlng);
      setPlacing(null);
    }
  }

  function reset() {
    setStart(null);
    setEnd(null);
    setPlacing("start");
  }

  const canGenerate = start && end;

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <StudioSidebar currentStep={currentStep}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#F7F7F7" }}>
            Set Route Endpoints
          </div>
          <div style={{ fontSize: 12, color: "rgba(247,247,247,0.55)", lineHeight: 1.6 }}>
            {placing === "start" && "Click the map to drop a Start point ●"}
            {placing === "end" && "Now click to drop an End point ○"}
            {placing === null && "Both endpoints set. Ready to generate."}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "rgba(247,247,247,0.35)", marginBottom: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>Start (A)</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: start ? "#01B4AF" : "rgba(247,247,247,0.25)", fontFamily: "JetBrains Mono, monospace" }}>
            {start ? `${start[0].toFixed(5)},  ${start[1].toFixed(5)}` : "not set"}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "rgba(247,247,247,0.35)", marginBottom: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>End (B)</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: end ? "#01B4AF" : "rgba(247,247,247,0.25)", fontFamily: "JetBrains Mono, monospace" }}>
            {end ? `${end[0].toFixed(5)},  ${end[1].toFixed(5)}` : "not set"}
          </div>
        </div>

        {(start || end) && (
          <button
            onClick={reset}
            style={{
              fontSize: 11,
              color: "rgba(247,247,247,0.35)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginBottom: 20,
              textDecoration: "underline",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Reset points
          </button>
        )}

        {/* Push buttons to bottom */}
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
            onClick={() => canGenerate && onNext({ start, end })}
            disabled={!canGenerate}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "transparent",
              color: canGenerate ? "#01B4AF" : "rgba(247,247,247,0.2)",
              border: canGenerate ? "0.5px solid rgba(1,180,175,0.5)" : "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              fontWeight: 500,
              cursor: canGenerate ? "pointer" : "default",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              transition: "border-color 200ms ease, color 200ms ease",
            }}
          >
            Generate Route →
          </button>
        </div>
      </StudioSidebar>

      <div style={{ flex: 1, height: "100vh", cursor: placing ? "crosshair" : "default" }}>
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />
          <MapClicker active={!!placing} onPlace={handlePlace} />
          {start && <Marker position={start} icon={startIcon} />}
          {end && <Marker position={end} icon={endIcon} />}
        </MapContainer>
      </div>
    </div>
  );
}
