import { useEffect, useRef, useState } from "react";
import { FileIcon, ImageIcon, Music2, Play } from "lucide-react";
import {
  getAttachmentKind,
  guessAttachmentKindFromUrl,
  resolveAttachmentUrl,
  type AttachmentKind,
} from "../../shared/attachmentUtils";
import { AttachmentImage } from "./AttachmentImage";

export type AttachmentThumbnailSource = {
  url: string;
  name?: string;
  mime_type?: string | null;
  suffix?: string | null;
  is_image?: boolean;
};

type AttachmentThumbnailProps = {
  item: AttachmentThumbnailSource;
  className?: string;
  fallbackClassName?: string;
  interactive?: boolean;
  onClick?: () => void;
};

function VideoThumbnail({
  url,
  className,
  fallbackClassName,
}: {
  url: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
        <Play size={18} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        muted
        playsInline
        className="h-full w-full object-cover"
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (!video) return;
          try {
            video.currentTime = Math.min(0.5, video.duration || 0.5);
          } catch {
            // ignore seek errors on some browsers
          }
        }}
        onError={() => setFailed(true)}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white">
          <Play size={14} className="ml-0.5" />
        </div>
      </div>
    </div>
  );
}

function KindFallback({
  kind,
  className,
}: {
  kind: AttachmentKind;
  className?: string;
}) {
  const Icon = kind === "audio" ? Music2 : kind === "file" ? FileIcon : ImageIcon;
  return (
    <div
      className={`flex items-center justify-center bg-muted/40 text-muted-foreground ${className ?? ""}`}
    >
      <Icon size={18} />
    </div>
  );
}

export function AttachmentThumbnail({
  item,
  className = "h-14 w-14 rounded-lg border border-border",
  fallbackClassName,
  interactive = false,
  onClick,
}: AttachmentThumbnailProps) {
  const kind = item.mime_type || item.suffix || item.is_image !== undefined
    ? getAttachmentKind(item)
    : guessAttachmentKindFromUrl(item.url);

  const shellClass = `${className}${interactive ? " cursor-pointer transition hover:ring-2 hover:ring-primary/40" : ""}`;

  if (kind === "image") {
    const image = (
      <AttachmentImage
        url={item.url}
        alt={item.name ?? "附件预览"}
        className={`${className} object-cover`}
        fallbackClassName={fallbackClassName ?? className}
      />
    );
    if (!onClick) return image;
    return (
      <button type="button" className={shellClass} onClick={onClick}>
        {image}
      </button>
    );
  }

  if (kind === "video") {
    const video = (
      <VideoThumbnail
        url={item.url}
        className={className}
        fallbackClassName={fallbackClassName ?? className}
      />
    );
    if (!onClick) return video;
    return (
      <button type="button" className={`block p-0 ${shellClass}`} onClick={onClick}>
        {video}
      </button>
    );
  }

  const fallback = <KindFallback kind={kind} className={fallbackClassName ?? className} />;
  if (!onClick) return fallback;
  return (
    <button type="button" className={shellClass} onClick={onClick}>
      {fallback}
    </button>
  );
}
