import { router } from "expo-router";
import { LogOut, MapPin, PackageCheck, Plus, Star } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";

import { AppButton } from "../../components/AppButton";
import { RequestCard } from "../../components/RequestCard";
import { Screen } from "../../components/Screen";
import { colors, font, radii } from "../../constants/theme";
import { demoProfile } from "../../data/demo";
import { apiBaseUrl, getUserProfile, toggleItemAvailability, updateBorrowRequestStatus } from "../../lib/api";
import { clearSession } from "../../lib/session";
import type { BorrowRequest, LendItem, UserProfile } from "../../types";

export default function MyStuffScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(apiBaseUrl ? null : demoProfile);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!apiBaseUrl) {
      return;
    }

    setLoading(true);

    try {
      setProfile(await getUserProfile());
    } catch {
      setProfile(null);
      Alert.alert("Could not load profile", "Sign in again if your session has expired.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function signOut() {
    await clearSession();
    router.replace("/onboarding");
  }

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

  const profileInitial = (profile?.firstName ?? "U").trim().charAt(0).toUpperCase();

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
        refreshControl={
          <RefreshControl refreshing={loading} tintColor={colors.accent} onRefresh={loadProfile} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.eyebrow}>Account</Text>
                <Text style={styles.title}>Profile</Text>
              </View>
              <AppButton variant="secondary" icon={LogOut} onPress={signOut}>
                Sign Out
              </AppButton>
            </View>

            <View style={styles.profileCard}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{profileInitial}</Text>
                </View>
              )}
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{profile?.firstName ?? "You"}</Text>
                <Text style={styles.muted}>Google account</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCell}>
                <Star color={colors.accent} width={18} height={18} />
                <Text style={styles.statValue}>{(profile?.rating ?? 0).toFixed(1)}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statCell}>
                <PackageCheck color={colors.accent} width={18} height={18} />
                <Text style={styles.statValue}>{profile?.totalLends ?? 0}</Text>
                <Text style={styles.statLabel}>Lends</Text>
              </View>
              <View style={styles.statCell}>
                <MapPin color={colors.accent} width={18} height={18} />
                <Text style={styles.statValue}>{profile?.radiusMiles ?? 1} mi</Text>
                <Text style={styles.statLabel}>Radius</Text>
              </View>
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

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Listings</Text>
              <AppButton icon={Plus} onPress={() => router.push("/add-item")}>
                Add
              </AppButton>
            </View>
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
        ListEmptyComponent={<Text style={styles.muted}>Your listed items will show here.</Text>}
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginTop: 8
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent
  },
  avatarInitial: {
    color: colors.background,
    fontFamily: font.extraBold,
    fontSize: 26
  },
  profileCopy: {
    flex: 1,
    gap: 4
  },
  profileName: {
    color: colors.text,
    fontFamily: font.extraBold,
    fontSize: 22
  },
  statsRow: {
    flexDirection: "row",
    gap: 10
  },
  statCell: {
    flex: 1,
    minHeight: 90,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 8
  },
  statValue: {
    color: colors.text,
    fontFamily: font.extraBold,
    fontSize: 18
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: font.medium,
    fontSize: 12
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
