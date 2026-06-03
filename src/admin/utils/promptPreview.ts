export function renderPromptPreview(
  system: string,
  userTemplate: string,
  vars: Record<string, string>,
): string {
  const user = userTemplate.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
  return [system.trim(), user.trim()].filter(Boolean).join("\n\n---\n\n");
}
