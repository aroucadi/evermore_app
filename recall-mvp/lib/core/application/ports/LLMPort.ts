export interface LLMPort {
  generateText(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string>;
  generateJson<T>(prompt: string, schema?: any, options?: { maxTokens?: number; temperature?: number }): Promise<T>;
  analyzeImage(imageBase64: string, mimeType: string, prompt: string): Promise<string>;
}
