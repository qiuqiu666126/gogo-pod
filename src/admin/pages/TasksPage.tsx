import { useState } from "react";
import { AdminShell } from "../components/AdminShell";
import { Badge, Card } from "../components/ui";
import { FEATURE_LABELS, ALL_FEATURE_TYPES } from "../data/initialData";
import { useAdminStore } from "../store";
import type { FeatureType } from "../types";

const STATUS: Record<string, { label: string; tone: "success" | "primary" | "danger" | "warn" }> = {
  completed: { label: "已完成", tone: "success" },
  running: { label: "运行中", tone: "primary" },
  failed: { label: "失败", tone: "danger" },
  pending: { label: "等待中", tone: "warn" },
};

export function TasksPage() {
  const { tasks } = useAdminStore();
  const [typeFilter, setTypeFilter] = useState<FeatureType | "">("");

  const list = typeFilter ? tasks.filter((t) => t.featureType === typeFilter) : tasks;

  return (
    <AdminShell title="任务监控" subtitle="演示数据 · 对接 API 后将展示真实任务队列">
      <div className="p-6 max-w-[1100px] space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setTypeFilter("")}
            className={`px-3 py-1.5 rounded-lg text-[13px] border ${
              !typeFilter ? "border-primary bg-primary/5 text-primary" : "border-border"
            }`}
          >
            全部
          </button>
          {ALL_FEATURE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-[13px] border ${
                typeFilter === t ? "border-primary bg-primary/5 text-primary" : "border-border"
              }`}
            >
              {FEATURE_LABELS[t]}
            </button>
          ))}
        </div>

        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">批次号</th>
                <th className="text-left px-4 py-3 font-medium">功能</th>
                <th className="text-left px-4 py-3 font-medium">参数摘要</th>
                <th className="text-left px-4 py-3 font-medium">模型</th>
                <th className="text-left px-4 py-3 font-medium">数量</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">操作人</th>
                <th className="text-left px-4 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => {
                const st = STATUS[t.status] ?? STATUS.pending;
                return (
                  <tr key={t.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-[12px]">{t.batch}</td>
                    <td className="px-4 py-3 font-medium">{FEATURE_LABELS[t.featureType]}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {t.paramsSummary}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{t.modelId}</td>
                    <td className="px-4 py-3">{t.quantity}</td>
                    <td className="px-4 py-3">
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3">{t.operator}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <p className="text-[12px] text-muted-foreground">
          后续可在此支持：重试、查看渲染后的完整 prompt、失败原因、消耗 Token 等
        </p>
      </div>
    </AdminShell>
  );
}
