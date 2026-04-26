import { router } from "expo-router";
import { List, LocateFixed, Map } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { NearbyMap } from "../../components/NearbyMap";
import { AppButton } from "../../components/AppButton";
import { CategoryPill } from "../../components/CategoryPill";
import { ItemCard } from "../../components/ItemCard";
import { Screen } from "../../components/Screen";
import { colors, font, radii } from "../../constants/theme";
import { useNearbyItems } from "../../hooks/useNearbyItems";
import { apiBaseUrl, updateUserLocation } from "../../lib/api";
import { defaultLocation, requestCurrentLocation } from "../../lib/location";
import { getSession, updateSession } from "../../lib/session";
import type { CategoryFilter, LendItem, RadiusMiles } from "../../types";

const filters: CategoryFilter[] = ["All", "Tools", "Kitchen", "Outdoor", "Misc"];
const radiusOptions: RadiusMiles[] = [0.5, 1, 2];

export default function HomeFeedScreen() {
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [radiusMiles, setRadiusMiles] = useState<RadiusMiles>(1);
  const [location, setLocation] = useState(defaultLocation);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const { loading, error, refresh, filterItems } = useNearbyItems(location, radiusMiles);

  useEffect(() => {
    getSession().then((session) => {
      if (session?.radiusMiles) {
        setRadiusMiles(session.radiusMiles);
      }

      if (session?.location) {
        setLocation(session.location);
      }
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const visibleItems = useMemo(() => filterItems(category), [category, filterItems]);

  function openItem(item: LendItem) {
    router.push({
      pathname: "/item/[id]",
      params: {
        id: item.id,
        item: JSON.stringify(item)
      }
    });
  }

  async function locateMe() {
    const nextLocation = await requestCurrentLocation();

    if (nextLocation) {
      setLocation(nextLocation);
      await updateSession({ location: nextLocation });

      if (apiBaseUrl) {
        try {
          await updateUserLocation({
            lat: nextLocation.latitude,
            lng: nextLocation.longitude,
            radius_miles: radiusMiles
          });
        } catch {
          // The local location still updates even if the server sync fails.
        }
      }
    }
  }

  async function selectRadius(nextRadius: RadiusMiles) {
    setRadiusMiles(nextRadius);
    await updateSession({ radiusMiles: nextRadius });

    if (apiBaseUrl) {
      try {
        await updateUserLocation({
          lat: location.latitude,
          lng: location.longitude,
          radius_miles: nextRadius
        });
      } catch {
        // Radius changes should remain responsive while the session is revalidated elsewhere.
      }
    }
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>Nearby</Text>
          <Text style={styles.title}>Borrow what you need</Text>
        </View>
        <Pressable
          accessibilityLabel="Toggle map view"
          onPress={() => setViewMode(viewMode === "list" ? "map" : "list")}
          style={styles.iconButton}
        >
          {viewMode === "list" ? (
            <Map color={colors.text} width={21} height={21} />
          ) : (
            <List color={colors.text} width={21} height={21} />
          )}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((filter) => (
          <CategoryPill
            key={filter}
            label={filter}
            selected={category === filter}
            onPress={() => setCategory(filter)}
          />
        ))}
      </ScrollView>

      <View style={styles.radiusRow}>
        {radiusOptions.map((radius) => (
          <Pressable
            key={radius}
            onPress={() => selectRadius(radius)}
            style={[styles.radiusChip, radiusMiles === radius && styles.radiusChipSelected]}
          >
            <Text
              style={[styles.radiusChipText, radiusMiles === radius && styles.radiusChipTextSelected]}
            >
              {radius} mi
            </Text>
          </Pressable>
        ))}
        <Pressable accessibilityLabel="Use current location" onPress={locateMe} style={styles.locateButton}>
          <LocateFixed color={colors.text} width={18} height={18} />
        </Pressable>
      </View>

      {error ? <Text style={styles.notice}>{error}</Text> : null}
    </View>
  );

  if (viewMode === "map") {
    return (
      <Screen>
        {header}
        <NearbyMap
          location={location}
          radiusMiles={radiusMiles}
          items={visibleItems}
          onItemPress={openItem}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => <ItemCard item={item} onPress={() => openItem(item)} />}
        refreshControl={
          <RefreshControl refreshing={loading} tintColor={colors.accent} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <Text style={styles.emptyTitle}>No items in this filter.</Text>
                <AppButton variant="secondary" onPress={() => setCategory("All")}>
                  Clear Filter
                </AppButton>
              </>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 18,
    paddingTop: 8,
    paddingBottom: 18
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: font.bold,
    fontSize: 13,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontFamily: font.extraBold,
    fontSize: 30,
    marginTop: 2
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  filters: {
    gap: 8,
    paddingRight: 20
  },
  radiusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  radiusChip: {
    height: 36,
    minWidth: 66,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  radiusChipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent
  },
  radiusChipText: {
    color: colors.textMuted,
    fontFamily: font.semibold,
    fontSize: 13
  },
  radiusChipTextSelected: {
    color: colors.accent
  },
  locateButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border
  },
  notice: {
    color: colors.warning,
    fontFamily: font.medium,
    fontSize: 12,
    lineHeight: 18
  },
  listContent: {
    paddingBottom: 28
  },
  empty: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: 14
  },
  emptyTitle: {
    color: colors.textMuted,
    fontFamily: font.semibold,
    fontSize: 15
  },
});
