GOGO POD 电商 AI 设计平台 — 技术开发项目拆解表
==========================================================

- 文档版本：v2.0 更新日期：2026-05-29 代码库：`POD`（包名 `gogo-pod`） 阶段：UI 原型 + 部分 API 联调

本文档基于 `POD` 仓库**截至 2026-05-29** 的实际代码拆解。前台用户端、管理后台、Express 后端已并行开发：作图/视频等 AI 任务在 DEV 下可调用 `/api/v1/tasks`，失败时回退本地 Mock；官方工作流/套图模板、前台用户账号经 `localStorage` 跨端同步；工作流可视化编排器、任务详情页、后台模版管理页等已落地 UI。尚未完成：后台 AI 配置与 Server SQLite 打通、工作流执行引擎、采集/刊登/下载等业务 API、真实 OSS 与专用图像/视频推理服务。

UI 已完成 部分实现 已对接 API 仅 Mock 待开发

一、项目概览
------------

8

前台一级导航

9

后台管理页

20+

业务页面/子页

18+

任务/功能弹窗

8

AI 功能类型

12

Server 路由组

3

localStorage 共享域

6

已对接前台 API

### 产品定位

面向 POD（按需印刷）卖家的 AI 电商设计工作台：从**竞品/店铺采集** → **印花提取/裂变/文生图/套图** → **多平台刊登上架**，支持**可视化工作流**串联批量任务，覆盖服饰、手机壳、铁皮画、挂钟等品类。品牌统一为 **GOGO POD**。

二、技术架构（现状）
--------------------

### 前端（双入口）

-   框架：React 18 + TypeScript + Vite 6
-   用户端：`index.html` → `AppRoot.tsx` → `App.tsx`
-   管理端：`admin.html` → `AdminApp.tsx`（`__POD_ADMIN__`）
-   导航：`useState(activeNav)`，未接入 react-router
-   样式：Tailwind + `theme.css`；组件 Radix UI / Lucide
-   开发代理：Vite `/api` → `127.0.0.1:8080`
-   联调：`npm run dev:all`（seed + API + Web）

### 后端（server/）

-   Express + TypeScript + SQLite（`pod.db`）
-   表：`feature_configs`、`feature_presets`、`tasks`
-   任务执行：`taskRunner`（有 API Key 调 OpenAI 兼容 Chat；否则演示图）
-   上传：`POST /api/v1/upload/presign` 返回 `local://` 占位
-   管理 API：`/api/admin/v1/*`（Bearer `pod-admin-dev`）
-   种子：`npm run seed` → `server/src/seed.ts`

### 数据持久化分层

-   **localStorage**：前台用户、官方工作流模板、官方套图模板（`pod_*` 键，含旧键迁移）
-   **SQLite**：功能配置、场景预设、任务记录（server）
-   **内存**：功能任务列表、工作流任务、我的模板、商品库、后台 configs/presets、推荐案例
-   **割裂点**：后台 UI 改配置不写 SQLite；前台 DEV 读 server 配置，与后台内存不同步

### 建议目标架构

