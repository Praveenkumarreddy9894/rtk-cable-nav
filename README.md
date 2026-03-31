# RTK Cable Navigation (React Native)

This project is a modular React Native implementation that:

- Connects to an external RTK GNSS stream (Bluetooth/USB/NTRIP transport abstraction).
- Parses NMEA (`$GNGGA`, `$GNRMC`) in real time.
- Prioritizes RTK external coordinates only (no automatic fallback to phone GPS).
- Stabilizes positions using smoothing + stationary anchor behavior.
- Loads underground cable route geometry (GeoJSON LineString).
- Computes offset distance and left/right guidance from route alignment.
- Displays route + rover + nearest point on map.

## Architecture

- `src/services/nmeaParser.ts`: RTK sentence parser and fix extraction.
- `src/services/rtkConnectionManager.ts`: transport manager and stale-signal monitoring.
- `src/services/stabilizer.ts`: moving-average + stationary jitter suppression.
- `src/services/navigationService.ts`: nearest segment and left/right offset math.
- `src/services/cableRouteService.ts`: GeoJSON line loader.
- `src/hooks/useRtkNavigation.ts`: end-to-end RTK priority pipeline.
- `src/components/MapScreen.tsx`: map UI and visualization.
- `android/.../ExternalRtkLocationModule.kt`: push RTK to Android location layer.

## RTK Priority Model

The app never switches to internal GPS automatically.  
If RTK stream is stale or fix quality degrades, the app shows warnings and keeps external-source-only behavior.

## Wiring Real Inputs

1. Bluetooth (BLE):
   - Subscribe to NMEA characteristic notifications.
   - Feed each line into `manager.ingestRawNmea(line)`.
2. USB Serial:
   - Read serial line stream from USB host service.
   - Feed lines into the same parser pipeline.
3. NTRIP:
   - Open TCP socket to caster/mountpoint.
   - Decode incoming stream into position output sentences and ingest.

## Android Integration Notes

- Register `ExternalRtkLocationPackage` in your Android app package list.
- Grant and enable mock location capability for field profile builds if you want to feed Android `LocationManager` test provider.
- If enterprise policy disallows mock providers, keep RTK as app-local authoritative location and avoid Android provider injection.

## Run

```bash
npm install
npm run android
```

Replace demo NMEA interval in `useRtkNavigation.ts` with real RTK input transport events.
