import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  type StackNavigationProp,
} from '@react-navigation/stack';
import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';

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
import AIAnalysisCaptureScreen from './src/screens/AIAnalysisCaptureScreen';
import AIAnalysisProcessingScreen from './src/screens/AIAnalysisProcessingScreen';
import AIAnalysisResultScreen from './src/screens/AIAnalysisResultScreen';
import AIAnalysisAdviceScreen from './src/screens/AIAnalysisAdviceScreen';
import AIAnalysisHistoryScreen from './src/screens/AIAnalysisHistoryScreen';
import AIAnalysisHistoryDetailScreen from './src/screens/AIAnalysisHistoryDetailScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import ChatScreen from './src/screens/ChatScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';

import type { AiAnalysisHistoryRecord } from './src/services/photoTempStore';
import type { ChatItem } from './src/types/ai';


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

  AIAnalysisCapture: undefined;

  AIAnalysisProcessing:
    | {
        photoUri?: string;
      }
    | undefined;

  AIAnalysisResult:
    | {
        photoUri?: string;
        detectedItems?: ChatItem[];
      }
    | undefined;

  AIAnalysisAdvice:
    | {
        photoUri?: string;
        detectedItems?: ChatItem[];
      }
    | undefined;

  AIAnalysisHistory: undefined;

  AIAnalysisHistoryDetail: {
    record: AiAnalysisHistoryRecord;
  };

  AIChat:
    | {
        detectedItems?: ChatItem[];
        userPersona?: string;
        persona?: string;
      }
    | undefined;

  Chat: {
    product: any;
  };

  AddProduct: undefined;

  ProductDetail: {
    product: any;
  };

  Cart: undefined;
  Checkout: undefined;
};


export type RootStackNavigationProp =
  StackNavigationProp<RootStackParamList>;


export type HomeDrawerParamList = {
  HomeMain: undefined;
};


const Stack =
  createStackNavigator<RootStackParamList>();

const Drawer =
  createDrawerNavigator<HomeDrawerParamList>();


const renderDrawerContent = (
  props: DrawerContentComponentProps,
) => <CustomDrawer {...props} />;


function HomeDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '70%',
        },
      }}
    >
      <Drawer.Screen
        name="HomeMain"
        component={HomeScreen}
      />
    </Drawer.Navigator>
  );
}


function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
        />

        <Stack.Screen
          name="Home"
          component={HomeDrawer}
        />

        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />

        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
        />

        <Stack.Screen
          name="CalendarCheckIn"
          component={CalendarCheckInScreen}
        />

        <Stack.Screen
          name="Market"
          component={MarketScreen}
        />

        <Stack.Screen
          name="ItemManagement"
          component={ItemManagementScreen}
        />

        <Stack.Screen
          name="AIAnalysisCapture"
          component={AIAnalysisCaptureScreen}
        />

        <Stack.Screen
          name="AIAnalysisProcessing"
          component={AIAnalysisProcessingScreen}
        />

        <Stack.Screen
          name="AIAnalysisResult"
          component={AIAnalysisResultScreen}
        />

        <Stack.Screen
          name="AIAnalysisAdvice"
          component={AIAnalysisAdviceScreen}
        />

        <Stack.Screen
          name="AIAnalysisHistory"
          component={AIAnalysisHistoryScreen}
        />

        <Stack.Screen
          name="AIAnalysisHistoryDetail"
          component={AIAnalysisHistoryDetailScreen}
        />

        <Stack.Screen
          name="AIChat"
          component={AIChatScreen}
        />

        <Stack.Screen
          name="Chat"
          component={ChatScreen}
        />

        <Stack.Screen
          name="AddProduct"
          component={AddProductScreen}
        />

        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
        />

        <Stack.Screen
          name="Cart"
          component={CartScreen}
        />

        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
        />
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