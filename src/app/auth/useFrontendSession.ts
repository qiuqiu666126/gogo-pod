import { useSyncExternalStore } from "react";
import {
  getFrontendUserInfo,
  loginFrontend,
  logoutFrontend,
  refreshFrontendToken,
  type FrontendLoginData,
  type FrontendLoginPayload,
  type FrontendUserInfo,
} from "../api/passportApi";

const FRONTEND_AUTH_KEY = "pod_app_auth";
const FRONTEND_USER_KEY = "pod_app_user";
const REFRESH_BEFORE_MS = 5 * 60 * 1000;

export type FrontendAuthSession = {
  accessToken: string;
  refreshToken: string;
  expireAt: number;
  expiresAtMs: number;
};

export type FrontendSession = {
  userId: string;
  username: string;
  displayName: string;
  role: string;
  plan: string;
  user: FrontendUserInfo | null;
  auth: FrontendAuthSession;
};

let authSession = loadAuthSession();
let frontendUser = loadFrontendUser();
let sessionSnapshot: FrontendSession | null = buildSessionSnapshot();
let refreshInFlight: Promise<string> | null = null;
let refreshTimerId: number | undefined;
const listeners = new Set<() => void>();

if (authSession) {
  scheduleFrontendTokenRefresh();
}

function buildAuthSession(data: FrontendLoginData): FrontendAuthSession {
  const expireAt = Number(data.expire_at) || 0;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expireAt,
    expiresAtMs: Date.now() + expireAt * 1000,
  };
}

function buildSessionSnapshot(): FrontendSession | null {
  if (!authSession || !frontendUser) return null;
  const userId = frontendUser.id === undefined ? "" : String(frontendUser.id);
  const role =
    frontendUser?.role?.name ??
    frontendUser?.roles?.[0]?.name ??
    frontendUser?.user_type ??
    "";
  const plan = frontendUser?.plan_label ?? frontendUser?.plan ?? "";
  return {
    userId,
    username: frontendUser?.username ?? "",
    displayName: frontendUser?.nickname || frontendUser?.username || "用户",
    role,
    plan,
    user: frontendUser,
    auth: authSession,
  };
}

function emit() {
  sessionSnapshot = buildSessionSnapshot();
  listeners.forEach((listener) => listener());
}

function loadAuthSession(): FrontendAuthSession | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(FRONTEND_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FrontendAuthSession>;
    if (!parsed.accessToken) return null;
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken ?? "",
      expireAt: Number(parsed.expireAt) || 0,
      expiresAtMs:
        typeof parsed.expiresAtMs === "number" && parsed.expiresAtMs > 0
          ? parsed.expiresAtMs
          : 0,
    };
  } catch {
    localStorage.removeItem(FRONTEND_AUTH_KEY);
    return null;
  }
}

function saveAuthSession(session: FrontendAuthSession | null) {
  if (typeof localStorage === "undefined") return;
  if (!session) {
    localStorage.removeItem(FRONTEND_AUTH_KEY);
    return;
  }
  localStorage.setItem(FRONTEND_AUTH_KEY, JSON.stringify(session));
}

function loadFrontendUser(): FrontendUserInfo | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(FRONTEND_USER_KEY);
    return raw ? (JSON.parse(raw) as FrontendUserInfo) : null;
  } catch {
    localStorage.removeItem(FRONTEND_USER_KEY);
    return null;
  }
}

function saveFrontendUser(user: FrontendUserInfo | null) {
  if (typeof localStorage === "undefined") return;
  if (!user) {
    localStorage.removeItem(FRONTEND_USER_KEY);
    return;
  }
  localStorage.setItem(FRONTEND_USER_KEY, JSON.stringify(user));
}

function applyAuthSession(session: FrontendAuthSession) {
  authSession = session;
  saveAuthSession(session);
  scheduleFrontendTokenRefresh();
  emit();
}

function setFrontendUser(user: FrontendUserInfo | null) {
  frontendUser = user;
  saveFrontendUser(user);
  emit();
}

