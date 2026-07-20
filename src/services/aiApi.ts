import { Platform } from 'react-native';
import { AI_API_BASE_URL as ENV_AI_API_BASE_URL } from '@env';

import type { AskQuestionRequest, AskQuestionResponse, ChatRequest, ChatResponse } from '../types/ai';

const DEFAULT_BASE_URL = Platform.OS === 'ios' ? 'http://localhost:8000' : 'http://10.0.2.2:8000';

const AI_API_BASE_URL = ENV_AI_API_BASE_URL?.trim() || DEFAULT_BASE_URL;

function buildAiUrl(path: string): string {
  return `${AI_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function requestJson<TResponse>(
  path: string,
  init: Omit<RequestInit, 'body' | 'method'> & { method?: 'GET' | 'POST'; body?: unknown } = {},
): Promise<TResponse> {
  const response = await fetch(buildAiUrl(path), {
    ...init,
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!response.ok) {
    throw new Error(`AI API request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export function getAiJson<TResponse>(path: string, init: Omit<RequestInit, 'body' | 'method'> = {}) {
  return requestJson<TResponse>(path, { ...init, method: 'GET' });
}

export function postAiJson<TResponse, TBody>(
  path: string,
  body: TBody,
  init: Omit<RequestInit, 'body' | 'method'> = {},
) {
  return requestJson<TResponse>(path, { ...init, method: 'POST', body });
}

export function sendMessageToAI(payload: ChatRequest): Promise<ChatResponse> {
  return postAiJson<ChatResponse, ChatRequest>('/chat', payload);
}

export async function askAiQuestion(payload: AskQuestionRequest): Promise<AskQuestionResponse> {
  const response = await sendMessageToAI({
    message: payload.question,
    items: payload.detectedItems,
    user_persona: payload.userPersona,
  });

  return {
    reply: response.reply,
    retrievedTitles: response.retrieved_titles,
  };
}
