import { useEffect, useState, useSyncExternalStore } from "react";
import {
  applyOptionChange,
  buildScenePrompt,
  collectDefaultValues,
  DEFAULT_SCENE_KEY,
  flattenFieldsForParams,
  getSceneFormPreset,
  getScenePresets,
  listSceneFormPresets,
  subscribeScenePresets,
  type FormValue,
  type SceneFeatureType,
  type SceneFormPreset,
} from "../../shared/sceneFormSchema";

export { DEFAULT_SCENE_KEY };

function useScenePresetsSnapshot() {
  return useSyncExternalStore(subscribeScenePresets, getScenePresets, getScenePresets);
}

export function useSceneFormState(
  featureType: SceneFeatureType,
  sceneKey: string,
  open: boolean,
) {
  useScenePresetsSnapshot();

  const preset = getSceneFormPreset(featureType, sceneKey);
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});

  useEffect(() => {
    if (!open || !preset) return;
    setFormValues(collectDefaultValues(preset.formFields));
  }, [open, preset?.id, sceneKey]);

  const handleChange = (key: string, value: FormValue) => {
    if (!preset) return;
    setFormValues((prev) => {
      const base = { ...collectDefaultValues(preset.formFields), ...prev };
      return applyOptionChange(preset.formFields, base, key, value);
    });
  };

  const submitParams = () =>
    preset ? flattenFieldsForParams(preset.formFields, formValues) : [];

  const buildPrompt = () => (preset ? buildScenePrompt(preset, formValues) : "");

  return { preset, formValues, handleChange, submitParams, buildPrompt };
}

export function useFeatureSceneTabs(featureType: SceneFeatureType) {
  useScenePresetsSnapshot();
  return listSceneFormPresets(featureType);
}

export function resolveScenePreset(
  featureType: SceneFeatureType,
  sceneKey: string,
): SceneFormPreset | undefined {
  return getSceneFormPreset(featureType, sceneKey);
}
