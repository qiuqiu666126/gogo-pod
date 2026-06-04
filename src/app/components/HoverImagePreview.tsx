import { useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

export function HoverImagePreview({
  src,
  alt,
  className = "",
  previewClassName = "w-[420px] max-w-[min(420px,80vw)]",
}: {
  src: string;
  alt: string;
  className?: string;
  previewClassName?: string;
}) {
  const [previewStyle, setPreviewStyle] = useState<CSSProperties | null>(null);

  function showPreview(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const margin = 16;
    const gap = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const previewWidth = Math.min(420, viewportWidth - margin * 2);
    const previewHeight = Math.min(560, viewportHeight - margin * 2);
    const idealLeft = rect.left + rect.width / 2 - previewWidth / 2;
    const left = Math.min(Math.max(idealLeft, margin), viewportWidth - previewWidth - margin);
    const top =
      rect.top > previewHeight + gap + margin
        ? rect.top - previewHeight - gap
        : Math.min(rect.bottom + gap, viewportHeight - previewHeight - margin);

    setPreviewStyle({
      left,
      top: Math.max(margin, top),
      width: previewWidth,
      maxHeight: previewHeight,
    });
  }

  return (
    <span
      className={`relative block h-full w-full overflow-hidden ${className}`}
      onMouseEnter={(event) => showPreview(event.currentTarget)}
      onMouseLeave={() => setPreviewStyle(null)}
      onFocus={(event) => showPreview(event.currentTarget)}
      onBlur={() => setPreviewStyle(null)}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      {previewStyle
        ? createPortal(
            <span
              className={`pointer-events-none fixed z-[9999] block overflow-hidden rounded-xl border-[10px] border-[#3f3f3f] bg-[#3f3f3f] shadow-2xl ${previewClassName}`}
              style={previewStyle}
            >
              <img src={src} alt={alt} className="block max-h-[inherit] w-full rounded-sm object-contain" />
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
