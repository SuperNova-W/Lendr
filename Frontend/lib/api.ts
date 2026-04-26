import Constants from "expo-constants";
import axios from "axios";

import type {
  BorrowRequest,
  Category,
  Coordinates,
  LendItem,
  RadiusMiles,
  RequestStatus,
  Session,
  UserProfile
} from "../types";
import { getSession } from "./session";

export const apiBaseUrl =
  Constants.expoConfig?.extra?.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

const client = axios.create({
  baseURL: apiBaseUrl || undefined,
  timeout: 12000
});

async function authHeaders() {
  const session = await getSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : undefined;
}

async function requiredAuthHeaders() {
  const headers = await authHeaders();
  if (!headers) {
    throw new Error("Sign in with Google to continue.");
  }
  return headers;
}

function normalizeRadiusMiles(value: unknown): RadiusMiles {
  const numeric = Number(value);
  if (numeric === 0.5 || numeric === 1 || numeric === 2) {
    return numeric;
  }
  return 1;
}

function normalizeUserSession(raw: any, token?: string): Session {
  return {
    userId: String(raw.id),
    firstName: String(raw.name ?? raw.firstName ?? "User"),
    avatarUrl: raw.photo_url ?? raw.avatarUrl,
    radiusMiles: normalizeRadiusMiles(raw.radius_miles ?? raw.radiusMiles),
    token
  };
}

function asCategory(value: unknown): Category {
  if (value === "Tools" || value === "Kitchen" || value === "Outdoor" || value === "Misc") {
    return value;
  }
  const lower = String(value).toLowerCase();
  if (lower === "kitchen") return "Kitchen";
  if (lower === "outdoor") return "Outdoor";
  if (lower === "misc") return "Misc";
  return "Tools";
}

export function normalizeItem(raw: any): LendItem {
  const owner = raw.owner ?? raw.user ?? {};

  return {
    id: String(raw.id),
    name: String(raw.name ?? raw.title ?? "Untitled item"),
    category: asCategory(raw.category),
    photoUrl: String(raw.photoUrl ?? raw.photo_url ?? raw.image_url ?? raw.photo ?? ""),
    distanceMiles: Number(raw.distanceMiles ?? raw.distance_miles ?? raw.distance ?? 0),
    available: Boolean(raw.available ?? raw.is_available ?? true),
    maxBorrowDays: Number(raw.maxBorrowDays ?? raw.max_borrow_days ?? raw.max_days ?? 3),
    pricePerDay: Number(raw.pricePerDay ?? raw.price_per_day ?? 0),
    owner: {
      id: String(owner.id ?? raw.owner_id ?? ""),
      firstName: String(owner.firstName ?? owner.first_name ?? owner.name ?? "Neighbor")
    },
    latitude: raw.latitude ?? raw.lat,
    longitude: raw.longitude ?? raw.lng,
    lendWindowLabel:
      raw.lendWindowLabel ?? raw.lend_window_label ?? `Up to ${raw.max_borrow_days ?? raw.max_days ?? 3} days`
  };
}

function normalizeRequest(raw: any): BorrowRequest {
  return {
    id: String(raw.id),
    itemId: String(raw.itemId ?? raw.item_id),
    itemName: String(raw.itemName ?? raw.item_name ?? raw.item?.name ?? "Borrow request"),
    itemPhotoUrl: String(raw.itemPhotoUrl ?? raw.item_photo_url ?? raw.item?.photo_url ?? ""),
    borrowerName: String(
      raw.borrowerName ?? raw.borrower_name ?? raw.borrower?.first_name ?? raw.borrower?.name ?? "Neighbor"
    ),
    ownerName: raw.ownerName ?? raw.owner_name ?? raw.owner?.first_name ?? raw.owner?.name,
    status: raw.status,
    startDate: String(raw.startDate ?? raw.start_date),
    endDate: String(raw.endDate ?? raw.end_date),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString())
  };
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export async function googleSignIn(
  idToken: string
): Promise<Session> {
  const response = await client.post("/auth/google", { id_token: idToken });
  const { access_token, user } = response.data;
  return normalizeUserSession(user, access_token);
}

