import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../state/authStore';

// Screens
import LoginScreen from '../screens/LoginScreen'; // Import your fog login screen
import HomeScreen from '../screens/HomeScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import BattleScreen from '../screens/BattleScreen';
import CreateBattleScreen from '../screens/CreateBattleScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TempChatScreen from '../screens/TempChatScreen';
import SavedPostsScreen from '../screens/SavedPostsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Replace AuthScreen with LoginScreen */}
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen name="Battles" component={BattleScreen} />
      <Stack.Screen 
        name="CreateBattle" 
        component={CreateBattleScreen}
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen 
        name="TempChat" 
        component={TempChatScreen}
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />
    </Stack.Navigator>
  );
}