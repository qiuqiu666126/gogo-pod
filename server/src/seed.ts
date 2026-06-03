import "dotenv/config";
import { v4 as uuid } from "uuid";
import { getDb, nowIso } from "./db.js";
import type { FeatureType } from "./types.js";

const FEATURES: {
  type: FeatureType;
  label: string;
  modelId: string;
  provider: string;
  systemPrompt: string;
  userPromptTemplate: string;
  defaultParams: Record<string, unknown>;
  notes: string;
}[] = [
  {
    type: "pattern-extract",
    label: "印花图提取",
    modelId: "pod-pattern-extract-v2",
    provider: "openai-compatible",
    systemPrompt: "你是印花图案提取专家，从商品图中分离出清晰可印刷的图案，保持边缘干净。",
    userPromptTemplate:
      "提取模式：{{mode}}；透明底：{{transparent}}；分辨率：{{resolution}}；比例：{{ratio}}。请从参考图中提取主图案。",
    defaultParams: { mode: "全能提取", resolution: "4k" },
    notes: "支持专项/全能提取、1k/4k",
  },
  {
    type: "cutout",
    label: "一键抠图",
    modelId: "pod-cutout-v1",
    provider: "replicate",
    systemPrompt: "高质量抠图，输出透明 PNG，边缘自然。",
    userPromptTemplate: "抠图模式：{{cutoutMode}}；边缘处理：{{edgeRefine}}。",
    defaultParams: { cutoutMode: "去背景" },
    notes: "",
  },
  {
    type: "crack",
    label: "图裂变",
    modelId: "pod-image-fission-v1",
    provider: "openai-compatible",
    systemPrompt: "根据参考图进行创意裂变，保持主体识别度，输出电商可用素材。",
    userPromptTemplate:
      "场景：{{scene}}；模式：{{mode}}；比例：{{ratio}}；数量：{{count}}。{{extra}}",
    defaultParams: { scene: "默认", mode: "艺术", count: 2 },
    notes: "按场景路由不同 preset，见 feature_presets",
  },
  {
    type: "text2img",
    label: "文生图",
    modelId: "pod-text2img-v3",
    provider: "openai-compatible",
    systemPrompt: "根据提示词生成高质量电商图案，风格统一、可印刷。",
    userPromptTemplate: "模式：{{mode}}；比例：{{ratio}}；提示词：\n{{prompt}}",
    defaultParams: { mode: "艺术", ratio: "1:1" },
    notes: "反推提示词使用独立 preset reverse-prompt",
  },
  {
    type: "vector",
    label: "转矢量图",
    modelId: "pod-vectorize-v1",
    provider: "custom",
    systemPrompt: "将位图转为干净矢量风格输出。",
    userPromptTemplate: "原图风格：{{style}}。",
    defaultParams: { style: "常规" },
    notes: "",
  },
  {
    type: "infringement",
    label: "侵权风险过滤",
    modelId: "pod-infringement-v1",
    provider: "custom",
    systemPrompt: "检测图案商标与版权风险，输出风险报告。",
    userPromptTemplate: "过滤深度：{{depth}}。",
    defaultParams: { depth: "基础过滤" },
    notes: "深度模式需 TRO/艺术家库",
  },
  {
    type: "product-set",
    label: "商品套图",
    modelId: "pod-mockup-set-v1",
    provider: "custom",
    systemPrompt: "将印花贴合到商品模板，生成套图。",
    userPromptTemplate: "模板分类：{{category}}；模板数：{{templateCount}}。",
    defaultParams: {},
    notes: "模板库后续扩展 mockup_templates 表",
  },
  {
    type: "video",
    label: "视频生成",
    modelId: "pod-video-gen-v2",
    provider: "openai-compatible",
    systemPrompt: "图生视频，商品展示动效自然流畅，无变形。",
    userPromptTemplate:
      "场景：{{scene}}；预设：{{preset}}；时长：{{duration}}；清晰度：{{genMode}}。\n{{customPrompt}}",
    defaultParams: { duration: "5s", genMode: "standard" },
    notes: "模特/商品/风铃三场景",
  },
];

