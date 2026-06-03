import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';

// 導入頁面元件
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import QuizScreen from './src/screens/QuizScreen';
import HomeScreen from './src/screens/HomeScreen';
import CustomDrawer from './src/components/CustomDrawer';

// 定義 Stack 導覽的型別
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Quiz: undefined;
  Home: undefined;
};

// 定義 Drawer 導覽的型別
export type HomeDrawerParamList = {
  HomeMain: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<HomeDrawerParamList>();

/**
 * 修正核心：建立一個獨立的渲染函式
 * 這樣 React 就不會認為它在每次 render 時都是「新定義」的組件
 */
const renderDrawerContent = (props: DrawerContentComponentProps) => <CustomDrawer {...props} />;

// 首頁的 Drawer 結構
function HomeDrawer() {
  return (
    <Drawer.Navigator 
      // 修正：直接引用外部定義的渲染函式，解決 eslint(react/no-unstable-nested-components)
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: '70%' },
      }}
    >
      <Drawer.Screen name="HomeMain" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#fdfcf0' } 
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Home" component={HomeDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;