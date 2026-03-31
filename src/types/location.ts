export type FixQuality =
  | "NO_FIX"
  | "GNSS"
  | "DGPS"
  | "RTK_FLOAT"
  | "RTK_FIX"
  | "UNKNOWN";

export interface RtkLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  horizontalAccuracyM: number;
  satellites: number;
  fixQuality: FixQuality;
  source: "RTK_EXTERNAL";
  timestamp: number;
}

export interface InternalLocation {
  latitude: number;
  longitude: number;
  horizontalAccuracyM: number;
  timestamp: number;
}

export interface RouteOffset {
  distanceMeters: number;
  side: "LEFT" | "RIGHT" | "ON_LINE";
  nearestPoint: {
    latitude: number;
    longitude: number;
  };
  segmentIndex: number;
}
