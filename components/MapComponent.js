"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

export default function MapComponent({ issues }) {
  // Fix default marker icons
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[19.076, 72.877]}
      zoom={5}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {issues
        .filter((issue) => issue.location && issue.location.includes(","))
        .map((issue) => {
          const [latStr, lngStr] = issue.location.split(",");
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={issue.id} position={[lat, lng]}>
              <Popup>
                <strong>{issue.title}</strong>
                <br />
                Status: {issue.status}
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
