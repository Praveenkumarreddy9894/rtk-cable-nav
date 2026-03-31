import { NativeModules, Platform } from "react-native";
import { RtkLocation } from "../types/location";

type NativeExternalRtkModule = {
  pushRtkLocationToAndroid: (location: {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
    timestamp: number;
  }) => void;
};

const nativeModule: NativeExternalRtkModule | undefined =
  Platform.OS === "android" ? NativeModules.ExternalRtkLocationModule : undefined;

export function pushRtkLocationToAndroidSystem(location: RtkLocation): void {
  if (!nativeModule) return;
  nativeModule.pushRtkLocationToAndroid({
    latitude: location.latitude,
    longitude: location.longitude,
    altitude: location.altitude,
    accuracy: location.horizontalAccuracyM,
    timestamp: location.timestamp
  });
}
