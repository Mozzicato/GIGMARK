"use client";

const STORAGE_KEY = "gigmark.session.user_id";
const STORAGE_ROLE_KEY = "gigmark.session.role";

export type SessionRole = "worker" | "employer";

export function setSession(userId: string, role: SessionRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, userId);
  window.localStorage.setItem(STORAGE_ROLE_KEY, role);
  window.dispatchEvent(new CustomEvent("gigmark:session"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(STORAGE_ROLE_KEY);
  window.dispatchEvent(new CustomEvent("gigmark:session"));
}

export function getSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function getSessionRole(): SessionRole | null {
  if (typeof window === "undefined") return null;
  const role = window.localStorage.getItem(STORAGE_ROLE_KEY);
  return role === "worker" || role === "employer" ? role : null;
}
