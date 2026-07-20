export type AIRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  id: string;
  role: AIRole;
  content: string;
  createdAt?: number;
}

export interface ChatItem {
  name: string;
  category: string;
  count: number;
}

export interface ChatRequest {
  message: string;
  items: ChatItem[];
  user_persona?: string;
  user_profile?: Record<string, unknown>;
}

export interface ChatResponse {
  reply: string;
  retrieved_titles: string[];
}

export interface AskQuestionRequest {
  question: string;
  detectedItems: ChatItem[];
  userPersona?: string;
  topK?: number;
}

export interface AskQuestionResponse {
  reply: string;
  retrievedTitles: string[];
}

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
}
