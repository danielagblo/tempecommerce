import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "oriel-admin";

export function adminPassword(): string {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : "oriel";
}

export function adminToken(): string {
  return createHash("sha256").update(`oriel:${adminPassword()}`).digest("hex");
}

export function passwordMatches(input: string): boolean {
  const given = createHash("sha256").update(input).digest();
  const expected = createHash("sha256").update(adminPassword()).digest();
  return timingSafeEqual(given, expected);
}

export function isAdmin(): boolean {
  const value = cookies().get(ADMIN_COOKIE)?.value ?? "";
  const expected = adminToken();
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
