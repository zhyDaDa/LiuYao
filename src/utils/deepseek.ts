import type { AiConfig } from "../models/AiConfig";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function testAiConfig(config: AiConfig): Promise<void> {
  const url = buildUrl(config.endpoint, "/models");
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`测试失败（${response.status}）${text ? `：${text}` : ""}`);
  }
}

export async function streamAnalysis(
  config: AiConfig | null,
  messages: ChatMessage[],
  onContentChunk: (chunk: string) => void,
  onReasoningChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
): Promise<void> {
  let response: Response;
  if (config && config.useCustomModel) {
    const url = buildUrl(config.endpoint, "/chat/completions");

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          stream: true,
          temperature: 0.7,
        }),
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
      return;
    }
  } else {
    const url = "https://chatApi.zhydada.com/stream";

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer huTY@n@e7^E!zx98jz`,
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
        }),
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
      return;
    }
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    onError(
      new Error(`请求失败（${response.status}）${text ? `：${text}` : ""}`),
    );
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError(new Error("响应体不可读"));
    return;
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const chunks = parseSseLine(line);
        if (chunks.content) {
          onContentChunk(chunks.content);
        }
        if (chunks.reasoning) {
          onReasoningChunk(chunks.reasoning);
        }
      }
    }

    if (buffer) {
      const chunks = parseSseLine(buffer);
      if (chunks.content) {
        onContentChunk(chunks.content);
      }
      if (chunks.reasoning) {
        onReasoningChunk(chunks.reasoning);
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  } finally {
    reader.releaseLock();
  }
}

function buildUrl(endpoint: string, path: string): string {
  const trimmed = endpoint.trim().replace(/\/$/, "");
  return `${trimmed}${path}`;
}

function parseSseLine(line: string): {
  content: string;
  reasoning: string;
} {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith("data: ")) {
    return { content: "", reasoning: "" };
  }

  const data = trimmed.slice("data: ".length).trim();
  if (data === "[DONE]") {
    return { content: "", reasoning: "" };
  }

  try {
    const parsed = JSON.parse(data) as {
      choices?: Array<{
        delta?: { content?: string; reasoning_content?: string };
      }>;
    };
    const delta = parsed.choices?.[0]?.delta;
    return {
      content: delta?.content ?? "",
      reasoning: delta?.reasoning_content ?? "",
    };
  } catch {
    return { content: "", reasoning: "" };
  }
}
