import Constants from "expo-constants";
import axios from "axios";

import type {
  BorrowRequest,
  Category,
  Coordinates,
  LendItem,
  RequestStatus,
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

function asCategory(value: unknown): Category {
  if (value === "Kitchen" || value === "Outdoor" || value === "Misc") {
    return value;
  }

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
    owner: {
      id: String(owner.id ?? raw.owner_id ?? ""),
      firstName: String(owner.firstName ?? owner.first_name ?? owner.name ?? "Neighbor")
    },
    latitude: raw.latitude ?? raw.lat,
    longitude: raw.longitude ?? raw.lng,
    lendWindowLabel:
      raw.lendWindowLabel ?? raw.lend_window_label ?? `Up to ${raw.max_borrow_days ?? 3} days`
  };
}

function normalizeRequest(raw: any): BorrowRequest {
  return {
    id: String(raw.id),
    itemId: String(raw.itemId ?? raw.item_id),
    itemName: String(raw.itemName ?? raw.item_name ?? raw.item?.name ?? "Borrow request"),
    itemPhotoUrl: String(raw.itemPhotoUrl ?? raw.item_photo_url ?? raw.item?.photo_url ?? ""),
    borrowerName: String(raw.borrowerName ?? raw.borrower_name ?? raw.borrower?.first_name ?? "Neighbor"),
    ownerName: raw.ownerName ?? raw.owner_name ?? raw.owner?.first_name,
    status: raw.status,
    startDate: String(raw.startDate ?? raw.start_date),
    endDate: String(raw.endDate ?? raw.end_date),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString())
  };
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
  photoUri: string;
}) {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const form = new FormData();
  const fileName = payload.photoUri.split("/").pop() ?? "item.jpg";
  const extension = fileName.split(".").pop() ?? "jpg";

  form.append("name", payload.name);
  form.append("category", payload.category);
  form.append("max_borrow_days", String(payload.maxBorrowDays));
  form.append("photo", {
    uri: payload.photoUri,
    name: fileName,
    type: `image/${extension === "jpg" ? "jpeg" : extension}`
  } as unknown as Blob);

  const response = await client.post("/items", form, {
    headers: {
      ...(await authHeaders()),
      "Content-Type": "multipart/form-data"
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
    { headers: await authHeaders() }
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
      start_date: payload.startDate,
      end_date: payload.endDate
    },
    { headers: await authHeaders() }
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
    { headers: await authHeaders() }
  );

  return normalizeRequest(response.data);
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  const response = await client.get(`/users/${userId}`, {
    headers: await authHeaders()
  });
  const raw = response.data;

  return {
    id: String(raw.id),
    firstName: String(raw.firstName ?? raw.first_name ?? raw.name ?? "You"),
    avatarUrl: raw.avatarUrl ?? raw.avatar_url,
    listings: (raw.listings ?? raw.items ?? []).map(normalizeItem),
    incomingRequests: (raw.incomingRequests ?? raw.incoming_requests ?? raw.requests ?? []).map(
      normalizeRequest
    )
  };
}
