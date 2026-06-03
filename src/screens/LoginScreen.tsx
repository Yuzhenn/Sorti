import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native';

const LoginScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo 圓形佔位 */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle} />
          <Image 
            source={{ uri: 'https://via.placeholder.com/120' }} // 先用網路圖測試
            style={styles.logoCircle} 
            />
          <Text style={styles.title}>AI收納建議</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>帳號</Text>
          <TextInput style={styles.input} placeholder="請輸入帳號" placeholderTextColor="#999" />

          <Text style={styles.label}>密碼</Text>
          <TextInput style={styles.input} placeholder="請輸入密碼" secureTextEntry={true} placeholderTextColor="#999" />
          
          <TouchableOpacity>
            <Text style={styles.forgotText}>忘記密碼？</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Quiz')}>
          <Text style={styles.loginBtnText}>登入</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>還沒有帳號？ </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>立即註冊</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfcf0' },
  content: { flex: 1, paddingHorizontal: 40, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  inputSection: { marginBottom: 30 },
  label: { fontSize: 20, marginBottom: 10, color: '#333', fontWeight: '500' },
  input: { backgroundColor: '#e0e0e0', borderRadius: 10, height: 50, paddingHorizontal: 15, marginBottom: 20, fontSize: 16 },
  forgotText: { textAlign: 'right', color: '#666', fontSize: 14 },
  loginBtn: { backgroundColor: '#ccc', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 },
  loginBtnText: { fontSize: 22, color: '#333', fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#666', fontSize: 16 },
  registerLink: { color: '#333', fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
});

export default LoginScreen;