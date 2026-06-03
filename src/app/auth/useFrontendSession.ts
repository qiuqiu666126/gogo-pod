import { useSyncExternalStore } from "react";
import {
  clearFrontendSession,
  getFrontendSession,
  subscribeFrontendUsers,
  type FrontendSession,
} from "../../shared/frontendUsers";

function getSnapshot(): FrontendSession | null {
  return getFrontendSession();
}

export function useFrontendSession() {
  return useSyncExternalStore(subscribeFrontendUsers, getSnapshot, () => null);
}

export function frontendLogout() {
  clearFrontendSession();
}
