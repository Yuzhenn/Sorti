import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../context/ThemeContext';
import {
  loadAiAnalysisHistory,
  type AiAnalysisHistoryRecord,
} from '../services/photoTempStore';
import { AI_ANALYSIS_ROOM_IMAGE } from './aiAnalysisData';

const AIAnalysisHistoryScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [history, setHistory] = useState<AiAnalysisHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const records = await loadAiAnalysisHistory();
      setHistory(records);
    } catch (error) {
      console.log('讀取 AI 分析歷史紀錄失敗：', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 每次返回此頁面時重新讀取，確保資料為最新狀態。
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const openRecord = (record: AiAnalysisHistoryRecord) => {
    navigation.navigate('AIAnalysisHistoryDetail', {
      record,
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          activeOpacity={0.75}
        >
          <Icon
            name="chevron-back"
            size={24}
            color={theme.textMain}
          />
          <Text
            style={[
              styles.headerButtonText,
              { color: theme.textMain },
            ]}
          >
            返回
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            { color: theme.textMain },
          ]}
        >
          歷史紀錄
        </Text>

        <TouchableOpacity
          onPress={loadHistory}
          style={styles.headerButton}
          activeOpacity={0.75}
          disabled={isLoading}
        >
          <Icon
            name="refresh"
            size={21}
            color={theme.primary}
          />
          <Text
            style={[
              styles.headerButtonText,
              { color: theme.primary },
            ]}
          >
            更新
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={theme.primary} />
            <Text
              style={[
                styles.loadingText,
                { color: theme.textSub },
              ]}
            >
              正在讀取 AI 物件分析歷史紀錄...
            </Text>
          </View>
        ) : history.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
              },
            ]}
          >
            <Icon
              name="time-outline"
              size={38}
              color={theme.textSub}
            />
            <Text
              style={[
                styles.emptyTitle,
                { color: theme.textMain },
              ]}
            >
              目前還沒有歷史紀錄
            </Text>
            <Text
              style={[
                styles.emptyBody,
                { color: theme.textSub },
              ]}
            >
              在 AI 物件分析頁按下「儲存建議」後，這裡就會顯示每次的完整分析結果。
            </Text>
          </View>
        ) : (
          history.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={[
                styles.recordCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                },
              ]}
              activeOpacity={0.88}
              onPress={() => openRecord(record)}
            >
              <Image
                source={{
                  uri:
                    record.photoUri ??
                    AI_ANALYSIS_ROOM_IMAGE,
                }}
                style={styles.previewImage}
                resizeMode="cover"
              />

              <View style={styles.recordBody}>
                <View style={styles.recordHeaderRow}>
                  <View style={styles.recordTitleBlock}>
                    <Text
                      style={[
                        styles.recordTitle,
                        { color: theme.textMain },
                      ]}
                      numberOfLines={1}
                    >
                      {record.summary || 'AI 收納分析'}
                    </Text>

                    <Text
                      style={[
                        styles.metaText,
                        { color: theme.textSub },
                      ]}
                    >
                      {new Date(
                        record.createdAt,
                      ).toLocaleString('zh-TW')}
                    </Text>
                  </View>

                  <Icon
                    name="chevron-forward"
                    size={22}
                    color={theme.textSub}
                  />
                </View>

                <Text
                  style={[
                    styles.adviceText,
                    { color: theme.textMain },
                  ]}
                  numberOfLines={3}
                >
                  {record.adviceText}
                </Text>

                <View style={styles.footerRow}>
                  <Text
                    style={[
                      styles.countText,
                      { color: theme.textSub },
                    ]}
                  >
                    共 {record.detectedItems.length} 類物件
                  </Text>

                  <Text
                    style={[
                      styles.detailHint,
                      { color: theme.primary },
                    ]}
                  >
                    查看完整內容
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  headerButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  recordCard: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
  },
  previewImage: {
    width: '100%',
    height: 170,
  },
  recordBody: {
    padding: 14,
  },
  recordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordTitleBlock: {
    flex: 1,
    marginRight: 10,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailHint: {
    fontSize: 12,
    fontWeight: '800',
  },
});

export default AIAnalysisHistoryScreen;