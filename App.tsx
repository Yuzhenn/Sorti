import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';

import { ThemeProvider } from './src/context/ThemeContext';
import { CartProvider } from './src/context/CartContext';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import QuizScreen from './src/screens/QuizScreen';
import HomeScreen from './src/screens/HomeScreen';
import CustomDrawer from './src/components/CustomDrawer';
import SettingsScreen from './src/screens/SettingsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import CalendarCheckInScreen from './src/screens/CalendarCheckInScreen';
import MarketScreen from './src/screens/MarketScreen';
import ItemManagementScreen from './src/screens/ItemManagementScreen';
import AIChatScreen from './src/screens/AIChatScreen'; // AI 收納導師
import ChatScreen from './src/screens/ChatScreen'; // 【新增】真人賣家聊聊
import AddProductScreen from './src/screens/AddProductScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Quiz: undefined;
  Home: undefined;
  Settings: undefined;
  EditProfile: undefined;
  CalendarCheckIn: undefined;
  Market: undefined;
  ItemManagement: undefined;
  AIChat: undefined; // AI 收納導師
  Chat: { product: any }; // 【修改】真人賣家聊聊，傳入對應商品資訊
  AddProduct: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  Checkout: undefined;
};

export type HomeDrawerParamList = {
  HomeMain: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<HomeDrawerParamList>();

const renderDrawerContent = (props: DrawerContentComponentProps) => <CustomDrawer {...props} />;

function HomeDrawer() {
  return (
    <Drawer.Navigator 
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

function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Home" component={HomeDrawer} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="CalendarCheckIn" component={CalendarCheckInScreen} />
        <Stack.Screen name="Market" component={MarketScreen} />
        <Stack.Screen name="ItemManagement" component={ItemManagementScreen} />
        <Stack.Screen name="AIChat" component={AIChatScreen} />
        {/* 【新增】將真人賣家聊天室註冊到 Stack */}
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ThemeProvider>
  );
}