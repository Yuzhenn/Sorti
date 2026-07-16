import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LoginScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();

  // 關鍵修正：將動態文字顏色移出標籤行內樣式，徹底消除 ESLint 警告
  const loginBtnTextStyle = [
    styles.loginBtnText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        
        {/* Logo 區塊 */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/120' }} 
            style={[styles.logoImage, { backgroundColor: theme.primary }]} 
          />
          <Text style={[styles.title, { color: theme.textMain }]}>AI收納建議</Text>
        </View>

        {/* 輸入表單區塊 */}
        <View style={styles.inputSection}>
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
          
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: theme.textSub }]}>忘記密碼？</Text>
          </TouchableOpacity>
        </View>

        {/* 登入按鈕 */}
        <TouchableOpacity 
          style={[styles.loginBtn, { backgroundColor: theme.primary }]} 
          onPress={() => navigation.navigate('Quiz')}
        >
          <Text style={loginBtnTextStyle}>登入</Text>
        </TouchableOpacity>

        {/* 底部註冊導引 */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSub }]}>還沒有帳號？ </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerLink, { color: theme.textMain }]}>立即註冊</Text>
          </TouchableOpacity>
        </View>

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
    justifyContent: 'center' 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logoImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 20 
  },
  title: { 
    fontSize: 26, 
    fontWeight: '600', 
    letterSpacing: 1
  },
  inputSection: { 
    marginBottom: 25 
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8, 
    fontWeight: '500' 
  },
  input: { 
    borderWidth: 1,
    borderRadius: 12, 
    height: 52, 
    paddingHorizontal: 16, 
    marginBottom: 16, 
    fontSize: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 5
  },
  forgotText: { 
    fontSize: 14 
  },
  loginBtn: { 
    height: 52, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05,
    shadowRadius: 3,
    marginTop: 10
  },
  loginBtnText: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 25 
  },
  footerText: { 
    fontSize: 15 
  },
  registerLink: { 
    fontSize: 15, 
    fontWeight: '600', 
    textDecorationLine: 'underline' 
  },
});

export default LoginScreen;