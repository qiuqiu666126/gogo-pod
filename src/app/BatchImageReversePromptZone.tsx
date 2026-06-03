import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { reversePromptFromImages } from "./api/reversePromptApi";
import { uploadAssets, type UploadedAsset } from "./api/uploadApi";

const MAX_FILES = 1000;

export type ReversePromptEntry = {
  id: string;
  prompt: string;
  imageUrl: string;
  assetId: string;
};

export function BatchImageReversePromptZone({
  onPromptsGenerated,
  disabled = false,
}: {
  onPromptsGenerated: (entries: ReversePromptEntry[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter(
        (f) => f.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(f.name),
      );
      if (files.length === 0) {
        setError("请选择图片文件");
        return;
      }
      if (files.length > MAX_FILES) {
        setError(`单次最多导入 ${MAX_FILES} 张`);
        return;
      }

      setError(null);
      setProcessing(true);
      setProgress({ done: 0, total: files.length });

      try {
        const uploaded = await uploadAssets(files);
        const results = await reversePromptFromImages(uploaded, (done, total) => {
          setProgress({ done, total });
        });
        const entries: ReversePromptEntry[] = results.map((r) => ({
          id: `prompt-${r.assetId}-${Date.now()}`,
          prompt: r.prompt,
          imageUrl: r.imageUrl,
          assetId: r.assetId,
        }));
        onPromptsGenerated(entries);
      } catch (e) {
        setError(e instanceof Error ? e.message : "导入失败，请重试");
      } finally {
        setProcessing(false);
        setProgress({ done: 0, total: 0 });
      }
    },
    [onPromptsGenerated],
  );

  return (
    <div className="flex-1 min-w-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled || processing}
        onChange={(e) => {
          if (e.target.files?.length) void processFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled || processing}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !processing) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && !processing && e.dataTransfer.files.length) {
            void processFiles(e.dataTransfer.files);
          }
        }}
        className={`w-full rounded-xl border border-dashed px-6 py-8 flex flex-col items-center justify-center text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border/70 bg-muted"
        } ${disabled || processing ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50 hover:bg-muted/80"}`}
      >
        {processing ? (
          <>
            <Loader2 size={28} className="text-primary animate-spin mb-3" />
            <div className="text-[13px] font-medium text-foreground">
              正在上传并反推提示词…
            </div>
            <div className="mt-1.5 text-[12px] text-muted-foreground">
              {progress.total > 0 ? `${progress.done} / ${progress.total}` : "准备中"}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background border border-border mb-3">
              <ImagePlus size={20} className="text-muted-foreground" />
            </div>
            <div className="text-[13px] font-medium text-foreground">批量导入图片进行反推词</div>
            <div className="mt-1.5 text-[12px] text-muted-foreground">
              点击选择或拖放图片到此处，不超过 {MAX_FILES} 张
            </div>
          </>
        )}
      </button>
      {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}
    </div>
  );
}
