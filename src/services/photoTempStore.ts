import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatItem } from '../types/ai';

const CHECK_IN_RECORDS_KEY = 'sorti_check_in_records_v1';
const AI_LATEST_CAPTURE_KEY = 'sorti_ai_latest_capture_v1';
const AI_ANALYSIS_HISTORY_KEY = 'sorti_ai_analysis_history_v1';

export type CheckInRecords = Record<string, string>;
export type AiAnalysisHistoryRecord = {
  id: string;
  createdAt: number;
  photoUri: string | null;
  detectedItems: ChatItem[];
  adviceText: string;
  summary: string;
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function buildAnalysisSummary(detectedItems: ChatItem[]): string {
  if (detectedItems.length === 0) {
    return '沒有偵測到明確物件';
  }

  return detectedItems.map((item) => `${item.name}（${item.category}，${item.count}個）`).join('、');
}

export async function loadCheckInRecords(): Promise<CheckInRecords> {
  return readJson<CheckInRecords>(CHECK_IN_RECORDS_KEY, {});
}

export async function saveCheckInRecord(recordKey: string, photoUri: string): Promise<CheckInRecords> {
  const currentRecords = await loadCheckInRecords();
  const nextRecords = {
    ...currentRecords,
    [recordKey]: photoUri,
  };

  await writeJson(CHECK_IN_RECORDS_KEY, nextRecords);
  return nextRecords;
}

export async function loadLatestAiCapture(): Promise<string | null> {
  return AsyncStorage.getItem(AI_LATEST_CAPTURE_KEY);
}

export async function saveLatestAiCapture(photoUri: string): Promise<void> {
  await AsyncStorage.setItem(AI_LATEST_CAPTURE_KEY, photoUri);
}

export async function loadAiAnalysisHistory(): Promise<AiAnalysisHistoryRecord[]> {
  const history = await readJson<AiAnalysisHistoryRecord[]>(AI_ANALYSIS_HISTORY_KEY, []);
  return [...history].sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveAiAnalysisHistoryRecord(input: {
  photoUri: string | null;
  detectedItems: ChatItem[];
  adviceText: string;
}): Promise<AiAnalysisHistoryRecord> {
  const currentHistory = await loadAiAnalysisHistory();
  const nextRecord: AiAnalysisHistoryRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    photoUri: input.photoUri,
    detectedItems: input.detectedItems,
    adviceText: input.adviceText,
    summary: buildAnalysisSummary(input.detectedItems),
  };

  const nextHistory = [nextRecord, ...currentHistory].slice(0, 20);
  await writeJson(AI_ANALYSIS_HISTORY_KEY, nextHistory);
  return nextRecord;
}