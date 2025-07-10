import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { usePostStore, Post } from '../state/postStore';
import PostCard from '../components/PostCard';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, signOut } = useAuthStore();
  const { posts, getActivePosts } = usePostStore();
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (user) {
      const activePosts = getActivePosts();
      const myPosts = activePosts.filter(p => p.userId === user.id);
      setUserPosts(myPosts);
    }
  }, [posts, user]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your anonymous identity will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard post={item} />
  );

  const EmptyState = () => (
    <Animated.View 
      entering={FadeInDown.duration(800)}
      className="flex-1 justify-center items-center px-8 py-16"
    >
      <View className="w-24 h-24 bg-cyan-500/20 rounded-full items-center justify-center mb-6 p-3 border border-cyan-400/30">
        <Image
          source={{ uri: 'https://images.composerapi.com/077FDAE4-B84A-4D47-BC07-082F8B373183.jpg' }}
          className="w-18 h-18 rounded-full opacity-80"
          resizeMode="cover"
        />
      </View>
      <Text className="text-white text-xl font-semibold text-center mb-2">
        No Active Ghosts
      </Text>
      <Text className="text-gray-400 text-center text-base leading-relaxed">
        Your ghosts will haunt this space.{'\n'}
        They vanish after 24 hours.
      </Text>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-black">
      
      {/* Header */}
      <SafeAreaView className="bg-gray-900 border-b border-gray-800">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
          </Pressable>
          
          <Text className="text-lg font-semibold text-white">Ghost Profile</Text>
          
          <Pressable
            onPress={handleSignOut}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Profile Info */}
      <Animated.View 
        entering={FadeInDown.delay(100).duration(500)}
        className="bg-gray-900 border border-gray-800 mx-4 mt-6 mb-4 rounded-2xl p-6"
      >
        <View className="items-center">
          <View className="w-20 h-20 bg-cyan-500/20 rounded-full items-center justify-center mb-4 p-2 border border-cyan-400/30">
            <Image
              source={{ uri: 'https://images.composerapi.com/077FDAE4-B84A-4D47-BC07-082F8B373183.jpg' }}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
          </View>
          
          <Text className="text-xl font-bold text-white mb-1">
            {user?.name}
          </Text>
          
          <View className="flex-row items-center mb-4">
            <View className="w-3 h-3 bg-cyan-400 rounded-full mr-2" />
            <Text className="text-gray-400 text-sm">Ethereal Identity</Text>
          </View>

          <View className="flex-row space-x-8">
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">{userPosts.length}</Text>
              <Text className="text-gray-400 text-sm">Active Ghosts</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">
                {userPosts.reduce((sum, post) => sum + post.likes, 0)}
              </Text>
              <Text className="text-gray-400 text-sm">Total Likes</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">
                {userPosts.filter(p => p.isInBattle).length}
              </Text>
              <Text className="text-gray-400 text-sm">In Battles</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* User Posts */}
      <Animated.View 
        entering={FadeInDown.delay(200).duration(500)}
        className="flex-1"
      >
        <View className="px-4 mb-4">
          <Text className="text-lg font-semibold text-white">Your Ghosts</Text>
          <Text className="text-gray-400 text-sm">Ghosts automatically vanish after 24 hours</Text>
        </View>

        <FlatList
          data={userPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={EmptyState}
        />
      </Animated.View>

      {/* App Info */}
      <View className="bg-gray-900 border-t border-gray-800 px-4 py-6">
        <View className="items-center">
          <Text className="text-cyan-400 text-sm mb-2">Blue Ghost v1.0</Text>
          <Text className="text-gray-400 text-xs text-center leading-relaxed">
            An ethereal space for anonymous expression{'\n'}
            No archives • No screenshots • No personal data
          </Text>
        </View>
      </View>
    </View>
  );
}