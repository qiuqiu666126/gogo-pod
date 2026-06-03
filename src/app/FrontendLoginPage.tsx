import { useState } from "react";
import { frontendLogin } from "./auth/useFrontendSession";

export function FrontendLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await frontendLogin({
        username: username.trim(),
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "账号或密码错误，或账号已停用");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-full flex items-center justify-center bg-gradient-to-br from-orange-50 via-background to-amber-50/80 p-6"
      style={{ fontFamily: "var(--font-family)" }}
    >
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary text-primary-foreground items-center justify-center text-2xl font-bold shadow-lg shadow-primary/25 mb-4">
            灵
          </div>
          <h1 className="text-2xl font-semibold text-foreground">POD · 登录</h1>
          <p className="text-[13px] text-muted-foreground mt-2">
            请使用管理后台为您开设的账号登录
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-card shadow-xl p-8 space-y-5"
        >
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium">登录账号</span>
            <input
              className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium">密码</span>
            <input
              type="password"
              className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-[13px] text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-[14px] font-medium hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "登录中…" : "登录"}
          </button>
        </form>

        <p className="text-[11px] text-center text-muted-foreground mt-6 leading-relaxed">
          账号由管理后台「用户账号管理」创建
          {import.meta.env.DEV && (
            <>
              <br />
              <a href="/?skipLogin=1" className="text-primary underline mt-2 inline-block">
                开发预览：跳过登录
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
