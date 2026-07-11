export interface AiConfig {
  useCustomModel: boolean;
  endpoint: string;
  model: string;
  apiKey: string;
}

const AI_CONFIG_KEY = "liuyao.ai-config.v1";

export const DEFAULT_AI_ENDPOINT = "https://api.deepseek.com";
export const DEFAULT_AI_MODEL = "deepseek-v4-flash";

export function readAiConfig(): AiConfig | null {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AiConfig;
    if (!isAiConfigValid(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAiConfig(config: AiConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

export function isAiConfigValid(config: AiConfig | null): boolean {
  if (!config) return true;
  if (!config.useCustomModel) return true;
  return (
    config.endpoint.trim().length > 0 &&
    config.model.trim().length > 0 &&
    config.apiKey.trim().length > 0
  );
}
