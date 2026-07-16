import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const EditProfileScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();

  // 嚴格至元件最頂端定義所有 Hook，不使用預設值
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');

  // 關鍵修正：將動態文字顏色移出標籤行內樣式，徹底消除 ESLint 警告
  const saveBtnTextStyle = [
    styles.saveBtnText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部導覽 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={32} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>編輯個人資料</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 大頭貼頭像區塊 */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Icon name="person" size={55} color={theme.primary} />
            </View>
            <View style={[styles.cameraBadge, { backgroundColor: theme.primary, borderColor: theme.cardBg }]}>
              <Icon name="camera" size={14} color={isDarkMode ? '#1c1816' : '#fff'} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHintText, { color: theme.textSub }]}>點擊更換大頭貼</Text>
        </View>

        {/* 表單輸入區 */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.textMain }]}>姓名</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]}
            value={name}
            onChangeText={setName}
            placeholder="請輸入姓名"
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
          />

          <Text style={[styles.label, { color: theme.textMain }]}>帳號</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]}
            value={account}
            onChangeText={setAccount}
            placeholder="請輸入帳號"
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: theme.textMain }]}>電子郵件</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]}
            value={email}
            onChangeText={setEmail}
            placeholder="請輸入電子郵件"
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: theme.textMain }]}>性別</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]}
            value={gender}
            onChangeText={setGender}
            placeholder="例如：男、女、不便透露"
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
          />

          <Text style={[styles.label, { color: theme.textMain }]}>密碼</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="請輸入新密碼 (不修改請留空)"
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
            autoCapitalize="none"
          />
        </View>

        {/* 儲存按鈕 */}
        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: theme.primary }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={saveBtnTextStyle}>儲存設定</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  avatarHintText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 5,
  },
  saveBtn: {
    height: 52,
    width: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  saveBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditProfileScreen;