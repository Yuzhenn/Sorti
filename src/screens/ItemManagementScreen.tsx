import React, { useState } from 'react';
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
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
// 1. 導入原生相機啟動方法
import { launchCamera } from 'react-native-image-picker';

// 模擬 AI 偵測並匯入的收納物品數據
const mockItems = [
  { id: '1', name: '日式棉麻大容量收納袋', category: '收納盒/籃', status: '已定位', location: '主臥衣櫃上層', time: '10分鐘前 AI 偵測', img: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?q=80&w=300' },
  { id: '2', name: '透明壓克力化妝品置物架', category: '桌上收納', status: '待整理', location: '尚未指定', time: '剛剛拍照匯入', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=300' },
  { id: '3', name: '北歐風牛皮紙多功能收納盒', category: '收納盒/籃', status: '已定位', location: '客廳電視櫃', time: '昨天 AI 偵測', img: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=300' },
  { id: '4', name: '實木防滑西裝衣架 (10入)', category: '大型衣架', status: '已定位', location: '玄關衣帽間', time: '3天前 AI 偵測', img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300' },
];

const ItemManagementScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('全部');

  // 關鍵修正一：動態抽離導覽高亮樣式，避開行內樣式警告
  const activeNavTextStyle = [
    styles.activeNavText,
    { color: theme.primary }
  ];

  // 2. 新增啟動相機拍照功能
  const handleCameraLaunch = async () => {
    const options = {
      mediaType: 'photo' as const,
      cameraType: 'back' as const,
      saveToPhotos: true, // 拍照後自動儲存至手機相簿
      quality: 0.8 as const,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('使用者取消了拍照');
      } else if (response.errorCode) {
        console.log('相機啟動出錯: ', response.errorMessage);
        Alert.alert('提示', '無法啟動相機，請檢查手機權限設定。');
      } else if (response.assets && response.assets.length > 0) {
        const sourceUri = response.assets[0].uri;
        console.log('拍照成功，相片本機路徑為：', sourceUri);
        
        // 拍照成功後的魔法提示
        Alert.alert(
          '拍照成功 ✨',
          '已成功捕捉收納好物！正在等待 AI 核心進行影像識別與空間歸類分析...',
          [{ text: '太棒了' }]
        );
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部導覽列 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeftBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>物品管理</Text>
        
        {/* 3. 修改：相機按鈕點擊時觸發原生拍照功能 */}
        <TouchableOpacity style={styles.scanBtn} onPress={handleCameraLaunch}>
          <Icon name="camera-outline" size={26} color={theme.textMain} />
        </TouchableOpacity>
      </View>

      {/* 快捷篩選標籤 */}
      <View style={styles.filterContainer}>
        {['全部', '待整理', '已定位'].map((tab) => {
          const isSelected = activeTab === tab;
          
          // 關鍵修正二：抽離篩選標籤的行內動態樣式
          const tagStyle = [
            styles.filterTag,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
            isSelected ? { backgroundColor: theme.primary, borderColor: theme.primary } : null
          ];

          const tagTextStyle = [
            styles.filterTagText,
            { color: theme.textSub },
            isSelected ? [styles.activeFilterTagText, { color: isDarkMode ? '#1c1816' : '#333' }] : null
          ];

          return (
            <TouchableOpacity
              key={tab}
              style={tagStyle}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={tagTextStyle}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 物品清單區塊 */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {mockItems
          .filter(item => activeTab === '全部' || item.status === activeTab)
          .map((item) => {
            const isAlert = item.status === '待整理';

            // 關鍵修正三：抽離物品卡片中的 Badge 狀態動態樣式，徹底消除 ESLint 行內樣式警告
            const badgeStyle = [
              styles.statusBadge,
              isAlert 
                ? { backgroundColor: isDarkMode ? 'rgba(201, 74, 74, 0.15)' : '#fff1f1' }
                : { backgroundColor: isDarkMode ? 'rgba(82, 155, 119, 0.15)' : '#f0f7f4' }
            ];

            const statusTextStyle = [
              styles.statusText,
              isAlert 
                ? { color: '#c94a4a' } 
                : { color: '#529b77' }
            ];

            return (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: theme.cardBg }]}>
                <Image source={{ uri: item.img }} style={styles.itemImg} />
                
                <View style={styles.itemInfo}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.itemName, { color: theme.textMain }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    
                    {/* 使用乾淨無警告的樣式變數 */}
                    <View style={badgeStyle}>
                      <Text style={statusTextStyle}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.itemCategory, { color: theme.textSub }]}>分類：{item.category}</Text>
                  
                  <View style={styles.locationRow}>
                    <Icon name="location-outline" size={14} color={theme.textSub} style={styles.locIcon} />
                    <Text style={[styles.locationText, { color: theme.textMain }]} numberOfLines={1}>
                      位置：{item.location}
                    </Text>
                  </View>

                  <Text style={[styles.timeText, { color: theme.textSub }]}>{item.time}</Text>
                </View>

                <TouchableOpacity style={styles.moreBtn}>
                  <Icon name="ellipsis-vertical" size={18} color={theme.textSub} />
                </TouchableOpacity>
              </View>
            );
          })}
      </ScrollView>

      {/* 底部工具列 */}
      <View style={[styles.bottomNav, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home-outline" size={28} color={theme.textSub} />
          <Text style={[styles.navText, { color: theme.textSub }]}>首頁</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcon name="dots-grid" size={28} color={theme.primary} />
          <Text style={activeNavTextStyle}>物品管理</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Market')}>
          <Icon name="storefront-outline" size={28} color={theme.textSub} />
          <Text style={[styles.navText, { color: theme.textSub }]}>二手拍賣</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <Icon name="person-outline" size={28} color={theme.textSub} />
          <Text style={[styles.navText, { color: theme.textSub }]}>個人中心</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
  },
  headerLeftBtn: { zIndex: 10, paddingVertical: 5, paddingRight: 15 },
  headerTitle: {
    position: 'absolute', left: 0, right: 0, textAlign: 'center',
    fontSize: 22, fontWeight: '600',
  },
  scanBtn: { padding: 4 },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  filterTag: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  filterTagText: { fontSize: 14 },
  activeFilterTagText: { fontWeight: '600' },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  itemInfo: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '70%',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  itemCategory: {
    fontSize: 13,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locIcon: { marginRight: 3 },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 11,
  },
  moreBtn: {
    padding: 8,
  },
  bottomNav: {
    position: 'absolute', bottom: 0, width: '100%', height: 70,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 4 },
  activeNavText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  }
});

export default ItemManagementScreen;