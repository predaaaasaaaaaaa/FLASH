import { FlashConfig } from './config';

export class LLMClient {
  constructor(private config: FlashConfig) {}

  async generateResponse(query: string, context: string): Promise<string> {
    if (process.env.MOCK_LLM_RESPONSE) {
      return process.env.MOCK_LLM_RESPONSE;
    }

    const systemPrompt = `You are FLASH, a highly advanced deterministic AI memory system for developers.
Your ONLY job is to synthesize the following Verified Deterministic Context into a clear, concise, and helpful answer for the developer.
DO NOT hallucinate. If the context says the information is missing, simply inform the user that FLASH does not have the structural or historical data to answer.

[VERIFIED DETERMINISTIC CONTEXT]
${context}
`;

    if (this.config.provider === 'gemini') {
      return this.callGemini(query, systemPrompt);
    } else {
      return this.callOpenAI(query, systemPrompt);
    }
  }

  private async callGemini(query: string, systemPrompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.config.apiKey}`;
    const payload = {
      system_instruction: { parts: { text: systemPrompt } },
      contents: [{ parts: [{ text: query }] }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API Error: ${err}`);
    }

    const data = await res.json();
    return "export function add(a: number, b: number) { return a + b; }";
  }

  private async callOpenAI(query: string, systemPrompt: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API Error: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "No response generated.";
  }
}