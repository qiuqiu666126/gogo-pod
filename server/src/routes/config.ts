import { Router } from "express";
import { getDb } from "../db.js";
import { toPresetDto, toPublicConfig } from "../services/configMapper.js";
import type { FeatureConfigRow, FeaturePresetRow, FeatureType } from "../types.js";

export const configRouter = Router();

configRouter.get("/features", (_req, res) => {
  const database = getDb();
  const rows = database
    .prepare("SELECT * FROM feature_configs ORDER BY feature_type")
    .all() as FeatureConfigRow[];
  res.json({ items: rows.map(toPublicConfig) });
});

configRouter.get("/features/:type", (req, res) => {
  const type = req.params.type as FeatureType;
  const database = getDb();
  const row = database
    .prepare("SELECT * FROM feature_configs WHERE feature_type = ?")
    .get(type) as FeatureConfigRow | undefined;
  if (!row) {
    res.status(404).json({ error: "未找到功能配置" });
    return;
  }
  res.json(toPublicConfig(row));
});

configRouter.get("/features/:type/presets", (req, res) => {
  const type = req.params.type as FeatureType;
  const scene = typeof req.query.scene === "string" ? req.query.scene : "";
  const database = getDb();

  let rows: FeaturePresetRow[];
  if (scene) {
    rows = database
      .prepare(
        `SELECT * FROM feature_presets
         WHERE feature_type = ? AND enabled = 1 AND (scene = '' OR scene = ?)
         ORDER BY sort_order`,
      )
      .all(type, scene) as FeaturePresetRow[];
  } else {
    rows = database
      .prepare(
        `SELECT * FROM feature_presets
         WHERE feature_type = ? AND enabled = 1
         ORDER BY sort_order`,
      )
      .all(type) as FeaturePresetRow[];
  }

  res.json({ items: rows.map(toPresetDto) });
});

configRouter.get("/features/:type/presets/:presetKey", (req, res) => {
  const type = req.params.type as FeatureType;
  const { presetKey } = req.params;
  const scene = typeof req.query.scene === "string" ? req.query.scene : "";
  const database = getDb();

  const row = database
    .prepare(
      `SELECT * FROM feature_presets
       WHERE feature_type = ? AND preset_key = ? AND (scene = ? OR scene = '' OR ? = '')
       LIMIT 1`,
    )
    .get(type, presetKey, scene, scene) as FeaturePresetRow | undefined;

  if (!row) {
    res.status(404).json({ error: "未找到预设" });
    return;
  }
  res.json(toPresetDto(row));
});
