import { MapContainer, TileLayer } from "react-leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

const apiKey = import.meta.env.VITE_GRAPHHOPPER_API_KEY;

export function MapStudio() {
  return (
    <motion.div
      className="flex-1 h-screen w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url={`https://graphhopper.com/api/1/map?key=${apiKey}`}
          attribution="&copy; GraphHopper & contributors"
        />
      </MapContainer>
    </motion.div>
  );
}
