import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const blackDot = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='6' fill='black'/%3E%3C/svg%3E",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const whiteDot = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='6' fill='white' stroke='black' stroke-width='2'/%3E%3C/svg%3E",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function PlanningStep({ onNext, onBack }) {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [placing, setPlacing] = useState("start");

  function MapClicker() {
    useMapEvents({
      click(e) {
        if (placing === "start") {
          setStart([e.latlng.lat, e.latlng.lng]);
          setPlacing("end");
        } else if (placing === "end") {
          setEnd([e.latlng.lat, e.latlng.lng]);
          setPlacing(null);
        }
      },
    });
    return null;
  }

  return (
    <div className="flex w-full h-full">
      <div className="flex flex-col gap-6 p-8 w-[340px] bg-white/80 z-10 h-full justify-center border-r border-[#EDEDED]">
        <div className="text-xl font-semibold mb-2">Set Route Destination</div>
        <div className="text-xs text-gray-500 mb-4">Click the map to drop a Start (black) and End (white) point.</div>
        <div className="flex flex-col gap-2">
          <div className="text-xs text-gray-600">Start (A): {start ? `${start[0].toFixed(5)}, ${start[1].toFixed(5)}` : "Not set"}</div>
          <div className="text-xs text-gray-600">End (B): {end ? `${end[0].toFixed(5)}, ${end[1].toFixed(5)}` : "Not set"}</div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            className="px-4 py-2 rounded border border-[#EDEDED] bg-white text-black font-semibold"
            onClick={onBack}
          >Back</button>
          <button
            className="px-4 py-2 rounded bg-black text-white font-semibold"
            disabled={!(start && end)}
            onClick={() => onNext({ start, end })}
          >Generate Route</button>
        </div>
      </div>
      <div className="flex-1 h-full w-full cursor-crosshair">
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
          <MapClicker />
          {start && <Marker position={start} icon={blackDot} />}
          {end && <Marker position={end} icon={whiteDot} />}
        </MapContainer>
      </div>
    </div>
  );
}
