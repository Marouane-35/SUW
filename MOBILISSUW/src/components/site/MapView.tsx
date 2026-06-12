import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet + bundlers)
import icon from "leaflet/dist/images/marker-icon.png";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: icon2x,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  origin?: { lat: number; lng: number; label: string };
  destination?: { lat: number; lng: number; label: string };
  route?: [number, number][];
  className?: string;
}

export default function MapView({ origin, destination, route, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView([48.8566, 2.3522], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const points: L.LatLngExpression[] = [];
    if (origin) {
      L.marker([origin.lat, origin.lng]).bindPopup(`<b>Départ</b><br/>${origin.label}`).addTo(layer);
      points.push([origin.lat, origin.lng]);
    }
    if (destination) {
      L.marker([destination.lat, destination.lng]).bindPopup(`<b>Arrivée</b><br/>${destination.label}`).addTo(layer);
      points.push([destination.lat, destination.lng]);
    }
    if (route && route.length > 1) {
      L.polyline(route, { color: "#22e07a", weight: 6, opacity: 0.9 }).addTo(layer);
      map.fitBounds(L.latLngBounds(route), { padding: [40, 40] });
    } else if (points.length === 2) {
      map.fitBounds(L.latLngBounds(points as L.LatLngTuple[]), { padding: [60, 60] });
    } else if (points.length === 1) {
      map.setView(points[0] as L.LatLngTuple, 14);
    }
  }, [origin, destination, route]);

  return <div ref={containerRef} className={className} style={{ minHeight: 420 }} />;
}
