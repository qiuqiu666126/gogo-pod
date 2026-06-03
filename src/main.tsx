import { createRoot } from "react-dom/client";
import "./styles/index.css";

declare global {
  interface Window {
    __POD_ADMIN__?: boolean;
  }
}

function isAdminEntry(): boolean {
  if (window.__POD_ADMIN__ === true) return true;
  const path = window.location.pathname;
  if (path === "/admin" || path.startsWith("/admin/")) return true;
  if (/\/admin\.html$/i.test(path)) return true;
  if (window.location.hash === "#/admin") return true;
  return false;
}

async function bootstrap() {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<p style="padding:24px;font-family:sans-serif;color:#b91c1c">页面加载失败：未找到 #root</p>',
    );
    return;
  }

  try {
    if (isAdminEntry()) {
      const { AdminApp } = await import("./admin/AdminApp");
      createRoot(rootEl).render(<AdminApp />);
    } else {
      const { default: AppRoot } = await import("./app/AppRoot");
      createRoot(rootEl).render(<AppRoot />);
    }
  } catch (err) {
    console.error(err);
    rootEl.innerHTML = `<div style="padding:24px;font-family:sans-serif;max-width:560px">
      <h2 style="color:#b91c1c;margin:0 0 8px">管理后台加载失败</h2>
      <p style="color:#52525b;font-size:14px">请在项目根目录执行 <code>npm install</code> 后运行 <code>npm run dev</code>。</p>
      <pre style="margin-top:12px;padding:12px;background:#f4f4f5;border-radius:8px;font-size:12px;overflow:auto">${String(err)}</pre>
    </div>`;
  }
}

void bootstrap();
