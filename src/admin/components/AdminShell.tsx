import {
  LayoutDashboard,
  Layers,
  ListTodo,
  LogOut,
  Settings,
  Sparkles,
  Video,
  Star,
  Users,
  GitBranch,
  LayoutGrid,
  MessageSquareText,
} from "lucide-react";
import type { ReactNode } from "react";
import { logoutAdmin } from "../api/passportApi";
import { FEATURE_LABELS } from "../data/initialData";
import {
  clearAdminSession,
  getAdminAccessToken,
  setActiveNav,
  setSelectedFeature,
  useAdminStore,
} from "../store";
import type { FeatureType, NavId } from "../types";

const NAV: { id: NavId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "概览", icon: LayoutDashboard },
  { id: "features", label: "AI 功能配置", icon: Sparkles },
  { id: "presets", label: "场景预设", icon: Layers },
  { id: "recommendations", label: "推荐案例配置", icon: Star },
  { id: "workflow-templates", label: "工作流模版", icon: GitBranch },
  { id: "product-set-templates", label: "套图模版", icon: LayoutGrid },
  { id: "publish-templates", label: "刊登模版", icon: MessageSquareText },
  { id: "users", label: "用户账号管理", icon: Users },
  { id: "tasks", label: "任务监控", icon: ListTodo },
  { id: "settings", label: "系统设置", icon: Settings },
];

export function AdminShell({
  title,
  subtitle,
  children,
  featureSidebar,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  featureSidebar?: ReactNode;
}) {
  const { activeNav, configs, adminUser } = useAdminStore();
  const displayName = adminUser?.nickname || adminUser?.username || "管理员";

  const handleLogout = async () => {
    const token = getAdminAccessToken();
    try {
      if (token) {
        await logoutAdmin(token);
      }
    } catch {
      // 即使服务端登出失败，也清理本地登录态，避免用户被卡在后台。
    } finally {
      clearAdminSession();
    }
  };

  return (
    <div
      className="min-h-full flex bg-background text-foreground"
      style={{ fontFamily: "var(--font-family)" }}
    >
      <aside className="w-[220px] shrink-0 border-r border-border bg-sidebar flex flex-col">
        <div className="px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              GOGO
            </div>
            <div>
              <div className="font-semibold text-[15px] text-sidebar-foreground">GOGO POD后台</div>
              <div className="text-[11px] text-muted-foreground">配置中心 · 原型</div>
            </div>
          </div>
        </div>

        <nav className="p-2 space-y-0.5 flex-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveNav(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                activeNav === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border text-[11px] text-muted-foreground">
          <p>认证 API 已接入</p>
          <p className="mt-0.5">配置数据仍为本地原型</p>
        </div>
      </aside>

      {featureSidebar}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 h-14 border-b border-border bg-card px-6 flex items-center justify-between">
          <div>
            {title && <h1 className="text-[16px] font-semibold">{title}</h1>}
            {subtitle && <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground hidden sm:inline">
              已启用 {configs.filter((c) => c.enabled).length} / {configs.length} 项功能
            </span>
            <span className="max-w-[160px] truncate text-[12px] text-muted-foreground hidden sm:inline">
              {displayName}
            </span>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted"
            >
              <LogOut size={14} />
              退出
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
      </div>
    </div>
  );
}

export function FeatureListSidebar({
  selected,
  onSelect,
}: {
  selected: FeatureType;
  onSelect: (t: FeatureType) => void;
}) {
  const { configs } = useAdminStore();

  const design = configs.filter((c) => c.category === "design");
  const video = configs.filter((c) => c.category === "video");

  const renderGroup = (title: string, items: typeof configs, icon: typeof Video) => {
    const Icon = icon;
    return (
      <div className="mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          <Icon size={12} />
          {title}
        </div>
        {items.map((cfg) => (
          <button
            key={cfg.featureType}
            type="button"
            onClick={() => onSelect(cfg.featureType)}
            className={`w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-colors ${
              selected === cfg.featureType
                ? "bg-accent text-accent-foreground ring-1 ring-primary/20"
                : "hover:bg-muted/80"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium">{cfg.label}</span>
              {!cfg.enabled && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  停用
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate font-mono">
              {cfg.modelId}
            </div>
            <div className="flex gap-1.5 mt-1">
              {cfg.apiKey ? (
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded">Key</span>
              ) : (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded">无 Key</span>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <aside className="w-[240px] shrink-0 border-r border-border bg-card overflow-y-auto p-2">
      {renderGroup("作图", design, Sparkles)}
      {renderGroup("视频", video, Video)}
    </aside>
  );
}

export function FeatureListSidebarConnected() {
  const { selectedFeature } = useAdminStore();
  return (
    <FeatureListSidebar
      selected={selectedFeature}
      onSelect={(t) => {
        setSelectedFeature(t);
        setActiveNav("features");
      }}
    />
  );
}

export { FEATURE_LABELS };
