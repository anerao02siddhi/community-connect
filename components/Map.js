"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// RoutingControl shows route from user location to destination
export function RoutingControl({ destination }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!destination || !map) return;

    let isMounted = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted) return;

        const { latitude, longitude } = position.coords;

        // Clean up previous route
        if (routingRef.current) {
          try {
            map.removeControl(routingRef.current);
          } catch (err) {
            console.warn("Routing control cleanup error:", err);
          }
          routingRef.current = null;
        }

        const control = L.Routing.control({
          waypoints: [
            L.latLng(latitude, longitude),
            L.latLng(destination.lat, destination.lng),
          ],
          routeWhileDragging: false,
          show: true,
          collapsible: true,
          lineOptions: {
            styles: [{ color: "#6FA1EC", weight: 4 }]
          },
        }).addTo(map);

        routingRef.current = control;
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );

    return () => {
      isMounted = false;
      if (routingRef.current) {
        try {
          map.removeControl(routingRef.current);
        } catch (err) {
          console.warn("Routing control cleanup error:", err);
        }
        routingRef.current = null;
      }
    };
  }, [destination, map]);

  return null;
}

// The main Map component
export default function Map({ coordinates }) {
  if (!coordinates) return null;

  return (
    <MapContainer
      center={[coordinates.lat, coordinates.lng]}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <RoutingControl destination={coordinates} />
    </MapContainer>
  );
}
