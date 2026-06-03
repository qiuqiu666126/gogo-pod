import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getDb, nowIso, parseJson } from "../db.js";
import { toAdminConfig, toPresetDto } from "../services/configMapper.js";
import { runTask } from "../services/taskRunner.js";
import type {
  FeatureConfigRow,
  FeaturePresetRow,
  FeatureType,
  TaskRow,
} from "../types.js";

export const adminRouter = Router();

adminRouter.get("/feature-configs", (_req, res) => {
  const database = getDb();
  const rows = database
    .prepare("SELECT * FROM feature_configs ORDER BY feature_type")
    .all() as FeatureConfigRow[];
  res.json({ items: rows.map(toAdminConfig) });
});

adminRouter.get("/feature-configs/:type", (req, res) => {
  const type = req.params.type as FeatureType;
  const database = getDb();
  const row = database
    .prepare("SELECT * FROM feature_configs WHERE feature_type = ?")
    .get(type) as FeatureConfigRow | undefined;
  if (!row) {
    res.status(404).json({ error: "未找到" });
    return;
  }
  res.json(toAdminConfig(row));
});

adminRouter.put("/feature-configs/:type", (req, res) => {
  const type = req.params.type as FeatureType;
  const body = req.body as Partial<{
    label: string;
    enabled: boolean;
    modelId: string;
    provider: string;
    apiBaseUrl: string;
    apiKey: string;
    systemPrompt: string;
    userPromptTemplate: string;
    defaultParams: Record<string, unknown>;
    notes: string;
  }>;

  const database = getDb();
  const existing = database
    .prepare("SELECT * FROM feature_configs WHERE feature_type = ?")
    .get(type) as FeatureConfigRow | undefined;

  if (!existing) {
    res.status(404).json({ error: "未找到功能" });
    return;
  }

  const ts = nowIso();
  database
    .prepare(
      `UPDATE feature_configs SET
        label = COALESCE(@label, label),
        enabled = COALESCE(@enabled, enabled),
        model_id = COALESCE(@model_id, model_id),
        provider = COALESCE(@provider, provider),
        api_base_url = COALESCE(@api_base_url, api_base_url),
        api_key = CASE WHEN @api_key_set = 1 THEN @api_key ELSE api_key END,
        system_prompt = COALESCE(@system_prompt, system_prompt),
        user_prompt_template = COALESCE(@user_prompt_template, user_prompt_template),
        default_params = COALESCE(@default_params, default_params),
        notes = COALESCE(@notes, notes),
        updated_at = @updated_at
      WHERE feature_type = @feature_type`,
    )
    .run({
      feature_type: type,
      label: body.label ?? null,
      enabled: body.enabled === undefined ? null : body.enabled ? 1 : 0,
      model_id: body.modelId ?? null,
      provider: body.provider ?? null,
      api_base_url: body.apiBaseUrl ?? null,
      api_key_set: body.apiKey !== undefined ? 1 : 0,
      api_key: body.apiKey ?? "",
      system_prompt: body.systemPrompt ?? null,
      user_prompt_template: body.userPromptTemplate ?? null,
      default_params:
        body.defaultParams !== undefined ? JSON.stringify(body.defaultParams) : null,
      notes: body.notes ?? null,
      updated_at: ts,
    });

  const row = database
    .prepare("SELECT * FROM feature_configs WHERE feature_type = ?")
    .get(type) as FeatureConfigRow;
  res.json(toAdminConfig(row));
});

adminRouter.get("/presets", (req, res) => {
  const featureType = req.query.featureType as FeatureType | undefined;
  const database = getDb();
  let rows: FeaturePresetRow[];
  if (featureType) {
    rows = database
      .prepare(
        "SELECT * FROM feature_presets WHERE feature_type = ? ORDER BY sort_order, label",
      )
      .all(featureType) as FeaturePresetRow[];
  } else {
    rows = database
      .prepare("SELECT * FROM feature_presets ORDER BY feature_type, sort_order")
      .all() as FeaturePresetRow[];
  }
  res.json({ items: rows.map(toPresetDto) });
});

