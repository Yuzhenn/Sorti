import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';

// 修正：移除未使用的 DrawerItemList 與 MaterialIcon 導入，解決紅字
const CustomDrawer = (props: any) => {
  return (
    // 修正：將行內樣式移至 styles.container 以解決 ESLint 警告
    <SafeAreaView style={styles.container}>
      <DrawerContentScrollView {...props}>
        {/* 選單頂部選單按鈕 */}
        <View style={styles.menuHeader}>
          <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
            <Icon name="menu" size={30} color="#333" />
          </TouchableOpacity>
        </View>

        {/* 渲染選單項目 */}
        <View style={styles.drawerList}>
          <DrawerItem 
            label="首頁" 
            icon="home-outline" 
            onPress={() => props.navigation.navigate('HomeMain')} 
          />
          <DrawerItem label="物品管理" icon="grid-outline" />
          <DrawerItem label="AI對話" icon="chatbubbles-outline" />
          <DrawerItem label="二手拍賣" icon="hammer-outline" />
          <DrawerItem label="歷史紀錄" icon="time-outline" />
          
          <View style={styles.divider} />
          
          <DrawerItem label="個人中心" icon="person-outline" />
          <DrawerItem label="設定" icon="settings-outline" />
          <DrawerItem label="關於我們" icon="alert-circle-outline" />
          
          <View style={styles.divider} />
          
          <DrawerItem 
            label="登出" 
            icon="exit-outline" 
            onPress={() => props.navigation.replace('Login')} 
          />
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

const DrawerItem = ({ label, icon, onPress }: any) => (
  <TouchableOpacity style={styles.itemRow} onPress={onPress}>
    <Icon name={icon} size={24} color="#333" style={styles.icon} />
    <Text style={styles.itemLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // 修正：新增 container 樣式解決行內樣式錯誤
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  drawerList: {
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 15,
    width: 25,
  },
  itemLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
    marginHorizontal: 20,
  },
});

export default CustomDrawer;