import React from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext'; // 關鍵修正：已將 .tsx 副檔名移除以符合標準 TS 引入規範

const ProductDetailScreen = ({ route, navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const { addToCart } = useCart(); // 拿取全域加入購物車功能
  const { product } = route.params;

  // 抽離按鈕動態文字樣式，避免 ESLint 警告
  const actionBtnTextStyle = [
    styles.actionBtnText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部導覽列 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>商品詳情</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Icon name="share-social-outline" size={24} color={theme.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.img }} style={styles.productImg} />

        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.price, { color: theme.primary }]}>${product.price}</Text>
          <Text style={[styles.title, { color: theme.textMain }]}>{product.title}</Text>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.metaRow}>
            <Icon name="location-outline" size={16} color={theme.textSub} />
            <Text style={[styles.metaText, { color: theme.textSub }]}>地區：{product.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Icon name="time-outline" size={16} color={theme.textSub} />
            <Text style={[styles.metaText, { color: theme.textSub }]}>上架時間：剛剛</Text>
          </View>
        </View>

        <View style={[styles.descriptionCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>商品描述</Text>
          <Text style={[styles.descriptionText, { color: theme.textSub }]}>
            這是一件精心維護的收納好物，非常適合需要魔法整理空間的你。歡迎詢問面交或寄送細節！✨
          </Text>
        </View>
      </ScrollView>

      {/* 底部工具列 */}
      <View style={[styles.bottomBar, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
        
        {/* 關鍵修改：點擊聊聊按鈕直接進去 Chat 聊天室 */}
        <TouchableOpacity 
          style={[styles.iconBtn, { borderColor: theme.border }]}
          onPress={() => navigation.navigate('Chat')}
        >
          <Icon name="chatbubbles-outline" size={20} color={theme.textMain} />
          <Text style={[styles.iconBtnText, { color: theme.textMain }]}>聊聊</Text>
        </TouchableOpacity>

        {/* 加入購物車按鈕 */}
        <TouchableOpacity 
          style={[styles.cartBtn, { borderColor: theme.primary }]}
          onPress={() => addToCart(product)}
        >
          <Icon name="cart-outline" size={20} color={theme.primary} />
          <Text style={[styles.cartBtnText, { color: theme.primary }]}>加入購物車</Text>
        </TouchableOpacity>

        {/* 關鍵修改：點擊立即購買按鈕直接進入 Checkout 購買頁面 */}
        <TouchableOpacity 
          style={[styles.buyBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={actionBtnTextStyle}>立即購買</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  backBtn: { paddingVertical: 5, paddingRight: 15, zIndex: 10 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 20, fontWeight: '600' },
  shareBtn: { padding: 4 },
  scrollContent: { paddingBottom: 100 },
  productImg: { width: '100%', height: 300, resizeMode: 'cover' },
  infoCard: { padding: 20, marginHorizontal: 16, borderRadius: 20, marginTop: -20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  price: { fontSize: 28, fontWeight: '700', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  divider: { height: 1, marginVertical: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metaText: { fontSize: 14, marginLeft: 8, fontWeight: '500' },
  descriptionCard: { padding: 20, marginHorizontal: 16, borderRadius: 20, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  descriptionText: { fontSize: 15, lineHeight: 24, textAlign: 'justify' },
  
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', height: 80, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 15 },
  iconBtn: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 12, height: 48, width: 60, marginRight: 8 },
  iconBtnText: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  cartBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 12, height: 48, marginRight: 8 },
  cartBtnText: { fontSize: 15, fontWeight: '600', marginLeft: 6 },
  buyBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { fontSize: 15, fontWeight: '600' },
});

export default ProductDetailScreen;