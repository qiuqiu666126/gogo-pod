import { http } from "../../shared/http";
import type { FormControl } from "../../shared/sceneFormSchema";
import { assertSuccess, getAdminAuthHeaders, type AdminApiResponse } from "./adminApi";

export type WorkflowStepSummaryDto = {
  featureCode: string;
  featureName: string;
  presetLabel: string;
};

export type WorkflowStepDetailDto = {
  id?: number;
  sortOrder?: number;
  featureCode: string;
  featureName: string;
  scenePresetId: number;
  presetUuid?: string;
  presetLabel?: string;
  sceneKey?: string;
  sceneLabel?: string;
  formFields?: FormControl[];
  nodeConfig?: Record<string, unknown>;
  manualReview?: boolean;
};

export type WorkflowTemplateSummaryDto = {
  id: number;
  templateUuid: string;
  name: string;
  categoryCode: string;
  categoryLabel: string;
  enabled: boolean;
  sortOrder: number;
  stepSummary: string;
  steps: WorkflowStepSummaryDto[];
  updatedAt: string;
};

export type WorkflowTemplateDetailDto = Omit<WorkflowTemplateSummaryDto, "steps"> & {
  steps: WorkflowStepDetailDto[];
  created_at?: string;
};

export type WorkflowTemplateListDto = {
  list: WorkflowTemplateSummaryDto[];
  total: number;
};

export type WorkflowCategoryOption = {
  code: string;
  label: string;
  value: string;
};

export type WorkflowTemplateMetaDto = {
  categories: WorkflowCategoryOption[];
  features: Array<{ value: string; label: string; code: string; enabled: boolean }>;
};

export type WorkflowStepOptionPresetDto = {
  id: number;
  presetUuid: string;
  label: string;
  sceneKey: string;
  sceneLabel: string;
  featureCode: string;
  featureName: string;
  enabled: boolean;
};

export type WorkflowStepOptionGroupDto = {
  featureCode: string;
  featureName: string;
  presets: WorkflowStepOptionPresetDto[];
};

export type WorkflowStepOptionsDto = {
  groups: WorkflowStepOptionGroupDto[];
};

export type WorkflowStepSchemaDto = {
  featureCode: string;
  featureName: string;
  scenePresetId: number;
  presetUuid: string;
  label: string;
  sceneKey: string;
  sceneLabel: string;
  formFields: FormControl[];
  defaultConfig: Record<string, unknown>;
};

export type WorkflowStepSavePayload = {
  scenePresetId: number;
  nodeConfig?: Record<string, unknown>;
  manualReview?: boolean;
};

export type WorkflowTemplateSavePayload = {
  name: string;
  categoryCode: string;
  enabled?: boolean;
  sortOrder?: number;
  steps: WorkflowStepSavePayload[];
};

export type WorkflowTemplateListParams = {
  category_code?: string;
  enabled?: number;
  keyword?: string;
  page?: number;
  page_size?: number;
};

export async function listWorkflowTemplates(
  params: WorkflowTemplateListParams,
  accessToken: string,
): Promise<WorkflowTemplateListDto> {
  const res = await http.get<AdminApiResponse<WorkflowTemplateListDto>>(
    "/admin/ai-workflow-template/list",
    {
      headers: await getAdminAuthHeaders(),
      query: {
        category_code: params.category_code,
        enabled: params.enabled,
        keyword: params.keyword?.trim() || undefined,
        page: params.page,
        page_size: params.page_size,
      },
    },
  );
  return assertSuccess(res, "获取工作流模版列表失败");
}

export async function getWorkflowTemplateMeta(
  accessToken: string,
): Promise<WorkflowTemplateMetaDto> {
  const res = await http.get<AdminApiResponse<WorkflowTemplateMetaDto>>(
    "/admin/ai-workflow-template/meta",
    { headers: await getAdminAuthHeaders() },
  );
  return assertSuccess(res, "获取工作流元数据失败");
}

export async function getWorkflowStepOptions(
  accessToken: string,
  featureCode?: string,
): Promise<WorkflowStepOptionsDto> {
  const res = await http.get<AdminApiResponse<WorkflowStepOptionsDto>>(
    "/admin/ai-workflow-template/step-options",
    {
      headers: await getAdminAuthHeaders(),
      query: { feature_code: featureCode },
    },
  );
  return assertSuccess(res, "获取可选工作流步骤失败");
}

export async function getWorkflowStepSchema(
  scenePresetId: number,
  accessToken: string,
): Promise<WorkflowStepSchemaDto> {
  const res = await http.get<AdminApiResponse<WorkflowStepSchemaDto>>(
    `/admin/ai-workflow-template/step-schema/${scenePresetId}`,
    { headers: await getAdminAuthHeaders() },
  );
  return assertSuccess(res, "获取节点控件配置失败");
}

export async function getWorkflowTemplateDetail(
  id: number,
  accessToken: string,
): Promise<WorkflowTemplateDetailDto> {
  const res = await http.get<AdminApiResponse<WorkflowTemplateDetailDto>>(
    `/admin/ai-workflow-template/${id}`,
    { headers: await getAdminAuthHeaders() },
  );
  return assertSuccess(res, "获取工作流模版详情失败");
}

export async function createWorkflowTemplate(
  payload: WorkflowTemplateSavePayload,
  accessToken: string,
): Promise<WorkflowTemplateDetailDto> {
  const res = await http.post<AdminApiResponse<WorkflowTemplateDetailDto>>(
    "/admin/ai-workflow-template",
    payload,
    { headers: await getAdminAuthHeaders() },
  );
  return assertSuccess(res, "创建工作流模版失败");
}

export async function updateWorkflowTemplate(
  id: number,
  payload: WorkflowTemplateSavePayload,
  accessToken: string,
): Promise<WorkflowTemplateDetailDto> {
  const res = await http.put<AdminApiResponse<WorkflowTemplateDetailDto>>(
    `/admin/ai-workflow-template/${id}`,
    payload,
    { headers: await getAdminAuthHeaders() },
  );
  return assertSuccess(res, "保存工作流模版失败");
}

export async function deleteWorkflowTemplate(id: number, accessToken: string): Promise<void> {
  const res = await http.delete<AdminApiResponse<unknown>>(
    `/admin/ai-workflow-template/${id}`,
    { headers: await getAdminAuthHeaders() },
  );
  assertSuccess(res, "删除工作流模版失败");
}
