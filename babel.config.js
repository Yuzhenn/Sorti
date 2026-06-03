module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ... 其他插件
    'react-native-reanimated/plugin', // 務必確保這一行在最後面！
  ],
};
