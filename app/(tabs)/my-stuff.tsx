import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Switch, Text, View } from "react-native";

import { AppButton } from "../../components/AppButton";
import { RequestCard } from "../../components/RequestCard";
import { Screen } from "../../components/Screen";
import { colors, font, radii } from "../../constants/theme";
import { demoProfile } from "../../data/demo";
import { apiBaseUrl, getUserProfile, toggleItemAvailability, updateBorrowRequestStatus } from "../../lib/api";
import { getSession } from "../../lib/session";
import type { BorrowRequest, LendItem, UserProfile } from "../../types";

export default function MyStuffScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(apiBaseUrl ? null : demoProfile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!apiBaseUrl) {
        return;
      }

      setLoading(true);

      try {
        const session = await getSession();
        const nextProfile = await getUserProfile(session?.userId ?? "me");

        if (mounted) {
          setProfile(nextProfile);
        }
      } catch {
        if (mounted) {
          setProfile(demoProfile);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  async function toggleListing(item: LendItem) {
    if (!profile) {
      return;
    }

    const nextAvailable = !item.available;
    setProfile({
      ...profile,
      listings: profile.listings.map((listing) =>
        listing.id === item.id ? { ...listing, available: nextAvailable } : listing
      )
    });

    if (apiBaseUrl) {
      try {
        await toggleItemAvailability(item.id, nextAvailable);
      } catch {
        Alert.alert("Could not update item", "The backend did not accept the availability change.");
      }
    }
  }

  async function updateRequest(request: BorrowRequest, status: "approved" | "declined") {
    if (!profile) {
      return;
    }

    setProfile({
      ...profile,
      incomingRequests: profile.incomingRequests.map((incoming) =>
        incoming.id === request.id ? { ...incoming, status } : incoming
      )
    });

    if (apiBaseUrl) {
      try {
        await updateBorrowRequestStatus(request.id, status);
      } catch {
        Alert.alert("Could not update request", "The request status did not save on the backend.");
      }
    }
  }

  if (!profile && loading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={profile?.listings ?? []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.eyebrow}>Lender view</Text>
                <Text style={styles.title}>My Stuff</Text>
              </View>
              <AppButton icon={Plus} onPress={() => router.push("/add-item")}>
                Add
              </AppButton>
            </View>

            <Text style={styles.sectionTitle}>Incoming Requests</Text>
            {(profile?.incomingRequests ?? []).length === 0 ? (
              <Text style={styles.muted}>No requests yet.</Text>
            ) : (
              profile?.incomingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  ownerMode
                  onApprove={() => updateRequest(request, "approved")}
                  onDecline={() => updateRequest(request, "declined")}
                />
              ))
            )}

            <Text style={styles.sectionTitle}>Listings</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.listingCard}>
            <Image source={{ uri: item.photoUrl }} style={styles.listingImage} />
            <View style={styles.listingBody}>
              <View style={styles.listingCopy}>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.muted} numberOfLines={1}>
                  {item.category} · {item.maxBorrowDays} day max
                </Text>
              </View>
              <Switch
                value={item.available}
                onValueChange={() => toggleListing(item)}
                trackColor={{ false: colors.surfaceSoft, true: colors.accentSoft }}
                thumbColor={item.available ? colors.accent : colors.textDim}
              />
            </View>
          </View>
        )}
        contentContainerStyle={styles.content}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    paddingBottom: 28
  },
  header: {
    gap: 18,
    paddingTop: 8
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
    fontSize: 31,
    marginTop: 2
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 18,
    marginTop: 8
  },
  muted: {
    color: colors.textMuted,
    fontFamily: font.regular,
    fontSize: 14
  },
  listingCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 10,
    marginBottom: 14
  },
  listingImage: {
    width: 82,
    height: 82,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft
  },
  listingBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  listingCopy: {
    flex: 1,
    gap: 4
  },
  listingTitle: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 16
  }
});
