import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
// 1. 導入原生相機與相簿選擇套件
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const AddProductScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null); // 用於存放選取的照片路徑

  // 關鍵修正：將動態文字顏色移出標籤行內樣式，徹底消除 ESLint 警告
  const submitBtnTextStyle = [
    styles.submitBtnText,
    { color: isDarkMode ? '#1c1816' : '#fff' }
  ];

  // 2. 處理選擇照片的對話框（相機拍照或相簿選擇）
  const handleSelectImage = () => {
    Alert.alert(
      '上傳寶物照片',
      '請選擇照片來源',
      [
        {
          text: '相機拍照',
          onPress: () => {
            launchCamera(
              { mediaType: 'photo', cameraType: 'back', quality: 0.8 },
              (response) => {
                if (response.assets && response.assets.length > 0) {
                  setImageUri(response.assets[0].uri || null);
                }
              }
            );
          },
        },
        {
          text: '從相簿選擇',
          onPress: () => {
            launchImageLibrary(
              { mediaType: 'photo', quality: 0.8 },
              (response) => {
                if (response.assets && response.assets.length > 0) {
                  setImageUri(response.assets[0].uri || null);
                }
              }
            );
          },
        },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  // 3. 確認上架物品與欄位防呆驗證
  const handleSubmit = () => {
    if (!imageUri) {
      Alert.alert('提示', '請先為你的收納寶物拍張精美的照片喔！📸');
      return;
    }
    if (!title.trim()) {
      Alert.alert('提示', '請填寫商品名稱');
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('提示', '請填寫正確的預售價格');
      return;
    }
    if (!location.trim()) {
      Alert.alert('提示', '請填寫面交或寄出地點');
      return;
    }

    // 模擬將新建立的商品對象打包
    const newProduct = {
      id: Date.now().toString(), // 隨機生成唯一ID
      title: title.trim(),
      price: Number(price),
      location: location.trim(),
      img: imageUri,
      description: description.trim() || '這是一件精心維護的收納好物，歡迎詢問細節！',
    };

    console.log('成功上架新商品：', newProduct);

    Alert.alert(
      '上架成功 🎉',
      '恭喜！你的二手收納好物已成功發布到二手拍賣市集。',
      [
        {
          text: '太棒了',
          onPress: () => {
            // 完美回傳資料給前一頁，或直接返回拍賣首頁
            navigation.navigate('Market', { newProduct });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部導覽列 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>發布二手好物</Text>
        <View style={styles.placeholderWidth} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 照片上傳觀景窗（若有照片則顯示預覽，若無則顯示虛線框） */}
        <TouchableOpacity 
          style={[styles.photoUploadBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]} 
          activeOpacity={0.8}
          onPress={handleSelectImage}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadInner}>
              <Icon name="camera-outline" size={36} color={theme.textSub} />
              <Text style={[styles.uploadText, { color: theme.textMain }]}>上傳寶物照片</Text>
              <Text style={[styles.uploadSubText, { color: theme.textSub }]}>清晰精美的照片能更快賣出喔！</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 表單欄位 */}
        <View style={styles.formContainer}>
          <Text style={[styles.label, { color: theme.textMain }]}>商品名稱</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]}
            placeholder="例如：無印風九成新雙層收納盒"
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: theme.textMain }]}>預售價格 (TWD)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]}
            placeholder="請輸入預期售價"
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
            keyboardType="number-pad"
            value={price}
            onChangeText={setPrice}
          />

          <Text style={[styles.label, { color: theme.textMain }]}>面交或寄出地點</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }]}
            placeholder="例如：高雄市、台北市"
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
            value={location}
            onChangeText={setLocation}
          />

          <Text style={[styles.label, { color: theme.textMain }]}>寶物詳情描述</Text>
          <TextInput
            style={[
              styles.input, 
              styles.textArea, 
              { backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textMain }
            ]}
            placeholder="細心描述一下物品的新舊狀況、尺寸或使用心得吧..."
            placeholderTextColor={isDarkMode ? '#6b5e56' : '#b5a4a4'}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* 底部確認按鈕 */}
        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: theme.primary }]} 
          onPress={handleSubmit}
        >
          <Text style={submitBtnTextStyle}>確認上架物品</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  placeholderWidth: { width: 32 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
  
  // 拍立得照片上傳區 / 預覽區
  photoUploadBox: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden', // 確保照片圓角完美貼齊外框
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadInner: { alignItems: 'center' },
  uploadText: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  uploadSubText: { fontSize: 12, marginTop: 4 },
  
  formContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 52,
    width: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  submitBtnText: { fontSize: 18, fontWeight: '600' },
});

export default AddProductScreen;