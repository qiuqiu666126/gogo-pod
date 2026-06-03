import { useState } from "react";
import { ApiError } from "../../shared/http";
import { getAdminInfo, loginAdmin } from "../api/passportApi";
import { Btn } from "../components/ui";
import { login } from "../store";

function getErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    if (
      err.body &&
      typeof err.body === "object" &&
      "message" in err.body &&
      typeof err.body.message === "string"
    ) {
      return err.body.message;
    }
    return `登录失败：${err.status}`;
  }
  if (err instanceof Error) return err.message;
  return "登录失败，请稍后重试";
}

export function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("请输入账号和密码");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const session = await loginAdmin({
        username: trimmedUsername,
        password,
      });
      const user = await getAdminInfo(session.access_token);
      login(session, user);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-muted/40 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] rounded-2xl border border-border bg-card shadow-lg p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
            P
          </div>
          <h1 className="text-xl font-semibold">GOGO POD管理后台</h1>
          <p className="text-[13px] text-muted-foreground">
            使用管理员账号登录配置中心
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium">账号</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入账号"
            autoComplete="username"
            className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-[13px]"
            disabled={submitting}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium">密码</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
            className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-[13px]"
            disabled={submitting}
          />
        </label>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {error}
          </div>
        )}

        <Btn className="w-full" type="submit" disabled={submitting}>
          {submitting ? "登录中..." : "登录"}
        </Btn>

        <p className="text-[11px] text-center text-muted-foreground">
          接口：/admin/passport/login
        </p>
      </form>
    </div>
  );
}
