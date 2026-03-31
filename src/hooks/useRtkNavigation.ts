import { useEffect, useMemo, useState } from "react";
import { RtkConnectionManager } from "../services/rtkConnectionManager";
import { PositionStabilizer } from "../services/stabilizer";
import { calculateRouteOffset } from "../services/navigationService";
import { pushRtkLocationToAndroidSystem } from "../services/externalRtkLocationAndroid";
import { RoutePoint } from "../services/cableRouteService";
import { RouteOffset, RtkLocation } from "../types/location";

export function useRtkNavigation(route: RoutePoint[]) {
  const [location, setLocation] = useState<RtkLocation | null>(null);
  const [warning, setWarning] = useState<string | null>("Waiting for RTK lock...");
  const [status, setStatus] = useState<string>("Idle");
  const [offset, setOffset] = useState<RouteOffset | null>(null);
  const stabilizer = useMemo(() => new PositionStabilizer(6, 0.12), []);

  useEffect(() => {
    const manager = new RtkConnectionManager(
      (raw) => {
        const filtered = stabilizer.apply(raw);
        setLocation(filtered);
        pushRtkLocationToAndroidSystem(filtered);

        const off = calculateRouteOffset(
          { latitude: filtered.latitude, longitude: filtered.longitude },
          route
        );
        setOffset(off);

        if (filtered.fixQuality === "RTK_FIX" || filtered.fixQuality === "RTK_FLOAT") {
          setWarning(null);
        } else {
          setWarning(`External receiver fix quality: ${filtered.fixQuality}`);
        }
      },
      (s) => {
        setStatus(s);
        if (s.includes("stale")) {
          setWarning("RTK signal lost. Internal GPS fallback is disabled by design.");
        }
      }
    );

    void manager.connect("BLUETOOTH");

    // Example NMEA feed. Replace with live stream from Bluetooth/USB/NTRIP.
    const demo = setInterval(() => {
      manager.ingestRawNmea("$GNGGA,123519,1303.1234,N,08016.1122,E,4,18,0.8,52.3,M,0.0,M,,*47");
      manager.ingestRawNmea("$GNRMC,123519,A,1303.1234,N,08016.1122,E,0.4,84.4,230394,,,A*68");
    }, 500);

    return () => {
      clearInterval(demo);
      manager.disconnect();
    };
  }, [route, stabilizer]);

  return { location, warning, status, offset };
}
