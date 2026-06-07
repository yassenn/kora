import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import MatchesListScreen from '../screens/MatchesListScreen';
import CreateMatchScreen from '../screens/CreateMatchScreen';
import MatchDetailsScreen from '../screens/MatchDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreatePitchScreen from '../screens/CreatePitchScreen';
import PitchesListScreen from '../screens/PitchesListScreen';
import PitchDetailsScreen from '../screens/PitchDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyScreen from '../screens/VerifyScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import InvitationsScreen from '../screens/InvitationsScreen';
import MyPitchesScreen from '../screens/MyPitchesScreen';
import AdminPitchesScreen from '../screens/AdminPitchesScreen';
import AdminSuspiciousScreen from '../screens/AdminSuspiciousScreen';
import FriendsScreen from '../screens/FriendsScreen';
import PlayerSearchScreen from '../screens/PlayerSearchScreen';

import { colors } from '../utils/styles';
import { useAuth } from '../context/AuthContext';
import { Text, View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MatchesStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { elevation: 0, shadowOpacity: 0 }, headerTitleStyle: { fontWeight: '700' } }}>
        <Stack.Screen name="MatchesList" component={MatchesListScreen} options={{ title: 'Find Matches' }} />
        <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} options={{ title: 'Match Details' }} />
        <Stack.Screen name="CreateMatch" component={CreateMatchScreen} options={{ title: 'Create Match' }}/>
    </Stack.Navigator>
);

const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { elevation: 0, shadowOpacity: 0 }, headerTitleStyle: { fontWeight: '700' } }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="Invitations" component={InvitationsScreen} options={{ title: 'Match Invites' }} />
        <Stack.Screen name="Friends" component={FriendsScreen} options={{ title: 'Friends' }} />
        <Stack.Screen name="PlayerSearch" component={PlayerSearchScreen} options={{ title: 'Find Players' }} />
    </Stack.Navigator>
);

const PitchesStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { elevation: 0, shadowOpacity: 0 }, headerTitleStyle: { fontWeight: '700' } }}>
        <Stack.Screen name="PitchesList" component={PitchesListScreen} options={{ title: 'Discover Pitches' }} />
        <Stack.Screen name="PitchDetails" component={PitchDetailsScreen} options={{ title: 'Pitch Details' }} />
    </Stack.Navigator>
);

const ManagementStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { elevation: 0, shadowOpacity: 0 }, headerTitleStyle: { fontWeight: '700' } }}>
        <Stack.Screen name="MyPitches" component={MyPitchesScreen} options={{ title: 'My Pitches' }} />
        <Stack.Screen name="CreatePitch" component={CreatePitchScreen} options={{ title: 'Pitch Setup' }} />
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { elevation: 0, shadowOpacity: 0 }, headerTitleStyle: { fontWeight: '700' } }}>
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Account' }} />
    </Stack.Navigator>
);

const AdminStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { elevation: 0, shadowOpacity: 0 }, headerTitleStyle: { fontWeight: '700' } }}>
        <Stack.Screen name="AdminPitches" component={AdminPitchesScreen} options={{ title: 'Manage Pitches' }} />
        <Stack.Screen name="AdminSuspicious" component={AdminSuspiciousScreen} options={{ title: 'Security Audit' }} />
    </Stack.Navigator>
);

const MainTabs = () => {
    const { user } = useAuth();
    const isOwner = user?.user_type === 'pitch_owner';
    const isAdmin = user?.user_type === 'admin';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let icon;
                    if (route.name === 'HomeTab') icon = '🏠';
                    else if (route.name === 'Matches') icon = '⚽';
                    else if (route.name === 'Pitches') icon = '🏟️';
                    else if (route.name === 'Manage') icon = '⚙️';
                    else if (route.name === 'Admin') icon = '🛡️';
                    else if (route.name === 'ProfileTab') icon = '👤';
                    
                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: size }}>{icon}</Text>
                        </View>
                    );
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.lightGray,
                    height: 90,
                    paddingBottom: 20,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
            <Tab.Screen name="Matches" component={MatchesStack} options={{ title: 'Games' }} />
            <Tab.Screen name="Pitches" component={PitchesStack} options={{ title: 'Venues' }} />
            {isOwner && (
                <Tab.Screen name="Manage" component={ManagementStack} options={{ title: 'Manage' }} />
            )}
            {isAdmin && (
                <Tab.Screen name="Admin" component={AdminStack} options={{ title: 'Admin' }} />
            )}
            <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
};

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Verify" component={VerifyScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <Stack.Screen name="Main" component={MainTabs} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
