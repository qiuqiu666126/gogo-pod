import { Router } from "express";
import { v4 as uuid } from "uuid";

export const uploadRouter = Router();

/** 预签名上传占位：开发环境返回直传占位，生产对接 OSS */
uploadRouter.post("/presign", (req, res) => {
  const body = req.body as { filename?: string; contentType?: string };
  const id = uuid();
  const filename = body.filename ?? "upload.bin";

  res.json({
    assetId: id,
    uploadUrl: `local://${id}`,
    publicUrl: "",
    headers: { "Content-Type": body.contentType ?? "application/octet-stream" },
    expiresIn: 3600,
    note: "开发模式：前端可继续使用 blob URL，生产请配置对象存储",
    filename,
  });
});
