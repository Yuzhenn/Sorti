import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useTheme } from '../context/ThemeContext';
import { AI_ANALYSIS_ROOM_IMAGE } from './aiAnalysisData';
import { askAiQuestion } from '../services/aiApi';
import { saveAiAnalysisHistoryRecord } from '../services/photoTempStore';
import type { ChatItem } from '../types/ai';

const PURCHASE_SECTION_TITLES = ['建議採購', '建議採買', '建議補充', '建議購買'];

// 提取 AI 回答中的「建議採購」項，並清洗掉 Markdown 格式
const extractPurchaseItems = (
  adviceText: string,
): {
  mainAdvice: string;
  purchaseItems: string[];
} => {
  if (!adviceText.trim()) {
    return {
      mainAdvice: '',
      purchaseItems: [],
    };
  }

  const lines = adviceText.split(/\r?\n/);

  const sectionIndex = lines.findIndex((line) =>
    PURCHASE_SECTION_TITLES.some((title) =>
      new RegExp(`^(#+\\s*)?${title}(\\s*[:：])?$`, 'i').test(line.trim()),
    ),
  );

  // AI 沒有輸出「建議採購」區塊時，前端不自行猜測採購用品。
  if (sectionIndex === -1) {
    return {
      mainAdvice: adviceText.trim(),
      purchaseItems: [],
    };
  }

  // 主內容只保留「建議採購」之前的文字，避免畫面重複顯示。
  const mainAdvice = lines.slice(0, sectionIndex).join('\n').trim();
  const extracted: string[] = [];

  for (let index = sectionIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) {
      continue;
    }

    // 遇到下一個 Markdown 標題就停止擷取。
    if (/^#{1,6}\s+/.test(line)) {
      break;
    }

    const bulletMatch = line.match(/^(?:[-*•]|\d+[.)])\s*(.+)$/);
    const candidate = (bulletMatch?.[1] ?? line)
      .replace(/[*_~`]/g, '')
      .trim();

    if (!candidate) {
      continue;
    }

    if (PURCHASE_SECTION_TITLES.includes(candidate)) {
      continue;
    }

    // AI 明確判斷不需購買時，不建立採購卡片。
    if (
      candidate === '無' ||
      candidate === '目前不需要添購' ||
      candidate === '目前沒有需要補充的收納用品' ||
      candidate.toLowerCase() === 'none'
    ) {
      continue;
    }

    // 允許 AI 同時輸出「用品名稱：用途」，因此放寬長度限制。
    if (candidate.length <= 100) {
      extracted.push(candidate);
    }
  }

  return {
    mainAdvice: mainAdvice || adviceText.trim(),
    purchaseItems: [...new Set(extracted)],
  };
};

const AIAnalysisAdviceScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const photoUri = route?.params?.photoUri;
  const detectedItems: ChatItem[] = useMemo(
    () => (Array.isArray(route?.params?.detectedItems) ? route.params.detectedItems : []),
    [route?.params?.detectedItems],
  );
  const previewUri = photoUri ?? AI_ANALYSIS_ROOM_IMAGE;
  const [rawAdviceText, setRawAdviceText] = useState('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(true);
  const [adviceError, setAdviceError] = useState('');
  const [isSavingHistory, setIsSavingHistory] = useState(false);

  const totalDetectedCount = useMemo(
    () => detectedItems.reduce((sum, item) => sum + (item.count ?? 0), 0),
    [detectedItems],
  );

  useEffect(() => {
    let active = true;

    const generateAdvice = async () => {
      try {
        setIsLoadingAdvice(true);
        setAdviceError('');

        // 前端只傳遞任務類型與辨識資料；完整輸出規則由後端 prompts.py 管理。
        const response = await askAiQuestion({
          question: '請根據照片辨識結果產生收納分析建議。',
          detectedItems,
          mode: 'photo_analysis',
        });

        if (!active) return;
        setRawAdviceText(response.reply);
      } catch (error) {
        if (!active) return;
        setAdviceError(error instanceof Error ? error.message : '無法取得建議，請稍後再試');
        setRawAdviceText('');
      } finally {
        if (!active) return;
        setIsLoadingAdvice(false);
      }
    };

    generateAdvice();

    return () => {
      active = false;
    };
  }, [detectedItems]);

  const { mainAdvice, purchaseItems } = useMemo(
    () => extractPurchaseItems(rawAdviceText),
    [rawAdviceText],
  );

  const markdownStyles = useMemo(
    () => ({
      body: { color: theme.textMain, fontSize: 15, lineHeight: 23 },
      heading1: { color: theme.textMain, fontSize: 18, fontWeight: '800' as const, marginBottom: 6 },
      heading2: { color: theme.textMain, fontSize: 16, fontWeight: '800' as const, marginBottom: 6 },
      paragraph: { color: theme.textMain, fontSize: 15, lineHeight: 23, marginBottom: 8 },
      bullet_list: { marginBottom: 8 },
      ordered_list: { marginBottom: 8 },
      list_item: { marginBottom: 4 },
      strong: { color: theme.textMain, fontWeight: '800' as const },
    }),
    [theme.textMain],
  );

  const saveButtonOpacity = isLoadingAdvice || !rawAdviceText || isSavingHistory ? 0.6 : 1;

  const handleSaveAdvice = async () => {
    if (isLoadingAdvice || adviceError || !rawAdviceText) return;

    try {
      setIsSavingHistory(true);
      await saveAiAnalysisHistoryRecord({
        photoUri: previewUri,
        detectedItems,
        adviceText: rawAdviceText,
      });
      Alert.alert('已儲存', '這次 AI 物件分析的收納建議已加入歷史紀錄。');
    } catch (error) {
      Alert.alert('儲存失敗', error instanceof Error ? error.message : '無法儲存歷史紀錄，請稍後再試。');
    } finally {
      setIsSavingHistory(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.textMain }]}>收納建議</Text>

        <View style={styles.segmentRow}>
          <View style={[styles.segmentActive, { backgroundColor: theme.primary }]}>
            <Text style={styles.segmentActiveText}>整理前</Text>
          </View>
        </View>

        <View style={[styles.previewWrap, { borderColor: theme.border }]}>
          <ImageBackground source={{ uri: previewUri }} style={styles.preview} imageStyle={styles.previewImage} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>段捨離</Text>
          <Text style={[styles.bodyText, { color: theme.textMain }]}>
            {detectedItems.length > 0
              ? `這次共辨識到 ${totalDetectedCount} 個物件，可先從重複數量高的類別開始減量。`
              : '這次沒有明確偵測到物件，我會先用空間整體狀態幫你整理方向。'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>如何收納?</Text>
          {isLoadingAdvice ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSub }]}>AI 正在根據辨識結果生成建議...</Text>
            </View>
          ) : adviceError ? (
            <Text style={styles.errorText}>{adviceError}</Text>
          ) : (
            <Markdown style={markdownStyles}>{mainAdvice}</Markdown>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>建議採購</Text>
          {purchaseItems.length > 0 ? (
            <View style={styles.purchaseList}>
              {purchaseItems.map((item) => (
                <View key={item} style={[styles.purchaseItem, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
                  <Text style={[styles.purchaseItemText, { color: theme.textMain }]}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.bodyText, { color: theme.textMain }]}>目前沒有需要補充的收納用品。</Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={[styles.bottomActionButton, { backgroundColor: theme.primary, opacity: saveButtonOpacity }]}
          onPress={handleSaveAdvice}
          disabled={isLoadingAdvice || !rawAdviceText || isSavingHistory}
        >
          <Text style={styles.buttonText}>{isSavingHistory ? '儲存中' : '儲存建議'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomActionButton, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>回主畫面</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomActionButton, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('CalendarCheckIn')}>
          <Text style={styles.buttonText}>拍照打卡</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 110 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  segmentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  segmentActive: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 3,
  },
  segmentActiveText: { color: '#111', fontSize: 16, fontWeight: '800' },
  previewWrap: {
    borderWidth: 1.5,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  preview: { height: 230 },
  previewImage: { borderRadius: 30 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  bodyText: { fontSize: 15, lineHeight: 22 },
  purchaseList: { gap: 10 },
  purchaseItem: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  purchaseItemText: { fontSize: 15, fontWeight: '700' },
  loadingBlock: { paddingVertical: 10, alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 14 },
  errorText: { fontSize: 14, lineHeight: 21, color: '#b42318' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 12,
  },
  bottomActionButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '800', color: '#111' },
});

export default AIAnalysisAdviceScreen;