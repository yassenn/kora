import React from 'react';
import { StatusBar, useColorScheme, LogBox } from 'react-native';
// Suppress deprecation noise for InteractionManager coming from third-party libs
// (temporary - upgrade navigation / gesture-handler packages to remove this warning)
LogBox.ignoreLogs(['InteractionManager has been deprecated']);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
