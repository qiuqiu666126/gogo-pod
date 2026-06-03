import type { Request, Response, NextFunction } from "express";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const token = process.env.ADMIN_TOKEN ?? "pod-admin-dev";
  const header = req.headers.authorization;
  const provided =
    header?.startsWith("Bearer ") ? header.slice(7) : (req.headers["x-admin-token"] as string);

  if (!provided || provided !== token) {
    res.status(401).json({ error: "未授权", message: "请提供有效的 Admin Token" });
    return;
  }
  next();
}
