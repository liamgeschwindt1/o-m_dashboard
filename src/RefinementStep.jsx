import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StudioSidebar from "./StudioSidebar";

function makeNodeIcon(active) {
  if (active) {
    return L.divIcon({
      html: `<div style="width:10px;height:10px;border-radius:50%;background:#F7F7F7;box-shadow:0 0 0 2.5px #FFB100, 0 0 0 4px rgba(255,177,0,0.25);"></div>`,
      className: "",
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });
  }
  return L.divIcon({
    html: `<div style="width:6px;height:6px;border-radius:50%;background:#F7F7F7;opacity:0.75;"></div>`,
    className: "",
    iconSize: [6, 6],
    iconAnchor: [3, 3],
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

  function injectNodeOnPolyline(e) {
    const pos = [e.latlng.lat, e.latlng.lng];
    const newNode = {
      id: Date.now(),
      pos,
      text: "Custom instruction",
    };
    setNodes((ns) => [...ns, newNode]);
    setActiveNode(newNode.id);
  }

  const mapCenter = path[Math.floor(path.length / 2)] || [37.7749, -122.4194];

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <StudioSidebar currentStep={currentStep}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#F7F7F7" }}>
            Instruction Refinement
          </div>
          <div style={{ fontSize: 12, color: "rgba(247,247,247,0.55)", lineHeight: 1.6 }}>
            Click a numbered node on the map to select and edit its instruction below.
          </div>
        </div>

        {/* Scrollable instruction timeline */}
        <div
          ref={listRef}
          style={{ flex: 1, overflowY: "auto", marginBottom: 16, paddingRight: 4 }}
        >
          {nodes.length === 0 && (
            <div style={{ fontSize: 12, color: "rgba(247,247,247,0.35)" }}>
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
                  marginBottom: 8,
                  padding: "10px 12px",
                  borderRadius: 4,
                  border: isActive ? "1px solid rgba(255,177,0,0.45)" : "1px solid rgba(255,255,255,0.10)",
                  background: isActive ? "rgba(255,177,0,0.05)" : "#1B354F",
                  cursor: "pointer",
                  boxShadow: "none",
                  transition: "border-color 150ms ease, background 150ms ease",
                }}
              >
                {/* Node number + label row */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isActive ? "#FFB100" : "rgba(247,247,247,0.4)",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }} />
                  <div style={{ fontSize: 10, color: isActive ? "#FFB100" : "rgba(247,247,247,0.35)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Node {i + 1}
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
                      lineHeight: 1.65,
                      minHeight: 52,
                      color: "#F7F7F7",
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ fontSize: 12, color: "rgba(247,247,247,0.65)", lineHeight: 1.65 }}>
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
            onClick={() => onNext(nodes)}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "transparent",
              color: "#01B4AF",
              border: "0.5px solid rgba(1,180,175,0.5)",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              transition: "border-color 200ms ease",
            }}
          >
            Continue →
          </button>
        </div>
      </StudioSidebar>

      <div style={{ position: "absolute", inset: 0 }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />
          <Polyline
            positions={path}
            pathOptions={{ color: "#01B4AF", weight: 1.5, opacity: 1 }}
            eventHandlers={{ click: injectNodeOnPolyline }}
          />
          {nodes.map((node, i) => (
            <Marker
              key={node.id}
              position={node.pos}
              icon={makeNodeIcon(activeNode === node.id)}
              eventHandlers={{ click: () => selectNode(node.id) }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
