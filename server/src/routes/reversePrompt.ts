import { Router } from "express";
import { getDb } from "../db.js";
import type { FeaturePresetRow } from "../types.js";
import { renderPromptTemplate } from "../services/configMapper.js";

export const reversePromptRouter = Router();

reversePromptRouter.post("/reverse-prompt", async (req, res) => {
  const body = req.body as { imageUrl?: string; imageUrls?: string[]; assetId?: string };
  const urls = body.imageUrls?.length ? body.imageUrls : body.imageUrl ? [body.imageUrl] : [];

  const database = getDb();
  const preset = database
    .prepare(
      `SELECT * FROM feature_presets
       WHERE feature_type = 'text2img' AND preset_key = 'reverse-prompt' AND enabled = 1
       LIMIT 1`,
    )
    .get() as FeaturePresetRow | undefined;

  const template =
    preset?.prompt_template ??
    "分析图案风格、配色与构图，输出详细中文文生图提示词。";

  const config = database
    .prepare("SELECT * FROM feature_configs WHERE feature_type = 'text2img'")
    .get() as { api_key: string; api_base_url: string; model_id: string; system_prompt: string } | undefined;

  const prompts: string[] = [];

  for (const url of urls) {
    const rendered = renderPromptTemplate(template, { imageUrl: url });
    if (config?.api_key?.trim()) {
      try {
        const text = await callReverse(config, rendered, url);
        prompts.push(text);
        continue;
      } catch {
        /* fallback */
      }
    }
    prompts.push(
      `（Mock 反推）基于参考图的印花风格：几何纹样、高对比配色、适合纺织印刷；参考：${url.slice(0, 48)}…`,
    );
  }

  if (urls.length <= 1) {
    res.json({ prompt: prompts[0] ?? "" });
    return;
  }
  res.json({ prompts });
});

async function callReverse(
  config: { api_key: string; api_base_url: string; model_id: string; system_prompt: string },
  prompt: string,
  imageUrl: string,
): Promise<string> {
  const base = config.api_base_url?.trim() || "https://api.openai.com/v1";
  const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.api_key}`,
    },
    body: JSON.stringify({
      model: config.model_id,
      messages: [
        { role: "system", content: config.system_prompt || prompt },
        { role: "user", content: `图片地址：${imageUrl}\n${prompt}` },
      ],
      max_tokens: 800,
    }),
  });
  if (!res.ok) throw new Error("反推 API 失败");
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("空响应");
  return text;
}
