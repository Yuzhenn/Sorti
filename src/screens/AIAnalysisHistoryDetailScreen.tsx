import React, { useMemo } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Markdown from 'react-native-markdown-display';

import { useTheme } from '../context/ThemeContext';
import type { AiAnalysisHistoryRecord } from '../services/photoTempStore';
import { AI_ANALYSIS_ROOM_IMAGE } from './aiAnalysisData';

const PURCHASE_SECTION_TITLES = [
  '建議採購',
  '建議採買',
  '建議補充',
  '建議購買',
];

type ParsedAdvice = {
  mainAdvice: string;
  purchaseItems: string[];
};

const parseAdvice = (adviceText: string): ParsedAdvice => {
  if (!adviceText?.trim()) {
    return {
      mainAdvice: '',
      purchaseItems: [],
    };
  }

  const lines = adviceText.split(/\r?\n/);

  const sectionIndex = lines.findIndex((line) =>
    PURCHASE_SECTION_TITLES.some((title) =>
      new RegExp(
        `^(#+\\s*)?${title}(\\s*[:：])?$`,
        'i',
      ).test(line.trim()),
    ),
  );

  if (sectionIndex === -1) {
    return {
      mainAdvice: adviceText.trim(),
      purchaseItems: [],
    };
  }

  const mainAdvice = lines
    .slice(0, sectionIndex)
    .join('\n')
    .trim();

  const purchaseItems: string[] = [];

  for (
    let index = sectionIndex + 1;
    index < lines.length;
    index += 1
  ) {
    const line = lines[index].trim();

    if (!line) {
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      break;
    }

    const bulletMatch = line.match(
      /^(?:[-*•]|\d+[.)])\s*(.+)$/,
    );

    const candidate = (
      bulletMatch?.[1] ?? line
    )
      .replace(/[*_~`]/g, '')
      .trim();

    if (
      !candidate ||
      candidate === '無' ||
      candidate === '目前不需要添購' ||
      candidate ===
        '目前沒有需要補充的收納用品'
    ) {
      continue;
    }

    purchaseItems.push(candidate);
  }

  return {
    mainAdvice: mainAdvice || adviceText.trim(),
    purchaseItems: [...new Set(purchaseItems)],
  };
};

const AIAnalysisHistoryDetailScreen = ({
  navigation,
  route,
}: any) => {
  const { theme } = useTheme();

  const record = route?.params
    ?.record as AiAnalysisHistoryRecord | undefined;

  const parsedAdvice = useMemo(
    () => parseAdvice(record?.adviceText ?? ''),
    [record?.adviceText],
  );

  const markdownStyles = useMemo(
    () => ({
      body: {
        color: theme.textMain,
        fontSize: 15,
        lineHeight: 24,
      },
      heading1: {
        color: theme.textMain,
        fontSize: 21,
        fontWeight: '800' as const,
        marginTop: 4,
        marginBottom: 8,
      },
      heading2: {
        color: theme.textMain,
        fontSize: 19,
        fontWeight: '800' as const,
        marginTop: 4,
        marginBottom: 8,
      },
      heading3: {
        color: theme.textMain,
        fontSize: 17,
        fontWeight: '800' as const,
        marginTop: 4,
        marginBottom: 8,
      },
      paragraph: {
        color: theme.textMain,
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 8,
      },
      ordered_list: {
        marginBottom: 8,
      },
      bullet_list: {
        marginBottom: 8,
      },
      list_item: {
        marginBottom: 6,
      },
      strong: {
        color: theme.textMain,
        fontWeight: '800' as const,
      },
    }),
    [theme.textMain],
  );

  if (!record) {
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
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="chevron-back"
              size={25}
              color={theme.textMain}
            />
            <Text
              style={[
                styles.backText,
                { color: theme.textMain },
              ]}
            >
              返回
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              { color: theme.textMain },
            ]}
          >
            紀錄詳情
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.missingWrap}>
          <Icon
            name="alert-circle-outline"
            size={42}
            color={theme.textSub}
          />
          <Text
            style={[
              styles.missingText,
              { color: theme.textSub },
            ]}
          >
            找不到這筆歷史紀錄。
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Icon
            name="chevron-back"
            size={25}
            color={theme.textMain}
          />
          <Text
            style={[
              styles.backText,
              { color: theme.textMain },
            ]}
          >
            返回
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: theme.textMain },
          ]}
        >
          紀錄詳情
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{
            uri:
              record.photoUri ??
              AI_ANALYSIS_ROOM_IMAGE,
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.summaryTitle,
              { color: theme.textMain },
            ]}
          >
            {record.summary || 'AI 收納分析'}
          </Text>

          <View style={styles.metaRow}>
            <Icon
              name="calendar-outline"
              size={17}
              color={theme.textSub}
            />
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
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textMain },
            ]}
          >
            辨識到的物件
          </Text>

          {record.detectedItems.length > 0 ? (
            <View style={styles.itemList}>
              {record.detectedItems.map(
                (item, index) => (
                  <View
                    key={`${item.name}-${item.category}-${index}`}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor:
                          theme.cardBg,
                        borderColor:
                          theme.border,
                      },
                    ]}
                  >
                    <View style={styles.itemTextBlock}>
                      <Text
                        style={[
                          styles.itemName,
                          {
                            color:
                              theme.textMain,
                          },
                        ]}
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={[
                          styles.itemCategory,
                          {
                            color:
                              theme.textSub,
                          },
                        ]}
                      >
                        {item.category}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.countBadge,
                        {
                          backgroundColor:
                            theme.background,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countBadgeText,
                          {
                            color:
                              theme.textMain,
                          },
                        ]}
                      >
                        × {item.count}
                      </Text>
                    </View>
                  </View>
                ),
              )}
            </View>
          ) : (
            <Text
              style={[
                styles.emptyText,
                { color: theme.textSub },
              ]}
            >
              這筆紀錄沒有物件辨識清單。
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textMain },
            ]}
          >
            完整收納建議
          </Text>

          <View
            style={[
              styles.adviceCard,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
              },
            ]}
          >
            {parsedAdvice.mainAdvice ? (
              <Markdown style={markdownStyles}>
                {parsedAdvice.mainAdvice}
              </Markdown>
            ) : (
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.textSub },
                ]}
              >
                這筆紀錄沒有收納建議。
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textMain },
            ]}
          >
            建議採購
          </Text>

          {parsedAdvice.purchaseItems.length >
          0 ? (
            <View style={styles.purchaseList}>
              {parsedAdvice.purchaseItems.map(
                (item) => (
                  <View
                    key={item}
                    style={[
                      styles.purchaseCard,
                      {
                        backgroundColor:
                          theme.cardBg,
                        borderColor:
                          theme.border,
                      },
                    ]}
                  >
                    <Icon
                      name="bag-handle-outline"
                      size={20}
                      color={theme.primary}
                    />
                    <Text
                      style={[
                        styles.purchaseText,
                        {
                          color:
                            theme.textMain,
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                ),
              )}
            </View>
          ) : (
            <View
              style={[
                styles.noPurchaseCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                },
              ]}
            >
              <Icon
                name="checkmark-circle-outline"
                size={22}
                color={theme.primary}
              />
              <Text
                style={[
                  styles.noPurchaseText,
                  { color: theme.textMain },
                ]}
              >
                目前沒有需要補充的收納用品。
              </Text>
            </View>
          )}
        </View>
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
  backButton: {
    minWidth: 76,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 76,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  heroImage: {
    width: '100%',
    height: 250,
    borderRadius: 22,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
  },
  metaText: {
    fontSize: 13,
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 12,
  },
  itemList: {
    gap: 10,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTextBlock: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
  },
  itemCategory: {
    fontSize: 12,
    marginTop: 4,
  },
  countBadge: {
    minWidth: 52,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  adviceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  purchaseList: {
    gap: 10,
  },
  purchaseCard: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  purchaseText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  noPurchaseCard: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noPurchaseText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  missingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  missingText: {
    fontSize: 15,
  },
});

export default AIAnalysisHistoryDetailScreen;