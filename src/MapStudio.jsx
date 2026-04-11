import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { motion } from "framer-motion";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

const apiKey = import.meta.env.VITE_GRAPHHOPPER_API_KEY;

function LocationMarker({ onSelect, active }) {
  useMapEvents({
    click(e) {
      if (active) {
        onSelect([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export function MapStudio({ step, onRouteComplete, onboardingData }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [activeBox, setActiveBox] = useState(null); // 'start' or 'end'

  // Autocomplete and geocoding logic would go here (placeholder for now)

  return (
    <motion.div
      className="flex h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Planning UI */}
      <div className="flex flex-col gap-4 p-8 w-[340px] bg-white/80 z-10 h-full justify-center border-r border-[#EDEDED]">
        <div className="mb-4">
          <div className="font-semibold text-lg mb-2">Plan Your Route</div>
          <div className="text-xs text-gray-500">Click a box, then click the map or type a destination.</div>
        </div>
        <div>
          <label className="block text-xs mb-1 text-gray-600">Start (A)</label>
          <input
            className={`border rounded px-3 py-2 w-full mb-2 focus:outline-none ${activeBox==='start' ? 'border-black' : 'border-[#EDEDED]'}`}
            style={{ fontFamily: 'Inter' }}
            value={start}
            onChange={e => setStart(e.target.value)}
            onFocus={() => setActiveBox('start')}
            placeholder="Type or click on map"
          />
          {startCoords && <div className="text-xs text-gray-400">Lat: {startCoords[0].toFixed(5)}, Lng: {startCoords[1].toFixed(5)}</div>}
        </div>
        <div>
          <label className="block text-xs mb-1 text-gray-600">End (B)</label>
          <input
            className={`border rounded px-3 py-2 w-full mb-2 focus:outline-none ${activeBox==='end' ? 'border-black' : 'border-[#EDEDED]'}`}
            style={{ fontFamily: 'Inter' }}
            value={end}
            onChange={e => setEnd(e.target.value)}
            onFocus={() => setActiveBox('end')}
            placeholder="Type or click on map"
          />
          {endCoords && <div className="text-xs text-gray-400">Lat: {endCoords[0].toFixed(5)}, Lng: {endCoords[1].toFixed(5)}</div>}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            className="px-4 py-2 rounded border border-[#EDEDED] bg-white text-black font-semibold"
            onClick={() => window.location.reload()}
          >Back</button>
          <button
            className="px-4 py-2 rounded bg-black text-white font-semibold"
            disabled={!(startCoords && endCoords)}
            onClick={() => onRouteComplete && onRouteComplete({ start, end, startCoords, endCoords })}
          >Next</button>
        </div>
      </div>
      {/* Map */}
      <div className="flex-1 h-full w-full">
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; <a href='https://carto.com/attributions'>CARTO</a>"
          />
          <LocationMarker
            active={activeBox === 'start'}
            onSelect={coords => {
              setStartCoords(coords);
              setStart(`Lat: ${coords[0].toFixed(5)}, Lng: ${coords[1].toFixed(5)}`);
              setActiveBox(null);
            }}
          />
          <LocationMarker
            active={activeBox === 'end'}
            onSelect={coords => {
              setEndCoords(coords);
              setEnd(`Lat: ${coords[0].toFixed(5)}, Lng: ${coords[1].toFixed(5)}`);
              setActiveBox(null);
            }}
          />
        </MapContainer>
      </div>
    </motion.div>
  );
}
