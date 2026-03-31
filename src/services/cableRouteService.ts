export type RoutePoint = { latitude: number; longitude: number };

type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
  }>;
};

export function loadRouteFromGeoJson(geoJson: GeoJsonFeatureCollection): RoutePoint[] {
  const firstLine = geoJson.features.find((f) => f.geometry.type === "LineString");
  if (!firstLine) return [];
  return firstLine.geometry.coordinates.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
}
