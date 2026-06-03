import { useCallback, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { uploadAssets, type UploadedAsset } from "./api/uploadApi";

export function AssetUploadZone({
  assets,
  onAssetsChange,
  maxFiles = 100,
  accept = "image/*",
  disabled = false,
}: {
  assets: UploadedAsset[];
  onAssetsChange: (assets: UploadedAsset[]) => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const remaining = maxFiles - assets.length;

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => f.type.startsWith("image/") || f.type === "");
      if (files.length === 0) {
        setError("请选择图片文件");
        return;
      }
      if (files.length > remaining) {
        setError(`最多还可上传 ${remaining} 张`);
        return;
      }

      setError(null);
      setUploading(true);
      try {
        const uploaded = await uploadAssets(files.slice(0, remaining));
        onAssetsChange([...assets, ...uploaded]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "上传失败");
      } finally {
        setUploading(false);
      }
    },
    [assets, onAssetsChange, remaining],
  );

  const removeAsset = (id: string) => {
    onAssetsChange(assets.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && !uploading && e.dataTransfer.files.length) {
            void handleFiles(e.dataTransfer.files);
          }
        }}
        className={`rounded-xl border border-dashed px-6 py-7 flex flex-col items-center justify-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border/70 bg-muted"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          disabled={disabled || uploading || remaining <= 0}
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={disabled || uploading || remaining <= 0}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 h-9 px-7 rounded-md border border-border bg-background text-[13px] text-foreground hover:border-primary/50 disabled:opacity-50 transition-colors"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? "上传中…" : "上传图片"}
        </button>
        <div className="mt-3 text-[12px] text-muted-foreground text-center">
          将文件拖放到此处，不超过 {maxFiles} 张
          {assets.length > 0 && (
            <span className="text-foreground">（已选 {assets.length} 张）</span>
          )}
        </div>
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      {assets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted group"
            >
              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
              {asset.local && (
                <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-black/50 text-white py-0.5">
                  本地
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAsset(asset.id)}
                className="absolute top-0.5 right-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="移除"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
