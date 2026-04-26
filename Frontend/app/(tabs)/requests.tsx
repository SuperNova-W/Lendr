import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";

import { RequestCard } from "../../components/RequestCard";
import { Screen } from "../../components/Screen";
import { colors, font } from "../../constants/theme";
import { demoRequests } from "../../data/demo";
import { apiBaseUrl, getMyRequests } from "../../lib/api";
import type { BorrowRequest } from "../../types";

export default function RequestsScreen() {
  const [requests, setRequests] = useState<BorrowRequest[]>(
    apiBaseUrl ? [] : demoRequests.filter((r) => r.borrowerName === "You")
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiBaseUrl) return;

    let mounted = true;
    setLoading(true);

    getMyRequests()
      .then((rows) => {
        if (mounted) setRequests(rows);
      })
      .catch(() => {
        if (mounted) {
          setRequests([]);
          Alert.alert("Could not load requests", "Sign in again if your session has expired.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
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
        data={requests}
        keyExtractor={(request) => request.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Borrower view</Text>
            <Text style={styles.title}>Requests</Text>
          </View>
        }
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onReturn={() =>
              router.push({
                pathname: "/return/[id]",
                params: {
                  id: item.id,
                  itemName: item.itemName
                }
              })
            }
          />
        )}
        ListEmptyComponent={<Text style={styles.muted}>Your borrow requests will show here.</Text>}
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
    gap: 2,
    paddingTop: 8,
    paddingBottom: 18
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
    fontSize: 31
  },
  muted: {
    color: colors.textMuted,
    fontFamily: font.regular,
    fontSize: 14
  }
});
