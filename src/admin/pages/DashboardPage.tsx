import { ArrowRight, Key, Layers, Sparkles, Users } from "lucide-react";
import { AdminShell } from "../components/AdminShell";
import { Badge, Card, StatCard } from "../components/ui";
import { FEATURE_LABELS } from "../data/initialData";
import { getDashboardStats, setActiveNav, setSelectedFeature, useAdminStore } from "../store";
import type { FeatureType } from "../types";

const STATUS_MAP = {
  completed: { label: "已完成", tone: "success" as const },
  running: { label: "运行中", tone: "primary" as const },
  failed: { label: "失败", tone: "danger" as const },
  pending: { label: "等待中", tone: "warn" as const },
};

export function DashboardPage() {
  const stats = getDashboardStats();
  const { configs } = useAdminStore();

  const needKey = configs.filter((c) => c.enabled && !c.apiKey.trim());

  return (
    <AdminShell title="概览" subtitle="作图与视频 AI 能力配置总览">
      <div className="p-6 space-y-6 max-w-[1200px]">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="AI 功能" value={stats.totalFeatures} sub={`已启用 ${stats.enabledFeatures} 项`} />
          <StatCard
            label="前台用户"
            value={stats.activeUsers}
            sub={`共 ${stats.totalUsers} 个账号`}
            accent="text-primary"
          />
          <StatCard
            label="作图能力"
            value={stats.designCount}
            sub="印花/抠图/裂变/文生图等"
            accent="text-violet-600"
          />
          <StatCard label="视频能力" value={stats.videoCount} sub="图生视频三场景" />
          <StatCard label="场景预设" value={stats.presetCount} sub="创意/场景 prompt 模板" />
        </div>

        {needKey.length > 0 && (
          <Card className="border-amber-200/80 bg-amber-50/50">
            <div className="flex items-start gap-3 -m-1">
              <Key className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-[14px] font-medium text-amber-900">待配置 API Key</p>
                <p className="text-[12px] text-amber-800/80 mt-1">
                  以下功能已启用但尚未填写密钥：{needKey.map((c) => c.label).join("、")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFeature(needKey[0]!.featureType);
                  setActiveNav("features");
                }}
                className="text-[12px] text-primary font-medium flex items-center gap-1 shrink-0"
              >
                去配置 <ArrowRight size={14} />
              </button>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="功能模块">
            <div className="space-y-2 -mt-1">
              {configs.map((c) => (
                <button
                  key={c.featureType}
                  type="button"
                  onClick={() => {
                    setSelectedFeature(c.featureType);
                    setActiveNav("features");
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 text-left transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      c.category === "video" ? "bg-orange-100 text-primary" : "bg-violet-100 text-violet-600"
                    }`}
                  >
                    {c.category === "video" ? "▶" : "◇"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{c.label}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{c.modelId}</div>
                  </div>
                  <Badge tone={c.enabled ? "success" : "default"}>{c.enabled ? "启用" : "停用"}</Badge>
                </button>
              ))}
            </div>
          </Card>

          <Card title="最近任务（演示数据）">
            <div className="space-y-0 -mt-1 divide-y divide-border">
              {stats.recentTasks.map((t) => {
                const st = STATUS_MAP[t.status];
                return (
                  <div key={t.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium">
                        {FEATURE_LABELS[t.featureType as FeatureType]}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{t.paramsSummary}</div>
                    </div>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setActiveNav("tasks")}
              className="mt-3 text-[12px] text-primary font-medium flex items-center gap-1"
            >
              查看全部任务 <ArrowRight size={14} />
            </button>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, title: "开设前台账号", desc: "创建/停用用户，供POD用户端登录", nav: "users" as const },
            { icon: Sparkles, title: "配置模型与提示词", desc: "按功能设置 model_id、Key、系统/用户 prompt", nav: "features" as const },
            { icon: Layers, title: "管理场景预设", desc: "视频创意、图裂变场景、反推模板", nav: "presets" as const },
            { icon: Key, title: "密钥仅后台可见", desc: "前台只读 modelId，不暴露 API Key", nav: "settings" as const },
          ].map(({ icon: Icon, title, desc, nav }) => (
            <button
              key={nav}
              type="button"
              onClick={() => setActiveNav(nav)}
              className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/30 hover:shadow-md transition-all"
            >
              <Icon size={20} className="text-primary mb-2" />
              <div className="text-[14px] font-semibold">{title}</div>
              <p className="text-[12px] text-muted-foreground mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
