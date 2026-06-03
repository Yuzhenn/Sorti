import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';

const RegisterScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>會員註冊</Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>姓名</Text>
          <TextInput style={styles.input} placeholder="請輸入用戶名" placeholderTextColor="#999" />

          <Text style={styles.label}>帳號</Text>
          <TextInput style={styles.input} placeholder="請輸入帳號" placeholderTextColor="#999" />

          <Text style={styles.label}>密碼</Text>
          <TextInput style={styles.input} placeholder="請輸入密碼" secureTextEntry={true} placeholderTextColor="#999" />

          <Text style={styles.label}>再確認密碼</Text>
          <TextInput style={styles.input} placeholder="請再輸入密碼" secureTextEntry={true} placeholderTextColor="#999" />
        </View>

        <TouchableOpacity style={styles.regBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.regBtnText}>註冊</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfcf0' },
  content: { flex: 1, paddingHorizontal: 40, paddingTop: 60 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 40 },
  inputSection: { marginBottom: 40 },
  label: { fontSize: 18, marginBottom: 8, color: '#333', fontWeight: '500' },
  input: { backgroundColor: '#e0e0e0', borderRadius: 10, height: 45, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  regBtn: { backgroundColor: '#ccc', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', width: 150, alignSelf: 'center', marginTop: 20, elevation: 3 },
  regBtnText: { fontSize: 20, color: '#333', fontWeight: '500' },
});

export default RegisterScreen;