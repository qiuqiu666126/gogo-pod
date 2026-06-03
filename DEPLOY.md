# 部署说明

## 在线访问地址

部署成功后：

| 页面 | 地址 |
|------|------|
| 前台 | `https://gogo-pod.pages.dev/` |
| 管理后台 | `https://gogo-pod.pages.dev/admin/` 或 `/admin.html` |

（若 Cloudflare 项目名不同，以实际 `*.pages.dev` 域名为准。）

## 本地构建

```bash
npm install
npm run build
```

产物目录：`dist/`

## GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:qiuqiu666126/gogo-pod.git
git push -u origin main
```

## Cloudflare Pages（GitHub Actions 自动部署）

1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**（或直接用手动上传 / Wrangler）。
2. 在 GitHub 仓库 **Settings → Secrets and variables → Actions** 添加：
   - `CLOUDFLARE_API_TOKEN`：Cloudflare API Token（需 Pages Edit 权限）
   - `CLOUDFLARE_ACCOUNT_ID`：账户 ID（Dashboard 右侧）
3. 推送 `main` 分支后，Actions 工作流 `.github/workflows/deploy-cloudflare-pages.yml` 会自动构建并部署。

## Cloudflare Pages（Wrangler 手动部署）

```bash
npm run build
npx wrangler pages deploy dist --project-name=gogo-pod
```

首次需执行 `npx wrangler login` 登录 Cloudflare。

## 构建配置（Dashboard 手动建项目时）

| 项 | 值 |
|----|-----|
| Framework | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 20 |
| Environment variable | `VITE_SKIP_FRONTEND_LOGIN=true`（可选，跳过前台登录演示） |

## 说明

- 当前为 **前端静态站点**（Vite）；`server/` 后端 API 未包含在本部署中，管理端场景预设等仍使用浏览器 localStorage。
- 构建时会生成 `dist/admin/index.html`，Cloudflare Pages 通过 `/admin/` 访问后台（勿使用易 308 循环的 `_redirects` 重写）。
