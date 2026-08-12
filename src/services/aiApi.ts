import { NativeModules, Platform } from 'react-native';
import { AI_API_BASE_URL as ENV_AI_API_BASE_URL } from '@env';

import type {
  AskQuestionRequest,
  AskQuestionResponse,
  ChatRequest,
  ChatResponse,
  DetectItemsResponse,
} from '../types/ai';

const DEFAULT_BASE_URL =
  Platform.OS === 'ios'
    ? 'http://localhost:8000'
    : 'http://10.0.2.2:8000';

function getMetroDevHost(): string | null {
  const scriptURL = NativeModules?.SourceCode?.scriptURL as string | undefined;

  if (!scriptURL) {
    return null;
  }

  try {
    const host = new URL(scriptURL).hostname;
    return host || null;
  } catch {
    return null;
  }
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function resolveAiApiBaseUrl(): string {
  const configuredBaseUrl = ENV_AI_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    const devHost =
      Platform.OS === 'android'
        ? getMetroDevHost()
        : null;

    return devHost
      ? `http://${devHost}:8000`
      : DEFAULT_BASE_URL;
  }

  if (Platform.OS !== 'android') {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  try {
    const parsedUrl = new URL(configuredBaseUrl);

    if (!isLoopbackHost(parsedUrl.hostname)) {
      return configuredBaseUrl.replace(/\/$/, '');
    }

    const devHost = getMetroDevHost();

    if (!devHost || isLoopbackHost(devHost)) {
      return configuredBaseUrl.replace(/\/$/, '');
    }

    const portPart = parsedUrl.port
      ? `:${parsedUrl.port}`
      : '';

    const rebuilt =
      `${parsedUrl.protocol}//${devHost}${portPart}` +
      `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;

    return rebuilt.replace(/\/$/, '');
  } catch {
    return configuredBaseUrl.replace(/\/$/, '');
  }
}

const AI_API_BASE_URL = resolveAiApiBaseUrl();

function buildAiUrl(path: string): string {
  return `${AI_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function readApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.detail === 'string') {
      return data.detail;
    }

    if (typeof data?.message === 'string') {
      return data.message;
    }

    if (typeof data?.error === 'string') {
      return data.error;
    }
  } catch {
    // 後端不一定回傳 JSON，解析失敗時使用預設錯誤。
  }

  return `AI API request failed with status ${response.status}`;
}

async function requestJson<TResponse>(
  path: string,
  init: Omit<RequestInit, 'body' | 'method'> & {
    method?: 'GET' | 'POST';
    body?: unknown;
  } = {},
): Promise<TResponse> {
  const requestUrl = buildAiUrl(path);
  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...init,
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      body:
        init.body === undefined
          ? undefined
          : JSON.stringify(init.body),
    });
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : 'unknown error';

    throw new Error(
      `Network request failed (${requestUrl}) - ${reason}`,
    );
  }

  if (!response.ok) {
    const errorMessage = await readApiError(response);
    throw new Error(errorMessage);
  }

  return (await response.json()) as TResponse;
}

async function requestMultipart<TResponse>(
  path: string,
  formData: FormData,
): Promise<TResponse> {
  const requestUrl = buildAiUrl(path);
  let response: Response;

  try {
    response = await fetch(requestUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : 'unknown error';

    throw new Error(
      `Network request failed (${requestUrl}) - ${reason}`,
    );
  }

  if (!response.ok) {
    const errorMessage = await readApiError(response);
    throw new Error(errorMessage);
  }

  return (await response.json()) as TResponse;
}

export function getAiJson<TResponse>(
  path: string,
  init: Omit<RequestInit, 'body' | 'method'> = {},
): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    ...init,
    method: 'GET',
  });
}

export function postAiJson<TResponse, TBody>(
  path: string,
  body: TBody,
  init: Omit<RequestInit, 'body' | 'method'> = {},
): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    ...init,
    method: 'POST',
    body,
  });
}

/**
 * 一般聊天與照片分析都會呼叫後端 /chat。
 * 後端依照 payload.mode 選擇不同 Prompt。
 */
export function sendMessageToAI(
  payload: ChatRequest,
): Promise<ChatResponse> {
  return postAiJson<ChatResponse, ChatRequest>(
    '/chat',
    payload,
  );
}

/**
 * 照片分析畫面使用。
 */
export async function askAiQuestion(
  payload: AskQuestionRequest,
): Promise<AskQuestionResponse> {
  const response = await sendMessageToAI({
    message: payload.question,
    items: payload.detectedItems,
    user_persona: payload.userPersona,

    // 將照片分析模式傳給後端。
    mode: payload.mode ?? 'photo_analysis',
  });

  return {
    reply: response.reply,
    retrievedTitles: response.retrieved_titles,
  };
}

export function detectItemsFromPhoto(
  photoUri: string,
): Promise<DetectItemsResponse> {
  const formData = new FormData();

  formData.append(
    'image',
    {
      uri: photoUri,
      name: `analysis-${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any,
  );

  return requestMultipart<DetectItemsResponse>(
    '/detect-items',
    formData,
  );
}