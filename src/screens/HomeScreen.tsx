import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native'; // 當頁面重新獲得焦點時觸發讀取
import { useTheme } from '../context/ThemeContext';

const HomeScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  // 建立動態魔法身分 state，預設值為「魔法學徒」
  const [magicIdentity, setMagicIdentity] = useState('🧙‍♂️ 魔法學徒');
  const isFocused = useIsFocused(); // 追蹤頁面是否處於當前焦點，防止頁面返回時不刷新

  // 讀取儲存在手機內的魔法身分
  const loadMagicIdentity = async () => {
    try {
      const savedIdentity = await AsyncStorage.getItem('user_magic_identity');
      if (savedIdentity) {
        // 因名稱本身不帶 Emoji，我們幫它加上精緻水晶球 🔮
        setMagicIdentity(`🔮 ${savedIdentity}`);
      } else {
        setMagicIdentity('🧙‍♂️ 魔法學徒');
      }
    } catch (e) {
      console.log('讀取魔法身分失敗', e);
    }
  };

  // 每當首頁載入或從測驗頁跳轉回來時，都重新讀取一次
  useEffect(() => {
    if (isFocused) {
      loadMagicIdentity();
    }
  }, [isFocused]);

  // 關鍵修正一：抽離底部工具列高亮文字的樣式，100% 避開行內樣式警告
  const activeNavTextStyle = [
    styles.activeNavText,
    { color: theme.primary }
  ];

  // 關鍵修正二：抽離按鈕與身分徽章的動態文字樣式
  const checkInBtnTextStyle = [
    styles.checkInText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  const identityTextStyle = [
    styles.identityText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  // 關鍵修正三：抽離半透明遮罩背景與 Icon 的動態色彩，解決 eslint 與字串格式報錯
  const cardTextBgColor = isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)';
  const fabIconColor = isDarkMode ? '#1c1816' : '#fff';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部導覽列 ── 輕盈質感 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="notifications-outline" size={24} color={theme.textMain} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Icon name="settings-outline" size={24} color={theme.textMain} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 歡迎語區塊 */}
        <View style={styles.welcomeSection}>
          <View style={styles.identityRow}>
            <Text style={[styles.userGreeting, { color: theme.textSub }]}>您好</Text>
            <View style={[styles.identityBadge, { backgroundColor: theme.primary }]}>
              <Text style={identityTextStyle}>{magicIdentity}</Text>
            </View>
          </View>
          <Text style={[styles.welcomeText, { color: theme.textMain }]}>今天想整理哪裡？</Text>
        </View>

        {/* 第一排：優化後的橫向流暢卡片 */}
        <View style={styles.topRow}>
          {/* 房間評分 ── 橫向專業儀表 */}
          <View style={[styles.scoreCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.scoreHeader}>
              <Text style={[styles.cardTitle, { color: theme.textSub }]}>房間評分</Text>
              <View style={styles.starsRow}>
                <Icon name="star" size={12} color={theme.primary} />
                <Icon name="star" size={12} color={theme.primary} />
                <Icon name="star" size={12} color={theme.primary} />
                <Icon name="star" size={12} color={theme.primary} />
              </View>
            </View>
            <View style={styles.scoreProgressRow}>
              <Text style={[styles.scoreValue, { color: theme.textMain }]}>80<Text style={styles.scoreUnit}>分</Text></Text>
              <View style={[styles.progressBarTrack, { backgroundColor: theme.background }]}>
                <View style={[styles.progressBarFill, { backgroundColor: theme.primary }]} />
              </View>
            </View>
            <Text style={[styles.statusText, { color: theme.textSub }]}>整體良好，維持得真棒！</Text>
          </View>

          {/* 每日打卡 ── 輕量化垂直膠囊 */}
          <View style={[styles.checkInCard, { backgroundColor: theme.cardBg }]}>
            <MaterialIcon name="calendar-check" size={26} color={theme.textSub} />
            <Text style={[styles.countText, { color: theme.textMain }]}>連續 5 天</Text>
            <TouchableOpacity 
              style={[styles.checkInBtn, { backgroundColor: theme.primary }]} 
              onPress={() => navigation.navigate('CalendarCheckIn')}
            >
              <Text style={checkInBtnTextStyle}>打卡</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 主角：開始 AI 分析 ── 滿版拍立得觀景窗設計 */}
        <TouchableOpacity style={styles.mainCard} activeOpacity={0.9}>
          <View style={styles.imagePlaceholder}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000' }} 
              style={styles.roomImg} 
            />
            {/* 玻璃半透明魔法鏡頭 */}
            <View style={[styles.cameraOverlay, StyleSheet.absoluteFill]}>
              <View style={styles.lensCircle}>
                <Icon name="camera" size={32} color="#fff" />
              </View>
            </View>
            
            {/* 疊加在圖片上的漸層文字區塊 ── 已修正行內與字串樣式 */}
            <View style={[styles.mainCardTextContainer, { backgroundColor: cardTextBgColor }]}>
              <Text style={styles.mainCardTitle}>開始 AI 分析</Text>
              <Text style={[styles.mainCardSub, { color: theme.primary }]}>拍張照，找回空間的魔法秩序 ✨</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 空間測量 */}
        <TouchableOpacity style={[styles.measureCard, { backgroundColor: theme.cardBg }]} activeOpacity={0.8}>
          <View style={styles.measureLeft}>
            <View style={[styles.measureIconCircle, { backgroundColor: theme.background }]}>
              <MaterialIcon name="ruler-square" size={24} color={theme.textSub} />
            </View>
            <View style={styles.measureTextContent}>
              <Text style={[styles.measureTitle, { color: theme.textMain }]}>空間測量</Text>
              <Text style={[styles.measureSub, { color: theme.textSub }]}>智能測量你還剩餘多少可用空間</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={18} color={theme.textSub} />
        </TouchableOpacity>
      </ScrollView>

      {/* 底部導覽列 */}
      <View style={[styles.bottomNav, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={28} color={theme.primary} />
          <Text style={activeNavTextStyle}>首頁</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ItemManagement')}
        >
          <MaterialIcon name="dots-grid" size={28} color={theme.textSub} />
          <Text style={[styles.navText, { color: theme.textSub }]}>物品管理</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Market')}
        >
          <Icon name="storefront-outline" size={28} color={theme.textSub} />
          <Text style={[styles.navText, { color: theme.textSub }]}>二手拍賣</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <Icon name="person-outline" size={28} color={theme.textSub} />
          <Text style={[styles.navText, { color: theme.textSub }]}>個人中心</Text>
        </TouchableOpacity>
      </View>

      {/* 右下角浮動 AI 小助手 */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('Chat')}
      >
        <MaterialIcon name="robot-happy-outline" size={36} color={fabIconColor} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 15 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
  
  // 歡迎語與身分標籤
  welcomeSection: { marginBottom: 20, marginTop: 5 },
  identityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  userGreeting: { fontSize: 15, fontWeight: '500' },
  identityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  identityText: { fontSize: 11, fontWeight: '600' },
  welcomeText: { fontSize: 26, fontWeight: '700', marginTop: 2, lineHeight: 34 },
  
  // 第一排卡片重組
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  scoreCard: {
    width: '62%',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }
  },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  starsRow: { flexDirection: 'row' },
  scoreProgressRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  scoreValue: { fontSize: 26, fontWeight: '700', marginRight: 10 },
  scoreUnit: { fontSize: 12, fontWeight: '500' },
  progressBarTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { width: '80%', height: '100%', borderRadius: 3 },
  statusText: { fontSize: 11, marginTop: 2 },
  
  checkInCard: {
    width: '34%',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }
  },
  countText: { fontSize: 12, fontWeight: '600', marginVertical: 6 },
  checkInBtn: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 },
  checkInText: { fontWeight: '600', fontSize: 12 },

  // AI 分析大卡片
  mainCard: {
    borderRadius: 24, overflow: 'hidden', marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
  },
  imagePlaceholder: { width: '100%', height: 220, position: 'relative' },
  roomImg: { width: '100%', height: '100%' },
  cameraOverlay: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  lensCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  mainCardTextContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  mainCardTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  mainCardSub: { fontSize: 13, marginTop: 4, fontWeight: '500' },

  // 空間測量功能條
  measureCard: {
    borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }
  },
  measureLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  measureIconCircle: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  measureTextContent: { flex: 1 },
  measureTitle: { fontSize: 16, fontWeight: '600' },
  measureSub: { fontSize: 12, marginTop: 2 },

  // 底部導覽列
  bottomNav: {
    position: 'absolute', bottom: 0, width: '100%', height: 70,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 4 },
  activeNavText: { fontSize: 12, marginTop: 4, fontWeight: '600' },

  fab: {
    position: 'absolute', right: 20, bottom: 90, width: 56, height: 56,
    borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  }
});

export default HomeScreen;