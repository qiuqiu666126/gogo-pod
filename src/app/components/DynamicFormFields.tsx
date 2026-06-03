import { Info } from "lucide-react";
import type { FormControl, FormControlOption, FormValue } from "../../shared/sceneFormSchema";
import { collectVisibleControls } from "../../shared/sceneFormSchema";

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
        <Info size={13} className="text-muted-foreground" title={field.helpText} />
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

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-xl border bg-card p-2 text-left transition-all duration-200 ${
        active
          ? "border-primary shadow-[0_10px_22px_rgba(242,100,25,0.18)]"
          : "border-border hover:border-primary/60"
      }`}
    >
      <div className="text-center text-[13px] font-medium text-foreground">{option.label}</div>
      <div className="mt-2 overflow-hidden rounded-lg border border-border/70 bg-muted/50">
        {option.thumbnailUrl ? (
          <div className="relative h-20">
            <img
              src={option.thumbnailUrl}
              alt={option.label}
              className="h-full w-full object-cover"
            />
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
