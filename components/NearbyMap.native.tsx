import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { colors } from "../constants/theme";
import type { Coordinates, LendItem } from "../types";

type Props = {
  location: Coordinates;
  radiusMiles: number;
  items: LendItem[];
  onItemPress: (item: LendItem) => void;
};

export function NearbyMap({ location, radiusMiles, items, onItemPress }: Props) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1, minHeight: 420, borderRadius: 14, overflow: "hidden" }}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.025 * radiusMiles,
        longitudeDelta: 0.025 * radiusMiles
      }}
      showsUserLocation
    >
      {items.map((item, index) => (
        <Marker
          key={item.id}
          coordinate={{
            latitude: item.latitude ?? location.latitude + 0.004 * (index + 1),
            longitude: item.longitude ?? location.longitude - 0.004 * (index + 1)
          }}
          title={item.name}
          description={`${item.distanceMiles.toFixed(1)} mi away`}
          pinColor={item.available ? colors.accent : colors.greyDot}
          onCalloutPress={() => onItemPress(item)}
        />
      ))}
    </MapView>
  );
}
