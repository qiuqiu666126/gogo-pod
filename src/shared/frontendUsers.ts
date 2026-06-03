/** 前台用户账号（管理后台开设，localStorage 持久化，API 接入前原型方案） */

import { migrateLocalStorageKey } from "./storageMigrate";

export type FrontendUserRole = "admin" | "member" | "viewer";
export type FrontendUserStatus = "active" | "disabled";

export type FrontendUserAccount = {
  id: string;
  username: string;
  /** 原型阶段明文存储，生产环境由后端哈希 */
  password: string;
  displayName: string;
  email: string;
  phone: string;
  role: FrontendUserRole;
  plan: string;
  status: FrontendUserStatus;
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type FrontendSession = {
  userId: string;
  username: string;
  displayName: string;
  role: FrontendUserRole;
  plan: string;
};

const USERS_KEY = "pod_frontend_users";
const SESSION_KEY = "pod_frontend_session";
const LEGACY_USERS_KEY = "lingtu_frontend_users";
const LEGACY_SESSION_KEY = "lingtu_frontend_session";

const ROLE_LABELS: Record<FrontendUserRole, string> = {
  admin: "管理员",
  member: "成员",
  viewer: "只读",
};

export function getRoleLabel(role: FrontendUserRole) {
  return ROLE_LABELS[role];
}

function now() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export const INITIAL_FRONTEND_USERS: FrontendUserAccount[] = [
  {
    id: "user-1",
    username: "xiaoming",
    password: "123456",
    displayName: "小明",
    email: "xiaoming@example.com",
    phone: "13800000001",
    role: "admin",
    plan: "专业版",
    status: "active",
    remark: "演示主账号",
    createdBy: "系统",
    createdAt: "2026-05-01 09:00:00",
    updatedAt: "2026-05-28 10:00:00",
    lastLoginAt: "2026-05-28 15:20:00",
  },
  {
    id: "user-2",
    username: "operator_b",
    password: "123456",
    displayName: "运营B",
    email: "opb@example.com",
    phone: "13800000002",
    role: "member",
    plan: "专业版",
    status: "active",
    remark: "",
    createdBy: "管理员",
    createdAt: "2026-05-10 14:00:00",
    updatedAt: "2026-05-20 11:00:00",
    lastLoginAt: "2026-05-27 09:15:00",
  },
  {
    id: "user-3",
    username: "viewer_test",
    password: "123456",
    displayName: "测试只读",
    email: "viewer@example.com",
    phone: "",
    role: "viewer",
    plan: "基础版",
    status: "disabled",
    remark: "已停用示例",
    createdBy: "管理员",
    createdAt: "2026-05-15 10:00:00",
    updatedAt: "2026-05-22 16:00:00",
    lastLoginAt: null,
  },
];

function readStorage(): FrontendUserAccount[] {
  if (typeof localStorage === "undefined") return structuredClone(INITIAL_FRONTEND_USERS);
  migrateLocalStorageKey(USERS_KEY, LEGACY_USERS_KEY);
  migrateLocalStorageKey(SESSION_KEY, LEGACY_SESSION_KEY);
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_FRONTEND_USERS));
      return structuredClone(INITIAL_FRONTEND_USERS);
    }
    return JSON.parse(raw) as FrontendUserAccount[];
  } catch {
    return structuredClone(INITIAL_FRONTEND_USERS);
  }
}

function writeStorage(users: FrontendUserAccount[]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

let cache = readStorage();
/** useSyncExternalStore 需要稳定引用，避免每次 JSON.parse 产生新对象 */
let sessionSnapshot: FrontendSession | null = null;
const listeners = new Set<() => void>();

function refreshSessionSnapshot() {
  if (typeof localStorage === "undefined") {
    sessionSnapshot = null;
    return;
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      sessionSnapshot = null;
      return;
    }
    const session = JSON.parse(raw) as FrontendSession;
    const user = cache.find((u) => u.id === session.userId);
    if (!user || user.status !== "active") {
      sessionSnapshot = null;
      return;
    }
    sessionSnapshot = session;
  } catch {
    sessionSnapshot = null;
  }
}

refreshSessionSnapshot();

function emit() {
  refreshSessionSnapshot();
  listeners.forEach((l) => l());
}

export function subscribeFrontendUsers(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFrontendUsers(): FrontendUserAccount[] {
  return cache;
}

export function reloadFrontendUsers() {
  cache = readStorage();
  emit();
}

export function saveFrontendUsers(users: FrontendUserAccount[]) {
  cache = users;
  writeStorage(users);
  emit();
}

export function createUserId() {
  return `user-${Date.now()}`;
}

export function upsertFrontendUser(
  input: Omit<FrontendUserAccount, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
) {
  const users = getFrontendUsers();
  const idx = users.findIndex((u) => u.id === input.id);
  const ts = now();
  const row: FrontendUserAccount = {
    ...input,
    createdAt: input.createdAt ?? ts,
    updatedAt: ts,
  };
  if (idx >= 0) {
    const prev = users[idx]!;
    saveFrontendUsers(users.map((u, i) => (i === idx ? { ...row, createdAt: prev.createdAt } : u)));
  } else {
    if (users.some((u) => u.username === input.username)) {
      throw new Error("登录账号已存在");
    }
    saveFrontendUsers([row, ...users]);
  }
}

export function deleteFrontendUser(id: string) {
  saveFrontendUsers(getFrontendUsers().filter((u) => u.id !== id));
}

export function resetFrontendUserPassword(id: string, password: string) {
  const users = getFrontendUsers();
  saveFrontendUsers(
    users.map((u) => (u.id === id ? { ...u, password, updatedAt: now() } : u)),
  );
}

export function setFrontendUserStatus(id: string, status: FrontendUserStatus) {
  const users = getFrontendUsers();
  saveFrontendUsers(
    users.map((u) => (u.id === id ? { ...u, status, updatedAt: now() } : u)),
  );
}

export function validateFrontendLogin(
  username: string,
  password: string,
): FrontendSession | null {
  const user = getFrontendUsers().find(
    (u) => u.username === username.trim() && u.password === password,
  );
  if (!user || user.status !== "active") return null;

  const session: FrontendSession = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    plan: user.plan,
  };

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    sessionSnapshot = session;
    const users = getFrontendUsers();
    saveFrontendUsers(
      users.map((u) => (u.id === user.id ? { ...u, lastLoginAt: now() } : u)),
    );
  } else {
    emit();
  }
  return session;
}

export function getFrontendSession(): FrontendSession | null {
  return sessionSnapshot;
}

export function clearFrontendSession() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
  sessionSnapshot = null;
  emit();
}

/** 开发预览：跳过登录（仅 DEV 或显式环境变量） */
export function shouldSkipFrontendLogin(): boolean {
  if (import.meta.env.VITE_SKIP_FRONTEND_LOGIN === "true") return true;
  if (!import.meta.env.DEV) return false;
  const q = new URLSearchParams(window.location.search);
  return q.has("skipLogin") || q.get("preview") === "1";
}

export function ensureDevPreviewSession(): FrontendSession | null {
  if (!shouldSkipFrontendLogin()) return getFrontendSession();
  if (getFrontendSession()) return getFrontendSession();
  return validateFrontendLogin("xiaoming", "123456");
}
