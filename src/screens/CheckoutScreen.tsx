import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

const CheckoutScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const { cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'magic' | 'cod'>('magic');

  // 計算結帳金額
  const itemsPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shippingFee = itemsPrice > 500 ? 0 : 60; // 滿 $500 免運，否則運費 $60
  const totalPrice = itemsPrice + shippingFee;

  // 確認付款點擊事件
  const handlePaymentConfirm = () => {
    Alert.alert(
      '付款成功！🎉',
      '魔法結帳完成！我們已通知賣家儘速為您發貨，一起找回空間的清爽魔法吧 ✨',
      [
        {
          text: '太棒了！',
          onPress: () => {
            clearCart(); // 清空購物車
            navigation.navigate('Home'); // 跳轉回首頁
          },
        },
      ]
    );
  };

  // 關鍵優化：抽離按鈕動態文字樣式，完美規避 ESLint 警告
  const actionBtnTextStyle = [
    styles.payBtnText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部導覽 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>確認結帳</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. 配送/面交地址 */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionTitleRow}>
            <Icon name="location-outline" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>收件資訊</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textMain }]}>收件人：魔法學徒</Text>
          <Text style={[styles.infoText, { color: theme.textSub }]}>電話：0912-345-678</Text>
          <Text style={[styles.infoText, { color: theme.textSub }]}>地址：魔法收納學院 主校區 A 棟宿舍</Text>
        </View>

        {/* 2. 付款方式選擇 */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionTitleRow}>
            <Icon name="card-outline" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>付款方式</Text>
          </View>

          {/* 魔法金幣支付 */}
          <TouchableOpacity 
            style={[
              styles.paymentOption, 
              { borderColor: theme.border },
              paymentMethod === 'magic' ? { borderColor: theme.primary } : null
            ]}
            onPress={() => setPaymentMethod('magic')}
          >
            <View style={styles.optionLeft}>
              <Icon 
                name={paymentMethod === 'magic' ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={paymentMethod === 'magic' ? theme.primary : theme.textSub} 
              />
              <Text style={[styles.optionText, { color: theme.textMain }]}>🔮 魔法金幣支付 (全額扣抵)</Text>
            </View>
          </TouchableOpacity>

          {/* 貨到付款 */}
          <TouchableOpacity 
            style={[
              styles.paymentOption, 
              { borderColor: theme.border },
              paymentMethod === 'cod' ? { borderColor: theme.primary } : null
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <View style={styles.optionLeft}>
              <Icon 
                name={paymentMethod === 'cod' ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={paymentMethod === 'cod' ? theme.primary : theme.textSub} 
              />
              <Text style={[styles.optionText, { color: theme.textMain }]}>📦 貨到面交付款</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. 購買商品清單概要 */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionTitleRow}>
            <Icon name="bag-handle-outline" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>商品明細 ({cartItems.length}件)</Text>
          </View>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemMinCard}>
              <Text style={[styles.itemTitle, { color: theme.textMain }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.itemPrice, { color: theme.primary }]}>${item.price}</Text>
            </View>
          ))}
        </View>

        {/* 4. 結帳金額計算 */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.priceCalcRow}>
            <Text style={[styles.priceCalcLabel, { color: theme.textSub }]}>商品小計</Text>
            <Text style={[styles.priceCalcValue, { color: theme.textMain }]}>${itemsPrice}</Text>
          </View>
          <View style={styles.priceCalcRow}>
            <Text style={[styles.priceCalcLabel, { color: theme.textSub }]}>傳送運費</Text>
            <Text style={[styles.priceCalcValue, { color: theme.textMain }]}>
              {shippingFee === 0 ? '免運 ✨' : `$${shippingFee}`}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.priceCalcRow}>
            <Text style={[styles.totalLabel, { color: theme.textMain }]}>實付總額</Text>
            <Text style={[styles.totalPrice, { color: theme.primary }]}>${totalPrice}</Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部確認付款固定按鈕 */}
      <View style={[styles.bottomBar, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
        <View style={styles.bottomPriceInfo}>
          <Text style={[styles.bottomTotalLabel, { color: theme.textSub }]}>實付總額：</Text>
          <Text style={[styles.bottomTotalPrice, { color: theme.primary }]}>${totalPrice}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.payBtn, { backgroundColor: theme.primary }]}
          onPress={handlePaymentConfirm}
        >
          <Text style={actionBtnTextStyle}>確認付款</Text>
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  itemMinCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceCalcLabel: {
    fontSize: 14,
  },
  priceCalcValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  bottomPriceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomTotalLabel: {
    fontSize: 14,
  },
  bottomTotalPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  payBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckoutScreen;