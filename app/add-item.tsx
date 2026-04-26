import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera, Image as ImageIcon } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { AppButton } from "../components/AppButton";
import { CategoryPill } from "../components/CategoryPill";
import { Screen } from "../components/Screen";
import { colors, font, radii } from "../constants/theme";
import { apiBaseUrl, createItem } from "../lib/api";
import type { Category } from "../types";

const categories: Category[] = ["Tools", "Kitchen", "Outdoor", "Misc"];

export default function AddItemScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Tools");
  const [maxBorrowDays, setMaxBorrowDays] = useState("3");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickPhoto(source: "camera" | "library") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Photo access is needed to add an item.");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.86
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.86
          });

    if (!result.canceled) {
      setPhotoUri(result.assets[0]?.uri ?? null);
    }
  }

  async function submit() {
    setError(null);

    if (!name.trim() || !photoUri) {
      setError("Add a photo and item name.");
      return;
    }

    const maxDays = Number(maxBorrowDays);
    if (!Number.isFinite(maxDays) || maxDays < 1) {
      setError("Max borrow days must be at least 1.");
      return;
    }

    setSubmitting(true);

    try {
      if (apiBaseUrl) {
        await createItem({
          name: name.trim(),
          category,
          maxBorrowDays: maxDays,
          photoUri
        });
      }

      router.replace("/(tabs)/my-stuff");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Pressable onPress={() => pickPhoto("library")} style={styles.photoPicker}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoEmpty}>
                <ImageIcon color={colors.textMuted} width={32} height={32} />
                <Text style={styles.photoText}>Add item photo</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.photoActions}>
            <AppButton variant="secondary" icon={ImageIcon} onPress={() => pickPhoto("library")}>
              Library
            </AppButton>
            <AppButton variant="secondary" icon={Camera} onPress={() => pickPhoto("camera")}>
              Camera
            </AppButton>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Item name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Cordless drill"
              placeholderTextColor={colors.textDim}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {categories.map((option) => (
                <CategoryPill
                  key={option}
                  label={option}
                  selected={category === option}
                  onPress={() => setCategory(option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Max borrow days</Text>
            <TextInput
              value={maxBorrowDays}
              onChangeText={setMaxBorrowDays}
              keyboardType="number-pad"
              placeholder="3"
              placeholderTextColor={colors.textDim}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AppButton loading={submitting} onPress={submit}>
            List Item
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  content: {
    paddingTop: 12,
    paddingBottom: 32,
    gap: 18
  },
  photoPicker: {
    height: 270,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  photo: {
    width: "100%",
    height: "100%"
  },
  photoEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  photoText: {
    color: colors.textMuted,
    fontFamily: font.semibold,
    fontSize: 15
  },
  photoActions: {
    flexDirection: "row",
    gap: 12
  },
  field: {
    gap: 8
  },
  label: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 14
  },
  input: {
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 14,
    fontFamily: font.medium,
    fontSize: 16
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  error: {
    color: colors.danger,
    fontFamily: font.semibold,
    fontSize: 13
  }
});
