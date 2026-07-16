import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ListRenderItemInfo,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

// 定義單條對話的型別
interface Message {
  id: string;
  sender: 'buyer' | 'seller'; // 買家 (user) 或是 賣家
  text: string;
  time: string;
}

const ChatScreen = ({ route, navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const listRef = useRef<FlatList<Message>>(null);
  const [input, setInput] = useState('');

  // 取得從商品詳情頁傳過來的商品資料
  const product = route?.params?.product;

  // 模擬像蝦皮一樣的對話紀錄
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (product) {
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // 初始化蝦皮風格的買賣問答
      setMessages([
        {
          id: 'msg-1',
          sender: 'buyer', // 買家主動問商品在不在
          text: `您好！請問這個「${product.title}」還在嗎？我很有興趣！`,
          time: timeString,
        },
        {
          id: 'msg-2',
          sender: 'seller', // 賣家親切回覆
          text: '您好！商品還在喔，保存狀況非常好！請問您需要面交還是超商寄送呢？😊',
          time: timeString,
        },
      ]);
    }
  }, [product]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  // 傳送訊息
  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'buyer', // 買家（使用者本人）送出訊息
      text: trimmedInput,
      time: timeString,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    scrollToBottom();
  };

  // 💡 關鍵優化：將所有動態樣式全部抽離，徹底消除 ESLint 警告 💡

  // 1. 導覽列與背景樣式
  const containerStyle = [styles.container, { backgroundColor: theme.background }];
  const headerStyle = [styles.header, { borderBottomColor: theme.border, backgroundColor: theme.background }];
  const headerTitleStyle = [styles.headerTitle, { color: theme.textMain }];

  // 2. 頂部商品橫條
  const miniHeaderStyle = [styles.productMiniHeader, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }];
  const miniTitleStyle = [styles.miniTitle, { color: theme.textMain }];
  const miniPriceStyle = [styles.miniPrice, { color: theme.primary }];
  const actionBtnStyle = [styles.actionBtn, { borderColor: theme.primary }];
  const actionBtnTextStyle = [styles.actionBtnText, { color: theme.primary }];

  // 3. 聊天氣泡
  const buyerBubbleStyle = [styles.buyerBubble, { backgroundColor: theme.primary }];
  const sellerBubbleStyle = [styles.sellerBubble, { backgroundColor: theme.cardBg, borderColor: theme.border }];
  
  const buyerTextStyle = [styles.bubbleText, { color: isDarkMode ? '#1c1816' : '#fff' }];
  const sellerTextStyle = [styles.bubbleText, { color: theme.textMain }];

  // 4. 底部輸入框與按鈕
  const inputRowStyle = [styles.inputRow, { backgroundColor: theme.cardBg, borderTopColor: theme.border }];
  const inputStyle = [styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textMain }];
  const sendButtonStyle = [
    styles.sendButton,
    { backgroundColor: theme.primary },
    !input.trim() && styles.sendButtonDisabled,
  ];
  const sendTextStyle = [styles.sendText, { color: isDarkMode ? '#1c1816' : '#fff' }];

  const renderItem = ({ item }: ListRenderItemInfo<Message>) => {
    const isBuyer = item.sender === 'buyer';

    return (
      <View style={[styles.messageRow, isBuyer ? styles.buyerRow : styles.sellerRow]}>
        
        {/* 對話氣泡 */}
        <View style={styles.bubbleContainer}>
          <View
            style={[
              styles.bubble,
              isBuyer ? buyerBubbleStyle : sellerBubbleStyle,
            ]}
          >
            <Text style={isBuyer ? buyerTextStyle : sellerTextStyle}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.timeText, isBuyer ? styles.buyerTime : styles.sellerTime]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 頂部導覽列 */}
        <View style={headerStyle}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={headerTitleStyle}>
            {product ? `與 ${product.location} 賣家的聊聊` : '賣家聊聊'}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* 頂部商品迷你資訊欄 */}
        {product && (
          <View style={miniHeaderStyle}>
            <Image source={{ uri: product.img }} style={styles.miniImg} />
            <View style={styles.miniInfo}>
              <Text style={miniTitleStyle} numberOfLines={1}>
                {product.title}
              </Text>
              <Text style={miniPriceStyle}>${product.price}</Text>
            </View>
            <TouchableOpacity style={actionBtnStyle}>
              <Text style={actionBtnTextStyle}>出價</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 對話訊息列表 */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        />

        {/* 底部輸入列 */}
        <View style={inputRowStyle}>
          <TextInput
            style={inputStyle}
            value={input}
            onChangeText={setInput}
            placeholder="請輸入訊息..."
            placeholderTextColor="#8e8e8e"
            multiline
          />

          <TouchableOpacity
            style={sendButtonStyle}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={sendTextStyle}>傳送</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  header: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { paddingVertical: 5, paddingRight: 15, zIndex: 10 },
  headerTitle: {
    position: 'absolute', left: 0, right: 0, textAlign: 'center',
    fontSize: 18, fontWeight: '700',
  },
  headerPlaceholder: { width: 32 },

  // 商品迷你橫條樣式
  productMiniHeader: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  miniImg: {
    width: 45,
    height: 45,
    borderRadius: 8,
  },
  miniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  miniPrice: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  messageList: { paddingHorizontal: 16, paddingVertical: 18, flexGrow: 1 },
  messageRow: { width: '100%', marginBottom: 14, flexDirection: 'row' },
  buyerRow: { justifyContent: 'flex-end' },
  sellerRow: { justifyContent: 'flex-start' },

  bubbleContainer: { flexDirection: 'column', maxWidth: '82%' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  buyerBubble: {
    borderBottomRightRadius: 4,
  },
  sellerBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timeText: {
    fontSize: 10,
    color: '#a89d9d',
    marginTop: 4,
  },
  buyerTime: { alignSelf: 'flex-end', marginRight: 4 },
  sellerTime: { alignSelf: 'flex-start', marginLeft: 4 },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    borderWidth: 1,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendText: { fontWeight: '700', fontSize: 14 },
});

export default ChatScreen;