import { RouteOffset } from "../types/location";

type LatLng = { latitude: number; longitude: number };

function toLocalMeters(base: LatLng, p: LatLng): { x: number; y: number } {
  const kLat = 111_320;
  const kLon = 111_320 * Math.cos((base.latitude * Math.PI) / 180);
  return {
    x: (p.longitude - base.longitude) * kLon,
    y: (p.latitude - base.latitude) * kLat
  };
}

function toLatLng(base: LatLng, xy: { x: number; y: number }): LatLng {
  const kLat = 111_320;
  const kLon = 111_320 * Math.cos((base.latitude * Math.PI) / 180);
  return {
    latitude: base.latitude + xy.y / kLat,
    longitude: base.longitude + xy.x / kLon
  };
}

export function calculateRouteOffset(point: LatLng, route: LatLng[]): RouteOffset | null {
  if (route.length < 2) return null;
  let best: RouteOffset | null = null;

  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i];
    const b = route[i + 1];
    const aM = toLocalMeters(point, a);
    const bM = toLocalMeters(point, b);
    const pM = { x: 0, y: 0 };

    const ab = { x: bM.x - aM.x, y: bM.y - aM.y };
    const ap = { x: pM.x - aM.x, y: pM.y - aM.y };
    const ab2 = ab.x * ab.x + ab.y * ab.y;
    const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / ab2));

    const nearest = { x: aM.x + t * ab.x, y: aM.y + t * ab.y };
    const diff = { x: pM.x - nearest.x, y: pM.y - nearest.y };
    const dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y);

    const cross = ab.x * ap.y - ab.y * ap.x;
    const side = Math.abs(cross) < 0.05 ? "ON_LINE" : cross > 0 ? "LEFT" : "RIGHT";

    const candidate: RouteOffset = {
      distanceMeters: dist,
      side,
      nearestPoint: toLatLng(point, nearest),
      segmentIndex: i
    };

    if (!best || candidate.distanceMeters < best.distanceMeters) best = candidate;
  }

  return best;
}
