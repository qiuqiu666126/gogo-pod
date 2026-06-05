import { useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import type { FormControl, FormControlOption, FormValue } from "../../shared/sceneFormSchema";
import { collectVisibleControls } from "../../shared/sceneFormSchema";
import { HoverImagePreview } from "./HoverImagePreview";

function CutoutChildDemo({ transparent }: { transparent?: boolean }) {
  return (
    <svg viewBox="0 0 96 136" className="h-full w-full" role="img" aria-label={transparent ? "去背景后" : "去背景前"}>
      {!transparent ? <rect width="96" height="136" fill="#e8c48a" /> : null}
      <ellipse cx="48" cy="124" rx="34" ry="8" fill="#000" opacity="0.08" />
      <path d="M24 63c-9 9-13 28-12 54h72c1-26-3-45-12-54-7-7-41-7-48 0z" fill="#f7f7f2" />
      {Array.from({ length: 8 }).map((_, index) => (
        <rect key={index} x="16" y={68 + index * 7} width="64" height="3.2" fill="#222" opacity="0.82" />
      ))}
      <path d="M29 66c-6 7-8 18-9 32l-8-2c1-15 4-27 12-35z" fill="#f7f7f2" />
      <path d="M67 66c6 7 8 18 9 32l8-2c-1-15-4-27-12-35z" fill="#f7f7f2" />
      <circle cx="48" cy="41" r="23" fill="#f4c6a6" />
      <path
        d="M25 42c-6-21 7-36 24-36 16 0 28 12 25 35-4-9-10-16-19-17-10-1-21 3-30 18z"
        fill="#c88a42"
      />
      <path d="M25 42c3-17 12-27 26-28 11 5 17 15 22 28-2 10-6 17-13 22 2-16-3-29-13-36-8 5-15 17-22 14z" fill="#d79a4f" />
      <circle cx="39" cy="43" r="2.2" fill="#3b2a22" />
      <circle cx="57" cy="43" r="2.2" fill="#3b2a22" />
      <path d="M41 54c4 3 10 3 14 0" stroke="#b85b52" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M23 44c-5 8-5 26 4 42l8-1c-7-16-8-31-3-41z" fill="#c88a42" />
      <path d="M73 44c5 8 5 26-4 42l-8-1c7-16 8-31 3-41z" fill="#c88a42" />
    </svg>
  );
}

function ExamplePreviewCard({
  example,
  style,
}: {
  example: NonNullable<FormControlOption["examplePreview"]>;
  style: CSSProperties;
}) {
  return (
    <div
      className="pointer-events-none fixed z-[9999] w-[238px] rounded-md border border-[#3c3c3c] bg-[#222] p-2 shadow-2xl"
      style={style}
    >
      <div className="rounded-sm bg-[#fff3bd] p-2">
        <div className="flex items-center gap-2">
          <div className="relative h-[136px] flex-1 overflow-hidden rounded border border-white/70 bg-white">
            {example.badge ? (
              <span className="absolute left-1 top-1 z-10 rounded-sm bg-primary px-1 py-0.5 text-[8px] font-medium text-white">
                {example.badge}
              </span>
            ) : null}
            {example.beforeUrl === "cutout-child-demo" ? (
              <CutoutChildDemo />
            ) : (
              <img src={example.beforeUrl} alt="处理前" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="text-[20px] font-semibold text-white/90">→</div>
          <div className="h-[136px] flex-1 overflow-hidden rounded border border-white/70 bg-[linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[length:14px_14px] bg-[position:0_0,0_7px,7px_-7px,-7px_0px]">
            {example.afterUrl === "cutout-child-demo" ? (
              <CutoutChildDemo transparent />
            ) : (
              <img src={example.afterUrl} alt="处理后" className="h-full w-full object-cover" />
            )}
          </div>
        </div>
      </div>
      <div className="px-1 pb-1 pt-3 text-[13px] font-semibold text-white">{example.label}</div>
    </div>
  );
}

function FieldInfoIcon({ field }: { field: FormControl }) {
  const [previewStyle, setPreviewStyle] = useState<CSSProperties | null>(null);

  if (field.examplePreview) {
    const showPreview = (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      const width = 238;
      const height = 198;
      const margin = 12;
      const gap = 10;
      const left = Math.min(
        Math.max(rect.left + rect.width / 2 - width / 2, margin),
        window.innerWidth - width - margin,
      );
      const top =
        rect.top > height + gap + margin
          ? rect.top - height - gap
          : Math.min(rect.bottom + gap, window.innerHeight - height - margin);
      setPreviewStyle({ left, top: Math.max(margin, top) });
    };

    return (
      <span
        className="relative inline-flex"
        onMouseEnter={(event) => showPreview(event.currentTarget)}
        onMouseLeave={() => setPreviewStyle(null)}
        onFocus={(event) => showPreview(event.currentTarget)}
        onBlur={() => setPreviewStyle(null)}
      >
        <Info size={13} className="text-muted-foreground" />
        {previewStyle
          ? createPortal(
              <ExamplePreviewCard example={field.examplePreview} style={previewStyle} />,
              document.body,
            )
          : null}
      </span>
    );
  }

  return <Info size={13} className="text-muted-foreground" title={field.helpText} />;
}

export function previewFieldDomId(fieldId: string) {
  return `scene-preview-field-${fieldId}`;
}

function sliderDisplay(field: FormControl, value: number): string {
  const s = field.slider;
  if (!s) return String(value);
  if (s.displayFormat === "label" && s.valueLabels) {
    const key = String(value);
    if (s.valueLabels[key]) return s.valueLabels[key];
  }
  return String(value);
}

function renderControl(
  field: FormControl,
  value: FormValue,
  onChange: (v: FormValue) => void,
) {
  switch (field.type) {
    case "radio":
      if (field.uiVariant === "card") {
        return (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {field.options?.map((opt) => (
              <StyleCardOption
                key={opt.value}
                option={opt}
                active={String(value) === opt.value}
                onClick={() => onChange(opt.value)}
              />
            ))}
          </div>
        );
      }
      return (
        <div className={`flex flex-wrap gap-4 ${field.layout === "inline" ? "items-center" : "flex-col"}`}>
          {field.options?.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-[13px] text-foreground">
              <input
                type="radio"
                checked={String(value) === opt.value}
                onChange={() => onChange(opt.value)}
                className="accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    case "slider": {
      const num = Number(value);
      const s = field.slider ?? { min: 0, max: 1, step: 0.1 };
      return (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={num}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-[220px] accent-primary"
          />
          <span className="text-[13px] text-foreground">{sliderDisplay(field, num)}</span>
        </div>
      );
    }
    case "select":
      if (field.uiVariant === "card") {
        return (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {field.options?.map((opt) => (
              <StyleCardOption
                key={opt.value}
                option={opt}
                active={String(value) === opt.value}
                onClick={() => onChange(opt.value)}
              />
            ))}
          </div>
        );
      }
      return (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 rounded-md border border-border bg-muted px-2 text-[13px] text-foreground outline-none focus:border-primary/60"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2 cursor-pointer text-[13px] text-foreground">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="accent-primary"
          />
          {field.label}
        </label>
      );
    case "multi-checkbox": {
      const selectedValues = Array.isArray(value) ? value : [];
      if (field.uiVariant === "card") {
        return (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {field.options?.map((opt) => {
              const checked = selectedValues.includes(opt.value);
              return (
                <StyleCardOption
                  key={opt.value}
                  option={opt}
                  active={checked}
                  onClick={() => {
                    if (checked) {
                      onChange(selectedValues.filter((item) => item !== opt.value));
                    } else {
                      onChange([...selectedValues, opt.value]);
                    }
                  }}
                />
              );
            })}
          </div>
        );
      }
      return (
        <div className="flex flex-wrap gap-3">
          {field.options?.map((opt) => {
            const checked = selectedValues.includes(opt.value);
            return (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-[13px] text-foreground">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, opt.value]);
                    } else {
                      onChange(selectedValues.filter((item) => item !== opt.value));
                    }
                  }}
                  className="accent-primary"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      );
    }
    case "text":
      return (
        <input
          type="text"
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 rounded-md border border-border bg-muted px-2 text-[13px] text-foreground outline-none focus:border-primary/60 w-full max-w-xs"
        />
      );
    case "textarea":
      return (
        <textarea
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[72px] rounded-md border border-border bg-muted px-2 py-1.5 text-[13px] text-foreground outline-none focus:border-primary/60"
        />
      );
    case "number-buttons":
      return (
        <div className="flex items-center gap-3 flex-wrap">
          {field.options?.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(Number(opt.value))}
              className={`min-w-8 h-8 px-2 rounded-md border transition-colors text-[13px] ${
                String(value) === opt.value
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-foreground hover:border-border/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: FormControl;
  value: FormValue;
  onChange: (v: FormValue) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <div id={previewFieldDomId(field.id)} className="py-1">
        {renderControl(field, value, onChange)}
      </div>
    );
  }

  return (
    <div
      id={previewFieldDomId(field.id)}
      className={`${
        field.uiVariant === "card"
          ? "space-y-2"
          : field.layout === "inline" || field.layout === "group"
            ? "flex flex-wrap items-center gap-3"
            : "space-y-2"
      }`}
    >
      <span
        className={`text-[13px] font-medium text-foreground flex items-center gap-1 shrink-0 ${
          field.uiVariant === "card"
            ? ""
            : field.layout === "group"
              ? "min-w-[94px]"
              : ""
        }`}
      >
        {field.label}
        <FieldInfoIcon field={field} />
      </span>
      {renderControl(field, value, onChange)}
    </div>
  );
}

function StyleCardOption({
  option,
  active,
  onClick,
}: {
  option: FormControlOption;
  active: boolean;
  onClick: () => void;
}) {
  const previewText = option.previewText || option.label.slice(0, 1);
  const isTextOnlyCard = !option.thumbnailUrl && Boolean(option.previewDescription);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-xl border bg-card text-left transition-all duration-200 ${
        active
          ? "border-primary shadow-[0_10px_22px_rgba(242,100,25,0.18)]"
          : "border-border hover:border-primary/60"
      } ${isTextOnlyCard ? "min-h-[114px] p-4" : "p-2"}`}
    >
      {isTextOnlyCard ? (
        <>
          <div className="text-[13px] font-semibold text-foreground">{option.label}</div>
          <p className="mt-4 text-[12px] leading-5 text-muted-foreground">
            {option.previewDescription}
          </p>
        </>
      ) : (
        <>
          <div className="text-center text-[13px] font-medium text-foreground">{option.label}</div>
          <div className="mt-2 rounded-lg border border-border/70 bg-muted/50">
            {option.thumbnailUrl ? (
              <div className="relative h-20">
                <HoverImagePreview src={option.thumbnailUrl} alt={option.label} />
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-2 text-[26px] font-semibold text-foreground">
                  {previewText}
                </div>
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center text-[26px] font-semibold text-foreground">
                {previewText}
              </div>
            )}
          </div>
          {option.previewDescription ? (
            <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
              {option.previewDescription}
            </p>
          ) : null}
        </>
      )}
    </button>
  );
}

/** 递归渲染动态表单（含选项子控件） */
export function DynamicFormFields({
  fields,
  values,
  onChange,
}: {
  fields: FormControl[];
  values: Record<string, FormValue>;
  onChange: (key: string, value: FormValue) => void;
}) {
  const visible = collectVisibleControls(fields, values);
  const topLevel = fields.filter((f) => f.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const subLevel = visible.filter((f) => !topLevel.some((t) => t.id === f.id));

  const groupSubs = subLevel.filter((f) => f.layout === "group");
  const blockSubs = subLevel.filter((f) => f.layout !== "group");

  return (
    <div className="space-y-4">
      {topLevel.map((field) => (
        <FieldRow
          key={field.id}
          field={field}
          value={values[field.key] ?? field.defaultValue}
          onChange={(v) => onChange(field.key, v)}
        />
      ))}

      {groupSubs.length > 0 && (
        <div className="rounded-xl border border-border bg-muted p-4 space-y-4">
          {groupSubs.map((field) => (
            <FieldRow
              key={field.id}
              field={field}
              value={values[field.key] ?? field.defaultValue}
              onChange={(v) => onChange(field.key, v)}
            />
          ))}
        </div>
      )}

      {blockSubs.map((field) => (
        <FieldRow
          key={field.id}
          field={field}
          value={values[field.key] ?? field.defaultValue}
          onChange={(v) => onChange(field.key, v)}
        />
      ))}
    </div>
  );
}
