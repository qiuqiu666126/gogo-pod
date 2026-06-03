import { useEffect, useState } from "react";
import {
  registerNavigateToMySpace,
  registerNavigateToTaskCenter,
  registerNavigateToWorkflowList,
} from "./appNavigation";
import { WorkflowPage } from "./WorkflowPage";
import { addWorkflowTask } from "./workflowTasks";
import { PublishPage } from "./PublishPage";
import { TaskCenterPage } from "./TaskCenterPage";
import { DesignPage } from "./DesignPage";
import { DownloadCenterPage } from "./DownloadCenterPage";
import { FindImagePage } from "./FindImagePage";
import { MySpacePage } from "./MySpacePage";
import { useTaskCenterRecords } from "./taskCenterStore";
import { VideoPage } from "./VideoPage";
import { TextToImageModal } from "./TextToImageModal";
import { Toaster } from "./components/ui/sonner";
import { PatternExtractModal } from "./PatternExtractModal";
import { CrackImageModal } from "./CrackImageModal";
import { submitFeatureTask } from "./featureTasks";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  Zap,
  FolderOpen,
  Telescope,
  PenTool,
  Video,
  Store,
  ClipboardList,
  Download,
  Plus,
  Bell,
  User,
  ChevronRight,
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Flame,
  ArrowLeft,
  Info,
  AlertTriangle,
  ChevronRight as Arrow,
} from "lucide-react";
import { PlayVideoModal } from "./PlayVideoModal";
import { WorkflowBuilderPage, normalizeWorkflowBuilderSteps } from "./WorkflowBuilderPage";
import { WorkflowNewTaskModal } from "./WorkflowNewTaskModal";
import { WorkflowTemplatesPage } from "./WorkflowTemplatesPage";
import {
  WORKFLOW_CATEGORY_TABS,
  getOfficialTemplatesRecord,
  getUserTemplatesRecord,
  useWorkflowTemplateVersion,
  type WorkflowCategory,
  type WorkflowTemplate,
} from "./workflowTemplateStore";
import { frontendLogout, useFrontendSession } from "./auth/useFrontendSession";

// ─── Sidebar nav ────────────────────────────────────────────────────────────
const sidebarNav = [
  { icon: Zap, label: "首页", id: "workflow" },
  { icon: Telescope, label: "找图", id: "findimg" },
  { icon: PenTool, label: "作图", id: "design" },
  { icon: Video, label: "视频", id: "video" },
  { icon: Store, label: "上架", id: "publish" },
  { icon: FolderOpen, label: "我的空间", id: "space" },
  { icon: ClipboardList, label: "任务中心", id: "tasks" },
  { icon: Download, label: "下载中心", id: "downloads" },
];

// ─── Quick start ─────────────────────────────────────────────────────────────
const quickStartBlank = {
  id: "blank",
  icon: <Plus size={22} className="text-zinc-500" />,
  title: "工作流",
  desc: "节点顺序随心排，采集/提取/裂变/合成/刊登一键串联",
  gradient: "from-zinc-100 to-zinc-50",
  borderColor: "border-zinc-200",
  hoverGlow: "hover:border-primary/30",
  openModal: true,
};

const quickStartTextToImage = {
  id: "text2img",
  icon: <PenTool size={22} className="text-primary" />,
  title: "文生图",
  desc: "输入提示词，AI 生成图片",
  gradient: "from-orange-50 to-amber-50",
  borderColor: "border-orange-200/80",
  hoverGlow: "hover:border-primary/35",
};

const quickStartPatternExtract = {
  id: "pattern",
  icon: <Layers size={22} className="text-amber-600" />,
  title: "印花图提取",
  desc: "不惧模糊遮挡透视，独家支持多比例提取",
  gradient: "from-amber-50 to-yellow-50",
  borderColor: "border-amber-200/80",
  hoverGlow: "hover:border-primary/35",
};

const quickStartCrackImage = {
  id: "crack",
  icon: <Sparkles size={22} className="text-orange-500" />,
  title: "图裂变",
  desc: "识别图案卖点裂变图案",
  gradient: "from-orange-50 to-rose-50",
  borderColor: "border-orange-200/70",
  hoverGlow: "hover:border-primary/35",
};

const quickStartFeatureCards = [quickStartTextToImage, quickStartPatternExtract, quickStartCrackImage];

