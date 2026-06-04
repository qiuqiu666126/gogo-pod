import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, ChevronRight, FileText, ImageIcon, Package2, Store, X } from "lucide-react";

import {
  PUBLISH_PLATFORMS,
  getOfficialPublishTemplatesList,
  type PublishPlatform,
} from "../shared/publishTemplates";

const fieldSelectClass =
  "h-11 w-full rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

export function AddListingTemplateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const templates = getOfficialPublishTemplatesList()
    .filter((template) => template.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const [platform, setPlatform] = useState<PublishPlatform>("temu");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates.find((template) => template.platform === "temu")?.id ?? templates[0]?.id ?? "",
  );

  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.platform === platform),
    [platform, templates],
  );

  const selectedTemplate =
    filteredTemplates.find((template) => template.id === selectedTemplateId) ??
    filteredTemplates[0] ??
    null;

  const handlePlatformChange = (value: PublishPlatform) => {
    setPlatform(value);
    const nextTemplate = templates.find((template) => template.platform === value);
    setSelectedTemplateId(nextTemplate?.id ?? "");
  };

  const previewSections = selectedTemplate
    ? [
        {
          icon: Store,
          title: "店铺与站点",
          items: [
            `${selectedTemplate.storeName} · ${selectedTemplate.site}`,
            selectedTemplate.publishMode,
          ],
        },
        {
          icon: FileText,
          title: "标题与属性",
          items: [selectedTemplate.titleRule, selectedTemplate.attributeRule],
        },
        {
          icon: ImageIcon,
          title: "图片规则",
          items: [selectedTemplate.imageRule],
        },
        {
          icon: Package2,
          title: "价格与库存",
          items: [selectedTemplate.priceRule, selectedTemplate.inventoryRule],
        },
      ]
    : [];

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(960px,96vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
            <div>
              <Dialog.Title className="text-[16px] font-semibold text-foreground">选择刊登模板</Dialog.Title>
              <p className="mt-1 text-[12px] text-muted-foreground">
                先选择平台模板，后续商品上架时会按模板生成 Temu 刊登规则。
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
            <div className="border-b border-border/80 p-6 lg:border-b-0 lg:border-r">
              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-foreground">平台</label>
                  <select
                    value={platform}
                    onChange={(event) => handlePlatformChange(event.target.value as PublishPlatform)}
                    className={fieldSelectClass}
                  >
                    {PUBLISH_PLATFORMS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border border-border bg-muted/20">
                  <div className="border-b border-border/80 px-4 py-3">
                    <p className="text-[13px] font-semibold text-foreground">模板列表</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      选择一套适合当前商品的 Temu 刊登规则。
                    </p>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {filteredTemplates.map((template) => {
                      const active = template.id === selectedTemplate?.id;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={`mb-2 w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                            active
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-card hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-foreground">
                                  {template.name}
                                </span>
                                {active ? <CheckCircle2 size={14} className="text-primary" /> : null}
                              </div>
                              <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                                {template.description}
                              </p>
                            </div>
                            <ChevronRight
                              size={16}
                              className={active ? "text-primary" : "text-muted-foreground"}
                            />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                              {template.site}
                            </span>
                            <span className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                              {template.storeName}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {selectedTemplate ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-border bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                            Temu
                          </span>
                          <span className="rounded-md bg-white/80 px-2 py-1 text-[11px] text-muted-foreground">
                            {selectedTemplate.storeName}
                          </span>
                          <span className="rounded-md bg-white/80 px-2 py-1 text-[11px] text-muted-foreground">
                            {selectedTemplate.site}
                          </span>
                        </div>
                        <h3 className="mt-3 text-[20px] font-semibold text-foreground">
                          {selectedTemplate.name}
                        </h3>
                        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted-foreground">
                          {selectedTemplate.description}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3 text-right">
                        <p className="text-[11px] text-muted-foreground">适用品类</p>
                        <p className="mt-1 text-[13px] font-medium text-foreground">
                          {selectedTemplate.categoryPath}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {previewSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <div key={section.title} className="rounded-xl border border-border bg-card p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
                              <Icon size={15} />
                            </div>
                            <p className="text-[13px] font-semibold text-foreground">{section.title}</p>
                          </div>
                          <div className="mt-3 space-y-2">
                            {section.items.map((item) => (
                              <p key={item} className="text-[12px] leading-5 text-muted-foreground">
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-[13px] font-semibold text-foreground">发布前必备字段</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedTemplate.requiredFields.map((field) => (
                          <span
                            key={field}
                            className="rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-[12px] text-foreground"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                      <p className="mt-4 text-[13px] font-semibold text-foreground">模板亮点</p>
                      <div className="mt-3 space-y-2">
                        {selectedTemplate.highlights.map((item) => (
                          <div key={item} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-primary" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-[13px] font-semibold text-foreground">模板配置摘要</p>
                      <div className="mt-3 space-y-3">
                        {selectedTemplate.sections.map((section) => (
                          <div
                            key={section.label}
                            className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5"
                          >
                            <p className="text-[11px] text-muted-foreground">{section.label}</p>
                            <p className="mt-1 text-[12px] leading-5 text-foreground">{section.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border text-[13px] text-muted-foreground">
                  当前平台暂无可用模板
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/80 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-border px-7 text-[14px] text-foreground hover:bg-muted/40"
            >
              取消
            </button>
            <button
              type="button"
              className="h-10 rounded-md bg-primary px-7 text-[14px] font-medium text-white hover:bg-primary/90"
            >
              使用该模板
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
