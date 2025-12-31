import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import MatchesListScreen from '../screens/MatchesListScreen';
import CreateMatchScreen from '../screens/CreateMatchScreen';
import MatchDetailsScreen from '../screens/MatchDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MatchesStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="MatchesList" component={MatchesListScreen} options={{ title: 'Matches' }} />
        <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} options={{ title: 'Match Details' }} />
        <Stack.Screen name="CreateMatch" component={CreateMatchScreen} options={{ title: 'Create Match' }}/>
    </Stack.Navigator>
);

const HomeStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
);

const MainTabs = () => (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Matches" component={MatchesStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
);

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);


const AppNavigator = () => {
    // For now, we assume the user is logged in and directly show the main app.
    // In a real app, you would have logic to switch between AuthStack and MainTabs.
    const isSignedIn = true; 

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isSignedIn ? (
                    <Stack.Screen name="Main" component={MainTabs} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

