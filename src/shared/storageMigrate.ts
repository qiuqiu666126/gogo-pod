/** 从旧 localStorage 键迁移到 pod_*（仅迁移一次） */
export function migrateLocalStorageKey(newKey: string, legacyKey: string) {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(newKey)) return;
  const legacy = localStorage.getItem(legacyKey);
  if (legacy) localStorage.setItem(newKey, legacy);
}
