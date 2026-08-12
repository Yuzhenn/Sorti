import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../context/ThemeContext';
import { AI_ANALYSIS_ROOM_IMAGE } from './aiAnalysisData';
import { detectItemsFromPhoto } from '../services/aiApi';

const AIAnalysisProcessingScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const photoUri = route?.params?.photoUri;
  const previewUri = photoUri ?? AI_ANALYSIS_ROOM_IMAGE;
  const [statusText, setStatusText] = useState('正在偵測物品、分類空間與找出可優先整理的重點。');

  useEffect(() => {
    let active = true;

    const runDetection = async () => {
      try {
        setStatusText('AI 正在分析畫面中的物品。');
        const response = await detectItemsFromPhoto(photoUri);
        if (!active) return;

        navigation.replace('AIAnalysisResult', {
          photoUri,
          detectedItems: response.detected_items,
          detectionBoxes: response.detection_boxes,
          totalDetections: response.total_detections,
          modelName: response.model_name,
        });
      } catch {
        if (!active) return;
        navigation.replace('AIAnalysisResult', {
          photoUri,
          detectedItems: [],
          detectionBoxes: [],
          totalDetections: 0,
          modelName: 'best.pt',
        });
      }
    };

    runDetection();

    return () => {
      active = false;
    };
  }, [navigation, photoUri]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.stage}>
        <View style={styles.background}>
          <Image source={{ uri: previewUri }} style={styles.backgroundImage} />
          <View style={styles.scrim} />
          <View style={styles.centerBlock}>
            <Text style={styles.title}>分析中...</Text>
            <Text style={styles.subtitle}>{statusText}</Text>
          </View>
          <View style={styles.progressRow}>
            <View style={[styles.progressPill, styles.progressActive]}>
              <Icon name="scan-outline" size={14} color="#333" />
              <Text style={styles.progressTextActive}>偵測物品</Text>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>分類中</Text>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>產出建議</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionArea}>
        <TouchableOpacity style={[styles.disabledButton, { backgroundColor: theme.border }]} disabled>
          <Text style={styles.disabledText}>開始分析</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  stage: { flex: 1 },
  background: { flex: 1, justifyContent: 'space-between', position: 'relative', overflow: 'hidden' },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.85,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1f1f1f',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  progressActive: { backgroundColor: 'rgba(255,209,102,0.85)' },
  progressText: { color: '#555', fontSize: 12, fontWeight: '700' },
  progressTextActive: { color: '#333', fontSize: 12, fontWeight: '800' },
  actionArea: {
    padding: 20,
    backgroundColor: '#fff',
  },
  disabledButton: {
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.36,
  },
  disabledText: {
    color: '#111',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AIAnalysisProcessingScreen;