export type AIRole = 'system' | 'user' | 'assistant';

export type AIRequestMode = 'chat' | 'photo_analysis';

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
  confidence?: number;
  raw_label?: string;
}

export interface ChatRequest {
  message: string;
  items: ChatItem[];
  user_persona?: string;
  user_profile?: Record<string, unknown>;

  /**
   * chat：一般 AI 收納聊天
   * photo_analysis：照片辨識後的收納分析
   */
  mode?: AIRequestMode;
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

  /**
   * 照片分析頁面請傳入 photo_analysis。
   */
  mode?: AIRequestMode;
}

export interface AskQuestionResponse {
  reply: string;
  retrievedTitles: string[];
}

export interface DetectItemsResponse {
  detected_items: ChatItem[];
  detection_boxes: DetectionBox[];
  total_detections: number;
  model_name: string;
}

export interface DetectionBox {
  name: string;
  category: string;
  confidence?: number;
  raw_label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
}