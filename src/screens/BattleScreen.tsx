import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore, Battle, Post } from '../state/postStore';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { formatDistanceToNow } from 'date-fns';

interface BattleScreenProps {
  navigation: any;
}

export default function BattleScreen({ navigation }: BattleScreenProps) {
  const { battles, posts, getActiveBattles, voteInBattle } = usePostStore();
  const [activeBattles, setActiveBattles] = useState<Battle[]>([]);

  useEffect(() => {
    setActiveBattles(getActiveBattles());
  }, [battles]);

  const getPostById = (postId: string): Post | undefined => {
    return posts.find(p => p.id === postId);
  };

  const BattleCard = ({ battle }: { battle: Battle }) => {
    const originalPost = getPostById(battle.originalPostId);
    const challengePost = getPostById(battle.challengePostId);
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handleVote = (side: 'original' | 'challenge') => {
      scale.value = withSpring(1.05, { duration: 150 }, () => {
        scale.value = withSpring(1, { duration: 150 });
      });
      voteInBattle(battle.id, side);
    };

    const timeLeft = formatDistanceToNow(new Date(battle.expiresAt), { addSuffix: true });
    const totalVotes = battle.originalVotes + battle.challengeVotes;
    const originalPercent = totalVotes > 0 ? (battle.originalVotes / totalVotes) * 100 : 50;
    const challengePercent = totalVotes > 0 ? (battle.challengeVotes / totalVotes) * 100 : 50;

    if (!originalPost || !challengePost) return null;

    return (
      <Animated.View
        style={animatedStyle}
        entering={FadeInDown.delay(100).duration(500)}
        className="mx-4 mb-6 bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        
        {/* Battle Header */}
        <View className="bg-gradient-to-r from-red-500 to-orange-500 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="flash" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">BATTLE ACTIVE</Text>
            </View>
            <Text className="text-white/80 text-sm">Ends {timeLeft}</Text>
          </View>
          
          {/* Vote Progress */}
          <View className="mt-3">
            <View className="bg-white/20 h-2 rounded-full overflow-hidden">
              <View 
                className="bg-white h-full"
                style={{ width: `${originalPercent}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-white/80 text-xs">{battle.originalVotes} votes</Text>
              <Text className="text-white/80 text-xs">{battle.challengeVotes} votes</Text>
            </View>
          </View>
        </View>

        {/* Battle Posts */}
        <View className="flex-row">
          
          {/* Original Post */}
          <Pressable
            onPress={() => handleVote('original')}
            className="flex-1 border-r border-gray-200"
          >
            <View 
              className="p-4 min-h-[120px] justify-center"
              style={{ backgroundColor: originalPost.backgroundColor }}
            >
              <Text className="text-xs text-white/60 mb-2">ORIGINAL</Text>
              <Text 
                className="text-center font-semibold leading-relaxed"
                style={{ color: originalPost.textColor }}
                numberOfLines={4}
              >
                {originalPost.content}
              </Text>
            </View>
            <View className="p-3 bg-gray-50 items-center">
              <Text className="text-gray-600 text-sm font-medium">
                {battle.originalVotes} votes ({originalPercent.toFixed(0)}%)
              </Text>
            </View>
          </Pressable>

          {/* VS Divider */}
          <View className="w-12 items-center justify-center bg-gray-100">
            <View className="w-8 h-8 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">VS</Text>
            </View>
          </View>

          {/* Challenge Post */}
          <Pressable
            onPress={() => handleVote('challenge')}
            className="flex-1 border-l border-gray-200"
          >
            <View 
              className="p-4 min-h-[120px] justify-center"
              style={{ backgroundColor: challengePost.backgroundColor }}
            >
              <Text className="text-xs text-white/60 mb-2">CHALLENGE</Text>
              <Text 
                className="text-center font-semibold leading-relaxed"
                style={{ color: challengePost.textColor }}
                numberOfLines={4}
              >
                {challengePost.content}
              </Text>
            </View>
            <View className="p-3 bg-gray-50 items-center">
              <Text className="text-gray-600 text-sm font-medium">
                {battle.challengeVotes} votes ({challengePercent.toFixed(0)}%)
              </Text>
            </View>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <Animated.View 
      entering={FadeInDown.duration(800)}
      className="flex-1 justify-center items-center px-8 py-16"
    >
      <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="flash-off" size={40} color="#EF4444" />
      </View>
      <Text className="text-gray-600 text-xl font-semibold text-center mb-2">
        No Active Battles
      </Text>
      <Text className="text-gray-400 text-center text-base leading-relaxed">
        When someone challenges a post to a battle,{'\n'}
        it will appear here for voting!
      </Text>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      
      {/* Header */}
      <SafeAreaView className="bg-white shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          
          <View className="flex-row items-center">
            <Ionicons name="flash" size={24} color="#EF4444" />
            <Text className="text-lg font-semibold text-gray-800 ml-2">Active Battles</Text>
          </View>
          
          <View className="w-10" />
        </View>
      </SafeAreaView>

      {/* Battle List */}
      <FlatList
        data={activeBattles}
        renderItem={({ item }) => <BattleCard battle={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        ListEmptyComponent={EmptyState}
      />

      {/* Info Footer */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <Text className="text-gray-600 text-center text-sm">
          Vote for your favorite! Winners stay visible for 48 hours.
        </Text>
      </View>
    </View>
  );
}