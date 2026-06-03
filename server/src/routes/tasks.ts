import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getDb, nowIso, parseJson } from "../db.js";
import { runTask } from "../services/taskRunner.js";
import type { FeatureConfigRow, FeatureType, TaskRow, TaskStatus } from "../types.js";

export const tasksRouter = Router();

function formatBatch(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${String(date.getFullYear()).slice(2)}${p(date.getMonth() + 1)}${p(date.getDate())}${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}${String(date.getMilliseconds()).padStart(3, "0")}`;
}

tasksRouter.post("/", (req, res) => {
  const body = req.body as {
    type: FeatureType;
    modelId?: string;
    assetIds?: string[];
    sourceUrls?: string[];
    params?: { label: string; value: string }[];
    quantity?: number;
    remark?: string;
    operator?: string;
  };

  if (!body.type) {
    res.status(400).json({ error: "缺少 type" });
    return;
  }

  const database = getDb();
  const config = database
    .prepare("SELECT * FROM feature_configs WHERE feature_type = ?")
    .get(body.type) as FeatureConfigRow | undefined;

  if (!config || !config.enabled) {
    res.status(400).json({ error: "功能未启用", featureType: body.type });
    return;
  }

  const id = uuid();
  const now = new Date();
  const ts = nowIso();

  const task: TaskRow = {
    id,
    feature_type: body.type,
    model_id: body.modelId || config.model_id,
    status: "pending",
    batch: formatBatch(now),
    quantity: body.quantity ?? 1,
    params_json: JSON.stringify(body.params ?? []),
    asset_ids_json: JSON.stringify(body.assetIds ?? []),
    source_urls_json: JSON.stringify(body.sourceUrls ?? []),
    result_json: "[]",
    error_message: "",
    remark: body.remark ?? "",
    operator: body.operator ?? "system",
    created_at: ts,
    updated_at: ts,
  };

  database
    .prepare(
      `INSERT INTO tasks (
        id, feature_type, model_id, status, batch, quantity,
        params_json, asset_ids_json, source_urls_json, result_json,
        error_message, remark, operator, created_at, updated_at
      ) VALUES (
        @id, @feature_type, @model_id, @status, @batch, @quantity,
        @params_json, @asset_ids_json, @source_urls_json, @result_json,
        @error_message, @remark, @operator, @created_at, @updated_at
      )`,
    )
    .run(task);

  res.status(201).json({ id: task.id, batch: task.batch });
});

tasksRouter.get("/:id", (req, res) => {
  const database = getDb();
  const row = database.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id) as
    | TaskRow
    | undefined;
  if (!row) {
    res.status(404).json({ error: "任务不存在" });
    return;
  }
  res.json(formatTaskResponse(row));
});

tasksRouter.post("/:id/run", async (req, res) => {
  const database = getDb();
  const row = database.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id) as
    | TaskRow
    | undefined;
  if (!row) {
    res.status(404).json({ error: "任务不存在" });
    return;
  }

  const ts = nowIso();
  database
    .prepare("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?")
    .run("running" satisfies TaskStatus, ts, row.id);

  try {
    const result = await runTask(row);
    database
      .prepare(
        "UPDATE tasks SET status = ?, result_json = ?, error_message = '', updated_at = ? WHERE id = ?",
      )
      .run("completed", JSON.stringify(result), nowIso(), row.id);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "执行失败";
    database
      .prepare(
        "UPDATE tasks SET status = ?, error_message = ?, updated_at = ? WHERE id = ?",
      )
      .run("failed", message, nowIso(), row.id);
    res.status(500).json({ error: message });
  }
});

tasksRouter.post("/:id/retry", async (req, res) => {
  const database = getDb();
  const row = database.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id) as
    | TaskRow
    | undefined;
  if (!row) {
    res.status(404).json({ error: "任务不存在" });
    return;
  }
  database
    .prepare("UPDATE tasks SET status = ?, error_message = '', updated_at = ? WHERE id = ?")
    .run("running", nowIso(), row.id);
  try {
    const result = await runTask(row);
    database
      .prepare(
        "UPDATE tasks SET status = ?, result_json = ?, updated_at = ? WHERE id = ?",
      )
      .run("completed", JSON.stringify(result), nowIso(), row.id);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "执行失败";
    database
      .prepare("UPDATE tasks SET status = ?, error_message = ?, updated_at = ? WHERE id = ?")
      .run("failed", message, nowIso(), row.id);
    res.status(500).json({ error: message });
  }
});

function formatTaskResponse(row: TaskRow) {
  return {
    id: row.id,
    type: row.feature_type,
    modelId: row.model_id,
    status: row.status,
    batch: row.batch,
    quantity: row.quantity,
    params: parseJson(row.params_json, []),
    assetIds: parseJson(row.asset_ids_json, []),
    sourceUrls: parseJson(row.source_urls_json, []),
    results: parseJson(row.result_json, []),
    errorMessage: row.error_message,
    remark: row.remark,
    operator: row.operator,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
