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
import { useCart } from '../context/CartContext';

const CartScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const { cartItems, removeFromCart } = useCart();

  // 計算購物車商品總金額
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  // 關鍵優化：抽離按鈕動態文字樣式，完美規避 ESLint 警告
  const checkoutBtnTextStyle = [
    styles.checkoutBtnText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部導覽列 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>我的購物車</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {cartItems.length === 0 ? (
        /* 空空如也的購物車畫面 */
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={80} color={theme.border} />
          <Text style={[styles.emptyText, { color: theme.textSub }]}>
            你的購物車目前空空的喔 🧙‍♂️
          </Text>
          <TouchableOpacity 
            style={[styles.goShoppingBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Market')}
          >
            <Text style={checkoutBtnTextStyle}>去二手拍賣逛逛</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* 有商品的購物車畫面 */
        <View style={styles.cartContent}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.id} style={[styles.cartItemCard, { backgroundColor: theme.cardBg }]}>
                <Image source={{ uri: item.img }} style={styles.itemImg} />
                
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: theme.textMain }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.itemLocation, { color: theme.textSub }]}>
                    地區：{item.location}
                  </Text>
                  <Text style={[styles.itemPrice, { color: theme.primary }]}>
                    ${item.price}
                  </Text>
                </View>

                {/* 垃圾桶移除按鈕 */}
                <TouchableOpacity 
                  style={styles.removeBtn} 
                  onPress={() => removeFromCart(item.id)}
                >
                  <Icon name="trash-outline" size={20} color="#c94a4a" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* 底部結帳控制列 ── 已修改點擊事件跳轉至 Checkout 頁面 */}
          <View style={[styles.checkoutBar, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.totalLabel, { color: theme.textMain }]}>總計金額：</Text>
              <Text style={[styles.totalPrice, { color: theme.primary }]}>${totalPrice}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={checkoutBtnTextStyle}>結帳購買 ({cartItems.length})</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  backBtn: { paddingVertical: 5, paddingRight: 15, zIndex: 10 },
  headerTitle: {
    position: 'absolute', left: 0, right: 0, textAlign: 'center',
    fontSize: 20, fontWeight: '600',
  },
  headerPlaceholder: { width: 32 },
  cartContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
  },
  cartItemCard: {
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
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 25,
    fontWeight: '500',
  },
  goShoppingBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 90,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  checkoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;