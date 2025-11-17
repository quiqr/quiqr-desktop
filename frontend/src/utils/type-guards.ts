import { HugoConfigParsed, PreviewConfig, QuiqrModelParsed } from "../components/HoForm";

export const hasOpenAiApiKey = (config: unknown): config is { openAiApiKey: string } => {
  return Boolean(typeof config === "object" && "openAiApiKey" in config && typeof config.openAiApiKey === "string");
}

export const isValidPreviewConfiguration = (config: unknown): config is PreviewConfig => {
  return typeof config === "object" && "enable" in config && typeof config.enable === "boolean" && 'preview_url' in config && typeof config.preview_url === 'string';
}

export interface HugoSiteDirResponse {
  Screenshot?: string;
  hugoConfigExists?: boolean;
  hugoConfigParsed?: HugoConfigParsed;
  quiqrModelParsed?: QuiqrModelParsed;
  dirName?: string;
  hugoThemesDirExists?: boolean;
  hugoContentDirExists?: boolean;
  hugoDataDirExists?: boolean;
}

export const isHugoSiteDirResponse = (response: unknown): response is HugoSiteDirResponse => {
  if (typeof response !== "object" || response === null) {
    return false;
  }

  // Optional fields validation - using proper type narrowing
  if ("Screenshot" in response && response.Screenshot !== undefined && typeof response.Screenshot !== "string") {
    return false;
  }

  if ("hugoConfigExists" in response && response.hugoConfigExists !== undefined && typeof response.hugoConfigExists !== "boolean") {
    return false;
  }

  if ("hugoConfigParsed" in response && response.hugoConfigParsed !== undefined && response.hugoConfigParsed !== null) {
    const config = response.hugoConfigParsed;
    if (typeof config !== "object") {
      return false;
    }
    if ("theme" in config && config.theme !== undefined && typeof config.theme !== "string") {
      return false;
    }
    if ("title" in config && config.title !== undefined && typeof config.title !== "string") {
      return false;
    }
  }

  if ("quiqrModelParsed" in response && response.quiqrModelParsed !== undefined && response.quiqrModelParsed !== null) {
    const model = response.quiqrModelParsed;
    if (typeof model !== "object") {
      return false;
    }
    if ("hugover" in model && model.hugover !== undefined && typeof model.hugover !== "string") {
      return false;
    }
  }

  if ("dirName" in response && response.dirName !== undefined && typeof response.dirName !== "string") {
    return false;
  }

  if ("hugoThemesDirExists" in response && response.hugoThemesDirExists !== undefined && typeof response.hugoThemesDirExists !== "boolean") {
    return false;
  }

  if ("hugoContentDirExists" in response && response.hugoContentDirExists !== undefined && typeof response.hugoContentDirExists !== "boolean") {
    return false;
  }

  if ("hugoDataDirExists" in response && response.hugoDataDirExists !== undefined && typeof response.hugoDataDirExists !== "boolean") {
    return false;
  }

  return true;
}