-   React Router + TanStack Query + 统一任务 Store
-   Admin ↔ Server 配置单源；WebSocket 任务进度
-   OSS/S3 真实上传；专用图像/视频推理服务
-   工作流编排引擎 + 消息队列 Worker
-   JWT 用户体系替换 localStorage 明文密码

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  浏览器 / Chrome 插件                                                          │
└───────────────┬──────────────────────────────┬─────────────────────────────────┘
                │                              │
    ┌───────────▼──────────┐       ┌───────────▼──────────┐
    │ 用户端 Web (React)    │       │ 管理后台 admin.html   │
    │ App.tsx · 8 导航模块   │       │ AdminApp · 9 管理页   │
    └───────────┬──────────┘       └───────────┬──────────┘
                │         localStorage          │ 内存 store（未接 API）
                │    pod_users / pod_templates  │
                └──────────────┬────────────────┘
                               │ /api/v1/*  (DEV 代理)
                ┌──────────────▼──────────────┐
                │  Express API :8080           │
                │  config · tasks · upload     │
                │  admin/v1 · text2img/reverse │
                └──────────────┬──────────────┘
                               │
                ┌──────────────▼──────────────┐
                │  SQLite pod.db               │
                │  + 目标：OSS / AI Workers    │
                └─────────────────────────────┘
```

三、站点信息架构（IA）
----------------------

用户端 — 全局壳层 App.tsx

登录门禁：FrontendLoginPage（AppRoot.tsx）

侧栏：首页 | 找图 | 作图 | 视频 | 上架 | 我的空间 | 任务中心 | 下载中心

顶栏（首页）：搜索 ⌘K · 通知 · 新建工作流

首页 workflow

欢迎区 · 快速开始 · 最近任务（taskCenterStore）· 推荐案例（硬编码）

WorkflowModal → WorkflowBuilderPage（全屏编排器）

WorkflowPage 列表 · WorkflowTemplatesPage 模板管理

找图 findimg — FindImagePage

数据采集：插件/店铺 Tab · 采集任务列表 CollectionTaskListContent

以图搜图：上传/空间选图 → 选平台 → 新开标签页跳转外链

作图 design — DesignPage

子页：印花提取 · 抠图 · 图裂变 · 文生图 · 商品套图 · 标题提取 · 矢量 · 侵权过滤

套图模板管理 ProductSetTemplatesPage

视频 video — VideoPage + VideoTaskModal

上架 publish — PublishPage（商品库 / 店铺 / 刊登模板）

我的空间 space — MySpacePage

任务中心 tasks — TaskCenterPage（功能 + 工作流任务聚合）

FeatureTaskDetailPage · WorkflowTaskDetailPage

下载中心 downloads — DownloadCenterPage（空态）

管理后台 — AdminShell 侧栏

概览 DashboardPage

AI 功能配置 FeatureDetailPage（模型/Key/提示词/参数映射）

场景预设 PresetsPage

推荐案例 RecommendationsPage

工作流模版 WorkflowTemplatesAdminPage（官方模板 + 可视化配置弹窗）

套图模版 ProductSetTemplatesAdminPage

用户账号 UsersPage（开设前台登录账号）

任务监控 TasksPage

系统设置 SettingsPage

四、用户端模块与实现状态
------------------------

| 模块           | nav ID    | 源文件                                                            | 子功能 / 弹窗                                        | 数据/API                               | 状态                                              |
|----------------|-----------|-------------------------------------------------------------------|------------------------------------------------------|----------------------------------------|---------------------------------------------------|
| 登录           | —         | AppRoot.tsx, FrontendLoginPage.tsx                                | 账号密码登录；DEV 可 skipLogin                       | shared/frontendUsers.ts → localStorage | 部分实现 |
| 应用壳层       | —         | App.tsx                                                           | 侧栏、顶栏、WorkflowModal、全局 Modals、工作流全屏页 | 混合                                   | UI 已完成     |
| 首页           | workflow  | App.tsx                                                           | 快速开始、最近任务、推荐玩法、PlayVideoModal         | 推荐硬编码；任务来自内存               | 部分实现 |
| 工作流列表     | workflow  | WorkflowPage.tsx                                                  | 任务列表、管理模板入口                               | workflowTasks.tsx 内存                 | UI 已完成     |
| 工作流模板     | workflow  | WorkflowTemplatesPage.tsx                                         | 官方/团队/我的 Tab；查看/新建任务/副本/以此新建模版  | 官方→localStorage；我的→内存           | 部分实现 |
| 工作流编排器   | 全屏      | WorkflowBuilderPage.tsx, WorkflowBuilderEditor.tsx                | 节点流、+ 添加作图/视频能力、右侧节点参数面板        | 保存模板 API 未接                      | UI 已完成     |
| 新建工作流任务 | Modal     | WorkflowNewTaskModal.tsx                                          | 选模板、上传素材、备注 → 任务中心                    | upload API + 内存任务                  | 部分实现 |
| 工作流任务详情 | tasks     | WorkflowTaskDetailPage.tsx                                        | 步骤条、Mock 步骤结果、商品套图预览                  | workflowStepResults.ts Mock            | UI 已完成     |
| 找图-采集      | findimg   | FindImagePage.tsx, CollectionTaskListContent.tsx                  | 插件/店铺 Tab、筛选栏、空表格                        | 无 API                                 | 仅 Mock     |
| 找图-以图搜图  | findimg   | FindImagePage.tsx (ImageSearchContent)                            | 拖放/上传/空间选图；Google/Shutterstock/Pinterest/MJ | 新开标签页跳转外链                     | 部分实现 |
| 作图-印花提取  | design    | PatternExtractPage.tsx, PatternExtractModal.tsx                   | 专项/全能、透明底、分辨率、比例；任务表+详情         | submitFeatureTask → server             | 已对接 API   |
| 作图-一键抠图  | design    | CutoutPage.tsx, CutoutModal.tsx                                   | 模式、边缘处理、批量                                 | submitFeatureTask → server             | 已对接 API   |
| 作图-图裂变    | design    | CrackImagePage.tsx, CrackImageModal.tsx                           | 多场景 Tab、铁艺/挂钟/铁皮画等分支                   | submitFeatureTask → server             | 已对接 API   |
| 作图-文生图    | design    | TextToImagePage.tsx, TextToImageModal.tsx                         | 4 模式、反推提示词、EXCEL 导入                       | tasks + reverse-prompt API             | 已对接 API   |
| 作图-商品套图  | design    | ProductSetPage.tsx, ProductSetTaskModal.tsx                       | 任务列表、模板管理入口、两步新建任务                 | submitFeatureTask → server             | 已对接 API   |
| 作图-套图模板  | design    | ProductSetTemplatesPage.tsx                                       | 官方/团队/我的；查看/新建/创建副本                   | 官方→localStorage                      | 部分实现 |
| 作图-标题提取  | design    | TitleExtractPage.tsx, TitleExtractTaskModal.tsx                   | 任务列表+详情                                        | server 无 title-extract 类型 → 纯 Mock | UI 已完成     |
| 作图-转矢量图  | design    | VectorPage.tsx, VectorTaskModal.tsx                               | 常规/黑白风格                                        | submitFeatureTask → server             | 已对接 API   |
| 作图-侵权过滤  | design    | InfringementFilterPage.tsx, InfringementFilterTaskModal.tsx       | 风险检测任务流                                       | submitFeatureTask → server             | 已对接 API   |
| 功能任务详情   | tasks     | FeatureTaskDetailPage.tsx                                         | 结果预览、废弃、再创作、入库、智能编辑               | featureTasks 内存                      | UI 已完成     |
| 视频           | video     | VideoPage.tsx, VideoTaskModal.tsx                                 | 模特动作/商品律动/风铃；首尾帧、预设、时长           | submitFeatureTask → server             | 已对接 API   |
| 上架           | publish   | PublishPage.tsx, ProductLibraryContent.tsx, ProductDetailPage.tsx | 商品库、店铺管理、刊登模板；AddStoreModal            | productLibrary 内存种子                | 部分实现 |
| 我的空间       | space     | MySpacePage.tsx, MySpacePickerModal.tsx                           | 网格、容量、标签按钮、批量选择                       | mySpaceData Mock                       | 仅 Mock     |
| 任务中心       | tasks     | TaskCenterPage.tsx, taskCenterStore.ts                            | 功能+工作流聚合；类型/状态筛选；删除                 | 内存；无 GET /api/v1/tasks 列表        | 部分实现 |
| 下载中心       | downloads | DownloadCenterPage.tsx                                            | 下载任务列表                                         | 空态                                   | 仅 Mock     |

五、管理后台模块与实现状态
--------------------------

| 页面        | 源文件                           | 管理内容                                                              | 持久化                                              | 状态                                              | 待办                         |
|-------------|----------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------|---------------------------------------------------|------------------------------|
| 登录        | LoginPage.tsx                    | 任意密码进入                                                          | 内存 authed                                         | 仅 Mock     | 对接 Admin Token / RBAC      |
| 概览        | DashboardPage.tsx                | 功能/用户/预设统计、待配置 Key 提醒                                   | 读 store + shared users                             | UI 已完成     | 接真实监控指标               |
| AI 功能配置 | FeatureDetailPage.tsx            | 8 功能：模型、Provider、API Key、系统/用户提示词、参数映射、限额      | 内存 store.ts                                       | 部分实现 | 读写 server feature\_configs |
| 场景预设    | PresetsPage.tsx                  | 视频/裂变等 scene prompt 模板 CRUD                                    | 内存 store.ts                                       | 部分实现 | 读写 server feature\_presets |
| 推荐案例    | RecommendationsPage.tsx          | 首页推荐玩法卡片（图/视频/标签）                                      | 页面内 useState                                     | UI 已完成     | 持久化 API + 前台读取        |
| 工作流模版  | WorkflowTemplatesAdminPage.tsx   | 官方模板 CRUD；品类/步骤/排序/启用；WorkflowBuilderModal 配置节点参数 | localStorage pod\_official\_workflow\_templates     | 部分实现 | 迁移至 server；用户端同步    |
| 套图模版    | ProductSetTemplatesAdminPage.tsx | 官方套图：名称、品类、主图/缩略图 URL、排序                           | localStorage pod\_official\_product\_set\_templates | 部分实现 | 迁移至 server + OSS 上传     |
| 用户账号    | UsersPage.tsx                    | 开设/编辑/停用前台登录账号                                            | localStorage pod\_frontend\_users                   | 部分实现 | 后端用户表 + 密码哈希        |
| 任务监控    | TasksPage.tsx                    | 全站 AI 任务列表（演示数据）                                          | 内存 INITIAL\_TASKS                                 | 仅 Mock     | 接 GET /api/admin/v1/tasks   |
| 系统设置    | SettingsPage.tsx                 | Admin Token、OSS 等占位                                               | 无                                                  | 仅 Mock     | 环境配置管理                 |

六、共享数据层（src/shared/）
-----------------------------

| 模块 | localStorage 键 | 内容 | 消费方 |
| --- | --- | --- | --- |
| frontendUsers.ts | `pod_frontend_users` `pod_frontend_session` | 前台账号、登录会话；含演示账号种子 | 用户端登录、后台 UsersPage |
| workflowTemplates.ts | `pod_official_workflow_templates` | 官方工作流模板（品类、步骤、stepConfigs、排序） | 后台工作流模版页、用户端官方 Tab |
| productSetTemplates.ts | `pod_official_product_set_templates` | 官方套图模板（品类、图片 URL） | 后台套图模版页、ProductSetTemplatesPage |
| storageMigrate.ts | — | 旧 `lingtu_*` 键一次性迁移至 `pod_*` | 各 store 初始化 |

七、工作流节点类型（编排器已支持）
----------------------------------

`WorkflowBuilderEditor` 支持「开始 → 添加素材 → 处理节点 → +」；点击节点右侧展示参数面板（`workflowNodeConfigPanels.tsx`）。后台官方模板通过 `WorkflowBuilderModal` 同样配置。

`添加素材``印花图提取``图案裁剪``图裂变` `一键抠图``商品套图``标题提取` `侵权风险过滤``转矢量图``文生图``视频生成`

品类 Tab（工作流/套图）：服饰、铁皮画、家用纺织、挂钟、装饰画、手机壳、亚克力、其他；套图另有「推荐」。 模板来源：官方（localStorage）、团队（从官方派生 Mock）、我的（用户操作写入内存）。

八、Server API 实现状态
-----------------------

| 方法    | 路径                                       | 说明                              | 状态                                                |
|---------|--------------------------------------------|-----------------------------------|-----------------------------------------------------|
| GET     | /health                                    | 健康检查，service: pod-api        | 已实现         |
| GET     | /api/v1/config/features                    | 公开功能配置列表（脱敏）          | 已实现         |
| GET     | /api/v1/config/features/:type              | 单功能配置                        | 已实现         |
| GET     | /api/v1/config/features/:type/presets      | 场景预设列表                      | 已实现         |
| GET     | /api/v1/config/features/:type/presets/:key | 单条预设                          | 已实现         |
| POST    | /api/v1/tasks                              | 创建任务（校验 feature 启用）     | 已实现         |
| GET     | /api/v1/tasks/:id                          | 查询任务详情                      | 已实现         |
| POST    | /api/v1/tasks/:id/run                      | 执行任务（Chat 占位 / 演示图）    | 部分实现   |
| POST    | /api/v1/tasks/:id/retry                    | 重试任务                          | 部分实现   |
| GET     | /api/v1/tasks                              | 前台任务列表                      | 未实现        |
| POST    | /api/v1/upload/presign                     | OSS 预签名                        | Stub local:// |
| POST    | /api/v1/text2img/reverse-prompt            | 图片反推提示词                    | 部分实现   |
| GET/PUT | /api/admin/v1/feature-configs              | 管理端功能配置 CRUD               | 已实现         |
| CRUD    | /api/admin/v1/presets                      | 场景预设管理                      | 已实现         |
| GET     | /api/admin/v1/tasks                        | 管理端任务列表                    | 已实现         |
| —       | 工作流 / 采集 / 商品 / 店铺 / 下载 / 用户  | 业务域 API                        | 未实现        |
| —       | title-extract 功能类型                     | 前台已有，server FeatureType 缺失 | 未实现        |
| WS      | /ws/tasks                                  | 任务进度推送                      | 未实现        |

九、开发项目总表（按模块）
--------------------------

### A. 基础设施 & 工程化

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A01 | 工程化 | 路由与深链 | 接入 React Router；URL 与侧栏同步；任务详情/弹窗可分享链接 | P0 | 前端 | — | 3d | 待开发 |
| A02 | 工程化 | 用户鉴权体系 | 替换 localStorage 明文密码；JWT 刷新；与后台 UsersPage 打通 server 用户表 | P0 | 后端 | — | 5d | 原型登录 |
| A03 | 工程化 | API 层统一 | apiClient 已有；补全错误处理、TanStack Query、任务列表轮询/WS | P0 | 前端 | A02 | 3d | 部分实现 |
| A04 | 工程化 | 真实文件上传 | presign → OSS 直传；assets 表；各弹窗/空间打通 | P0 | 后端 | A02 | 5d | Stub |
| A05 | 工程化 | 任务持久化 & 列表 API | GET /api/v1/tasks；前台任务中心/各功能页从 server 拉取；刷新不丢 | P0 | 后端 | A02 | 4d | 创建/详情已有 |
| A06 | 工程化 | Admin ↔ Server 配置同步 | 后台 FeatureDetail/Presets 读写 SQLite；消除双份配置源 | P0 | 前端 | — | 4d | 待开发 |
| A07 | 工程化 | 专用 AI Provider | 图像/视频推理服务替代 taskRunner Chat 占位；按 featureType 分发 pipeline | P0 | AI | A05 | 20d | Chat 占位 |
| A08 | 工程化 | 全局搜索 ⌘K | 搜索任务、商品、素材、模板 | P2 | 前端 | A05 | 4d | UI 占位 |

### B. 管理后台

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B01 | 后台 | 官方工作流模版 | 已实现列表+编辑+WorkflowBuilderModal；需迁移 server + 图片资源管理 | P1 | 后端 | A06 | 3d | localStorage |
| B02 | 后台 | 官方套图模版 | 已实现 CRUD；需 OSS 上传替代 URL 手填 | P1 | 后端 | A04 | 3d | localStorage |
| B03 | 后台 | 推荐案例配置 | RecommendationsPage UI 已有；持久化并驱动首页 recommendations | P1 | 后端 | — | 3d | 内存 |
| B04 | 后台 | 任务监控对接 | TasksPage 接 GET /api/admin/v1/tasks 真实数据 | P1 | 前端 | A05 | 2d | 演示数据 |

### C. 我的空间

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C01 | 我的空间 | 素材 CRUD | MySpacePage 网格+容量 UI；SelectFromMySpaceButton 已用于多场景 | P0 | 前端 | A04 | 4d | Mock 5 条 |
| C02 | 我的空间 | 标签 & 批量操作 | 标签管理按钮已有；补 API 与批量删除/移动 | P2 | 前端 | C01 | 3d | UI 占位 |

### D. 找图

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D01 | 找图 | 浏览器插件采集 | 插件写入采集列表；安装检测、FAQ | P0 | 插件 | A04,A05 | 10d | 待开发 |
| D02 | 找图 | 采集列表 & 任务 | FindImagePage 表格/筛选 UI 完整；CollectionTaskListContent 空列表 | P0 | 前端 | D01 | 5d | UI 已完成 |
| D03 | 找图 | 以图搜图 | 已实现选图+选平台+按钮高亮+外链跳转；后续可接平台 API 回传结果 | P1 | 后端 | C01 | 8d | 外链跳转 |

### E. 作图 — AI 图像

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E01 | 作图 | 一键抠图 | CutoutPage + Modal + 任务详情；submitFeatureTask | P0 | AI | A07 | — | UI+API |
| E02 | 作图 | 印花图提取 | 专项/全能、透明底、1k/4k、比例；节点配置面板已对齐 | P0 | AI | A07 | — | UI+API |
| E03 | 作图 | 图裂变全场景 | 默认/服装/铁艺/挂钟/铁皮画等 CrackImageModal 分支 | P0 | AI | A07 | — | UI+API |
| E04 | 作图 | 文生图 | 4 模式、反推、EXCEL；reverse-prompt API | P0 | AI | A07 | — | UI+API |
| E05 | 作图 | 转矢量图 | VectorPage + Modal + 详情 | P1 | AI | A07 | — | UI+API |
| E06 | 作图 | 侵权风险过滤 | InfringementFilterPage + Modal | P1 | AI | A07 | — | UI+API |
| E07 | 作图 | 标题提取 | TitleExtractPage 已修复白屏；需 server 补 title-extract 类型 | P1 | AI | A07 | 5d | UI 已完成 |
| E08 | 作图 | 图案裁剪 | 工作流节点名存在；无独立功能页，需补或并入节点 | P2 | AI | E01 | 6d | 仅工作流提及 |
| E09 | 作图 | 功能任务详情通用能力 | FeatureTaskDetailPage：预览、废弃、再创作、入库、智能编辑 | P1 | 前端 | A05 | — | UI 已完成 |

### F. 商品套图

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | 套图 | 套图任务 & 两步新建 | ProductSetPage + ProductSetTaskModal Step1/2 | P0 | 前端 | A07 | — | UI+API |
| F02 | 套图 | 套图模板管理 | 官方/团队/我的；后台可配官方模板 | P0 | 后端 | B02 | — | 部分实现 |
| F03 | 套图 | 套图合成引擎 | 印花处理、描边、压缩、多模板批量输出 | P0 | AI | F01,A04 | 12d | Mock 结果 |
| F04 | 套图 | PSD 样机 | 用户 PSD 1:1 套图 | P2 | AI | F03 | 15d | 待规划 |

### G. 视频

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G01 | 视频 | 视频任务 & Modal | 三场景、首尾帧、预设、清晰度、时长、数量 | P1 | AI | A07 | — | UI+API |

### H. 上架

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H01 | 上架 | 商品库 | 列表筛选 UI；ProductDetailPage；任务结果可入库 | P0 | 后端 | — | 6d | 内存种子 |
| H02 | 上架 | 店铺管理 | 列表+AddStoreModal（Temu/Amazon/Shein） | P0 | 后端 | A02 | 5d | UI 已完成 |
| H03 | 上架 | 批量刊登上架 | 商品库 → 店铺 → 平台 API | P0 | 后端 | H01,H02 | 15d | 待开发 |

### I. 工作流引擎

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| I01 | 工作流 | 模板库 | 官方 localStorage + 团队 Mock + 我的内存；WorkflowModal/CopyModal | P0 | 后端 | A02 | 5d | 部分实现 |
| I02 | 工作流 | 可视化编排器 | WorkflowBuilderEditor：节点、+菜单、参数面板、stepConfigs 持久化（官方模板） | P0 | 前端 | I01 | — | UI 已完成 |
| I03 | 工作流 | 工作流执行引擎 | 按节点调度 E/F/G 任务；状态机；WorkflowTaskDetail 接真实步骤结果 | P0 | 后端 | I02,A05 | 15d | 待开发 |
| I04 | 工作流 | 新建任务 & 模板副本 | WorkflowNewTaskModal；以此新建模版 → Builder；创建副本 → 我的模版 | P1 | 前端 | I01 | — | UI 已完成 |

### J. 任务中心 & 下载

| ID | 模块 | 功能点 | 需求描述 / 验收要点 | 优先级 | 负责 | 依赖 | 工期估 | 现状 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| J01 | 任务中心 | 聚合列表 & 筛选 | 功能任务+工作流任务；类型/状态筛选；跳转双详情页 | P0 | 前端 | A05 | — | 内存聚合 |
| J02 | 任务中心 | 结果下载 & 备注 | 打包下载；跳转下载中心 | P0 | 后端 | J03 | 4d | 待开发 |
| J03 | 下载中心 | 异步打包任务 | DownloadCenterPage 空态 UI | P0 | 后端 | A04 | 5d | UI 已完成 |
十、前台 API 集成对照
---------------------

| 文件                    | 调用                    | 真实 API                        | Mock 回退         |
|-------------------------|-------------------------|---------------------------------|-------------------|
| api/apiClient.ts        | 通用 fetch              | DEV 代理 / VITE\_API\_BASE\_URL | —                 |
| api/taskApi.ts          | POST /api/v1/tasks      | ✓                               | catch → null      |
| featureTaskApi.ts       | POST .../run, retry     | ✓ 有 remoteTaskId               | 本地延迟 + 演示图 |
| api/featureConfigApi.ts | GET /api/v1/config/\*   | ✓                               | 空 Map            |
| api/uploadApi.ts        | POST .../presign        | Stub                            | blob URL          |
| api/reversePromptApi.ts | POST .../reverse-prompt | 部分                            | 随机 Mock 文案    |
| featureTasks.tsx        | 编排提交                | 部分                            | 内存 store        |
| workflowTasks.tsx       | —                       | ✗                               | 纯内存            |
| shared/\*Templates.ts   | —                       | ✗                               | localStorage      |
| shared/frontendUsers.ts | —                       | ✗                               | localStorage      |
| admin/store.ts          | —                       | ✗ 未调 server                   | 内存              |

十一、建议分期排期（基于现状）
------------------------------

### 第一期：打通数据与 AI 真能力（约 6–8 周）

-   A02/A05/A06 Admin↔Server 与用户/任务持久化
-   A04 真实 OSS 上传 + C01 我的空间 API
-   A07 专用图像推理替换 Chat 占位
-   E07 server 补齐 title-extract
-   B04 后台任务监控接真实数据

### 第二期：业务闭环（约 8–10 周）

-   I03 工作流执行引擎 + 步骤结果回写
-   F03 套图合成真实输出
-   D01–D02 插件采集 API
-   H01–H03 商品库 + 店铺 + 刊登
-   J02–J03 下载打包

### 第三期：增长与运营（约 4–6 周）

-   B03 推荐案例持久化 + 首页动态化
-   D03 以图搜图平台 API（可选）
-   F04 PSD 样机、A08 全局搜索
-   E08 图案裁剪独立能力
-   A01 React Router 深链

### 已完成（无需重复排期）

-   作图 8 项功能 UI + 任务流（除标题提取 server 类型）
-   工作流编排器、模板管理、新建任务全流程 UI
-   任务中心双详情页、功能任务通用详情
-   后台官方工作流/套图模版管理 + 可视化配置
-   前台登录、后台用户管理（localStorage）
-   以图搜图外链跳转交互

十二、技术风险与待确认项
------------------------

-   **双配置源**：admin/store.ts 与 server SQLite 不一致，生产前必须统一
-   **任务双写**：前台内存任务与 server tasks 表未双向同步，刷新后列表不一致
-   **AI 占位**：taskRunner 使用 Chat Completions，非真实抠图/裂变/视频 pipeline
-   **无路由**：任务详情、商品编辑无法 URL 分享
-   **明文密码**：frontendUsers localStorage 仅适合原型
-   **插件方案**：采集插件与主站账号、跨域通信待产品确认
-   **平台刊登**：Temu/Amazon/Shein API 合规与限流单独评估
-   **批量上限**：1000 张任务对队列与 GPU 资源规划压力大

基于 POD 代码库 v2.0 拆解 · `docs/开发项目拆解表.html` · 浏览器直接打开或打印 · 更新 2026-05-29
