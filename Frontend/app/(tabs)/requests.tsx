import { router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { RequestCard } from "../../components/RequestCard";
import { Screen } from "../../components/Screen";
import { colors, font } from "../../constants/theme";
import { demoRequests } from "../../data/demo";

export default function RequestsScreen() {
  const borrowerRequests = demoRequests.filter((request) => request.borrowerName === "You");

  return (
    <Screen>
      <FlatList
        data={borrowerRequests}
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
