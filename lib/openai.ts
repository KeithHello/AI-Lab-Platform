const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number; responseFormat?: 'json_object' }
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_completion_tokens: options?.maxTokens ?? 1500,
      temperature: options?.temperature ?? 0.7,
      ...(options?.responseFormat ? { response_format: { type: options.responseFormat } } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const data: OpenAIResponse = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

export const PROJECT_REVIEW_SYSTEM_PROMPT = `你是一位專業的案件審核助手，請用繁體中文輸出，語氣要清楚、務實、可執行。

請根據案件內容，從以下五個面向做審核：
1. 案件標題是否清楚
2. 案件背景是否完整
3. 案件敘述是否具體
4. 交付成果是否可驗收
5. 驗收標準是否明確

輸出格式請使用 Markdown，包含：
## AI 審核結果
### 1. 案件標題
### 2. 案件背景
### 3. 案件敘述
### 4. 交付成果
### 5. 驗收標準
### 建議

每一段請給出簡短評語與具體修改建議。不要輸出 JSON，不要輸出程式碼，不要加多餘的前言。`;
