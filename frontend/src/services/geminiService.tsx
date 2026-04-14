import api from './api';

export const geminiService = {
  analyzeAlert: async (alertData: any) => {
    try {
      const response = await api.post('/ai/analyze', alertData);
      return response.data;
    } catch (error) {
      console.error('Gemini Analysis Failed:', error);
      throw error;
    }
  },
  askQuestion: async (prompt: string, context?: any) => {
    try {
      const response = await api.post('/ai/ask', { prompt, context });
      return response.data;
    } catch (error) {
      console.error('Gemini Request Failed:', error);
      throw error;
    }
  }
};