import { useEffect } from "react";
import { getAdminInfo } from "./api/passportApi";
import { useAdminStore } from "./store";
import {
  clearAdminSession,
  clearAdminTokenRefreshTimer,
  ensureAdminAccessToken,
  reloadAdminAiData,
  setAdminUser,
} from "./store";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FeatureDetailPage } from "./pages/FeatureDetailPage";
import { PresetsPage } from "./pages/PresetsPage";
import { TasksPage } from "./pages/TasksPage";
import { SettingsPage } from "./pages/SettingsPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { WorkflowTemplatesAdminPage } from "./pages/WorkflowTemplatesAdminPage";
import { ProductSetTemplatesAdminPage } from "./pages/ProductSetTemplatesAdminPage";
import { PublishTemplatesAdminPage } from "./pages/PublishTemplatesAdminPage";
import { UsersPage } from "./pages/UsersPage";
import { AttachmentsPage } from "./pages/AttachmentsPage";

export function AdminApp() {
  const { authed, activeNav, adminAuth, adminUser } = useAdminStore();

  useEffect(() => {
    if (!authed || !adminAuth?.accessToken || adminUser) return;
    let cancelled = false;

    void ensureAdminAccessToken()
      .then((token) => getAdminInfo(token))
      .then((user) => {
        if (!cancelled) setAdminUser(user);
      })
      .catch(() => {
        if (!cancelled) clearAdminSession();
      });

    return () => {
      cancelled = true;
    };
  }, [authed, adminAuth?.accessToken, adminUser]);

  useEffect(() => {
    if (!authed) {
      clearAdminTokenRefreshTimer();
    }
  }, [authed]);

  useEffect(() => {
    if (!authed || !adminAuth?.accessToken) return;
    void reloadAdminAiData();
  }, [authed, adminAuth?.accessToken]);

  if (!authed) return <LoginPage />;

  switch (activeNav) {
    case "dashboard":
      return <DashboardPage />;
    case "features":
      return <FeatureDetailPage />;
    case "presets":
      return <PresetsPage />;
    case "recommendations":
      return <RecommendationsPage />;
    case "workflow-templates":
      return <WorkflowTemplatesAdminPage />;
    case "product-set-templates":
      return <ProductSetTemplatesAdminPage />;
    case "publish-templates":
      return <PublishTemplatesAdminPage />;
    case "users":
      return <UsersPage />;
    case "attachments":
      return <AttachmentsPage />;
    case "tasks":
      return <TasksPage />;
    case "settings":
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
}
