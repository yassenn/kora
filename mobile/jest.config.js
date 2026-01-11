module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|@react-navigation|react-navigation-stack|react-native-screens|react-native-reanimated|react-native-gesture-handler|react-native-worklets)',
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/jestSetup.js'],
  testPathIgnorePatterns: ['<rootDir>/__tests__/jestSetup.js'],
};