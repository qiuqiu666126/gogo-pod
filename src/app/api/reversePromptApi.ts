import { http } from "./apiClient";
import type { UploadedAsset } from "./uploadApi";

export type ReversePromptResult = {
  assetId: string;
  imageUrl: string;
  prompt: string;
};

const MOCK_PROMPTS = [
  "Halloween pumpkin and vampire theme, vintage print style, bold colors",
  "Cute cartoon character pattern, flat illustration, white background",
  "Floral botanical repeat pattern, watercolor texture, soft pastel tones",
  "Retro sports graphic, distressed texture, navy and orange palette",
  "Abstract geometric shapes, modern minimalist, high contrast",
];

/**
 * 单张图片反推提示词；对接 POST /api/v1/text2img/reverse-prompt
 */
export async function reversePromptFromImage(asset: UploadedAsset): Promise<string> {
  try {
    const res = await http.post<{ prompt: string }>("/api/v1/text2img/reverse-prompt", {
      assetId: asset.id,
      imageUrl: asset.url,
    });
    if (res.prompt?.trim()) return res.prompt.trim();
  } catch {
    /* 回退 Mock */
  }

  await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
  const base = asset.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  const sample = MOCK_PROMPTS[Math.floor(Math.random() * MOCK_PROMPTS.length)];
  return base.length > 2 ? `${base}, ${sample}` : sample;
}

export async function reversePromptFromImages(
  assets: UploadedAsset[],
  onProgress?: (done: number, total: number) => void,
): Promise<ReversePromptResult[]> {
  const results: ReversePromptResult[] = [];
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]!;
    const prompt = await reversePromptFromImage(asset);
    results.push({ assetId: asset.id, imageUrl: asset.url, prompt });
    onProgress?.(i + 1, assets.length);
  }
  return results;
}
