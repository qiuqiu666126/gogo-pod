import { Ban, Check, ChevronRight, Download, Pencil, RotateCcw } from "lucide-react";
import { addDownloadRecord } from "./downloadCenterStore";
import { showDownloadStartedSuccess } from "./taskToast";

export type TaskGeneratedPreview = {
  id: string;
  url: string;
  mediaKind?: "image" | "video";
  label?: string;
  selected?: boolean;
  discarded?: boolean;
};

function PreviewImage({
  url,
  alt,
  fit = "contain",
}: {
  url: string;
  alt: string;
  fit?: "contain" | "cover";
}) {
  return (
    <img
      src={url}
      alt={alt}
      className={`h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
    />
  );
}

export function TaskResultComparisonPanel({
  sourceUrl,
  generated,
  onToggleGenerated,
  onDiscardGenerated,
  onSmartEditGenerated,
  onRecreateGenerated,
}: {
  sourceUrl?: string;
  generated: TaskGeneratedPreview[];
  onToggleGenerated?: (id: string) => void;
  onDiscardGenerated?: (id: string) => void;
  onSmartEditGenerated?: (id: string) => void;
  onRecreateGenerated?: (id: string) => void;
}) {
  const visibleGenerated = generated.filter((item) => !item.discarded);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="grid max-w-[720px] gap-4 lg:grid-cols-[220px_28px_minmax(0,1fr)]">
        <section className="min-w-0">
          <h2 className="mb-3 text-[13px] font-semibold text-foreground">原图</h2>
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-muted/35">
            {sourceUrl ? (
              <PreviewImage url={sourceUrl} alt="原图" />
            ) : (
              <div className="text-[12px] text-muted-foreground">暂无原图</div>
            )}
          </div>
        </section>

        <div className="hidden items-center justify-center text-muted-foreground/70 lg:flex">
          <ChevronRight size={24} />
          <ChevronRight size={24} className="-ml-4" />
        </div>

        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded border border-border bg-background" />
            <h2 className="text-[13px] font-semibold text-foreground">生成图</h2>
          </div>

          {visibleGenerated.length > 0 ? (
            <div className="grid max-w-[360px] grid-cols-2 gap-3">
              {visibleGenerated.map((item) => {
                const isVideo = item.mediaKind === "video";
                return (
                  <div
                    key={item.id}
                    className={`group relative overflow-hidden rounded-lg bg-muted transition ${
                      item.selected ? "ring-2 ring-primary" : "ring-1 ring-border"
                    }`}
                  >
                    <div className="aspect-[4/3] bg-muted">
                      <PreviewImage
                        url={item.url}
                        alt={item.label ?? (isVideo ? "生成视频" : "生成图")}
                        fit="cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleGenerated?.(item.id)}
                      className={`absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded border transition ${
                        item.selected
                          ? "border-primary bg-primary text-white"
                          : "border-foreground/40 bg-background/90 text-foreground shadow-sm"
                      }`}
                      aria-label="选择生成图"
                    >
                      {item.selected ? <Check size={12} strokeWidth={3} /> : null}
                    </button>

                    {item.label ? (
                      <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {item.label}
                      </span>
                    ) : null}

                    <div className="absolute bottom-2 right-2 flex flex-wrap justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {!isVideo && onRecreateGenerated ? (
                        <button
                          type="button"
                          onClick={() => onRecreateGenerated(item.id)}
                          className="flex h-7 items-center gap-1 rounded-md border border-border bg-background/95 px-2 text-[11px] text-foreground shadow-sm hover:bg-muted"
                        >
                          <RotateCcw size={13} />
                          再次创作
                        </button>
                      ) : null}
                      <a
                        href={item.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          addDownloadRecord({ title: `${item.label ?? "图片"}-下载`, count: 1 });
                          showDownloadStartedSuccess();
                        }}
                        className="flex h-7 items-center gap-1 rounded-md border border-border bg-background/95 px-2 text-[11px] text-foreground shadow-sm hover:bg-muted"
                      >
                        <Download size={13} />
                        下载
                      </a>
                      {!isVideo && onSmartEditGenerated ? (
                        <button
                          type="button"
                          onClick={() => onSmartEditGenerated(item.id)}
                          className="flex h-7 items-center gap-1 rounded-md bg-primary px-2 text-[11px] font-medium text-white shadow-sm hover:bg-primary/90"
                        >
                          <Pencil size={13} />
                          智能编辑
                        </button>
                      ) : null}
                      {onDiscardGenerated ? (
                        <button
                          type="button"
                          onClick={() => onDiscardGenerated(item.id)}
                          className="flex h-7 items-center gap-1 rounded-md border border-border bg-background/95 px-2 text-[11px] text-foreground shadow-sm hover:bg-muted"
                        >
                          <Ban size={13} />
                          废弃
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-border text-[12px] text-muted-foreground">
              暂无生成图
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
