import { useSyncExternalStore } from "react";
import { getScenePresets } from "../shared/sceneFormSchema";
import {
  ALL_FEATURE_TYPES,
  INITIAL_FEATURE_CONFIGS,
  INITIAL_PRESETS,
  INITIAL_TASKS,
} from "./data/initialData";
import type { AdminLoginData, AdminUserInfo } from "./api/passportApi";
import {
  getFrontendUsers,
  reloadFrontendUsers,
  subscribeFrontendUsers,
  type FrontendUserAccount,
} from "../shared/frontendUsers";
import type { AdminTask, FeatureConfig, FeaturePreset, FeatureType, NavId } from "./types";

reloadFrontendUsers();

const ADMIN_AUTH_KEY = "pod_admin_auth";
const ADMIN_USER_KEY = "pod_admin_user";

let configs = structuredClone(INITIAL_FEATURE_CONFIGS);
let presets = structuredClone(INITIAL_PRESETS);
let tasks = structuredClone(INITIAL_TASKS);
let adminAuth = loadAdminAuth();
let adminUser = loadAdminUser();
let authed = Boolean(adminAuth?.accessToken);
let activeNav: NavId = "dashboard";
let selectedFeature: FeatureType = "pattern-extract";

export type AdminAuthSession = {
  accessToken: string;
  refreshToken: string;
  expireAt: number;
};

type AdminSnapshot = {
  authed: boolean;
  activeNav: NavId;
  selectedFeature: FeatureType;
  configs: FeatureConfig[];
  presets: FeaturePreset[];
  tasks: AdminTask[];
  users: FrontendUserAccount[];
  adminAuth: AdminAuthSession | null;
  adminUser: AdminUserInfo | null;
};

const listeners = new Set<() => void>();

function buildSnapshot(): AdminSnapshot {
  return {
    authed,
    activeNav,
    selectedFeature,
    configs,
    presets,
    tasks,
    users: getFrontendUsers(),
    adminAuth,
    adminUser,
  };
}

/** useSyncExternalStore 要求 getSnapshot 返回稳定引用，仅在数据变更时更新 */
let snapshot = buildSnapshot();

function emit() {
  snapshot = buildSnapshot();
  listeners.forEach((l) => l());
}

/** 前台用户库变更时同步刷新管理端 snapshot */
subscribeFrontendUsers(() => {
  snapshot = buildSnapshot();
  listeners.forEach((l) => l());
});

function now() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function subscribeAll(listener: () => void) {
  const unsubAdmin = subscribe(listener);
  const unsubUsers = subscribeFrontendUsers(listener);
  return () => {
    unsubAdmin();
    unsubUsers();
  };
}

export function useAdminStore() {
  return useSyncExternalStore(subscribeAll, getSnapshot, getSnapshot);
}

function getSnapshot() {
  return snapshot;
}

function loadAdminAuth(): AdminAuthSession | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminAuthSession>;
    if (!parsed.accessToken) return null;
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken ?? "",
      expireAt: Number(parsed.expireAt) || 0,
    };
  } catch {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
}

function saveAdminAuth(session: AdminAuthSession | null) {
  if (typeof localStorage === "undefined") return;
  if (!session) {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    return;
  }
  localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
}

function loadAdminUser(): AdminUserInfo | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUserInfo) : null;
  } catch {
    localStorage.removeItem(ADMIN_USER_KEY);
    return null;
  }
}

function saveAdminUser(user: AdminUserInfo | null) {
  if (typeof localStorage === "undefined") return;
  if (!user) {
    localStorage.removeItem(ADMIN_USER_KEY);
    return;
  }
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function login(session: AdminLoginData, user?: AdminUserInfo | null) {
  adminAuth = {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expireAt: session.expire_at,
  };
  if (user !== undefined) {
    adminUser = user;
    saveAdminUser(user);
  }
  saveAdminAuth(adminAuth);
  authed = true;
  emit();
}

export function setAdminUser(user: AdminUserInfo | null) {
  adminUser = user;
  saveAdminUser(user);
  emit();
}

export function clearAdminSession() {
  adminAuth = null;
  adminUser = null;
  saveAdminAuth(null);
  saveAdminUser(null);
  authed = false;
  emit();
}

export const logout = clearAdminSession;

export function getAdminAccessToken() {
  return adminAuth?.accessToken ?? "";
}

export function setActiveNav(nav: NavId) {
  activeNav = nav;
  emit();
}

export function setSelectedFeature(type: FeatureType) {
  selectedFeature = type;
  emit();
}

export function getFeatureConfig(type: FeatureType): FeatureConfig | undefined {
  return configs.find((c) => c.featureType === type);
}

export function updateFeatureConfig(type: FeatureType, patch: Partial<FeatureConfig>) {
  configs = configs.map((c) =>
    c.featureType === type ? { ...c, ...patch, updatedAt: now() } : c,
  );
  emit();
}

export function updateParamMapping(
  featureType: FeatureType,
  mappingId: string,
  patch: Partial<FeatureConfig["paramMappings"][0]>,
) {
  configs = configs.map((c) => {
    if (c.featureType !== featureType) return c;
    return {
      ...c,
      paramMappings: c.paramMappings.map((m) => (m.id === mappingId ? { ...m, ...patch } : m)),
      updatedAt: now(),
    };
  });
  emit();
}

export function listPresets(featureType?: FeatureType) {
  if (!featureType) return presets;
  return presets.filter((p) => p.featureType === featureType);
}

export function upsertPreset(preset: FeaturePreset) {
  const idx = presets.findIndex((p) => p.id === preset.id);
  const row = { ...preset, updatedAt: now() };
  if (idx >= 0) presets = presets.map((p, i) => (i === idx ? row : p));
  else presets = [...presets, row];
  emit();
}

export function createPresetId() {
  return `preset-${Date.now()}`;
}

export function deletePreset(id: string) {
  presets = presets.filter((p) => p.id !== id);
  emit();
}

export function getDashboardStats() {
  const designFeatures = configs.filter((c) => c.category === "design");
  const videoFeatures = configs.filter((c) => c.category === "video");
  const users = getFrontendUsers();
  return {
    totalFeatures: configs.length,
    enabledFeatures: configs.filter((c) => c.enabled).length,
    withApiKey: configs.filter((c) => c.apiKey.trim()).length,
    presetCount: getScenePresets().length,
    taskToday: tasks.length,
    designCount: designFeatures.length,
    videoCount: videoFeatures.length,
    recentTasks: tasks.slice(0, 5),
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
  };
}

export { ALL_FEATURE_TYPES };
