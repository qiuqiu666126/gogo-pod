import { useEffect, useState } from "react";
import { AdminShell, FeatureListSidebarConnected } from "../components/AdminShell";
import { Badge, Btn, Card, Field, Tabs, inputCls, textareaCls } from "../components/ui";
import { getFeatureConfig, updateFeatureConfig, useAdminStore } from "../store";

const PROVIDERS = ["openai-compatible", "replicate", "custom", "azure-openai", "dashscope", "volcengine"];

const DETAIL_TABS = [
  { id: "overview", label: "概览" },
  { id: "model", label: "模型与密钥" },
];

export function FeatureDetailPage() {
  const { selectedFeature } = useAdminStore();
  const config = getFeatureConfig(selectedFeature);
  const [tab, setTab] = useState("overview");
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState(config);

  useEffect(() => {
    const c = getFeatureConfig(selectedFeature);
    if (c) {
      setDraft({ ...c });
      setTab("overview");
    }
  }, [selectedFeature]);

  if (!config || !draft) return null;

  const save = () => {
    if (!draft) return;
    updateFeatureConfig(selectedFeature, draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminShell
      featureSidebar={<FeatureListSidebarConnected />}
      title={draft.label}
      subtitle="模型与基础信息 · 表单与提示词请在「场景预设」配置"
    >
      <div className="p-6 max-w-[720px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs items={DETAIL_TABS} value={tab} onChange={setTab} />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                className="rounded border-border"
              />
              启用功能
            </label>
            <Btn onClick={save}>{saved ? "已保存" : "保存"}</Btn>
          </div>
        </div>

        {tab === "overview" && (
          <div className="space-y-4">
            <Card>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="功能名称">
                  <input
                    className={inputCls}
                    value={draft.label}
                    onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  />
                </Field>
                <Field label="功能标识">
                  <input className={inputCls} value={draft.featureType} readOnly disabled />
                </Field>
                <Field label="分类">
                  <input
                    className={inputCls}
                    value={draft.category === "video" ? "视频" : "作图"}
                    readOnly
                    disabled
                  />
                </Field>
                <Field label="模型 ID">
                  <input
                    className={inputCls}
                    value={draft.modelId}
                    onChange={(e) => setDraft({ ...draft, modelId: e.target.value })}
                  />
                </Field>
                <Field label="说明" className="sm:col-span-2">
                  <textarea
                    className={textareaCls}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  />
                </Field>
              </div>
            </Card>
            <p className="text-[12px] text-muted-foreground rounded-lg border border-border bg-muted/30 px-4 py-3">
              前台表单控件、各场景参数、提示词片段请在左侧菜单「场景预设 → 场景表单」中配置。
            </p>
          </div>
        )}

        {tab === "model" && (
          <Card title="模型与 API">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="模型 ID (model_id)" hint="传给供应商的模型名称">
                <input
                  className={inputCls}
                  value={draft.modelId}
                  onChange={(e) => setDraft({ ...draft, modelId: e.target.value })}
                />
              </Field>
              <Field label="供应商">
                <select
                  className={inputCls}
                  value={draft.provider}
                  onChange={(e) => setDraft({ ...draft, provider: e.target.value })}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="API Base URL" className="sm:col-span-2">
                <input
                  className={inputCls}
                  placeholder="https://api.openai.com/v1"
                  value={draft.apiBaseUrl}
                  onChange={(e) => setDraft({ ...draft, apiBaseUrl: e.target.value })}
                />
              </Field>
              <Field label="API Key" hint="仅保存在管理后台" className="sm:col-span-2">
                <input
                  type="password"
                  className={inputCls}
                  placeholder="sk-..."
                  value={draft.apiKey}
                  onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <dt className="text-[13px] text-muted-foreground mb-1">Key 状态</dt>
                {draft.apiKey ? <Badge tone="success">已配置</Badge> : <Badge tone="warn">未配置</Badge>}
              </div>
            </div>
          </Card>
        )}

        <p className="text-[11px] text-muted-foreground">上次保存：{draft.updatedAt}</p>
      </div>
    </AdminShell>
  );
}
