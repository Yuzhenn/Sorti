import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

// 【收納魔法學院】七道空間試煉題目
const questions = [
  {
    id: 1,
    question: "上課鐘聲快響了，你剛用完魔法筆，會把它放在哪裡？",
    image: require('../assets/images/第一題.png'),
    options: [
      { text: "A. 桌上看得到的地方", scores: { visual: "豐富", detail: "簡易" } },
      { text: "B. 先收進附近抽屜", scores: { visual: "簡潔", detail: "簡易" } },
      { text: "C. 放回展示架並分類", scores: { visual: "豐富", detail: "詳盡" } },
      { text: "D. 放回專屬收納格", scores: { visual: "簡潔", detail: "詳盡" } },
    ],
  },
  {
    id: 2,
    question: "你可以選擇一間宿舍，最想入住哪一間？",
    image: require('../assets/images/第二題.png'),
    options: [
      { text: "A. 桌面空空，物品全收起", scores: { visual: "簡潔", detail: "詳盡" } },
      { text: "B. 收藏展示，排列整齊", scores: { visual: "豐富", detail: "詳盡" } },
      { text: "C. 常用物品都看得到", scores: { visual: "豐富", detail: "簡易" } },
      { text: "D. 外表乾淨，雜物藏起來", scores: { visual: "簡潔", detail: "簡易" } },
    ],
  },
  {
    id: 3,
    question: "你在森林裡撿到一件新寶物，帶回房間後會？",
    image: require('../assets/images/第三題.png'),
    options: [
      { text: "A. 找個櫃子先放著", scores: { visual: "簡潔", detail: "簡易" } },
      { text: "B. 安排固定收納位置", scores: { visual: "簡潔", detail: "詳盡" } },
      { text: "C. 放在順手的位置", scores: { visual: "豐富", detail: "簡易" } },
      { text: "D. 放進展示區並分類", scores: { visual: "豐富", detail: "詳盡" } },
    ],
  },
  {
    id: 4,
    question: "校長半小時後要檢查房間，你會先做什麼？",
    image: require('../assets/images/第四題.png'),
    options: [
      { text: "A. 快速把雜物藏起來", scores: { visual: "簡潔", detail: "簡易" } },
      { text: "B. 把桌上的東西排好看", scores: { visual: "豐富", detail: "簡易" } },
      { text: "C. 每件物品放回原位", scores: { visual: "簡潔", detail: "詳盡" } },
      { text: "D. 整理展示區與分類", scores: { visual: "豐富", detail: "詳盡" } },
    ],
  },
  {
    id: 5,
    question: "你獲得一張免費兌換券，會選哪一種收納道具？",
    image: require('../assets/images/第五題.png'),
    options: [
      { text: "A. 開放式魔法層架", scores: { visual: "豐富", detail: "簡易" } },
      { text: "B. 分格隱藏收納櫃", scores: { visual: "簡潔", detail: "詳盡" } },
      { text: "C. 大型隱形收納籃", scores: { visual: "簡潔", detail: "簡易" } },
      { text: "D. 透明分類展示盒", scores: { visual: "豐富", detail: "詳盡" } },
    ],
  },
  {
    id: 6,
    question: "你突然找不到一枚很久沒用的徽章，通常會？",
    image: require('../assets/images/第六題.png'),
    options: [
      { text: "A. 翻找幾個櫃子", scores: { visual: "簡潔", detail: "簡易" } },
      { text: "B. 掃一眼就找到", scores: { visual: "豐富", detail: "簡易" } },
      { text: "C. 按標籤直接找到", scores: { visual: "簡潔", detail: "詳盡" } },
      { text: "D. 去固定展示區找", scores: { visual: "豐富", detail: "詳盡" } },
    ],
  },
  {
    id: 7,
    question: "最後一關，你希望自己的房間呈現什麼模樣？",
    image: require('../assets/images/第七題.png'),
    options: [
      { text: "A. 收藏都展示出來", scores: { visual: "豐富", detail: "簡易" } },
      { text: "B. 表面乾淨就好", scores: { visual: "簡潔", detail: "簡易" } },
      { text: "C. 展示清楚、分類完整", scores: { visual: "豐富", detail: "詳盡" } },
      { text: "D. 內外都整齊有序", scores: { visual: "簡潔", detail: "詳盡" } },
    ],
  },
];

