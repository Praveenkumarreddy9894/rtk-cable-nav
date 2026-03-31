import { RtkLocation } from "../types/location";

function toMeters(latDelta: number, lonDelta: number, lat: number): number {
  const kLat = 111_320;
  const kLon = 111_320 * Math.cos((lat * Math.PI) / 180);
  return Math.sqrt((latDelta * kLat) ** 2 + (lonDelta * kLon) ** 2);
}

export class PositionStabilizer {
  private history: RtkLocation[] = [];
  private stationaryAnchor: RtkLocation | null = null;

  constructor(
    private readonly windowSize = 5,
    private readonly stationaryThresholdM = 0.15
  ) {}

  apply(point: RtkLocation): RtkLocation {
    this.history.push(point);
    if (this.history.length > this.windowSize) this.history.shift();

    const avg = this.average(this.history);
    const delta = toMeters(
      point.latitude - avg.latitude,
      point.longitude - avg.longitude,
      point.latitude
    );

    if (delta <= this.stationaryThresholdM) {
      if (!this.stationaryAnchor) this.stationaryAnchor = avg;
      return { ...avg, latitude: this.stationaryAnchor.latitude, longitude: this.stationaryAnchor.longitude };
    }

    this.stationaryAnchor = null;
    return avg;
  }

  private average(samples: RtkLocation[]): RtkLocation {
    const acc = samples.reduce(
      (a, s) => {
        a.latitude += s.latitude;
        a.longitude += s.longitude;
        a.altitude += s.altitude;
        a.horizontalAccuracyM += s.horizontalAccuracyM;
        a.satellites += s.satellites;
        return a;
      },
      { latitude: 0, longitude: 0, altitude: 0, horizontalAccuracyM: 0, satellites: 0 }
    );

    const n = samples.length || 1;
    const latest = samples[samples.length - 1];
    return {
      latitude: acc.latitude / n,
      longitude: acc.longitude / n,
      altitude: acc.altitude / n,
      horizontalAccuracyM: acc.horizontalAccuracyM / n,
      satellites: Math.round(acc.satellites / n),
      fixQuality: latest.fixQuality,
      source: "RTK_EXTERNAL",
      timestamp: latest.timestamp
    };
  }
}
