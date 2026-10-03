module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@clerk/expo)',
  ],
  moduleNameMapper: {
    '^react-native/setup-env$': '<rootDir>/__tests__/setup-env.mock.js',
    '^test-renderer$': 'react-test-renderer',
  },
  testPathIgnorePatterns: ['<rootDir>/__tests__/setup-env.mock.js'],
};
