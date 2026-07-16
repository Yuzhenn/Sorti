import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

// 定義單條訊息的型別
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time: string;
}

const ChatScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '你好！我是你的 AI 收納小助手 🧙‍♂️',
      sender: 'ai',
      time: '10:00',
    },
    {
      id: '2',
      text: '今天有什麼空間整理的難題想跟我聊聊嗎？比如「衣服太多怎麼辦」或「如何規劃玄關收納」？',
      sender: 'ai',
      time: '10:01',
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  // 傳送訊息邏輯
  const handleSend = () => {
    if (inputText.trim() === '') return;

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // 1. 新增使用者訊息
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      time: timeString,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // 2. 模擬 AI 回覆延遲
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '收到你的問題了！讓我想想如何用最溫柔、最適合你的魔法屬性來幫你規劃這個空間...✨',
        sender: 'ai',
        time: timeString,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  // 關鍵優化：抽離動態樣式，避免 ESLint 行內樣式警告
  const userTextStyle = [
    styles.userText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部導覽列 */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.headerLeftBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>AI 收納小助手</Text>
          <View style={styles.statusDotRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.statusText, { color: theme.textSub }]}>魔法在線中</Text>
          </View>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* 鍵盤避讓容器 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* 聊天訊息對話區 */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <View
                key={msg.id}
                style={[styles.messageRow, isAI ? styles.aiRow : styles.userRow]}
              >
                {/* AI 頭貼 */}
                {isAI && (
                  <View style={[styles.aiAvatar, { backgroundColor: theme.primary }]}>
                    <Icon name="planet-outline" size={18} color={isDarkMode ? '#1c1816' : '#fff'} />
                  </View>
                )}

                {/* 對話氣泡 */}
                <View style={styles.bubbleContainer}>
                  <View style={[
                    styles.bubble, 
                    isAI 
                      ? [styles.aiBubble, { backgroundColor: theme.cardBg, borderColor: theme.border }] 
                      : [styles.userBubble, { backgroundColor: theme.primary }]
                  ]}>
                    <Text style={isAI ? [styles.aiText, { color: theme.textMain }] : userTextStyle}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text style={[styles.timeText, isAI ? styles.aiTime : styles.userTime]}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* 底部輸入列 */}
        <View style={[styles.inputContainer, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textMain }]}
            placeholder="輸入訊息..."
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn, 
              inputText.trim() === '' 
                ? [styles.sendBtnDisabled, { backgroundColor: isDarkMode ? '#423833' : '#eadecc' }] 
                : [styles.sendBtnActive, { backgroundColor: theme.primary }]
            ]}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Icon name="arrow-up" size={20} color={isDarkMode && inputText.trim() !== '' ? '#1c1816' : '#fff'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
  },
  headerLeftBtn: {
    zIndex: 10,
    paddingVertical: 5,
    paddingRight: 15,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#529b77',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerPlaceholder: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  aiRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 16,
  },
  bubbleContainer: {
    flexDirection: 'column',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  aiBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  aiText: {},
  userText: {},
  timeText: {
    fontSize: 10,
    color: '#a89d9d',
    marginTop: 4,
  },
  aiTime: {
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  userTime: {
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendBtnActive: {},
  sendBtnDisabled: {},
});

export default ChatScreen;