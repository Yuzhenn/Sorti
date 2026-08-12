import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput, CommonResolutions } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../context/ThemeContext';
import { saveLatestAiCapture } from '../services/photoTempStore';

const AI_CAPTURE_INTRO_DISMISSED_KEY = 'sorti_ai_capture_intro_dismissed_v1';

const AIAnalysisCaptureScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const photoOutput = usePhotoOutput({
    targetResolution: CommonResolutions.HD_4_3,
    quality: 0.85,
  });
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoadingIntroPref, setIsLoadingIntroPref] = useState(true);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [dontRemindAgain, setDontRemindAgain] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    let active = true;

    const loadIntroPreference = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(AI_CAPTURE_INTRO_DISMISSED_KEY);
        const introDismissed = storedValue === 'true';

        if (!active) return;

        setShowIntroModal(!introDismissed);
        setCameraStarted(introDismissed);
      } finally {
        if (active) {
          setIsLoadingIntroPref(false);
        }
      }
    };

    loadIntroPreference();

    return () => {
      active = false;
    };
  }, []);

  const handleStartCamera = async () => {
    if (isBusy) return;

    try {
      setIsBusy(true);

      if (dontRemindAgain) {
        await AsyncStorage.setItem(AI_CAPTURE_INTRO_DISMISSED_KEY, 'true');
      }

      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert('需要相機權限', '請先允許相機權限，才能拍攝整理空間。');
          return;
        }
      }

      setCapturedUri(null);
      setShowIntroModal(false);
      setCameraStarted(true);
    } catch (error) {
      Alert.alert('無法開始拍攝', error instanceof Error ? error.message : '請稍後再試');
    } finally {
      setIsBusy(false);
    }
  };

  const handleTakePhoto = async () => {
    if (isBusy) return;

    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('需要相機權限', '請先允許相機權限，才能拍攝整理空間。');
        return;
      }
    }

    if (typeof photoOutput.capturePhotoToFile !== 'function') {
      Alert.alert('相機尚未就緒', '請稍等相機載入完成後再按快門。');
      return;
    }

    try {
      setIsBusy(true);
      const photoFile = await photoOutput.capturePhotoToFile(
        { flashMode: 'off' },
        {},
      );
      const localUri = photoFile?.filePath
        ? photoFile.filePath.startsWith('file://')
          ? photoFile.filePath
          : `file://${photoFile.filePath}`
        : null;

      if (!localUri) {
        throw new Error('無法取得照片路徑');
      }

      setCapturedUri(localUri);
    } catch (error) {
      Alert.alert('拍照失敗', error instanceof Error ? error.message : '請稍後再試');
    } finally {
      setIsBusy(false);
    }
  };

  const handlePickImage = async () => {
    if (isBusy) return;

    try {
      setIsBusy(true);
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.9,
      });

      if (response.didCancel) {
        return;
      }

      const image = response.assets?.[0];
      if (!image?.uri) {
        throw new Error('沒有取得圖片路徑');
      }

      setCapturedUri(image.uri);
    } catch (error) {
      Alert.alert('上傳失敗', error instanceof Error ? error.message : '請稍後再試');
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!capturedUri || isBusy) return;

    try {
      setIsBusy(true);
      await saveLatestAiCapture(capturedUri);
      navigation.navigate('AIAnalysisProcessing', { photoUri: capturedUri });
    } catch (error) {
      Alert.alert('上傳失敗', error instanceof Error ? error.message : '請稍後再試');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  if (isLoadingIntroPref) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingScreen}>
          <Text style={[styles.loadingTitle, { color: theme.textMain }]}>載入拍攝設定中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const showPermissionScreen = !showIntroModal && !capturedUri && !hasPermission;

  if (showPermissionScreen) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.permissionScreen}>
          <Icon name="camera-outline" size={44} color={theme.textSub} />
          <Text style={[styles.permissionTitle, { color: theme.textMain }]}>需要相機權限</Text>
          <Text style={[styles.permissionText, { color: theme.textSub }]}>允許後才能直接拍攝房間照片進行 AI 分析。</Text>
          <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: theme.primary }]} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>開啟權限</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.permissionSecondaryBtn, { borderColor: theme.border }]} onPress={handlePickImage}>
            <Text style={[styles.permissionSecondaryBtnText, { color: theme.textMain }]}>從相簿上傳圖片</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderIntroModal = () => (
    <Modal
      transparent
      animationType="fade"
      visible={showIntroModal}
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.modalTitle, { color: theme.textMain }]}>拍攝前注意事項</Text>
          <View style={styles.noticeList}>
            <View style={styles.noticeRow}>
              <Text style={[styles.noticeBullet, { color: theme.primary }]}>•</Text>
              <Text style={[styles.noticeText, { color: theme.textMain }]}>先維持房間原狀，拍下最真實的整理現況。</Text>
            </View>
            <View style={styles.noticeRow}>
              <Text style={[styles.noticeBullet, { color: theme.primary }]}>•</Text>
              <Text style={[styles.noticeText, { color: theme.textMain }]}>盡量讓桌面、床面或主要混亂區域完整入鏡。</Text>
            </View>
            <View style={styles.noticeRow}>
              <Text style={[styles.noticeBullet, { color: theme.primary }]}>•</Text>
              <Text style={[styles.noticeText, { color: theme.textMain }]}>拍完後要先確認上傳，再開始 AI 分析。</Text>
            </View>
          </View>

          {(() => {
            const checkboxBackgroundColor = dontRemindAgain ? theme.primary : 'transparent';
            const checkboxContainerStyle = [
              styles.checkbox,
              { borderColor: theme.border, backgroundColor: checkboxBackgroundColor },
            ];

            return (
              <TouchableOpacity
                style={styles.remindRow}
                activeOpacity={0.8}
                onPress={() => setDontRemindAgain(prev => !prev)}
              >
                <View style={checkboxContainerStyle}>
                  <Icon name={dontRemindAgain ? 'checkmark' : 'remove'} size={13} color={dontRemindAgain ? '#111' : theme.textSub} />
                </View>
                <Text style={[styles.remindText, { color: theme.textMain }]}>以後不再提醒</Text>
              </TouchableOpacity>
            );
          })()}

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={handleStartCamera}
            disabled={isBusy}
          >
            <Text style={styles.startButtonText}>{isBusy ? '準備中...' : '開始拍攝'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // 1. 照片確認與預覽畫面 (已修正完整顯示與文字位置)
  if (capturedUri) {
    return (
      <SafeAreaView style={[styles.container, styles.blackContainer]}>
        <StatusBar barStyle="light-content" hidden />
        <View style={styles.previewContainer}>
          {/* 使用 contain 模式讓直/橫圖片完整顯示不被裁切 */}
          <Image source={{ uri: capturedUri }} style={styles.fullImage} resizeMode="contain" />

          {/* 頂部返回按鈕 */}
          <TouchableOpacity style={styles.previewBackBtn} onPress={handleRetake} disabled={isBusy}>
            <Icon name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>

          {/* 下移標題區塊（位於返回鍵下方適當距離） */}
          <View style={styles.previewCaptionArea}>
            <Text style={styles.previewMainTitle}>請確認照片後上傳</Text>
            <Text style={styles.previewMainSub}>確認無誤後才會開始 AI 分析。</Text>
          </View>

          {/* 底部按鈕區 */}
          <View style={styles.previewBottomBar}>
            <TouchableOpacity style={[styles.previewActionButton, styles.previewSecondaryButton]} onPress={handleRetake} disabled={isBusy}>
              <Text style={styles.previewSecondaryButtonText}>重新拍攝</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.previewActionButton, styles.previewPrimaryButton]} onPress={handleConfirmUpload} disabled={isBusy}>
              <Text style={styles.previewPrimaryButtonText}>{isBusy ? '上傳中...' : '確定上傳並分析'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (cameraStarted && device == null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.permissionScreen}>
          <Text style={[styles.permissionTitle, { color: theme.textMain }]}>相機載入中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showIntroModal) {
    return (
      <SafeAreaView style={[styles.container, styles.blackContainer]}>
        <StatusBar barStyle="light-content" hidden />
        <View style={styles.introBackdrop} />
        {renderIntroModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, styles.blackContainer]}>
      <StatusBar barStyle="light-content" hidden />

      <View style={styles.cameraFullscreen}>
        {cameraStarted && device ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            outputs={[photoOutput]}
          />
        ) : null}
        <View style={styles.fullscreenOverlay} />
        <TouchableOpacity style={styles.fullscreenBackBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.fullscreenCaption}>
          <Text style={styles.fullscreenTitle}>對準你的整理空間</Text>
          <Text style={styles.fullscreenSub}>拍下現況，拍完先確認上傳，再開始 AI 分析。</Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.thumbnailWrap} activeOpacity={0.85} onPress={handlePickImage}>
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Icon name="cloud-upload-outline" size={22} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.shutterCenterSlot}>
            <TouchableOpacity
              style={[styles.shutterButton, { backgroundColor: theme.primary }]}
              onPress={handleTakePhoto}
              disabled={isBusy}
              activeOpacity={0.9}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </View>

      {renderIntroModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  blackContainer: { backgroundColor: '#000' },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: { fontSize: 18, fontWeight: '700' },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  permissionTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  permissionText: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  permissionBtn: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  permissionBtnText: { color: '#111', fontSize: 15, fontWeight: '800' },
  permissionSecondaryBtn: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  permissionSecondaryBtnText: { fontSize: 15, fontWeight: '800' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  introBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  noticeList: { gap: 12 },
  noticeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  noticeBullet: { fontSize: 18, lineHeight: 24, marginRight: 8 },
  noticeText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' },
  remindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  remindText: { fontSize: 14, fontWeight: '700' },
  startButton: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: { color: '#111', fontSize: 16, fontWeight: '800' },
  
  // --- 照片預覽視圖修正區 ---
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  fullImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  previewBackBtn: {
    position: 'absolute',
    top: 20,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  previewCaptionArea: {
    marginTop: 75, // 置於返回鍵下方適當位置，不再重疊
    paddingHorizontal: 18,
  },
  previewMainTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  previewMainSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  previewBottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    // 往上移
    paddingBottom: 60,
    // iPhone / Android 都比較漂亮
    marginBottom: 20,
  },
  // -------------------------

  cameraFullscreen: { flex: 1, backgroundColor: '#000' },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  fullscreenBackBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenCaption: {
    position: 'absolute',
    top: 74,
    left: 18,
    right: 18,
  },
  fullscreenTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  fullscreenSub: { color: 'rgba(255,255,255,0.92)', fontSize: 13, marginTop: 6, lineHeight: 19 },
  
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  thumbnailWrap: { width: 54, height: 54, borderRadius: 16, overflow: 'hidden' },
  thumbnail: { width: '100%', height: '100%', borderRadius: 16 },
  thumbnailPlaceholder: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSecondaryButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  previewSecondaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  previewPrimaryButton: { backgroundColor: '#fff' },
  previewPrimaryButtonText: { color: '#111', fontSize: 15, fontWeight: '800' },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  shutterInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.88)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  shutterCenterSlot: {
    flex: 1,
    alignItems: 'center',
  },
  bottomSpacer: {
    width: 54,
    height: 54,
  },
});

export default AIAnalysisCaptureScreen;