export async function getCurrentUser(): Promise<Session> {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const response = await client.get("/users/me", {
    headers: await requiredAuthHeaders()
  });

  const session = await getSession();
  return normalizeUserSession(response.data, session?.token);
}

export async function updateUserLocation(payload: {
  lat: number;
  lng: number;
  radius_miles: number;
}): Promise<void> {
  await client.patch("/users/me", payload, { headers: await requiredAuthHeaders() });
}

export async function getNearbyItems(params: Coordinates & { radius: number }) {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const response = await client.get("/items/nearby", {
    params: {
      lat: params.latitude,
      lng: params.longitude,
      radius: params.radius
    },
    headers: await authHeaders()
  });

  const rows = Array.isArray(response.data) ? response.data : response.data.items;
  return rows.map(normalizeItem) as LendItem[];
}

export async function createItem(payload: {
  name: string;
  category: Category;
  maxBorrowDays: number;
  pricePerDay: number;
  photoUri: string;
  lat: number;
  lng: number;
}) {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const form = new FormData();
  
  form.append("name", payload.name);
  form.append("category", payload.category);
  form.append("max_days", String(payload.maxBorrowDays));
  form.append("price_per_day", String(payload.pricePerDay));
  form.append("lat", String(payload.lat));
  form.append("lng", String(payload.lng));

  // Handle photo for both web and native
  if (payload.photoUri) {
    const fileName = payload.photoUri.split("/").pop() ?? "item.jpg";
    const extension = fileName.split(".").pop() ?? "jpg";
    const mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;

    // Fetch and convert URI to blob for web compatibility
    try {
      const response = await fetch(payload.photoUri);
      if (!response.ok) throw new Error("Failed to load photo");
      const blob = await response.blob();
      form.append("photo", blob, fileName);
    } catch (err) {
      console.warn("Failed to fetch photo, attempting direct append:", err);
      // Fallback for native: try to append directly
      form.append("photo", {
        uri: payload.photoUri,
        name: fileName,
        type: mimeType
      } as unknown as Blob);
    }
  }

  const response = await client.post("/items", form, {
    headers: {
      ...(await requiredAuthHeaders())
      // Don't manually set Content-Type; axios + FormData will handle it
    }
  });

  return normalizeItem(response.data);
}

export async function toggleItemAvailability(itemId: string, available: boolean) {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const response = await client.patch(
    `/items/${itemId}`,
    { available },
    { headers: await requiredAuthHeaders() }
  );

  return normalizeItem(response.data);
}

export async function createBorrowRequest(payload: {
  itemId: string;
  startDate: string;
  endDate: string;
}) {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const response = await client.post(
    "/requests",
    {
      item_id: payload.itemId,
      start_date: toDateString(new Date(payload.startDate)),
      end_date: toDateString(new Date(payload.endDate))
    },
    { headers: await requiredAuthHeaders() }
  );

  return normalizeRequest(response.data);
}

export async function updateBorrowRequestStatus(requestId: string, status: RequestStatus) {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const response = await client.patch(
    `/requests/${requestId}`,
    { status },
    { headers: await requiredAuthHeaders() }
  );

  return normalizeRequest(response.data);
}

export async function getMyRequests(): Promise<BorrowRequest[]> {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const response = await client.get("/requests/mine", {
    headers: await requiredAuthHeaders()
  });

  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map(normalizeRequest);
}

export async function getUserProfile(): Promise<UserProfile> {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const response = await client.get("/users/me/profile", {
    headers: await requiredAuthHeaders()
  });
  const raw = response.data;

  return {
    id: String(raw.id),
    firstName: String(raw.name ?? raw.firstName ?? "You"),
    avatarUrl: raw.photo_url ?? raw.avatarUrl,
    radiusMiles: Number(raw.radius_miles ?? raw.radiusMiles ?? 1),
    rating: Number(raw.rating ?? 0),
    totalLends: Number(raw.total_lends ?? raw.totalLends ?? 0),
    createdAt: raw.created_at ?? raw.createdAt,
    listings: (raw.listings ?? []).map(normalizeItem),
    incomingRequests: (raw.incoming_requests ?? raw.incomingRequests ?? []).map(normalizeRequest)
  };
}
