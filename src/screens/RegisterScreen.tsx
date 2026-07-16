import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const RegisterScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();

  // 關鍵修正：將動態文字顏色移出標籤行內樣式，徹底消除 ESLint 警告
  const regBtnTextStyle = [
    styles.regBtnText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>會員註冊</Text>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textMain }]}>姓名</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]} 
            placeholder="請輸入用戶名" 
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'} 
          />

          <Text style={[styles.label, { color: theme.textMain }]}>帳號</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]} 
            placeholder="請輸入帳號" 
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'} 
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: theme.textMain }]}>密碼</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]} 
            placeholder="請輸入密碼" 
            secureTextEntry={true} 
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'} 
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: theme.textMain }]}>再確認密碼</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]} 
            placeholder="請再輸入密碼" 
            secureTextEntry={true} 
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'} 
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={[styles.regBtn, { backgroundColor: theme.primary }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={regBtnTextStyle}>註冊</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 40, 
    paddingTop: 60 
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 40 
  },
  inputSection: { 
    marginBottom: 30 
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8, 
    fontWeight: '500' 
  },
  input: { 
    borderWidth: 1,
    borderRadius: 12, 
    height: 50, 
    paddingHorizontal: 15, 
    marginBottom: 15, 
    fontSize: 16 
  },
  regBtn: { 
    height: 52, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: 160, 
    alignSelf: 'center', 
    marginTop: 20, 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  regBtnText: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
});

export default RegisterScreen;