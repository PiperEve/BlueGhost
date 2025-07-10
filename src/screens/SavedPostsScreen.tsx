import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRewindStore, SavedPost } from '../state/rewindStore';
import PostCard from '../components/PostCard';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SavedPostsScreenProps {
  navigation: any;
}

export default function SavedPostsScreen({ navigation }: SavedPostsScreenProps) {
  const { getSavedPosts, deleteSavedPost, canSaveThisMonth } = useRewindStore();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  useEffect(() => {
    setSavedPosts(getSavedPosts());
  }, []);

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Saved Post?',
      'This will permanently remove this post from your collection.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            deleteSavedPost(postId);
            setSavedPosts(getSavedPosts());
          }
        }
      ]
    );
  };

  const renderPost = ({ item }: { item: SavedPost }) => (
    <View className="relative">
      <PostCard post={item} />
      
      {/* Saved Badge */}
      <View className="absolute top-4 left-4 bg-purple-500 px-3 py-1 rounded-full flex-row items-center">
        <Ionicons name="bookmark" size={16} color="white" />
        <Text className="text-white text-xs font-bold ml-1">SAVED</Text>
      </View>
      
      {/* Delete Button */}
      <Pressable
        onPress={() => handleDeletePost(item.id)}
        className="absolute top-4 right-4 w-8 h-8 bg-red-500/80 rounded-full items-center justify-center"
      >
        <Ionicons name="trash-outline" size={16} color="white" />
      </Pressable>
    </View>
  );

  const EmptyState = () => (
    <Animated.View 
      entering={FadeInDown.duration(800)}
      className="flex-1 justify-center items-center px-8 py-16"
    >
      <View className="w-24 h-24 bg-purple-500/20 rounded-full items-center justify-center mb-6 border border-purple-400/30">
        <Ionicons name="bookmark-outline" size={40} color="#8B5CF6" />
      </View>
      <Text className="text-white text-xl font-semibold text-center mb-2">
        No Saved Ghosts
      </Text>
      <Text className="text-gray-400 text-center text-base leading-relaxed">
        Use the Rewind button on posts you want{'\n'}
        to save from disappearing forever.
      </Text>
      <Text className="text-purple-400 text-center text-sm mt-4">
        {canSaveThisMonth() ? 'You can save 1 post this month' : 'Purchase Rewind to save posts'}
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
          
          <View className="flex-row items-center">
            <Ionicons name="bookmark" size={24} color="#8B5CF6" />
            <Text className="text-lg font-semibold text-white ml-2">Saved Ghosts</Text>
          </View>
          
          <View className="w-10" />
        </View>
      </SafeAreaView>

      {/* Stats */}
      <Animated.View 
        entering={FadeInDown.delay(100).duration(500)}
        className="bg-gray-900 border-b border-gray-800 px-4 py-4"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-lg font-semibold">{savedPosts.length} Saved</Text>
            <Text className="text-gray-400 text-sm">Permanent collection</Text>
          </View>
          <View className="items-end">
            <Text className="text-purple-400 text-sm font-medium">
              {canSaveThisMonth() ? '1 Rewind Available' : 'No Rewinds Left'}
            </Text>
            <Text className="text-gray-400 text-xs">This month</Text>
          </View>
        </View>
      </Animated.View>

      {/* Posts List */}
      <FlatList
        data={savedPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
}