const academyResults: any = {
  "豐富_簡易": {
    name: "視覺幻術師",
    icon: "sparkles-outline",
    vLabel: "視覺表現：展現流派",
    dLabel: "空間維護：順手隨行",
    feature: "東西必須看得到、好拿取，討厭繁瑣的分類，重視空間的美感與擺設。",
    desc: "追求自由與視覺享受。對你來說，看不到的東西就等於不存在。不喜歡把東西關在黑漆漆的抽屜裡，而是喜歡把心愛的物品像藝術品一樣陳列在日光下，亂得有美感才是最舒服的狀態。"
  },
  "簡潔_簡易": {
    name: "遮醜結界師",
    icon: "shield-half-outline",
    vLabel: "視覺表現：極簡隱形",
    dLabel: "空間維護：順手隨行",
    feature: "表面看起來非常乾淨整潔，但櫃子一打開其實是「順手塞進去」的隱藏流派，追求快速收好。",
    desc: "表面維持著完美的平靜。你的魔法專長是「把雜物隱形」，最受不了表面有視覺干擾。只要能把東西快速藏進漂亮的籃子或不透明的櫃子裡，內部維持什麼秩序並不重要，實行「快速遮醜」的速成魔法。"
  },
  "豐富_詳盡": {
    name: "時光展覽家",
    icon: "hourglass-outline",
    vLabel: "視覺表現：展現流派",
    dLabel: "空間維護：精密檔案",
    feature: "喜歡把所有收藏和物品清清楚楚地展示出來，同時擁有極度微觀、精細的標籤與分類邏輯。",
    desc: "你的空間是一座壯觀的魔法博物館。你既想要一眼看到所有的寶物，又擁有極強的分類靈魂。收納盒裡還有小分隔、標籤機是你的日常，對你而言，將每件回憶物件井然有序地展現出來，是極具儀式感的事。"
  },
  "簡潔_詳盡": {
    name: "首席秩序官",
    icon: "ribbon-outline",
    vLabel: "視覺表現：極簡隱形",
    dLabel: "空間維護：精密檔案",
    feature: "追求極致的清爽與秩序。表面空無一物，而櫃子內部擁有像是圖書館、檔案室般教科書等級的嚴密分類。",
    desc: "魔法學院中最嚴謹的幾何大師。你的防禦結界是「絕對的清爽與條理」，表面上看不到任何雜物，而隱藏的抽屜與櫃子打開，每一件物品都有專屬的座標與規格。你擁有將繁複秩序藏在簡潔背後的頂級魔法。"
  }
};

const QuizScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useTheme();
  const [showIntro, setShowIntro] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);

  const [visualScores, setVisualScores] = useState<any>({ "豐富": 0, "簡潔": 0 });
  const [detailScores, setDetailScores] = useState<any>({ "簡易": 0, "詳盡": 0 });

  const handleSelectOption = (index: number) => {
    setSelectedOptionIdx(index);

    const currentScores = questions[currentIdx].options[index].scores;
    
    setVisualScores((prev: any) => ({ ...prev, [currentScores.visual]: prev[currentScores.visual] + 1 }));
    setDetailScores((prev: any) => ({ ...prev, [currentScores.detail]: prev[currentScores.detail] + 1 }));

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelectedOptionIdx(null);
      } else {
        setShowResult(true);
      }
    }, 200);
  };

  const goToPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setSelectedOptionIdx(null);
    }
  };

  const getFinalResult = () => {
    const finalVisual = Object.keys(visualScores).reduce((a, b) => visualScores[a] > visualScores[b] ? a : b);
    const finalDetail = Object.keys(detailScores).reduce((a, b) => detailScores[a] > detailScores[b] ? a : b);
    
    const totalV = visualScores["豐富"] + visualScores["簡潔"] || 1;
    const totalD = detailScores["詳盡"] + detailScores["簡易"] || 1;
    
    const vPercent = Math.round((visualScores[finalVisual] / totalV) * 100);
    const dPercent = Math.round((detailScores[finalDetail] / totalD) * 100);

    return { 
      key: `${finalVisual}_${finalDetail}`,
      vPercent,
      dPercent
    };
  };

  const handleCompleteQuiz = async (identityName: string) => {
    try {
      await AsyncStorage.setItem('user_magic_identity', identityName);
    } catch (e) {
      console.log('儲存魔法身分失敗', e);
    }
    navigation.navigate('Home');
  };

  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  const primaryBtnTextStyle = [
    styles.primaryBtnText,
    { color: isDarkMode ? '#1c1816' : '#333' }
  ];

  // --- 1. 前言畫面 ---
  if (showIntro) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
          <View style={styles.magicTitleRow}>
            <Icon name="sparkles" size={18} color={theme.primary} />
            <Text style={[styles.introTitle, { color: theme.textMain }]}> 收納魔法學院 </Text>
            <Icon name="sparkles" size={18} color={theme.primary} />
          </View>
          
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <View style={styles.magicBadgeContainer}>
              <View style={[styles.magicOrbitSmall, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Icon name="school-outline" size={28} color={theme.primary} />
              </View>
            </View>
            <View style={[styles.magicDividerLineShort, { backgroundColor: theme.border }]} />
            <Text style={[styles.introParagraph, { color: theme.textMain }]}>✦ 你收到一封來自神祕魔法學院的入學通知。</Text>
            <Text style={[styles.introParagraph, { color: theme.textMain }]}>✦ 在這裡，空間與秩序是一門至高無上的魔咒。通過七道神祕的空間試煉後，你將正式覺醒，解鎖屬於你的專屬收納魔法身分！</Text>
            <Text style={[styles.introParagraph, { color: theme.textMain }]}>✦ 準備好拿好你的魔杖，接受這場空間秩序的洗禮了嗎？</Text>
            <View style={[styles.magicDividerLineShort, styles.marginTop15, { backgroundColor: theme.border }]} />
          </View>
          
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => setShowIntro(false)}>
            <Text style={primaryBtnTextStyle}>開啟入學試煉</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- 2. 結果畫面 ---
  if (showResult) {
    const { key, vPercent, dPercent } = getFinalResult();
    const finalIdentity = academyResults[key] || academyResults["豐富_簡易"];

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
          <View style={styles.magicTitleRow}>
            <Icon name="star-sharp" size={16} color={theme.primary} />
            <Text style={[styles.introTitle, { color: theme.textMain }]}> 魔法身分覺醒 </Text>
            <Icon name="star-sharp" size={16} color={theme.primary} />
          </View>
          
          <View style={[styles.resultCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.magicBadgeContainer}>
              <View style={[styles.magicOrbit, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Icon name={finalIdentity.icon} size={38} color={theme.primary} />
              </View>
            </View>

            <Text style={[styles.resultType, { color: theme.primary }]}>{finalIdentity.name}</Text>
            <View style={[styles.magicDividerLine, { backgroundColor: theme.border }]} />
            
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={[styles.statLabel, { color: theme.textMain }]}>{finalIdentity.vLabel}</Text>
                  <Text style={[styles.statValue, { color: theme.primary }]}>{vPercent}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.background }]}>
                  <View style={[styles.progressFill, { width: `${vPercent}%`, backgroundColor: theme.primary }]} />
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={[styles.statLabel, { color: theme.textMain }]}>{finalIdentity.dLabel}</Text>
                  <Text style={[styles.statValue, { color: theme.primary }]}>{dPercent}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.background }]}>
                  <View style={[styles.progressFill, { width: `${dPercent}%`, backgroundColor: theme.primary }]} />
                </View>
              </View>
            </View>

            <View style={[styles.featureBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Icon name="eye-outline" size={18} color={theme.textMain} style={styles.sectionIcon} />
                <Text style={[styles.featureTitle, { color: theme.textMain }]}>核心特徵</Text>
              </View>
              <Text style={[styles.featureDesc, { color: theme.textMain }]}>{finalIdentity.feature}</Text>
            </View>
            
            <View style={styles.sectionHeaderRow}>
              <Icon name="document-text-outline" size={18} color={theme.textMain} style={styles.sectionIcon} />
              <Text style={[styles.attributeSubTitle, { color: theme.textMain }]}>試煉鑑定結果</Text>
            </View>
            <Text style={[styles.resultDesc, { color: theme.textSub }]}>{finalIdentity.desc}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]} 
            onPress={() => handleCompleteQuiz(finalIdentity.name)}
          >
            <Text style={primaryBtnTextStyle}>進入魔法空間</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- 3. 測驗題目畫面 ---
  const currentQuestion = questions[currentIdx];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 頂部進度條與標題 */}
      <View style={styles.header}>
        <Text style={[styles.progressText, { color: theme.textSub }]}>{currentIdx + 1} / {questions.length}</Text>
        <Text style={[styles.qNumber, { color: theme.textMain }]}>試煉 {currentIdx + 1}</Text>
        
        <View style={[styles.topProgressContainer, { backgroundColor: theme.cardBg }]}>
          <View style={[styles.topProgressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.primary }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.quizCard, { backgroundColor: theme.cardBg }]}>
          
          {/* 1. 情境圖保持原本大小尺寸 */}
          {currentQuestion.image && (
            <View style={styles.qImageWrapper}>
              <Image 
                source={currentQuestion.image} 
                style={styles.qImage} 
                resizeMode="cover"
              />
            </View>
          )}

          {/* 2. 題目與選項區域：已將中間一排圖示刪除，整體順暢往上提升 */}
          <View style={styles.cardInnerContent}>
            <Text style={[styles.questionText, { color: theme.textMain }]}>{currentQuestion.question}</Text>
            
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((opt, index) => {
                const isSelected = selectedOptionIdx === index;
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.optionButton, 
                      { backgroundColor: theme.background, borderColor: theme.border },
                      isSelected ? { backgroundColor: theme.primary, borderColor: theme.primary } : null
                    ]} 
                    onPress={() => handleSelectOption(index)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.optionText, 
                      { color: theme.textMain },
                      isSelected ? [styles.selectedOptionText, { color: isDarkMode ? '#1c1816' : '#333' }] : null
                    ]}>
                      {opt.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部按鈕 */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            { backgroundColor: theme.cardBg },
            currentIdx === 0 ? styles.hidden : styles.transparent
          ]} 
          onPress={goToPrev}
          disabled={currentIdx === 0}
        >
          <Text style={[styles.navButtonText, { color: theme.textMain }]}>上一關</Text>
        </TouchableOpacity>
        <View style={styles.navPlaceholder} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 24, justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, flexGrow: 1, justifyContent: 'center' },
  
  magicTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15, marginTop: 10 },
  introTitle: { fontSize: 26, fontWeight: '700', textAlign: 'center', letterSpacing: 1 },
  
  card: { padding: 26, borderRadius: 24, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 35, width: '100%' },
  introParagraph: { fontSize: 16, lineHeight: 28, marginBottom: 18, textAlign: 'justify', letterSpacing: 0.5 },
  magicOrbitSmall: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  magicDividerLineShort: { height: 1, width: '40%', alignSelf: 'center', marginTop: 5, marginBottom: 20 },
  
  primaryBtn: { paddingVertical: 14, paddingHorizontal: 60, borderRadius: 25, elevation: 1 },
  primaryBtnText: { fontSize: 18, fontWeight: '600' },
  
  header: { marginTop: 10, alignItems: 'center', width: '100%', paddingHorizontal: 24, marginBottom: 4 },
  progressText: { fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  qNumber: { fontSize: 24, fontWeight: '700', marginTop: 1 },
  topProgressContainer: { width: '100%', height: 4, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  topProgressBarFill: { height: '100%', borderRadius: 2 },
  
  quizCard: { 
    borderRadius: 22, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 3 },
    overflow: 'hidden', 
  },
  
  // 圖片容器維持原有大小不變
  qImageWrapper: {
    width: '100%',
    aspectRatio: 1.6,
  },
  qImage: {
    width: '100%',
    height: '100%',
  },

  // 刪除裝飾列後，內文頂部 Padding 調至 16px，精準緊接圖片下方
  cardInnerContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },

  questionText: { fontSize: 17, textAlign: 'center', marginBottom: 16, lineHeight: 24, fontWeight: '600', paddingHorizontal: 4 },
  optionsContainer: { width: '100%' },
  
  optionButton: { borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8 },
  optionText: { fontSize: 14, textAlign: 'left', lineHeight: 18 },
  selectedOptionText: { fontWeight: '600' },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginVertical: 8, alignItems: 'center' },
  navButton: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 18 },
  navButtonText: { fontSize: 15, fontWeight: '600' },
  navPlaceholder: { width: 80 },
  
  resultCard: { padding: 24, borderRadius: 24, width: '100%', marginBottom: 25, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10 },
  magicBadgeContainer: { alignItems: 'center', marginVertical: 5 },
  magicOrbit: { width: 74, height: 74, borderRadius: 37, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  resultType: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginTop: 10, letterSpacing: 1.5 },
  magicDividerLine: { height: 1, width: '60%', alignSelf: 'center', marginTop: 15, marginBottom: 20 },
  
  statsContainer: { marginBottom: 24, paddingHorizontal: 4 },
  statRow: { marginBottom: 14 },
  statInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  statLabel: { fontSize: 14, fontWeight: '600' },
  statValue: { fontSize: 14, fontWeight: '700' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  
  featureBox: { borderWidth: 1, padding: 16, borderRadius: 14, marginBottom: 22 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionIcon: { marginRight: 6 },
  featureTitle: { fontSize: 16, fontWeight: '600' },
  featureDesc: { fontSize: 15, lineHeight: 22, textAlign: 'justify' },
  attributeSubTitle: { fontSize: 16, fontWeight: '600' },
  resultDesc: { fontSize: 15, lineHeight: 24, paddingLeft: 4, textAlign: 'justify' },
  
  marginTop15: { marginTop: 15 },
  hidden: { opacity: 0 },
  transparent: { opacity: 1 },
});

export default QuizScreen;