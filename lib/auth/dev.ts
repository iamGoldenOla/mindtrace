// DEV-ONLY sign-in. Two synthetic teachers, cookie session, no passwords.
// This module refuses to run in production: the production build must use
// real Supabase Auth instead. Never use these accounts with real data.
import { cookies } from "next/headers";
import { getRepository } from "@/lib/db";
import { DEV_SESSION_COOKIE, DEV_TEACHERS } from "./dev-accounts";

export { DEV_SESSION_COOKIE };

/**
 * Development sign-in is always available outside production. On a deployed
 * demo it is available only when explicitly enabled with
 * ALLOW_DEV_AUTH=true, so a forgotten env var can never open it by accident.
 */
export function devAuthEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ALLOW_DEV_AUTH === "true";
}

export function assertDevAuthAllowed(): void {
  if (!devAuthEnabled()) {
    throw new Error("Development sign-in is not available in production.");
  }
}

export interface DevUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export async function signInDev(email: string): Promise<DevUser> {
  assertDevAuthAllowed();
  const repo = getRepository();
  const profile = await repo.getUserByEmail(email);
  if (!profile || !DEV_TEACHERS.some((t) => t.email === email)) {
    throw new Error("Unknown development account.");
  }
  const session = await repo.createDevSession(profile.id);
  const jar = await cookies();
  jar.set(DEV_SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name ?? profile.email,
    role: profile.role,
  };
}

export async function signOutDev(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(DEV_SESSION_COOKIE)?.value;
  if (token) {
    await getRepository().deleteDevSession(token);
  }
  jar.delete(DEV_SESSION_COOKIE);
}

export async function getDevUser(): Promise<DevUser | null> {
  if (!devAuthEnabled()) return null;
  const jar = await cookies();
  const token = jar.get(DEV_SESSION_COOKIE)?.value;
  if (!token) return null;
  const repo = getRepository();
  const session = await repo.getDevSession(token);
  if (!session) return null;
  const profile = await repo.getUserById(session.user_id);
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name ?? profile.email,
    role: profile.role,
  };
}

export async function requireDevUser(): Promise<DevUser> {
  const user = await getDevUser();
  if (!user) throw new Error("Sign in to use this.");
  return user;
}