function seedPresets(database: ReturnType<typeof getDb>) {
  const ts = nowIso();
  const videoPresets = [
    { key: "natural", label: "自然动态", scene: "model", prompt: "模特轻微摆动，自然光线，电商展示风格" },
    { key: "walk", label: "休闲走动", scene: "model", prompt: "模特缓慢走动，全身展示，背景简洁" },
    { key: "magazine", label: "杂志写真", scene: "model", prompt: "杂志感构图，柔和布光，高级感" },
    { key: "rotate", label: "转动展示", scene: "model", prompt: "模特缓慢转身，360度展示服装" },
    { key: "dance", label: "翩翩起舞", scene: "model", prompt: "轻盈舞动，布料飘逸" },
    { key: "pet", label: "宠物用品", scene: "product", prompt: "商品轻微晃动，可爱氛围" },
    { key: "rug", label: "地垫", scene: "product", prompt: "地垫纹理展示，俯视轻微推进" },
    { key: "blanket", label: "毛毯", scene: "product", prompt: "毛毯柔软质感，轻微飘动" },
    { key: "case", label: "手机壳", scene: "product", prompt: "手机壳光泽反射，缓慢旋转" },
    { key: "tablecloth", label: "桌布", scene: "product", prompt: "桌布花纹展开，微风效果" },
    { key: "flower", label: "花形风铃", scene: "wind", prompt: "花形风铃随风转动，清脆感" },
    { key: "heart", label: "爱心风铃", scene: "wind", prompt: "爱心风铃摆动，温馨背景" },
    { key: "tree", label: "圣诞树风铃", scene: "wind", prompt: "圣诞风铃转动，节日氛围" },
  ];

  const insertPreset = database.prepare(`
    INSERT OR IGNORE INTO feature_presets
    (id, feature_type, preset_key, label, scene, param_key, prompt_template, extra_params, sort_order, enabled, updated_at)
    VALUES (@id, @feature_type, @preset_key, @label, @scene, @param_key, @prompt_template, @extra_params, @sort_order, 1, @updated_at)
  `);

  videoPresets.forEach((p, i) => {
    insertPreset.run({
      id: uuid(),
      feature_type: "video",
      preset_key: p.key,
      label: p.label,
      scene: p.scene,
      param_key: "preset",
      prompt_template: p.prompt,
      extra_params: "{}",
      sort_order: i,
      updated_at: ts,
    });
  });

  const crackScenes = ["默认", "服装/纺织", "手机壳", "铁艺图形", "挂钟", "装饰画", "铁皮画"];
  crackScenes.forEach((scene, i) => {
    insertPreset.run({
      id: uuid(),
      feature_type: "crack",
      preset_key: `scene-${scene}`,
      label: scene,
      scene,
      param_key: "scene",
      prompt_template: `图裂变场景「${scene}」：保持主体，按场景风格裂变。`,
      extra_params: JSON.stringify({ scene }),
      sort_order: i,
      updated_at: ts,
    });
  });

  insertPreset.run({
    id: uuid(),
    feature_type: "text2img",
    preset_key: "reverse-prompt",
    label: "反推提示词",
    scene: "",
    param_key: "reverse",
    prompt_template: "分析图片中的图案、配色、风格，输出可用于文生图的详细中文提示词。",
    extra_params: "{}",
    sort_order: 0,
    updated_at: ts,
  });
}

function main() {
  const database = getDb();
  const ts = nowIso();

  const upsert = database.prepare(`
    INSERT INTO feature_configs (
      feature_type, label, enabled, model_id, provider, api_base_url, api_key,
      system_prompt, user_prompt_template, default_params, notes, updated_at
    ) VALUES (
      @feature_type, @label, 1, @model_id, @provider, '', '',
      @system_prompt, @user_prompt_template, @default_params, @notes, @updated_at
    )
    ON CONFLICT(feature_type) DO UPDATE SET
      label = excluded.label,
      model_id = excluded.model_id,
      provider = excluded.provider,
      system_prompt = excluded.system_prompt,
      user_prompt_template = excluded.user_prompt_template,
      default_params = excluded.default_params,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `);

  for (const f of FEATURES) {
    upsert.run({
      feature_type: f.type,
      label: f.label,
      model_id: f.modelId,
      provider: f.provider,
      system_prompt: f.systemPrompt,
      user_prompt_template: f.userPromptTemplate,
      default_params: JSON.stringify(f.defaultParams),
      notes: f.notes,
      updated_at: ts,
    });
  }

  seedPresets(database);
  console.log("Seed 完成：功能配置与预设已写入数据库");
}

main();
