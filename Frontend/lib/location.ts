import * as Location from "expo-location";

import type { Coordinates } from "../types";

export const defaultLocation: Coordinates = {
  latitude: 40.7282,
  longitude: -73.9848
};

export async function requestCurrentLocation(): Promise<Coordinates | null> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  };
}
