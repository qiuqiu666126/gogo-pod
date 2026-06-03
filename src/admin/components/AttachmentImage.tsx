import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { resolveAttachmentUrl } from "../../shared/attachmentUtils";

type AttachmentImageProps = {
  url: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
};

/** 安全渲染附件图片，避免空 src 或加载失败时反复请求 */
export function AttachmentImage({
  url,
  alt = "",
  className = "",
  fallbackClassName = "",
}: AttachmentImageProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveAttachmentUrl(url);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/40 text-muted-foreground ${fallbackClassName || className}`}
      >
        <ImageIcon size={18} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
