import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AdminShell, FeatureListSidebarConnected } from "../components/AdminShell";
import { Badge, Btn, Card, Field, Tabs, inputCls, textareaCls } from "../components/ui";
import { getDictionaryByCode } from "../api/dictionaryApi";
import {
  fetchFeatureConfigDetail,
  getFeatureConfig,
  persistFeatureConfig,
  useAdminStore,
} from "../store";

const DETAIL_TABS = [
  { id: "overview", label: "概览" },
  { id: "model", label: "模型与密钥" },
];

export function FeatureDetailPage() {
  const { selectedFeature, featuresLoading, featuresError } = useAdminStore();
  const config = getFeatureConfig(selectedFeature);
  const [tab, setTab] = useState("overview");
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState(config);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [providerOptions, setProviderOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    void getDictionaryByCode("ai_provider")
      .then((items) => {
        setProviderOptions(
          items.map((item) => ({
            value: item.value,
            label: item.label || item.value,
          })),
        );
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setTab("overview");
    setShowApiKey(false);

    void fetchFeatureConfigDetail(selectedFeature)
      .then((detail) => {
        if (!cancelled) setDraft({ ...detail });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载功能详情失败");
          const fallback = getFeatureConfig(selectedFeature);
          if (fallback) setDraft({ ...fallback });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedFeature]);

  if (featuresLoading && !draft) {
    return (
      <AdminShell featureSidebar={<FeatureListSidebarConnected />} title="AI 功能配置">
        <div className="p-6 text-[13px] text-muted-foreground">加载中…</div>
      </AdminShell>
    );
  }

  if (!draft) return null;

  const providerSelectOptions = [...providerOptions];
  if (draft.provider && !providerSelectOptions.some((item) => item.value === draft.provider)) {
    providerSelectOptions.unshift({ value: draft.provider, label: draft.provider });
  }

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const saved = await persistFeatureConfig(selectedFeature, draft);
      setDraft({ ...saved });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const hasApiKey = Boolean(draft.hasApiKey);

  return (
    <AdminShell
      featureSidebar={<FeatureListSidebarConnected />}
      title={draft.label}
      subtitle="模型与基础信息 · 表单与提示词请在「场景预设」配置"
    >
      <div className="p-6 max-w-[720px] space-y-5">
        {(featuresError || error) && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
            {error || featuresError}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs items={DETAIL_TABS} value={tab} onChange={setTab} />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                className="rounded border-border"
                disabled={loading || saving}
              />
              启用功能
            </label>
            <Btn onClick={() => void save()} disabled={loading || saving}>
              {saving ? "保存中…" : saved ? "已保存" : "保存"}
            </Btn>
          </div>
        </div>

        {loading ? (
          <div className="text-[13px] text-muted-foreground">加载详情中…</div>
        ) : null}

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
                <Field label="功能标识 (code)">
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
                  disabled={providerSelectOptions.length === 0}
                >
                  {providerSelectOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
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
              <Field label="API Key" className="sm:col-span-2">
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    className={`${inputCls} pr-10`}
                    placeholder="sk-..."
                    value={draft.apiKey}
                    onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    title={showApiKey ? "隐藏 API Key" : "查看 API Key"}
                    aria-label={showApiKey ? "隐藏 API Key" : "查看 API Key"}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <div className="sm:col-span-2">
                <dt className="text-[13px] text-muted-foreground mb-1">Key 状态</dt>
                {hasApiKey ? <Badge tone="success">已配置</Badge> : <Badge tone="warn">未配置</Badge>}
              </div>
            </div>
          </Card>
        )}

        <p className="text-[11px] text-muted-foreground">上次保存：{draft.updatedAt || "—"}</p>
      </div>
    </AdminShell>
  );
}
