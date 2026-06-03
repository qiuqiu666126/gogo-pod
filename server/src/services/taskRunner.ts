import { getDb, parseJson } from "../db.js";
import type { FeatureConfigRow, FeatureType, TaskRow } from "../types.js";
import { renderPromptTemplate } from "./configMapper.js";

const DEMO_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&h=800&fit=crop&auto=format";
const DEMO_VIDEO =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d7b?w=640&h=480&fit=crop&auto=format";

export type RunTaskResult = {
  items: { id: string; sourceUrl: string; resultUrl: string; mediaKind: "image" | "video" }[];
  success: number;
  failed: number;
  renderedPrompt?: string;
  provider?: string;
};

type ProductSetTemplatePromptConfig = {
  templateId?: string;
  templateName?: string;
  category?: string;
  images?: unknown[];
  promptTemplate?: string;
};

function getFeatureConfig(type: FeatureType): FeatureConfigRow | undefined {
  const database = getDb();
  return database
    .prepare("SELECT * FROM feature_configs WHERE feature_type = ? AND enabled = 1")
    .get(type) as FeatureConfigRow | undefined;
}

function paramsToRecord(
  params: { label: string; value: string }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of params) {
    const key = p.label.replace(/\s+/g, "_").toLowerCase();
    map[key] = p.value;
    map[p.label] = p.value;
  }
  return map;
}

function normalizeKey(input: string) {
  return input.replace(/\s+/g, "_").toLowerCase();
}

/**
 * 执行任务：读取后台配置的模型与提示词，调用供应商 API（已配置 Key 时）或返回演示结果
 */
export async function runTask(task: TaskRow): Promise<RunTaskResult> {
  const config = getFeatureConfig(task.feature_type);
  if (!config) {
    throw new Error(`功能 ${task.feature_type} 未启用或未配置`);
  }

  const params = parseJson<{ label: string; value: string }[]>(task.params_json, []);
  const paramMap = paramsToRecord(params);
  const templateConfigs = parseJson<ProductSetTemplatePromptConfig[]>(task.template_configs_json, []);
  const primaryTemplate = templateConfigs[0];
  const defaultParams = parseJson<Record<string, unknown>>(config.default_params, {});
  const merged = {
    ...defaultParams,
    ...paramMap,
    templateConfigs: JSON.stringify(templateConfigs),
    template_configs: JSON.stringify(templateConfigs),
    templateConfig: primaryTemplate ? JSON.stringify(primaryTemplate) : "",
    template_config: primaryTemplate ? JSON.stringify(primaryTemplate) : "",
    templateName: primaryTemplate?.templateName ?? "",
    template_name: primaryTemplate?.templateName ?? "",
    templateCategory: primaryTemplate?.category ?? "",
    template_category: primaryTemplate?.category ?? "",
  } as Record<string, string>;

  if (Array.isArray(templateConfigs) && templateConfigs.length > 0) {
    merged["templateCount"] = String(templateConfigs.length);
    merged["template_count"] = String(templateConfigs.length);
    merged["templatePlacementPrintImageCount"] = String(
      templateConfigs.reduce((count, template) => {
        const images = Array.isArray(template.images) ? template.images : [];
        return (
          count +
          images.reduce((imageCount, image) => {
            const placements =
              image && typeof image === "object" && Array.isArray((image as { placements?: unknown[] }).placements)
                ? ((image as { placements: unknown[] }).placements ?? [])
                : [];
            return (
              imageCount +
              placements.filter(
                (placement) =>
                  placement &&
                  typeof placement === "object" &&
                  typeof (placement as { printImageUrl?: unknown }).printImageUrl === "string" &&
                  ((placement as { printImageUrl?: string }).printImageUrl ?? "").trim(),
              ).length
            );
          }, 0)
        );
      }, 0),
    );
    merged["template_placement_print_image_count"] = merged["templatePlacementPrintImageCount"];
    templateConfigs.forEach((template, index) => {
      const order = index + 1;
      const serialized = JSON.stringify(template);
      merged[`template${order}Config`] = serialized;
      merged[`template${order}_config`] = serialized;
    });
  }

  params.forEach((param) => {
    const normalized = normalizeKey(param.label);
    merged[normalized] = param.value;
  });

  const promptTemplate = primaryTemplate?.promptTemplate?.trim() || config.user_prompt_template || config.system_prompt;
  const renderedPrompt = renderPromptTemplate(promptTemplate, merged);
  const fullPrompt = renderedPrompt;

  const sources = parseJson<string[]>(task.source_urls_json, []);
  const quantity = Math.max(task.quantity, sources.length || 1);
  const mediaKind = task.feature_type === "video" ? "video" : "image";

  // 已配置 API Key 时尝试调用（OpenAI 兼容 / 自定义 base URL）
  if (config.api_key?.trim()) {
    try {
      const remote = await callProvider(config, renderedPrompt, sources[0], mediaKind);
      if (remote) return remote;
    } catch (err) {
      console.warn("[taskRunner] 供应商调用失败，回退演示结果:", err);
    }
  }

  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 600));

  const items = Array.from({ length: quantity }, (_, i) => ({
    id: `${task.id}-item-${i}`,
    sourceUrl: sources[i] ?? sources[0] ?? DEMO_IMAGE,
    resultUrl: mediaKind === "video" ? DEMO_VIDEO : DEMO_IMAGE,
    mediaKind: mediaKind as "image" | "video",
  }));

  return {
    items,
    success: items.length,
    failed: 0,
    renderedPrompt: fullPrompt,
    provider: config.provider,
  };
}

async function callProvider(
  config: FeatureConfigRow,
  prompt: string,
  imageUrl: string | undefined,
  mediaKind: "image" | "video",
): Promise<RunTaskResult | null> {
  const base = config.api_base_url?.trim() || "https://api.openai.com/v1";
  const url = `${base.replace(/\/$/, "")}/chat/completions`;

  const body = {
    model: config.model_id,
    messages: [
      {
        role: "user",
        content: imageUrl
          ? `参考图: ${imageUrl}\n\n${prompt}`
          : prompt,
      },
    ],
    max_tokens: mediaKind === "video" ? 256 : 512,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.api_key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return null;

  // 若返回 URL 则使用，否则仍用演示图
  const resultUrl =
    text.match(/https?:\/\/[^\s]+/)?.[0] ?? (mediaKind === "video" ? DEMO_VIDEO : DEMO_IMAGE);

  return {
    items: [
      {
        id: `remote-0`,
        sourceUrl: imageUrl ?? DEMO_IMAGE,
        resultUrl,
        mediaKind,
      },
    ],
    success: 1,
    failed: 0,
    renderedPrompt: prompt,
    provider: config.provider,
  };
}
