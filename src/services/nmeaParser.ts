import { FixQuality, RtkLocation } from "../types/location";

interface PartialNmeaState {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  satellites?: number;
  fixQuality?: FixQuality;
  timestamp?: number;
}

function parseCoordinate(raw: string, hemi: string): number | null {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot < 2) return null;
  const degLen = dot > 4 ? 3 : 2;
  const deg = Number(raw.slice(0, degLen));
  const min = Number(raw.slice(degLen));
  if (Number.isNaN(deg) || Number.isNaN(min)) return null;
  let coord = deg + min / 60;
  if (hemi === "S" || hemi === "W") coord *= -1;
  return coord;
}

function parseFixQuality(code: string): FixQuality {
  switch (code) {
    case "0":
      return "NO_FIX";
    case "1":
      return "GNSS";
    case "2":
      return "DGPS";
    case "4":
      return "RTK_FIX";
    case "5":
      return "RTK_FLOAT";
    default:
      return "UNKNOWN";
  }
}

export class NmeaParser {
  private state: PartialNmeaState = {};

  parseLine(line: string): RtkLocation | null {
    const trimmed = line.trim();
    if (!trimmed.startsWith("$") || trimmed.length < 6) return null;
    const sentence = trimmed.split("*")[0];
    const parts = sentence.split(",");
    const id = parts[0];

    if (id === "$GNGGA" || id === "$GPGGA") {
      this.parseGga(parts);
    } else if (id === "$GNRMC" || id === "$GPRMC") {
      this.parseRmc(parts);
    }

    if (
      this.state.latitude == null ||
      this.state.longitude == null ||
      this.state.altitude == null ||
      this.state.satellites == null ||
      this.state.fixQuality == null
    ) {
      return null;
    }

    return {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      altitude: this.state.altitude,
      satellites: this.state.satellites,
      fixQuality: this.state.fixQuality,
      horizontalAccuracyM:
        this.state.fixQuality === "RTK_FIX"
          ? 0.02
          : this.state.fixQuality === "RTK_FLOAT"
            ? 0.25
            : 1.5,
      source: "RTK_EXTERNAL",
      timestamp: this.state.timestamp ?? Date.now()
    };
  }

  private parseGga(parts: string[]): void {
    const lat = parseCoordinate(parts[2] ?? "", parts[3] ?? "");
    const lon = parseCoordinate(parts[4] ?? "", parts[5] ?? "");
    const fixQuality = parseFixQuality(parts[6] ?? "");
    const satellites = Number(parts[7] ?? "0");
    const altitude = Number(parts[9] ?? "0");

    if (lat != null) this.state.latitude = lat;
    if (lon != null) this.state.longitude = lon;
    this.state.fixQuality = fixQuality;
    this.state.satellites = Number.isNaN(satellites) ? 0 : satellites;
    this.state.altitude = Number.isNaN(altitude) ? 0 : altitude;
    this.state.timestamp = Date.now();
  }

  private parseRmc(parts: string[]): void {
    const lat = parseCoordinate(parts[3] ?? "", parts[4] ?? "");
    const lon = parseCoordinate(parts[5] ?? "", parts[6] ?? "");
    if (lat != null) this.state.latitude = lat;
    if (lon != null) this.state.longitude = lon;
    this.state.timestamp = Date.now();
  }
}