export function subscribeFrontendSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFrontendSession(): FrontendSession | null {
  return sessionSnapshot;
}

export function getFrontendAccessToken() {
  return authSession?.accessToken ?? "";
}

export function clearFrontendTokenRefreshTimer() {
  if (typeof window !== "undefined" && refreshTimerId !== undefined) {
    window.clearTimeout(refreshTimerId);
    refreshTimerId = undefined;
  }
}

export function scheduleFrontendTokenRefresh() {
  if (typeof window === "undefined" || !authSession?.refreshToken) return;
  if (refreshTimerId !== undefined) {
    window.clearTimeout(refreshTimerId);
  }
  const delay = Math.max(authSession.expiresAtMs - Date.now() - REFRESH_BEFORE_MS, 1000);
  refreshTimerId = window.setTimeout(() => {
    void ensureFrontendAccessToken().catch(() => undefined);
  }, delay);
}

export async function ensureFrontendAccessToken(): Promise<string> {
  if (!authSession?.accessToken) {
    throw new Error("未登录");
  }

  const remaining = authSession.expiresAtMs - Date.now();
  if (remaining > REFRESH_BEFORE_MS) {
    return authSession.accessToken;
  }

  if (!authSession.refreshToken) {
    clearFrontendSessionState();
    throw new Error("登录已过期，请重新登录");
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = refreshFrontendToken(authSession.refreshToken)
    .then((data) => {
      applyAuthSession(buildAuthSession(data));
      return authSession!.accessToken;
    })
    .catch((err) => {
      clearFrontendSessionState();
      throw err;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export async function frontendLogin(payload: FrontendLoginPayload): Promise<FrontendSession> {
  const auth = buildAuthSession(await loginFrontend(payload));
  try {
    authSession = auth;
    saveAuthSession(auth);
    scheduleFrontendTokenRefresh();
    const user = await getFrontendUserInfo(auth.accessToken);
    setFrontendUser(user);
  } catch (err) {
    clearFrontendSessionState();
    throw err;
  }
  return getFrontendSession()!;
}

export async function refreshFrontendUserInfo(): Promise<FrontendUserInfo> {
  const token = await ensureFrontendAccessToken();
  const user = await getFrontendUserInfo(token);
  setFrontendUser(user);
  return user;
}

function clearFrontendSessionState() {
  clearFrontendTokenRefreshTimer();
  refreshInFlight = null;
  authSession = null;
  frontendUser = null;
  saveAuthSession(null);
  saveFrontendUser(null);
  emit();
}

export async function frontendLogout() {
  const token = authSession?.accessToken;
  try {
    if (token && token !== "dev-preview-access-token") {
      await logoutFrontend(token);
    }
  } finally {
    clearFrontendSessionState();
  }
}

export function useFrontendSession() {
  return useSyncExternalStore(subscribeFrontendSession, getFrontendSession, () => null);
}

export function shouldSkipFrontendLogin(): boolean {
  if (import.meta.env.VITE_SKIP_FRONTEND_LOGIN === "true") return true;
  if (!import.meta.env.DEV) return false;
  const q = new URLSearchParams(window.location.search);
  return q.has("skipLogin") || q.get("preview") === "1";
}

export function ensureDevPreviewSession(): FrontendSession | null {
  if (!shouldSkipFrontendLogin()) return getFrontendSession();
  if (getFrontendSession()) return getFrontendSession();

  const previewAuth: FrontendAuthSession = {
    accessToken: "dev-preview-access-token",
    refreshToken: "dev-preview-refresh-token",
    expireAt: 24 * 60 * 60,
    expiresAtMs: Date.now() + 24 * 60 * 60 * 1000,
  };
  const previewUser: FrontendUserInfo = {
    id: 0,
    username: "preview",
    nickname: "预览用户",
    plan: "professional",
    plan_label: "专业版",
    role: { id: 0, code: "FrontMember", name: "成员" },
    roles: [{ id: 0, code: "FrontMember", name: "成员" }],
  };
  authSession = previewAuth;
  frontendUser = previewUser;
  emit();
  return getFrontendSession();
}
