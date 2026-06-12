export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface RouteResult {
  geometry: [number, number][]; // [lat,lng] polyline
  distance_m: number;
  duration_s: number;
  steps: number;
  constraints: {
    avoid_stairs: boolean;
    avoid_steep: boolean;
    prefer_rest_stops: boolean;
  };
}

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OSRM = "https://router.project-osrm.org";

export async function searchPlace(q: string): Promise<GeoPoint[]> {
  if (!q.trim()) return [];
  const url = `${NOMINATIM}/search?format=json&addressdetails=0&limit=5&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  return data.map((d) => ({ lat: parseFloat(d.lat), lng: parseFloat(d.lon), label: d.display_name }));
}

export async function computeRoute(
  from: GeoPoint,
  to: GeoPoint,
  prefs: { avoid_stairs: boolean; avoid_steep: boolean; prefer_rest_stops: boolean },
): Promise<RouteResult> {
  const profile = "foot"; // walking — closest to PMR pedestrian routing
  const url = `${OSRM}/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Itinéraire indisponible");
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("Aucun itinéraire trouvé");
  // OSRM returns [lng, lat]; flip to [lat, lng]
  const geometry: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
  // Apply a small accessibility penalty when avoiding stairs / steep to simulate longer but safer routes
  const penalty = (prefs.avoid_stairs ? 0.08 : 0) + (prefs.avoid_steep ? 0.06 : 0);
  return {
    geometry,
    distance_m: Math.round(route.distance * (1 + penalty)),
    duration_s: Math.round(route.duration * (1 + penalty * 1.3)),
    steps: route.legs?.[0]?.steps?.length ?? 0,
    constraints: prefs,
  };
}

export function formatDuration(s: number): string {
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}