// ─── Recommendations ─────────────────────────────────────────────────────────
const recommendations = [
  { id: 1, title: "2D印花秒变3D效果 Etsy爆款月入10w+", desc: "3D立体印花 · 爆款玩法", tag: "热门", tagColor: "text-orange-400 bg-orange-400/10", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=240&fit=crop&auto=format", videoUrl: "//player.bilibili.com/player.html?bvid=BV1LbxheoEcM&autoplay=1" },
  { id: 2, title: "手机壳高还原度跟款", desc: "支持iPhone · 三星全系", tag: "新品", tagColor: "text-emerald-400 bg-emerald-400/10", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=240&fit=crop&auto=format", videoUrl: "//player.bilibili.com/player.html?bvid=BV1LbxheoEcM&autoplay=1" },
  { id: 3, title: "帆布包爆款二创玩法", desc: "文艺风设计 · 多色配色", tag: "推荐", tagColor: "text-violet-400 bg-violet-400/10", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=240&fit=crop&auto=format", videoUrl: "//player.bilibili.com/player.html?bvid=BV1LbxheoEcM&autoplay=1" },
  { id: 4, title: "儿童节印花系列", desc: "卡通风格 · 批量定制", tag: "热门", tagColor: "text-orange-400 bg-orange-400/10", img: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=240&fit=crop&auto=format", videoUrl: "//player.bilibili.com/player.html?bvid=BV1LbxheoEcM&autoplay=1" },
];

// ─── Small helpers ────────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 size={15} className="text-emerald-400" />;
  if (status === "running") return <Loader2 size={15} className="text-blue-400 animate-spin" />;
  return <XCircle size={15} className="text-red-400" />;
}

function StatusLabel({ status }: { status: string }) {
  if (status === "completed") return <span className="text-emerald-400">已完成</span>;
  if (status === "running") return <span className="text-blue-400">运行中</span>;
  return <span className="text-red-400">失败</span>;
}

function toRecentTaskStatus(status: string) {
  if (status === "已完成") return "completed";
  if (status === "运行中") return "running";
  return "failed";
}

// ─── Workflow Modal ───────────────────────────────────────────────────────────
function WorkflowModal({
  open,
  onClose,
  onCreateBlank,
  onCreateFromTemplate,
  title = "创建工作流",
}: {
  open: boolean;
  onClose: () => void;
  onCreateBlank: (name: string) => void;
  onCreateFromTemplate: (
    name: string,
    steps: string[],
    stepConfigs?: Record<string, Record<string, unknown>>,
  ) => void;
  title?: string;
}) {
  const [leftTab, setLeftTab] = useState<"blank" | "hot" | "mine">("hot");
  const [category, setCategory] = useState<WorkflowCategory>("服饰");
  const [blankTemplateName, setBlankTemplateName] = useState("");
  const [blankNameError, setBlankNameError] = useState("");
  useWorkflowTemplateVersion();

  const isMineTab = leftTab === "mine";
  const templateRecord = isMineTab ? getUserTemplatesRecord() : getOfficialTemplatesRecord();
  const templates = templateRecord[category] ?? [];

  const handleCreateBlankTemplate = () => {
    const name = blankTemplateName.trim();
    if (!name) {
      setBlankNameError("请先填写模板名称");
      return;
    }
    onCreateBlank(name);
    setBlankTemplateName("");
    setBlankNameError("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed inset-4 sm:inset-8 z-50 flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <Dialog.Title className="text-[16px] font-semibold text-foreground">{title}</Dialog.Title>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 min-h-0">
            {/* Left panel */}
            <div className="w-[148px] shrink-0 border-r border-border py-3 flex flex-col gap-0.5">
              <button
                onClick={() => setLeftTab("blank")}
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-[13px] font-medium transition-colors ${
                  leftTab === "blank"
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Plus size={13} className={leftTab === "blank" ? "text-primary" : ""} />
                新建空白模板
              </button>
              <button
                onClick={() => setLeftTab("hot")}
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-[13px] font-medium transition-colors ${
                  leftTab === "hot"
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Flame size={13} className={leftTab === "hot" ? "text-primary" : "text-orange-500"} />
                热门工作流
              </button>
              <button
                onClick={() => setLeftTab("mine")}
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-[13px] font-medium transition-colors ${
                  leftTab === "mine"
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Layers size={13} className={leftTab === "mine" ? "text-primary" : "text-muted-foreground"} />
                我的模版
              </button>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col min-w-0">
              {leftTab === "blank" ? (
                <div className="flex-1 flex flex-col justify-center gap-4 px-8 max-w-[560px]">
                  <div>
                    <div className="text-[14px] font-semibold text-foreground mb-2">工作流模板名称</div>
                    <input
                      value={blankTemplateName}
                      onChange={(e) => {
                        setBlankTemplateName(e.target.value);
                        if (blankNameError) setBlankNameError("");
                      }}
                      placeholder="请输入模板名称"
                      className={`w-full h-10 rounded-lg border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none transition-colors ${
                        blankNameError ? "border-red-500/70" : "border-border focus:border-primary/60"
                      }`}
                    />
                    {blankNameError && <div className="mt-1.5 text-[12px] text-red-400">{blankNameError}</div>}
                  </div>
                  <button
                    onClick={handleCreateBlankTemplate}
                    className="w-fit px-6 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-[0_0_16px_rgba(242,100,25,0.3)]"
                  >
                    下一步：配置流程
                  </button>
                </div>
              ) : (
                <>
                  {/* Category tabs */}
                  <div className="flex items-center gap-0 px-5 pt-4 pb-0 border-b border-border shrink-0 overflow-x-auto scrollbar-none">
                    {WORKFLOW_CATEGORY_TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCategory(tab)}
                        className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                          category === tab
                            ? "text-primary border-primary"
                            : "text-muted-foreground border-transparent hover:text-foreground"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Template grid */}
                  <div className="flex-1 overflow-y-auto p-5 scrollbar-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {templates.map((tpl, i) => (
                        <div
                          key={i}
                          className="group relative flex flex-col items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted transition-all text-left"
                        >
                          {leftTab === "hot" && (
                            <button
                              onClick={() =>
                                onCreateFromTemplate(tpl.name, tpl.steps, tpl.stepConfigs)
                              }
                              className="absolute top-3 right-3 h-8 px-3 rounded-md bg-primary text-white text-[12px] font-medium opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-[0_0_14px_rgba(242,100,25,0.35)] hover:bg-primary/90"
                            >
                              以此新建模板
                            </button>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-primary border border-primary/40 px-1.5 py-0.5 rounded">
                              {isMineTab ? "我的" : "官方"}
                            </span>
                            <span className="text-[14px] font-semibold text-foreground">
                              {tpl.name}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            {tpl.steps.map((step, si) => (
                              <span key={si} className="flex items-center gap-1">
                                <span className="text-[12px] text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                  {step}
                                </span>
                                {si < tpl.steps.length - 1 && (
                                  <ChevronRight size={11} className="text-muted-foreground/50 shrink-0" />
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {templates.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed border-border bg-input-background px-4 py-10 text-center">
                          <div className="text-[14px] font-medium text-foreground">当前分类还没有自建模板</div>
                          <div className="mt-1 text-[12px] text-muted-foreground">可先在任意工作流基础上保存为我的模版</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const session = useFrontendSession();
  const [activeNav, setActiveNav] = useState("workflow");
  const [searchFocused, setSearchFocused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showBuilderPage, setShowBuilderPage] = useState(false);
  const [builderTemplateName, setBuilderTemplateName] = useState("");
  const [builderInitialSteps, setBuilderInitialSteps] = useState<string[]>(["添加素材"]);
  const [builderInitialStepConfigs, setBuilderInitialStepConfigs] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [patternModalOpen, setPatternModalOpen] = useState(false);
  const [crackModalOpen, setCrackModalOpen] = useState(false);
  const [textToImageModalOpen, setTextToImageModalOpen] = useState(false);
  const [playVideoUrl, setPlayVideoUrl] = useState("");
  const [playVideoModalOpen, setPlayVideoModalOpen] = useState(false);
  const [pluginCollectionEntryKey, setPluginCollectionEntryKey] = useState(0);
  const [productSetEntryKey, setProductSetEntryKey] = useState(0);
  const [workflowListOpen, setWorkflowListOpen] = useState(false);
  const [workflowView, setWorkflowView] = useState<"list" | "templates">("list");
  const [workflowModalTitle, setWorkflowModalTitle] = useState("创建工作流");
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [newTaskInitialTemplate, setNewTaskInitialTemplate] = useState<WorkflowTemplate | null>(null);
  const [newTaskInitialCategory, setNewTaskInitialCategory] = useState<WorkflowCategory>("服饰");
  const taskCenterRecords = useTaskCenterRecords();
  const recentTasks = taskCenterRecords.slice(0, 4).map((task) => ({
    id: task.id,
    name: `${task.typeLabel} — ${task.batch}`,
    type: task.typeLabel,
    status: toRecentTaskStatus(task.status),
    count: task.total,
    time: task.createdAt,
  }));

  useEffect(() => {
    return registerNavigateToMySpace(() => setActiveNav("space"));
  }, []);

  useEffect(() => {
    return registerNavigateToWorkflowList(() => {
      setActiveNav("workflow");
      setWorkflowListOpen(true);
      setWorkflowView("list");
    });
  }, []);

  useEffect(() => {
    return registerNavigateToTaskCenter(() => {
      setActiveNav("tasks");
    });
  }, []);

  const goToTaskCenterAfterWorkflowSubmit = () => {
    setNewTaskModalOpen(false);
    setActiveNav("tasks");
  };

  const openNewTaskModal = (template?: WorkflowTemplate, category: WorkflowCategory = "服饰") => {
    setNewTaskInitialTemplate(template ?? null);
    setNewTaskInitialCategory(category);
    setNewTaskModalOpen(true);
  };

  const handleWorkflowTaskSubmit = (input: {
    template: WorkflowTemplate;
    assets: import("./api/uploadApi").UploadedAsset[];
    remark: string;
  }) => {
    const preview = input.assets[0]?.url;
    addWorkflowTask({
      steps: input.template.steps,
      templateName: input.template.name,
      preview,
      remark: input.remark || undefined,
    });
    goToTaskCenterAfterWorkflowSubmit();
  };

  const openWorkflowBuilder = (
    name: string,
    steps: string[],
    stepConfigs?: Record<string, Record<string, unknown>>,
  ) => {
    setBuilderTemplateName(name);
    setBuilderInitialSteps(normalizeWorkflowBuilderSteps(steps));
    setBuilderInitialStepConfigs(stepConfigs ?? {});
    setModalOpen(false);
    setShowBuilderPage(true);
  };

  const handleCreateBlankTemplate = (name: string) => {
    addWorkflowTask({ steps: ["添加素材"], templateName: name });
    openWorkflowBuilder(name, ["添加素材"]);
  };

  const handleCreateFromTemplate = (
    name: string,
    steps: string[],
    stepConfigs?: Record<string, Record<string, unknown>>,
  ) => {
    openWorkflowBuilder(`${name}-副本`, steps, stepConfigs);
  };

  const openCreateWorkflowModal = () => {
    setWorkflowModalTitle("创建工作流");
    setModalOpen(true);
  };

  const openWorkflowTemplateModal = () => {
    setActiveNav("workflow");
    setWorkflowListOpen(true);
    setWorkflowView("templates");
  };

  const openAddWorkflowTemplateModal = () => {
    setWorkflowModalTitle("新增工作流模板");
    setModalOpen(true);
  };

  if (showBuilderPage) {
    return (
      <WorkflowBuilderPage
        initialTemplateName={builderTemplateName}
        initialSteps={builderInitialSteps}
        initialStepConfigs={builderInitialStepConfigs}
        onBack={() => setShowBuilderPage(false)}
      />
    );
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-background text-foreground"
      style={{ fontFamily: "'Inter', 'Noto Sans SC', sans-serif" }}
    >
      {/* Sidebar */}
      <aside className="flex flex-col w-[200px] shrink-0 bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-semibold text-[15px] text-foreground tracking-tight">
            GOGO<span className="text-primary"> POD</span>
          </span>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto scrollbar-none">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.id === "workflow") {
                    setWorkflowListOpen(false);
                  }
                }}
                className={`group flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium transition-all duration-150 relative ${
                  isActive
                    ? "text-foreground bg-sidebar-accent"
                    : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}
                <Icon size={16} className={isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <div className="flex items-center gap-2.5 w-full px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User size={13} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[12px] font-medium text-foreground truncate">
                {session?.displayName ?? "未登录"}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {session?.plan ?? "—"} · {session?.username}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void frontendLogout()}
            className="w-full text-[11px] text-muted-foreground hover:text-foreground py-1.5 rounded-md hover:bg-sidebar-accent"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeNav === "tasks" ? (
          <TaskCenterPage onNavigateDownloads={() => setActiveNav("downloads")} />
        ) : activeNav === "findimg" ? (
          <FindImagePage pluginCollectionEntryKey={pluginCollectionEntryKey} />
        ) : activeNav === "space" ? (
          <MySpacePage />
        ) : activeNav === "design" ? (
          <DesignPage
            onOpenPattern={() => setPatternModalOpen(true)}
            onOpenCrack={() => setCrackModalOpen(true)}
            onOpenText2img={() => setTextToImageModalOpen(true)}
            productSetEntryKey={productSetEntryKey}
          />
        ) : activeNav === "video" ? (
          <VideoPage />
        ) : activeNav === "downloads" ? (
          <DownloadCenterPage />
        ) : activeNav === "publish" ? (
          <PublishPage
            onGoToPluginCollection={() => {
              setPluginCollectionEntryKey((key) => key + 1);
              setActiveNav("findimg");
            }}
            onGoToProductSetList={() => {
              setProductSetEntryKey((key) => key + 1);
              setActiveNav("design");
            }}
          />
        ) : activeNav === "workflow" && workflowListOpen ? (
          workflowView === "templates" ? (
            <WorkflowTemplatesPage
              onBack={() => setWorkflowView("list")}
              onAddTemplate={openAddWorkflowTemplateModal}
              onViewTemplate={(template) => {
                openWorkflowBuilder(template.name, template.steps, template.stepConfigs);
              }}
              onDuplicateAsNewTemplate={(template) => {
                openWorkflowBuilder(
                  `${template.name}-副本`,
                  template.steps,
                  template.stepConfigs,
                );
              }}
              onNewTask={(template, category) => openNewTaskModal(template, category)}
            />
          ) : (
            <WorkflowPage
              onNewTask={() => openNewTaskModal()}
              onManageTemplates={openWorkflowTemplateModal}
              onGoTaskCenter={() => setActiveNav("tasks")}
            />
          )
        ) : (
          <>
        {/* Navbar */}
        <header className="flex items-center gap-4 h-14 px-6 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          <div
            className={`flex items-center gap-2 flex-1 max-w-xs h-8 px-3 rounded-lg border transition-all duration-200 ${
              searchFocused
                ? "bg-card border-primary/40 shadow-[0_0_0_3px_rgba(242,100,25,0.08)]"
                : "bg-muted border-border hover:border-border/60"
            }`}
          >
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="全局搜索…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none min-w-0"
            />
            <kbd className="text-[10px] text-muted-foreground/60 font-mono">⌘K</kbd>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors border border-border">
              <Bell size={14} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            <button
              onClick={() => {
                setWorkflowListOpen(true);
                openCreateWorkflowModal();
              }}
              className="flex items-center gap-2 h-8 pl-2 pr-3 rounded-lg bg-primary hover:bg-primary/90 transition-all text-[12px] font-medium text-white shadow-[0_0_16px_rgba(242,100,25,0.25)]"
            >
              <Plus size={13} />
              新建工作流
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-8 scrollbar-none">
          {/* Welcome */}
          <div>
            <h1 className="text-[22px] font-semibold text-foreground">
              欢迎回来，<span className="text-primary">{session?.displayName ?? "用户"}</span> 👋
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              今天是 2025年5月25日，距母亲节还有{" "}
              <span className="text-foreground font-medium">4天</span>，赶紧备货吧！
            </p>
          </div>

          {/* Quick start */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-foreground">快速开始</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Blank workflow card */}
              <button
                onClick={() => setWorkflowListOpen(true)}
                className={`group relative flex h-[156px] flex-col items-start gap-3 p-4 rounded-xl border bg-gradient-to-br ${quickStartBlank.gradient} ${quickStartBlank.borderColor} ${quickStartBlank.hoverGlow} hover:shadow-lg transition-all duration-200 text-left`}
              >
                <div className="p-2 rounded-lg bg-muted/80">{quickStartBlank.icon}</div>
                <div>
                  <div className="text-[13px] font-semibold text-foreground mb-0.5">{quickStartBlank.title}</div>
                  <div className="text-[12px] text-muted-foreground leading-snug">{quickStartBlank.desc}</div>
                </div>
                <div className="flex items-center gap-1 text-[12px] text-muted-foreground group-hover:text-foreground transition-colors mt-auto">
                  立即使用
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Feature cards */}
              {quickStartFeatureCards.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "text2img") setTextToImageModalOpen(true);
                    if (item.id === "pattern") setPatternModalOpen(true);
                    if (item.id === "crack") setCrackModalOpen(true);
                  }}
                  className={`group relative flex h-[156px] flex-col items-start gap-3 p-4 rounded-xl border bg-gradient-to-br ${item.gradient} ${item.borderColor} ${item.hoverGlow} hover:shadow-lg transition-all duration-200 text-left`}
                >
                  <div className="p-2 rounded-lg bg-white/70">{item.icon}</div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground mb-0.5">{item.title}</div>
                    <div className="text-[12px] text-muted-foreground leading-snug">{item.desc}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[12px] text-muted-foreground group-hover:text-foreground transition-colors mt-auto">
                    立即使用
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Recent tasks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-foreground">最近运行的任务</h2>
              <button
                onClick={() => setActiveNav("tasks")}
                className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary transition-colors"
              >
                查看全部 <ChevronRight size={13} />
              </button>
            </div>
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 text-[12px] font-medium text-muted-foreground">任务名称</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">类型</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">状态</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">数量</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">时间</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task, i) => (
                    <tr
                      key={task.id}
                      className={`group transition-colors hover:bg-muted/30 ${i < recentTasks.length - 1 ? "border-b border-border/60" : ""}`}
                    >
                      <td className="px-5 py-3.5 font-medium text-foreground">{task.name}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{task.type}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={task.status} />
                          <StatusLabel status={task.status} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{task.count} 件</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{task.time}</td>
                      <td className="px-4 py-3.5">
                        <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary transition-all px-2.5 py-1 rounded-md hover:bg-primary/10">
                          <RefreshCw size={11} /> 重跑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recommendations */}
          <section className="pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-foreground">推荐玩法 / 案例</h2>
              <button className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary transition-colors">
                查看更多 <ChevronRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {recommendations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.videoUrl) {
                      setPlayVideoUrl(item.videoUrl);
                      setPlayVideoModalOpen(true);
                    }
                  }}
                  className="group rounded-xl overflow-hidden border border-border bg-card hover:border-border/80 hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                  <div className="relative h-36 overflow-hidden bg-muted">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className={`absolute top-2.5 left-2.5 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <div className="text-[13px] font-semibold text-foreground mb-0.5">{item.title}</div>
                    <div className="text-[12px] text-muted-foreground">{item.desc}</div>
                    <button className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-150">
                      立即使用 <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
          </>
        )}
      </div>

      {/* Workflow modal */}
      <WorkflowModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={workflowModalTitle}
        onCreateBlank={handleCreateBlankTemplate}
        onCreateFromTemplate={handleCreateFromTemplate}
      />
      <WorkflowNewTaskModal
        open={newTaskModalOpen}
        onClose={() => setNewTaskModalOpen(false)}
        initialTemplate={newTaskInitialTemplate}
        initialCategory={newTaskInitialCategory}
        onSubmit={handleWorkflowTaskSubmit}
        onGoCreateWorkflow={() => {
          setNewTaskModalOpen(false);
          openCreateWorkflowModal();
        }}
      />
      <PatternExtractModal
        open={patternModalOpen}
        onClose={() => setPatternModalOpen(false)}
        onSubmit={(input) => submitFeatureTask("pattern-extract", input)}
      />
      <CrackImageModal
        open={crackModalOpen}
        onClose={() => setCrackModalOpen(false)}
        onSubmit={(input) => submitFeatureTask("crack", input)}
      />
      <TextToImageModal
        open={textToImageModalOpen}
        onClose={() => setTextToImageModalOpen(false)}
        onSubmit={(input) => submitFeatureTask("text2img", input)}
      />
      <PlayVideoModal
        open={playVideoModalOpen}
        videoUrl={playVideoUrl}
        onClose={() => setPlayVideoModalOpen(false)}
      />
      <Toaster position="top-center" closeButton={false} />
    </div>
  );
}
