import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useTheme } from '../context/ThemeContext';

const today = new Date();

const CalendarCheckInScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [checkInRecords, setCheckInRecords] = useState<any>({});
  
  const { hasPermission, requestPermission } = useCameraPermission();

  const cameraRef = useRef<any>(null); 
  const device = useCameraDevice('back');

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const calendarCells = [
    ...Array(firstDayIndex).fill(''),
    ...Array.from({ length: totalDays }, (_, i) => i + 1)
  ];

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleOpenCamera = async (day: number) => {
    if (!hasPermission) {
      const isGranted = await requestPermission();
      if (!isGranted) {
        Alert.alert('需要權限', '需要相機權限才能進行拍照打卡喔！請至手機設定開啟。');
        return;
      }
    }
    setSelectedDay(day);
    setIsCameraOpen(true);
  };

  const handleTakePic = async () => {
    if (cameraRef.current && selectedDay !== null) {
      try {
        console.log('嘗試拍照...');
        const photo = await cameraRef.current.takePhoto();
        console.log('拍照成功，原始資料:', photo);
        
        if (photo && photo.path) {
          const recordKey = `${currentYear}-${currentMonth + 1}-${selectedDay}`;
          const localUri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
          
          setCheckInRecords((prev: any) => ({
            ...prev,
            [recordKey]: localUri,
          }));
          setIsCameraOpen(false);
          setSelectedDay(null);
        }
      } catch (error) {
        console.log('快門硬體拒絕，拍照失敗原因:', error);
        Alert.alert('錯誤', '拍照發生錯誤，請稍後再試');
      }
    }
  };

  const currentShortcutKey = selectedDay ? `${currentYear}-${currentMonth + 1}-${selectedDay}` : '';

  // 動態抽離「今天」的文字顏色，防止 ESLint 行內樣式警告
  const getTodayTextStyle = () => {
    return [
      styles.dayText,
      styles.todayText,
      { color: isDarkMode ? '#1c1816' : '#333' }
    ];
  };

  // --- 1. 真實相機介面 ---
  if (isCameraOpen) {
    if (device == null) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>相機鏡頭初始化中...</Text>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          {...({
            photo: true,
            mode: 'photo',
            output: ['photo']
          } as any)}
        />

        <TouchableOpacity 
          style={styles.closeCameraBtn} 
          onPress={() => { setIsCameraOpen(false); setSelectedDay(null); }}
        >
          <Icon name="chevron-back" size={32} color="#fff" />
        </TouchableOpacity>

        <View style={styles.cameraBottomBar}>
          <View style={styles.albumShortcut}>
            {checkInRecords[currentShortcutKey] ? (
              <Image 
                source={{ uri: checkInRecords[currentShortcutKey] }} 
                style={styles.shortcutImg} 
              />
            ) : (
              <View style={[styles.shortcutImg, styles.albumEmpty]} />
            )}
          </View>

          <TouchableOpacity style={styles.shutterBtn} onPress={handleTakePic} activeOpacity={0.8}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <View style={styles.cameraPlaceholder} />
        </View>
      </View>
    );
  }

  // --- 2. 日曆打卡主介面 ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部輕盈導覽 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>每日打卡</Text>
        <View style={styles.placeholderWidth} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 月份切換 */}
        <View style={[styles.monthSelector, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity 
            onPress={handlePrevMonth} 
            style={[styles.arrowBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
          >
            <Icon name="chevron-back" size={20} color={theme.textSub} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.textMain }]}>{`${currentYear}年 ${currentMonth + 1}月`}</Text>
          <TouchableOpacity 
            onPress={handleNextMonth} 
            style={[styles.arrowBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
          >
            <Icon name="chevron-forward" size={20} color={theme.textSub} />
          </TouchableOpacity>
        </View>

        {/* 日曆主網格卡片 */}
        <View style={[styles.calendarCard, { backgroundColor: theme.cardBg }]}>
          {/* 星期標頭 */}
          <View style={styles.weekHeader}>
            {weekDays.map((day, index) => (
              <Text key={index} style={[styles.weekDayText, index === 0 ? styles.sundayText : null]}>
                {day}
              </Text>
            ))}
          </View>

          {/* 日期網格 */}
          <View style={styles.calendarGrid}>
            {calendarCells.map((cellValue, index) => {
              if (cellValue === '') {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const dayNum = cellValue;
              const recordKey = `${currentYear}-${currentMonth + 1}-${dayNum}`;
              const hasCheckedIn = !!checkInRecords[recordKey];
              
              const isToday = 
                dayNum === today.getDate() && 
                currentYear === today.getFullYear() && 
                currentMonth === today.getMonth();
              const isSunday = index % 7 === 0;

              return (
                <View key={`day-${dayNum}`} style={styles.dayCell}>
                  {hasCheckedIn ? (
                    <TouchableOpacity 
                      style={[styles.avatarWrapper, { borderColor: theme.border }]} 
                      onPress={() => handleOpenCamera(dayNum)}
                      activeOpacity={0.9}
                    >
                      <Image source={{ uri: checkInRecords[recordKey] }} style={styles.dayImg} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[
                        styles.normalCell, 
                        isToday ? [styles.todayCell, { backgroundColor: theme.primary }] : null
                      ]} 
                      onPress={() => handleOpenCamera(dayNum)}
                    >
                      <Text style={
                        isToday 
                          ? getTodayTextStyle()
                          : [
                              styles.dayText, 
                              { color: theme.textMain },
                              isSunday ? styles.sundayText : null
                            ]
                      }>
                        {dayNum}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: { paddingVertical: 5, paddingRight: 15, zIndex: 10 },
  headerTitle: {
    position: 'absolute', left: 0, right: 0, textAlign: 'center',
    fontSize: 20, fontWeight: '600', letterSpacing: 0.5,
  },
  placeholderWidth: { width: 32 },
  scrollContent: { alignItems: 'center', paddingTop: 10, paddingHorizontal: 16, paddingBottom: 30 },
  
  monthSelector: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    width: '100%', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16,
    marginBottom: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, shadowOffset: { width: 0, height: 1 }
  },
  arrowBtn: { padding: 6, borderRadius: 10, borderWidth: 1 },
  monthText: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  
  calendarCard: {
    borderRadius: 24, paddingVertical: 20, paddingHorizontal: 8, width: '100%',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }
  },
  weekHeader: { flexDirection: 'row', width: '100%', marginBottom: 12 },
  weekDayText: { width: '14.28%', textAlign: 'center', fontSize: 13, color: '#a89d9d', fontWeight: '600' },
  sundayText: { color: '#c99e93' }, 
  
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  dayCell: { width: '14.28%', height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  normalCell: { width: 38, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 19 },
  dayText: { fontSize: 15, fontWeight: '500' },
  
  avatarWrapper: { 
    width: 40, height: 40, borderRadius: 12, overflow: 'hidden', 
    borderWidth: 1.5, backgroundColor: '#f5f5f5',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 
  },
  dayImg: { width: '100%', height: '100%' },
  
  todayCell: { }, 
  todayText: { fontSize: 15, fontWeight: '700' },

  errorContainer: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#888', fontSize: 15 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  closeCameraBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  cameraBottomBar: { 
    position: 'absolute', bottom: 0, width: '100%', height: 150, 
    backgroundColor: 'rgba(0, 0, 0, 0.65)', flexDirection: 'row', 
    justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20
  },
  albumShortcut: { width: 52, height: 52, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: '#333' },
  shortcutImg: { width: '100%', height: '100%' },
  albumEmpty: { backgroundColor: '#222' },
  shutterBtn: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 56, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  cameraPlaceholder: { width: 52 },
});

export default CalendarCheckInScreen;