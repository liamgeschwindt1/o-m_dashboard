import { useMapEvents } from "react-leaflet";

export const TILE_LAYERS = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/'>CARTO</a>",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/'>CARTO</a>",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
  },
};

const BUTTONS = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "satellite", label: "SAT" },
];

export default function MapLayerControl({ active, onChange }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        right: 16,
        zIndex: 500,
        display: "flex",
        gap: 4,
        background: "rgba(3,17,25,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "0.5px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "4px 5px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.45)",
      }}
    >
      {BUTTONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              padding: "5px 10px",
              borderRadius: 5,
              border: "none",
              background: isActive ? "rgba(1,180,175,0.2)" : "transparent",
              color: isActive ? "#01B4AF" : "rgba(247,247,247,0.5)",
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.04em",
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease",
              outline: isActive ? "0.5px solid rgba(1,180,175,0.45)" : "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function MapViewportTracker({ basemap, onChange }) {
  useMapEvents({
    moveend(event) {
      const map = event.target;
      const center = map.getCenter();
      onChange({
        basemap,
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      });
    },
    zoomend(event) {
      const map = event.target;
      const center = map.getCenter();
      onChange({
        basemap,
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      });
    },
  });

  return null;
}
