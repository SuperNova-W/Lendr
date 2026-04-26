import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Coordinates, RadiusMiles, Session } from "../types";

const SESSION_KEY = "lend.session.v1";

export async function getSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export async function saveSession(session: Session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function updateSession(patch: Partial<Session>) {
  const current = await getSession();
  const next: Session = {
    userId: current?.userId ?? "demo-user",
    firstName: current?.firstName ?? "Yash",
    radiusMiles: current?.radiusMiles ?? 1,
    ...current,
    ...patch
  };

  return saveSession(next);
}

export async function createDemoSession(radiusMiles: RadiusMiles, location?: Coordinates) {
  return saveSession({
    userId: "demo-user",
    firstName: "Yash",
    radiusMiles,
    location
  });
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
