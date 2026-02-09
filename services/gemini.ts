export const GeminiService = {
  async getAdvice(prompt: string): Promise<string> {
    // Mocked response for deployment & demo
    return Promise.resolve(
      "Based on your interests, joining nearby sessions can help you stay active and connected."
    );
  }
};