adminRouter.post("/presets", (req, res) => {
  const body = req.body as {
    featureType: FeatureType;
    presetKey: string;
    label: string;
    scene?: string;
    paramKey?: string;
    promptTemplate: string;
    extraParams?: Record<string, unknown>;
    sortOrder?: number;
    enabled?: boolean;
  };

  if (!body.featureType || !body.presetKey || !body.label) {
    res.status(400).json({ error: "缺少必填字段" });
    return;
  }

  const id = uuid();
  const ts = nowIso();
  const database = getDb();
  database
    .prepare(
      `INSERT INTO feature_presets (
        id, feature_type, preset_key, label, scene, param_key,
        prompt_template, extra_params, sort_order, enabled, updated_at
      ) VALUES (
        @id, @feature_type, @preset_key, @label, @scene, @param_key,
        @prompt_template, @extra_params, @sort_order, @enabled, @updated_at
      )`,
    )
    .run({
      id,
      feature_type: body.featureType,
      preset_key: body.presetKey,
      label: body.label,
      scene: body.scene ?? "",
      param_key: body.paramKey ?? "preset",
      prompt_template: body.promptTemplate ?? "",
      extra_params: JSON.stringify(body.extraParams ?? {}),
      sort_order: body.sortOrder ?? 0,
      enabled: body.enabled === false ? 0 : 1,
      updated_at: ts,
    });

  const row = database.prepare("SELECT * FROM feature_presets WHERE id = ?").get(id) as FeaturePresetRow;
  res.status(201).json(toPresetDto(row));
});

adminRouter.put("/presets/:id", (req, res) => {
  const { id } = req.params;
  const body = req.body as Partial<{
    label: string;
    scene: string;
    paramKey: string;
    promptTemplate: string;
    extraParams: Record<string, unknown>;
    sortOrder: number;
    enabled: boolean;
  }>;

  const database = getDb();
  const existing = database
    .prepare("SELECT * FROM feature_presets WHERE id = ?")
    .get(id) as FeaturePresetRow | undefined;
  if (!existing) {
    res.status(404).json({ error: "未找到预设" });
    return;
  }

  const ts = nowIso();
  database
    .prepare(
      `UPDATE feature_presets SET
        label = COALESCE(@label, label),
        scene = COALESCE(@scene, scene),
        param_key = COALESCE(@param_key, param_key),
        prompt_template = COALESCE(@prompt_template, prompt_template),
        extra_params = COALESCE(@extra_params, extra_params),
        sort_order = COALESCE(@sort_order, sort_order),
        enabled = COALESCE(@enabled, enabled),
        updated_at = @updated_at
      WHERE id = @id`,
    )
    .run({
      id,
      label: body.label ?? null,
      scene: body.scene ?? null,
      param_key: body.paramKey ?? null,
      prompt_template: body.promptTemplate ?? null,
      extra_params:
        body.extraParams !== undefined ? JSON.stringify(body.extraParams) : null,
      sort_order: body.sortOrder ?? null,
      enabled: body.enabled === undefined ? null : body.enabled ? 1 : 0,
      updated_at: ts,
    });

  const row = database.prepare("SELECT * FROM feature_presets WHERE id = ?").get(id) as FeaturePresetRow;
  res.json(toPresetDto(row));
});

adminRouter.delete("/presets/:id", (req, res) => {
  const database = getDb();
  const result = database.prepare("DELETE FROM feature_presets WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "未找到" });
    return;
  }
  res.status(204).send();
});

adminRouter.get("/tasks", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;
  const featureType = req.query.featureType as FeatureType | undefined;
  const database = getDb();

  let rows: TaskRow[];
  let total: { count: number };
  if (featureType) {
    rows = database
      .prepare(
        "SELECT * FROM tasks WHERE feature_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      )
      .all(featureType, limit, offset) as TaskRow[];
    total = database
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE feature_type = ?")
      .get(featureType) as { count: number };
  } else {
    rows = database
      .prepare("SELECT * FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .all(limit, offset) as TaskRow[];
    total = database.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
  }

  res.json({
    total: total.count,
    items: rows.map((r) => ({
      id: r.id,
      featureType: r.feature_type,
      modelId: r.model_id,
      status: r.status,
      batch: r.batch,
      quantity: r.quantity,
      operator: r.operator,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      errorMessage: r.error_message,
    })),
  });
});

adminRouter.get("/tasks/:id", (req, res) => {
  const database = getDb();
  const row = database.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id) as
    | TaskRow
    | undefined;
  if (!row) {
    res.status(404).json({ error: "未找到" });
    return;
  }
  res.json({
    id: row.id,
    featureType: row.feature_type,
    modelId: row.model_id,
    status: row.status,
    batch: row.batch,
    quantity: row.quantity,
    params: parseJson(row.params_json, []),
    results: parseJson(row.result_json, []),
    sourceUrls: parseJson(row.source_urls_json, []),
    errorMessage: row.error_message,
    remark: row.remark,
    operator: row.operator,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
});

adminRouter.post("/tasks/:id/run", async (req, res) => {
  const database = getDb();
  const row = database.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id) as
    | TaskRow
    | undefined;
  if (!row) {
    res.status(404).json({ error: "未找到" });
    return;
  }
  try {
    const result = await runTask(row);
    database
      .prepare(
        "UPDATE tasks SET status = ?, result_json = ?, updated_at = ? WHERE id = ?",
      )
      .run("completed", JSON.stringify(result), nowIso(), row.id);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "失败";
    res.status(500).json({ error: message });
  }
});
