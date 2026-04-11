import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StudioSidebar from "./StudioSidebar";

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
    <div style={{ position: "relative", width: "100vw", height: "100vh", cursor: placing ? "crosshair" : "default" }}>
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
              color: canGenerate ? "#FFB100" : "rgba(247,247,247,0.2)",
              border: canGenerate ? "0.5px solid rgba(255,177,0,0.55)" : "0.5px solid rgba(255,255,255,0.1)",
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

      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
