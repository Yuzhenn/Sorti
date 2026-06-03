import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

const questions = [
  {
    id: 1,
    question: "精靈遞給你一張通行證，但上面佈滿了灰塵與雜物，你的第一反應是？",
    options: [
      { text: "立刻找抹布擦乾淨，不能忍受髒亂", type: "behavior", label: "高規律傾向" },
      { text: "覺得這張卡片很有復古感，想直接收藏起來", type: "emotion", label: "高度物品依附" },
      { text: "先研究卡片上的地圖與路徑，確定要去哪", type: "logic", label: "邏輯規劃型" },
      { text: "隨手塞進口袋，等一下有空再說", type: "random", label: "隨性型" },
    ],
  },
  {
    id: 2,
    question: "你走出閣樓，發現小鎮的街道上堆滿了閃閃發光的寶石，大家都在撿，你會？",
    options: [
      { text: "既然大家都撿，我也要撿一袋回家留念", type: "emotion", label: "易受影響蓄積" },
      { text: "只挑一顆最漂亮的，其他覺得是累贅", type: "logic", label: "精準決策型" },
      { text: "想拿去賣掉換成錢，不想囤積在身上", type: "behavior", label: "斷捨離傾向" },
      { text: "好奇這些寶石是怎麼排列的，觀察規律", type: "logic", label: "空間邏輯型" },
    ],
  },
  {
    id: 3,
    question: "小精靈帶你來到「記憶雜貨店」，老闆說可以讓你帶走一件遺失的童年玩具，你會...？",
    options: [
      { text: "超感動！立刻抱住它，這輩子都不會再弄丟了", type: "emotion", label: "極高情感依附" },
      { text: "猶豫很久，覺得雖然懷念但家裡好像沒位子放", type: "logic", label: "空間成本意識" },
      { text: "拍張照留念就好，實體物品就留在店裡吧", type: "behavior", label: "數位化管理" },
      { text: "問老闆有沒有更實用的東西可以換", type: "behavior", label: "務實主義" },
    ],
  },
  {
    id: 4,
    question: "午後突然下起一場「落葉雨」，小鎮瞬間變得亂七八糟，你會？",
    options: [
      { text: "覺得亂得很有美感，乾脆在那裡玩耍", type: "random", label: "低整理意願" },
      { text: "趕快拿出掃把，強迫症發作想把它掃成一堆", type: "behavior", label: "高執行力" },
      { text: "思考這堆葉子可以怎麼分類利用，做成肥料或書籤", type: "logic", label: "系統化思維" },
      { text: "先躲進屋子裡，等雨停了請別人來處理", type: "random", label: "逃避整理型" },
    ],
  },
  {
    id: 5,
    question: "你來到一間奇幻旅館，但房間裡只有一個小箱子，要裝進你所有的行李，你會？",
    options: [
      { text: "努力折疊、發揮空間幾何能力把東西塞進去", type: "logic", label: "空間利用技巧" },
      { text: "丟掉一半不重要的東西，只留生活必需品", type: "behavior", label: "果斷斷捨離" },
      { text: "坐在箱子上大哭，覺得箱子太小太殘忍了", type: "emotion", label: "物品優先於空間" },
      { text: "去問老闆能不能再給我一個箱子", type: "random", label: "擴張儲存傾向" },
    ],
  },
  {
    id: 6,
    question: "在小鎮噴泉旁，你遇到一位「未來的自己」，他送你一句箴言，你希望是哪句？",
    options: [
      { text: "「擁有的越少，你的靈魂越自由。」", type: "behavior", label: "極簡主義" },
      { text: "「每一件留下的物品，都要有它專屬的家。」", type: "logic", label: "秩序管理" },
      { text: "「那些充滿回憶的東西，才是你存在的證明。」", type: "emotion", label: "重情重義" },
      { text: "「生活隨性一點，亂一點也沒關係。」", type: "random", label: "自由放任" },
    ],
  },
  {
    id: 7,
    question: "奇幻之旅即將結束，小精靈要送你回現實世界，你最後帶回家的「紀念品」是？",
    options: [
      { text: "一疊整理得整整齊齊的冒險筆記", type: "logic", label: "資訊整合型" },
      { text: "一顆充滿魔法能量、捨不得放手的漂浮球", type: "emotion", label: "感性依附型" },
      { text: "一套效率驚人的魔法清潔工具", type: "behavior", label: "實踐行動型" },
      { text: "空手而回，因為這趟回憶已存在腦海中", type: "behavior", label: "終極斷捨離型" },
    ],
  },
];

// 定義人格結果
const personalityResults: any = {
  behavior: { title: "行動派收納家", desc: "你擁有極強的執行力，看不得一絲雜亂，是朋友眼中的整理達人！" },
  emotion: { title: "感性回憶收藏家", desc: "你非常重視物品背後的感情，每一件留下的東西都是你生命的珍貴片段。" },
  logic: { title: "邏輯規劃策略師", desc: "收納對你而言是一場幾何遊戲，你總能找到最高效率的空間利用方式。" },
  random: { title: "隨性生活藝術家", desc: "你嚮往自由，比起整齊的空間，你更在意生活是否自在舒適。" },
};

