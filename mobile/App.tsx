import React from 'react';
import { StatusBar, useColorScheme, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { FeedbackProvider } from './src/context/FeedbackContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <FeedbackProvider>
          <View style={{ flex: 1 }}>
            <AppNavigator />
            <View 
              pointerEvents="none" 
              style={{ 
                position: 'absolute', 
                bottom: 2, 
                left: 0, 
                right: 0, 
                alignItems: 'center', 
                zIndex: 9999 
              }}
            >
              <Text style={{ color: '#8E8E93', fontSize: 10, opacity: 0.6 }}>
                v0.0.1-schedule-grid-fix
              </Text>
            </View>
          </View>
        </FeedbackProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
