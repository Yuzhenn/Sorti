import React, { createContext, useState, useContext, ReactNode } from 'react';

// 定義我們的主題調色盤型別
interface Theme {
  background: string;     // 大背景底色
  cardBg: string;         // 卡片與輸入框背景
  textMain: string;       // 主要文字
  textSub: string;        // 次要文字（例如描述、時間）
  border: string;         // 邊框顏色
  primary: string;        // 招牌奶茶色/主色調
}

// 1. 溫柔日系暖米色（淺色模式）
const lightTheme: Theme = {
  background: '#fdfcf0',
  cardBg: '#ffffff',
  textMain: '#333333',
  textSub: '#7a6f6f',
  border: '#eadecc',
  primary: '#e6d3c3',
};

// 2. 溫柔沉靜深可可（深色/夜間模式）── 絕不使用刺眼的死黑，而是高雅的暖深褐
const darkTheme: Theme = {
  background: '#1c1816',  // 深可可夜色
  cardBg: '#2a2421',      // 稍亮的巧克力褐（卡片用）
  textMain: '#f5efe6',    // 柔和的米白字
  textSub: '#a0938a',     // 霧面灰褐字
  border: '#423833',      // 深色細邊框
  primary: '#cdaf97',     // 焦糖奶茶色
};

interface ThemeContextType {
  isDarkMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 建立一個方便頁面調用的 Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme 必須在 ThemeProvider 內使用');
  }
  return context;
};