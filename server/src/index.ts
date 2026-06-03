import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "./db.js";
import { adminAuth } from "./middleware/adminAuth.js";
import { adminRouter } from "./routes/admin.js";
import { configRouter } from "./routes/config.js";
import { reversePromptRouter } from "./routes/reversePrompt.js";
import { tasksRouter } from "./routes/tasks.js";
import { uploadRouter } from "./routes/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;

// 启动时确保数据库与默认数据
getDb();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "pod-api" });
});

app.use("/api/v1/config", configRouter);
app.use("/api/v1/tasks", tasksRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/text2img", reversePromptRouter);

app.use("/api/admin/v1", adminAuth, adminRouter);

// 生产可托管 admin 构建产物
const adminDist = path.join(__dirname, "../../dist-admin");
app.use("/admin", express.static(adminDist));
app.get("/admin/*", (_req, res) => {
  res.sendFile(path.join(adminDist, "index.html"), (err) => {
    if (err) res.status(404).send("Admin 未构建，请运行 pnpm dev 访问 /admin.html");
  });
});

app.listen(PORT, () => {
  console.log(`POD API 运行于 http://127.0.0.1:${PORT}`);
  console.log(`  业务 API: /api/v1/*`);
  console.log(`  管理 API: /api/admin/v1/* (Bearer ${process.env.ADMIN_TOKEN ?? "pod-admin-dev"})`);
});
