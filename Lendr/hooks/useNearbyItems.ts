import { useCallback, useMemo, useState } from "react";

import { demoItems } from "../data/demo";
import { apiBaseUrl, getNearbyItems } from "../lib/api";
import type { CategoryFilter, Coordinates, LendItem, RadiusMiles } from "../types";

export function useNearbyItems(location: Coordinates, radiusMiles: RadiusMiles) {
  const [items, setItems] = useState<LendItem[]>(apiBaseUrl ? [] : demoItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(apiBaseUrl ? null : "Demo data");

  const refresh = useCallback(async () => {
    if (!apiBaseUrl) {
      setItems(demoItems);
      setError("Set EXPO_PUBLIC_API_BASE_URL to load real nearby items.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setItems(await getNearbyItems({ ...location, radius: radiusMiles }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load nearby items.");
    } finally {
      setLoading(false);
    }
  }, [location, radiusMiles]);

  const filterItems = useCallback(
    (category: CategoryFilter) => {
      return category === "All" ? items : items.filter((item) => item.category === category);
    },
    [items]
  );

  return useMemo(
    () => ({
      items,
      loading,
      error,
      refresh,
      filterItems
    }),
    [error, filterItems, items, loading, refresh]
  );
}
