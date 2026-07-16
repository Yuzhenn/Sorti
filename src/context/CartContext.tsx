import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';

// 定義購物車商品的型別
interface CartItem {
  id: string;
  title: string;
  price: number;
  location: string;
  img: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 加入購物車邏輯
  const addToCart = (product: any) => {
    setCartItems((prevItems) => {
      const exist = prevItems.find((item) => item.id === product.id);
      if (exist) {
        Alert.alert('提示', '此商品已經在購物車中囉！');
        return prevItems;
      }
      Alert.alert('成功', '已將寶物加入購物車 ✨');
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // 從購物車移除
  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // 清空購物車
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart 必須在 CartProvider 內使用');
  }
  return context;
};