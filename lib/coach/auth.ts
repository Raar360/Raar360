import bcrypt from "bcryptjs";
import { getSetting, setSetting } from "@/lib/storage/settings";

const PIN_HASH_KEY = "coachPinHash";
const SESSION_KEY = "coachAuthenticated";

export async function hasPin(): Promise<boolean> {
  const hash = await getSetting<string>(PIN_HASH_KEY);
  return Boolean(hash);
}

export async function setPin(pin: string): Promise<void> {
  const hash = await bcrypt.hash(pin, 10);
  await setSetting(PIN_HASH_KEY, hash);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const hash = await getSetting<string>(PIN_HASH_KEY);
  if (!hash) {
    await setPin(pin);
    return true;
  }
  return bcrypt.compare(pin, hash);
}

export function setCoachSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, "true");
  }
}

export function clearCoachSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function isCoachSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "true";
}
