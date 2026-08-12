export const AI_ANALYSIS_ROOM_IMAGE = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200';

export type AnalysisBox = {
  id: string;
  label: string;
  color: string;
  top: string;
  left: string;
  width: string;
  height: string;
};

export type AnalysisCategory = {
  title: string;
  count: number;
  items: string[];
  warning?: string;
};

export const analysisBoxes: AnalysisBox[] = [
  { id: 'books', label: '書籍', color: '#66d17f', top: '69%', left: '11%', width: '20%', height: '18%' },
  { id: 'stationery', label: '文具', color: '#ff6b6b', top: '16%', left: '25%', width: '16%', height: '19%' },
  { id: 'charger', label: '3C', color: '#f7c948', top: '52%', left: '44%', width: '15%', height: '11%' },
  { id: 'table', label: '桌面', color: '#5b8def', top: '48%', left: '39%', width: '29%', height: '31%' },
  { id: 'shelf', label: '收納層', color: '#8b5cf6', top: '24%', left: '76%', width: '11%', height: '30%' },
];

export const analysisCategories: AnalysisCategory[] = [
  {
    title: '文具類',
    count: 4,
    items: ['圓規', '尺', '鉛筆', '橡皮擦'],
    warning: '圓規',
  },
  {
    title: '服飾類',
    count: 2,
    items: ['圍巾', '帽子'],
  },
  {
    title: '書籍類',
    count: 1,
    items: ['雜誌 / 筆記本'],
  },
  {
    title: '3C類',
    count: 1,
    items: ['充電線 / 裝置'],
  },
];

export const recommendationSteps = [
  'STEP1. 筆電不建議直接放置於軟質被褥上，除了容易因墊塊造成損壞，也會阻礙散熱。應規劃專屬的書桌或移動式電腦架。',
  'STEP2. 床前下方左右有餘裕空間，建議添置滑輪式收納箱，將目前散落在床面、 不宜隨時使用需求的非季節性被褥與衣物進行集中儲存，以釋放床面物理範圍。',
  'STEP3. 滾筒黏紙器應放置於側邊櫃面的掛鈎或床頭櫃抽屜，避免佔用睡眠區域的中心位置。',
];

export const suggestedPurchaseItems = ['塑膠收納箱 1個'];