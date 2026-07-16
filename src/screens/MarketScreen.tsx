import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext'; 

// 初始模擬二手商品數據
const initialProducts = [
  { id: '1', title: '九成新日式實木收納櫃', price: 1200, location: '台北市', img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=500' },
  { id: '2', title: '無印風簡約編織籃 (大)', price: 150, location: '高雄市', img: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?q=80&w=500' },
  { id: '3', title: '北歐風金屬桌上置物架', price: 350, location: '台中市', img: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=500' },
  { id: '4', title: '極簡白手提分格收納盒', price: 90, location: '新北市', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=500' },
];

const MarketScreen = ({ route, navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const { cartItems } = useCart();
  
  // 將商品列表改為 state 管理，以便動態新增商品
  const [products, setProducts] = useState(initialProducts);

  // 完美修復版：將物件與導航方法都完整放進依賴陣列，徹底解決 react-hooks/exhaustive-deps 警告
  useEffect(() => {
    if (route.params?.newProduct) {
      const { newProduct } = route.params;
      
      setProducts((prevProducts) => {
        const isExist = prevProducts.some((p) => p.id === newProduct.id);
        if (isExist) return prevProducts;
        return [newProduct, ...prevProducts]; // 新商品排在最前面
      });

      // 清除參數，避免重複觸發
      navigation.setParams({ newProduct: undefined });
    }
  }, [route.params, route.params?.newProduct, navigation]);

  // 關鍵修正一：抽離底部工具列高亮文字的樣式
  const activeNavTextStyle = [
    styles.activeNavText,
    { color: theme.primary }
  ];

  // 關鍵修正二：抽離「全部」高亮標籤的文字樣式，解決 eslint 行內樣式警告
  const activeTagTextStyle = [
    styles.activeTagText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  // 關鍵修正三：將浮動按鈕（FAB）Icon 的顏色抽離成變數
  const fabIconColor = isDarkMode ? '#1c1816' : '#fff';

  // 關鍵修正四：抽離購物車氣泡小紅點與內部文字樣式
  const cartBadgeStyle = [
    styles.cartBadge,
    { backgroundColor: '#c94a4a' }
  ];

  const cartBadgeTextStyle = [
    styles.cartBadgeText,
    { color: '#fff' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部導覽列 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeftBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>二手拍賣</Text>
        
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <Icon name="cart-outline" size={26} color={theme.textMain} />
          {cartItems.length > 0 && (
            <View style={cartBadgeStyle}>
              <Text style={cartBadgeTextStyle}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 搜尋欄區塊 */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Icon name="search-outline" size={20} color={theme.textSub} style={styles.searchIcon} />
          <TextInput 
            placeholder="搜尋想要的二手收納好物..." 
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
            style={[styles.searchInput, { color: theme.textMain }]}
          />
        </View>
      </View>

      {/* 主滾動區區塊 */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 分類標籤區塊 */}
        <View style={styles.categoryRow}>
          <TouchableOpacity style={[styles.categoryTag, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
            <Text style={activeTagTextStyle}>全部</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryTag, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.categoryTagText, { color: theme.textSub }]}>大型家具</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryTag, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.categoryTagText, { color: theme.textSub }]}>桌上收納</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryTag, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.categoryTagText, { color: theme.textSub }]}>收納盒/籃</Text>
          </TouchableOpacity>
        </View>

        {/* 商品列表 - 橫向兩列單排排列 */}
        <View style={styles.listContainer}>
          {products.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.productCard, { backgroundColor: theme.cardBg }]}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              {/* 左側商品圖片 */}
              <Image source={{ uri: item.img }} style={styles.productImg} />
              
              {/* 右側商品資訊內容 */}
              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: theme.textMain }]} numberOfLines={2}>
                  {item.title}
                </Text>
                
                <View style={styles.priceRow}>
                  <Text style={[styles.productPrice, { color: theme.primary }]}>${item.price}</Text>
                  
                  {/* 位置標籤 */}
                  <View style={styles.locationTag}>
                    <Icon name="location-outline" size={12} color={theme.textSub} style={styles.locIcon} />
                    <Text style={[styles.productLocation, { color: theme.textSub }]}>{item.location}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 底部工具列 */}
      <View style={[styles.bottomNav, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home-outline" size={28} color={theme.textSub} />
          <Text style={[styles.navText, { color: theme.textSub }]}>首頁</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('ItemManagement')}
        >
          <MaterialIcon name="dots-grid" size={28} color={theme.textSub} />
          <Text style={[styles.navText, { color: theme.textSub }]}>物品管理</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Icon name="storefront" size={28} color={theme.primary} />
          <Text style={activeNavTextStyle}>二手拍賣</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <Icon name="person-outline" size={28} color={theme.textSub} />
          <Text style={[styles.navText, { color: theme.textSub }]}>個人中心</Text>
        </TouchableOpacity>
      </View>

      {/* 右下角浮動上架按鈕 */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary }]} 
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Icon name="add" size={30} color={fabIconColor} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeftBtn: { 
    zIndex: 10,
    paddingVertical: 5,
    paddingRight: 15,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
  },
  cartBtn: { 
    padding: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -4,
    top: -2,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 45,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110, 
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 5,
  },
  categoryTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryTagText: { fontSize: 14 },
  activeTagText: { fontSize: 14, fontWeight: '600' },
  listContainer: {
    width: '100%',
  },
  productCard: {
    flexDirection: 'row', 
    borderRadius: 16,
    marginBottom: 12,
    padding: 12, 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  productImg: {
    width: 85, 
    height: 85,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'space-between',
    height: 85, 
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '700',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIcon: {
    marginRight: 2,
  },
  productLocation: {
    fontSize: 12,
  },
  bottomNav: {
    position: 'absolute', bottom: 0, width: '100%', height: 70,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 4 },
  activeNavText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90, 
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default MarketScreen;