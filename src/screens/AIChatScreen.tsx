import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { sendMessageToAI } from '../services/aiApi';
import type { ChatItem } from '../types/ai';

type MessageSender = 'user' | 'ai' | 'loading';

interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  createdAt: number;
}

const AIChatScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const listRef = useRef<FlatList<Message>>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPersona, setUserPersona] = useState('未提供收納人格');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '你好，我是你的 AI 收納導師。你可以直接描述現在最亂的地方，我會幫你判斷哪些先丟、哪些先留、哪些適合收納。',
      createdAt: Date.now(),
    },
  ]);

  const fixedItems: ChatItem[] = useMemo(
    () => [
      { name: '穿到起毛球的 T恤', category: '衣服', count: 3 },
      { name: '未拆封的過期化妝品試用包', category: '小東西', count: 10 },
      { name: '沒看過的統計學原文書', category: '書籍', count: 1 },
    ],
    [],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadPersona = async () => {
        try {
          const savedPersona = await AsyncStorage.getItem('user_magic_identity');
          if (!active) return;

          setUserPersona(savedPersona?.trim() || '未提供收納人格');
        } catch (error) {
          if (!active) return;
          console.log('讀取收納人格失敗', error);
          setUserPersona('未提供收納人格');
        }
      };

      loadPersona();

      return () => {
        active = false;
      };
    }, []),
  );

  // 將所有動態主題樣式抽離至 dynamicStyles，避免 JSX 內聯物件觸發 ESLint 警告
  const dynamicStyles = useMemo(
    () => ({
      container: { backgroundColor: theme.background },
      hero: { backgroundColor: theme.cardBg, borderBottomColor: theme.border },
      title: { color: theme.textMain },
      subtitle: { color: theme.textSub },
      metaPill: { backgroundColor: theme.background },
      metaPillText: { color: theme.textSub },
      userText: { color: isDarkMode ? '#1c1816' : '#333' },
      aiText: { color: theme.textMain },
      inputRow: { backgroundColor: theme.cardBg, borderTopColor: theme.border },
      input: {
        backgroundColor: theme.background,
        borderColor: theme.border,
        color: theme.textMain,
      },
      sendButton: { backgroundColor: theme.primary },
      sendText: { color: isDarkMode ? '#1c1816' : '#fff' },
    }),
    [theme, isDarkMode],
  );

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const formatTime = (timestamp: number) => {
    const now = new Date(timestamp);
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || loading) return;

    const now = Date.now();
    const userMessage: Message = {
      id: `${now}-user`,
      sender: 'user',
      text: trimmedInput,
      createdAt: now,
    };

    const loadingMessage: Message = {
      id: `${now}-loading`,
      sender: 'loading',
      text: 'AI 導師思考中...',
      createdAt: now,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputText('');
    setLoading(true);
    scrollToBottom();

    try {
      const result = await sendMessageToAI({
        message: trimmedInput,
        items: fixedItems,
        user_persona: userPersona === '未提供收納人格' ? undefined : userPersona,
      });

      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        sender: 'ai',
        text: result.reply,
        createdAt: Date.now(),
      };

      setMessages((prev) => prev.filter((message) => message.id !== loadingMessage.id).concat(aiMessage));
    } catch (error) {
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        sender: 'ai',
        text:
          error instanceof Error
            ? `目前無法取得回覆：${error.message}`
            : '目前 AI 小助手暫時無法回覆，請稍後再試。',
        createdAt: Date.now(),
      };

      setMessages((prev) => prev.filter((message) => message.id !== loadingMessage.id).concat(errorMessage));
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<Message>) => {
    const isUser = item.sender === 'user';
    const isLoading = item.sender === 'loading';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.aiRow,
          isLoading && styles.loadingRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.aiBubble,
            isLoading && styles.loadingBubble,
          ]}
        >
          {isLoading ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator size="small" color="#5c5c5c" />
              <Text style={styles.loadingText}>{item.text}</Text>
            </View>
          ) : (
            <Text style={isUser ? [styles.userText, dynamicStyles.userText] : [styles.aiText, dynamicStyles.aiText]}>
              {item.text}
            </Text>
          )}
          <Text style={[styles.timeText, isUser ? styles.userTime : styles.aiTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.hero, dynamicStyles.hero]}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={28} color={theme.textMain} />
            </TouchableOpacity>
            <View style={styles.heroTitleBlock}>
              <Text style={[styles.title, dynamicStyles.title]}>AI 收納聊天機器人</Text>
              <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
                先減量，再收納，讓每次對話都能直接變成整理行動。
              </Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.metaPills}>
            <View style={[styles.metaPill, dynamicStyles.metaPill]}>
              <Text style={[styles.metaPillText, dynamicStyles.metaPillText]}>人格：{userPersona}</Text>
            </View>
            <View style={[styles.metaPill, dynamicStyles.metaPill]}>
              <Text style={[styles.metaPillText, dynamicStyles.metaPillText]}>已串接後端 /chat</Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        />

        <View style={[styles.inputRow, dynamicStyles.inputRow]}>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="例如：我的桌子很亂，該從哪裡開始？"
            placeholderTextColor={isDarkMode ? '#8b7f73' : '#8e8e8e'}
            multiline
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              dynamicStyles.sendButton,
              (loading || !inputText.trim()) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={loading || !inputText.trim()}
          >
            <Text style={[styles.sendText, dynamicStyles.sendText]}>
              {loading ? '傳送中' : '送出'}
            </Text>
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
  keyboard: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backBtn: {
    paddingVertical: 5,
    paddingRight: 14,
    zIndex: 10,
  },
  heroTitleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  headerSpacer: {
    width: 32,
  },
  metaPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexGrow: 1,
  },
  messageRow: {
    width: '100%',
    marginBottom: 12,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  loadingRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#c6f0d6',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#e7dfd0',
  },
  loadingBubble: {
    backgroundColor: '#f2f2f2',
  },
  userText: {
    fontSize: 16,
    lineHeight: 23,
    color: '#2f2a26',
  },
  aiText: {
    fontSize: 16,
    lineHeight: 23,
    color: '#2f2a26',
  },
  timeText: {
    marginTop: 6,
    fontSize: 11,
  },
  userTime: {
    color: '#6d665c',
    textAlign: 'right',
  },
  aiTime: {
    color: '#8b7e6f',
    textAlign: 'left',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    flexShrink: 1,
    color: '#5e5e5e',
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
  sendText: {
    fontWeight: '700',
  },
});

export default AIChatScreen;