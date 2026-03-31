import React, { useMemo } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRtkNavigation } from "../hooks/useRtkNavigation";
import { loadRouteFromGeoJson } from "../services/cableRouteService";
import { StatusBanner } from "./StatusBanner";

const demoGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [80.2679, 13.0519],
          [80.2689, 13.0525],
          [80.2698, 13.0530]
        ]
      }
    }
  ]
} as const;

export function MapScreen() {
  const route = useMemo(() => loadRouteFromGeoJson(demoGeoJson), []);
  const { location, status, warning, offset } = useRtkNavigation(route);

  const fixText = location
    ? `${location.fixQuality} | sats ${location.satellites} | acc ${location.horizontalAccuracyM.toFixed(2)}m`
    : "No RTK location yet";
  const offsetText = offset
    ? `${offset.distanceMeters.toFixed(2)}m ${offset.side}`
    : "Not available";

  return (
    <SafeAreaView style={styles.root}>
      <StatusBanner status={status} warning={warning} fixText={fixText} offsetText={offsetText} />
      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude: route[0]?.latitude ?? 13.052,
          longitude: route[0]?.longitude ?? 80.268,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003
        }}
      >
        <Polyline coordinates={route} strokeColor="#2e86ff" strokeWidth={4} />
        {location ? (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="RTK Rover"
            description={`${location.fixQuality} ${location.horizontalAccuracyM.toFixed(2)}m`}
            pinColor={location.fixQuality === "RTK_FIX" ? "green" : "orange"}
          />
        ) : null}
        {offset ? (
          <Marker
            coordinate={offset.nearestPoint}
            title="Nearest cable alignment"
            description={`${offset.distanceMeters.toFixed(2)}m ${offset.side}`}
            pinColor="blue"
          />
        ) : null}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { flex: 1 }
});