const QuizScreen = ({ navigation }: any) => {
  const [showIntro, setShowIntro] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [scores, setScores] = useState<any>({ behavior: 0, emotion: 0, logic: 0, random: 0 });

  const handleSelectOption = (index: number) => {
    setSelectedOptionIdx(index); // 使用 index 紀錄，避免 type 相同造成重複亮起
  };

  const goToNext = () => {
    if (selectedOptionIdx === null) return;

    // 累加分數
    const selectedType = questions[currentIdx].options[selectedOptionIdx].type;
    setScores((prev: any) => ({ ...prev, [selectedType]: prev[selectedType] + 1 }));

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOptionIdx(null); // 重置下一題的選取
    } else {
      setShowResult(true); // 進入結果頁面
    }
  };

  const goToPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setSelectedOptionIdx(null); // 實務上可紀錄舊答案，此處先做重置
    }
  };

  // 計算最高分的人格
  const getTopPersonality = () => {
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  };

  // --- 1. 前言畫面 ---
  if (showIntro) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.centerContent}>
          <Text style={styles.introTitle}>空間入學考</Text>
          <View style={styles.card}>
            <Text style={styles.introText}>
              你緩緩睜開眼，發現自己不在熟悉的臥室，而是躺在一座散發著淡淡香氣的「魔法閣樓」裡。{"\n\n"}
              窗外傳來鈴鐺般的笑聲，一位穿著圍裙的小精靈飛到你面前，驚訝地說：{"\n\n"}
              「哎呀！新來的旅人，要留在這個小鎮，你得先通過我們的 空間入學考 喔！」
            </Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowIntro(false)}>
            <Text style={styles.primaryBtnText}>開始測驗</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- 2. 結果畫面 ---
  if (showResult) {
    const topType = getTopPersonality();
    const result = personalityResults[topType];
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.introTitle}>測驗結果</Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultType}>{result.title}</Text>
            <Text style={styles.resultDesc}>{result.desc}</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.primaryBtnText}>進入系統</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- 3. 測驗題目畫面 ---
  const currentQuestion = questions[currentIdx];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>{currentIdx + 1}/{questions.length}</Text>
        <Text style={styles.qNumber}>Q{currentIdx + 1}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.optionButton, selectedOptionIdx === index ? styles.selectedOption : null]} 
              onPress={() => handleSelectOption(index)}
            >
              <Text style={[styles.optionText, selectedOptionIdx === index ? styles.selectedOptionText : null]}>
                {opt.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.navButton, currentIdx === 0 ? styles.hidden : styles.transparent]} 
          onPress={goToPrev}
          disabled={currentIdx === 0}
        >
          <Text style={styles.navButtonText}>上一題</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, selectedOptionIdx === null ? styles.disabledNav : styles.transparent]} 
          onPress={goToNext}
          disabled={selectedOptionIdx === null}
        >
          <Text style={styles.navButtonText}>
            {currentIdx === questions.length - 1 ? "完成測驗" : "下一題"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfcf0', alignItems: 'center' },
  centerContent: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 30, justifyContent: 'center', flex: 1 },
  introTitle: { fontSize: 32, fontWeight: 'bold', color: '#4a3744', marginBottom: 30 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 3, marginBottom: 40 },
  introText: { fontSize: 18, color: '#555', lineHeight: 28, textAlign: 'center' },
  primaryBtn: { backgroundColor: '#4a3744', paddingVertical: 15, paddingHorizontal: 60, borderRadius: 30, elevation: 2 },
  primaryBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  // 測驗樣式
  header: { marginTop: 40, alignItems: 'center' },
  progressText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  qNumber: { fontSize: 60, fontWeight: 'bold', color: '#333', marginTop: 5 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  questionText: { fontSize: 20, textAlign: 'center', marginBottom: 30, lineHeight: 28, color: '#333' },
  optionsContainer: { width: width - 60 },
  optionButton: { backgroundColor: '#e0e0e0', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  selectedOption: { backgroundColor: '#4a3744' },
  optionText: { fontSize: 16, color: '#333', textAlign: 'center' },
  selectedOptionText: { color: '#fff', fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 40, marginBottom: 50 },
  navButton: { padding: 10 },
  navButtonText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  // 結果樣式
  resultCard: { backgroundColor: '#fff', padding: 40, borderRadius: 20, width: '100%', alignItems: 'center', marginBottom: 40, elevation: 3 },
  resultType: { fontSize: 28, fontWeight: 'bold', color: '#4a3744', marginBottom: 20 },
  resultDesc: { fontSize: 18, color: '#666', textAlign: 'center', lineHeight: 26 },
  hidden: { opacity: 0 },
  transparent: { opacity: 1 },
  disabledNav: { opacity: 0.3 },
});

export default QuizScreen;