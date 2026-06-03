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

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "pod-admin-dev";
const ADMIN_USER = {
  id: 1,
  username: "admin",
  user_type: "super_admin",
  nickname: "管理员",
  phone: "",
  email: "admin@gogopod.local",
  avatar: "",
  signed: "GOGO POD Admin",
  status: 1,
  login_ip: "127.0.0.1",
  login_time: "",
  created_by: 0,
  updated_by: 0,
  created_at: "2026-01-01 00:00:00",
  updated_at: "2026-01-01 00:00:00",
  remark: "Local dev admin",
  policy: {
    policy_type: "admin",
    is_default: true,
    value: {},
  },
};

app.post("/admin/passport/login", (req, res) => {
  const { username, password } = req.body ?? {};
  if (String(username ?? "").trim() !== "admin" || String(password ?? "") !== "123456") {
    res.status(200).json({
      code: 401,
      message: "账号或密码错误",
      data: null,
    });
    return;
  }

  res.json({
    code: 200,
    message: "ok",
    data: {
      access_token: ADMIN_TOKEN,
      refresh_token: ADMIN_TOKEN,
      expire_at: 24 * 60 * 60,
    },
  });
});

app.post("/admin/passport/refresh", (req, res) => {
  const header = req.headers.authorization;
  const provided = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!provided || provided !== ADMIN_TOKEN) {
    res.status(200).json({
      code: 401,
      message: "登录已过期",
      data: null,
    });
    return;
  }

  res.json({
    code: 200,
    message: "ok",
    data: {
      access_token: ADMIN_TOKEN,
      refresh_token: ADMIN_TOKEN,
      expire_at: 24 * 60 * 60,
    },
  });
});

app.get("/admin/passport/getInfo", (req, res) => {
  const header = req.headers.authorization;
  const provided = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!provided || provided !== ADMIN_TOKEN) {
    res.status(200).json({
      code: 401,
      message: "未登录",
      data: null,
    });
    return;
  }

  res.json({
    code: 200,
    message: "ok",
    data: {
      ...ADMIN_USER,
      login_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
});

app.post("/admin/passport/logout", (_req, res) => {
  res.json({
    code: 200,
    message: "ok",
    data: true,
  });
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
