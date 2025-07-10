import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore, Post } from '../state/postStore';
import { useAuthStore } from '../state/authStore';
import PostCard from '../components/PostCard';
import LoFiPlayer from '../components/LoFiPlayer';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { posts, getActivePosts, cleanExpiredContent } = usePostStore();
  const { user, signOut } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activePosts, setActivePosts] = useState<Post[]>([]);

  useEffect(() => {
    // Just update active posts, don't clean here to avoid loops
    setActivePosts(getActivePosts());
  }, [posts]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Clean expired content on manual refresh only
    cleanExpiredContent();
    // Small delay to let cleanup complete
    setTimeout(() => {
      setActivePosts(getActivePosts());
      setRefreshing(false);
    }, 100);
  };

  const handleBattlePress = (post: Post) => {
    navigation.navigate('CreateBattle', { originalPost: post });
  };

  const handleSupportPress = (post: Post) => {
    navigation.navigate('TempChat', { 
      postId: post.id, 
      postAuthor: post.username 
    });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard 
      post={item} 
      onBattlePress={() => handleBattlePress(item)}
      onSupportPress={() => handleSupportPress(item)}
    />
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
        The void is empty...
      </Text>
      <Text className="text-gray-400 text-center text-base leading-relaxed">
        No ghosts to show right now.{'\n'}
        Be the first to haunt the feed!
      </Text>
      <Pressable
        onPress={() => navigation.navigate('CreatePost')}
        className="bg-cyan-500 px-6 py-3 rounded-full mt-8"
      >
        <Text className="text-black font-bold">Start Venting</Text>
      </Pressable>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-black">
      
      {/* Header - Modern Mobile */}
      <SafeAreaView className="bg-black">
        <View className="flex-row items-center justify-between px-4 py-2">
          
          {/* Logo - Compact */}
          <View className="flex-row items-center">
            <View className="w-7 h-7 bg-cyan-500/30 rounded-full items-center justify-center mr-2">
              <Image
                source={{ uri: 'https://images.composerapi.com/077FDAE4-B84A-4D47-BC07-082F8B373183.jpg' }}
                className="w-5 h-5 rounded-full"
                resizeMode="cover"
              />
            </View>
            <Text className="text-lg font-bold text-white">Ghost</Text>
          </View>

          {/* User Menu - iOS Style */}
          <View className="flex-row items-center space-x-4">
            <Pressable
              onPress={() => navigation.navigate('Battles')}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="flash" size={20} color="#EF4444" />
            </Pressable>
            
            <Pressable
              onPress={() => navigation.navigate('Profile')}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="person-circle" size={24} color="#06B6D4" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* Feed */}
      <FlatList
        data={activePosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={EmptyState}
      />

      {/* Lo-Fi Player */}
      <LoFiPlayer />

      {/* Floating Action Button - Modern */}
      <Pressable
        onPress={() => navigation.navigate('CreatePost')}
        className="absolute bottom-6 right-4 w-14 h-14 bg-cyan-500 rounded-full items-center justify-center"
        style={{
          shadowColor: '#06B6D4',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={24} color="black" />
      </Pressable>
    </View>
  );
}