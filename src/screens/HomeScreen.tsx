import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* 頂部導覽列 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={32} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="notifications-outline" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="settings-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 歡迎語區塊 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>早安！韋G~</Text>
          <Text style={styles.welcomeText}>今天想整理哪裡？</Text>
        </View>

        {/* 第一排：每日打卡與房間評分 */}
        <View style={styles.topRow}>
          <View style={styles.smallCard}>
            <Text style={styles.cardTitle}>每日打卡</Text>
            <View style={styles.iconContainer}>
              <MaterialIcon name="calendar-month-outline" size={50} color="#4a3744" />
            </View>
            <Text style={styles.countText}>連續5天</Text>
            <TouchableOpacity style={styles.checkInBtn}>
              <Text style={styles.checkInText}>今日打卡</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.cardTitle}>房間評分</Text>
            <View style={styles.scoreContainer}>
              {/* 這裡模擬截圖中的環形進度與分數 */}
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreValue}>80</Text>
                <Text style={styles.scoreUnit}>分</Text>
              </View>
              <View style={styles.starsRow}>
                <Icon name="star" size={14} color="#333" />
                <Icon name="star" size={14} color="#333" />
                <Icon name="star" size={14} color="#333" />
                <Icon name="star" size={14} color="#333" />
              </View>
            </View>
            <Text style={styles.statusText}>整體良好</Text>
          </View>
        </View>

        {/* 開始 AI 分析卡片 */}
        <TouchableOpacity style={styles.mainCard}>
          <View style={styles.imagePlaceholder}>
             {/* 這裡放房間範例圖 */}
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000' }} 
              style={styles.roomImg} 
            />
            <View style={styles.cameraOverlay}>
              <Icon name="camera-outline" size={80} color="rgba(0,0,0,0.6)" />
            </View>
          </View>
          <Text style={styles.mainCardTitle}>開始AI分析</Text>
          <Text style={styles.mainCardSub}>拍張照，找回你空間秩序</Text>
        </TouchableOpacity>

        {/* 空間測量卡片 */}
        <TouchableOpacity style={styles.measureCard}>
          <MaterialIcon name="ruler-square" size={60} color="#333" />
          <Text style={styles.measureTitle}>空間測量</Text>
          <Text style={styles.measureSub}>測量你還剩餘多少空間</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 底部導覽列 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home-outline" size={28} color="#333" />
          <Text style={styles.navText}>首頁</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcon name="dots-grid" size={28} color="#333" />
          <Text style={styles.navText}>物品管理</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="chatbubbles-outline" size={28} color="#333" />
          <Text style={styles.navText}>AI對話</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person-outline" size={28} color="#333" />
          <Text style={styles.navText}>個人中心</Text>
        </TouchableOpacity>
      </View>

      {/* 右下角浮動 AI 小助手按鈕 */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcon name="robot-happy-outline" size={40} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfcf0' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerRight: { flexDirection: 'row' },
  iconBtn: { marginLeft: 15 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  welcomeSection: { marginBottom: 25 },
  welcomeText: { fontSize: 24, fontWeight: '600', color: '#000', lineHeight: 32 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  smallCard: {
    backgroundColor: '#fff',
    width: (width - 60) / 2,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  iconContainer: { marginVertical: 5 },
  countText: { fontSize: 14, color: '#333', marginBottom: 10 },
  checkInBtn: { backgroundColor: '#f9dce7', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  checkInText: { color: '#000', fontWeight: 'bold' },
  scoreContainer: { alignItems: 'center', marginVertical: 5 },
  scoreCircle: { 
    width: 70, height: 70, borderRadius: 35, borderWidth: 6, borderColor: '#f9dce7', 
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row' 
  },
  scoreValue: { fontSize: 22, fontWeight: 'bold' },
  scoreUnit: { fontSize: 12, marginTop: 5 },
  starsRow: { flexDirection: 'row', marginTop: 5 },
  statusText: { fontSize: 14, color: '#333', marginTop: 10 },
  mainCard: {
    backgroundColor: '#fff', borderRadius: 15, padding: 15, alignItems: 'center', marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
  },
  imagePlaceholder: { width: '100%', height: 180, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  roomImg: { width: '100%', height: '100%' },
  cameraOverlay: { 
    ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
  mainCardTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  mainCardSub: { fontSize: 14, color: '#888', marginTop: 5 },
  measureCard: {
    backgroundColor: '#fff', borderRadius: 15, padding: 20, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
  },
  measureTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  measureSub: { fontSize: 14, color: '#888', marginTop: 5 },
  bottomNav: {
    position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: '#fdfcf0',
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ddd'
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 2 },
  fab: {
    position: 'absolute', right: 20, bottom: 90, width: 60, height: 60,
    borderRadius: 30, backgroundColor: '#4a90e2', justifyContent: 'center', alignItems: 'center', elevation: 5
  }
});

export default HomeScreen;