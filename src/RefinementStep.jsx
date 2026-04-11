import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StudioSidebar from "./StudioSidebar";

function makeNodeIcon(num, active) {
  const bg = active ? "#1c1c1e" : "#fff";
  const fg = active ? "#fff" : "#1c1c1e";
  return L.divIcon({
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${bg};border:2px solid #1c1c1e;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:${fg};font-family:Inter,sans-serif;box-sizing:border-box;">${num}</div>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

// Build instruction nodes from GraphHopper data
function buildNodes(instructions, path) {
  if (!instructions || instructions.length === 0) return [];
  return instructions
    .filter((inst) => inst.interval && path[inst.interval[0]])
    .map((inst, i) => ({
      id: i,
      pos: path[inst.interval[0]],
      text: inst.text || `Instruction ${i + 1}`,
    }));
}

export default function RefinementStep({ currentStep, route, onBack, onNext }) {
  const { path, instructions: rawInstructions } = route;

  const [nodes, setNodes] = useState(() => buildNodes(rawInstructions, path));
  const [activeNode, setActiveNode] = useState(null);
  const listRef = useRef(null);

  function selectNode(id) {
    const next = id === activeNode ? null : id;
    setActiveNode(next);
    if (next !== null) {
      setTimeout(() => {
        const el = document.getElementById(`node-item-${next}`);
        if (el && listRef.current) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 50);
    }
  }

  function updateText(id, text) {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, text } : n)));
  }

  const mapCenter = path[Math.floor(path.length / 2)] || [37.7749, -122.4194];

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <StudioSidebar currentStep={currentStep}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#1c1c1e" }}>
            Instruction Refinement
          </div>
          <div style={{ fontSize: 12, color: "#999", lineHeight: 1.6 }}>
            Click a numbered node on the map to select and edit its instruction below.
          </div>
        </div>

        {/* Scrollable instruction timeline */}
        <div
          ref={listRef}
          style={{ flex: 1, overflowY: "auto", marginBottom: 16, paddingRight: 4 }}
        >
          {nodes.length === 0 && (
            <div style={{ fontSize: 12, color: "#ccc" }}>
              No turn instructions were returned for this route segment.
            </div>
          )}
          {nodes.map((node, i) => {
            const isActive = activeNode === node.id;
            return (
              <div
                id={`node-item-${node.id}`}
                key={node.id}
                onClick={() => selectNode(node.id)}
                style={{
                  marginBottom: 10,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: isActive ? "1px solid #1c1c1e" : "1px solid #EDEDED",
                  background: isActive ? "#fafafa" : "#fff",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
              >
                {/* Node number + label row */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: isActive ? "#1c1c1e" : "#fff",
                    border: "2px solid #1c1c1e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8,
                    fontWeight: 700,
                    color: isActive ? "#fff" : "#1c1c1e",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 10, color: "#aaa", letterSpacing: 0.5 }}>
                    NODE {i + 1}
                  </div>
                </div>

                {/* Editable text or display text */}
                {isActive ? (
                  <textarea
                    value={node.text}
                    onChange={(e) => updateText(node.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: "100%",
                      fontSize: 12,
                      fontFamily: "Inter, sans-serif",
                      border: "none",
                      outline: "none",
                      resize: "none",
                      background: "transparent",
                      lineHeight: 1.6,
                      minHeight: 52,
                      color: "#1c1c1e",
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                    {node.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
            onClick={() => onNext(nodes)}
            style={{
              flex: 1,
              padding: "11px 0",
              background: "#1c1c1e",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Continue
          </button>
        </div>
      </StudioSidebar>

      <div style={{ flex: 1, height: "100vh" }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />
          <Polyline
            positions={path}
            pathOptions={{ color: "#333", weight: 2, opacity: 0.9 }}
          />
          {nodes.map((node, i) => (
            <Marker
              key={node.id}
              position={node.pos}
              icon={makeNodeIcon(i + 1, activeNode === node.id)}
              eventHandlers={{ click: () => selectNode(node.id) }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
