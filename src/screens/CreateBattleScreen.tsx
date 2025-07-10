import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore, Post } from '../state/postStore';
import { useAuthStore } from '../state/authStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CreateBattleScreenProps {
  navigation: any;
  route: {
    params: {
      originalPost: Post;
    };
  };
}

const backgroundColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const textColors = ['#FFFFFF', '#000000', '#F3F4F6'];

export default function CreateBattleScreen({ navigation, route }: CreateBattleScreenProps) {
  const { originalPost } = route.params;
  const { createBattle } = usePostStore();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [selectedBg, setSelectedBg] = useState(backgroundColors[1]); // Default to red for battle
  const [selectedText, setSelectedText] = useState(textColors[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Content moderation filters (same as CreatePost)
  const blockedWords = [
    'hate', 'kill', 'die', 'murder', 'suicide', 'racist', 'nazi', 'terrorist',
    'sexual', 'porn', 'nude', 'naked', 'sex', 'fuck', 'shit', 'damn',
    'trump', 'biden', 'politics', 'election', 'vote', 'democrat', 'republican',
    'jesus', 'god', 'allah', 'muslim', 'christian', 'jew', 'religion',
    'child', 'kid', 'minor', 'baby', 'teen'
  ];

  const containsBlockedContent = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return blockedWords.some(word => lowerText.includes(word));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Challenge', 'Please write your counter-argument!');
      return;
    }

    if (content.length > 200) {
      Alert.alert('Too Long', 'Battle posts must be 200 characters or less!');
      return;
    }

    if (containsBlockedContent(content)) {
      Alert.alert(
        'Content Blocked',
        'Your challenge contains restricted content. Please keep battles respectful and within community guidelines.',
        [{ text: 'OK', onPress: () => setContent('') }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      createBattle(originalPost.id, {
        userId: user!.id,
        username: user!.name,
        content: content.trim(),
        backgroundColor: selectedBg,
        textColor: selectedText,
        likes: 0,
        dislikes: 0,
        isInBattle: true,
      });

      Alert.alert(
        'Battle Started! ⚔️',
        'Your challenge has been posted! The community now has 24 hours to vote. The winner stays visible for 48 hours.',
        [{ text: 'Watch Battle', onPress: () => navigation.navigate('Battles') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start battle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      
      {/* Header */}
      <SafeAreaView className="bg-white shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#374151" />
          </Pressable>
          
          <View className="flex-row items-center">
            <Ionicons name="flash" size={20} color="#EF4444" />
            <Text className="text-lg font-semibold text-gray-800 ml-2">Start Battle</Text>
          </View>
          
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className={`px-4 py-2 rounded-full ${
              isSubmitting || !content.trim() 
                ? 'bg-gray-200' 
                : 'bg-red-500'
            }`}
          >
            <Text className={`font-medium ${
              isSubmitting || !content.trim() 
                ? 'text-gray-400' 
                : 'text-white'
            }`}>
              {isSubmitting ? 'Starting...' : 'Battle!'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Original Post */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(500)}
          className="mx-4 mt-6 mb-4"
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="shield" size={16} color="#6B7280" />
            <Text className="text-gray-600 font-medium ml-2">Original Post</Text>
          </View>
          
          <View 
            className="rounded-2xl p-6 min-h-[120px] justify-center shadow-sm"
            style={{ backgroundColor: originalPost.backgroundColor }}
          >
            <View className="absolute top-4 left-4 flex-row items-center">
              <View className="w-6 h-6 bg-white/20 rounded-full items-center justify-center mr-2 p-0.5">
                <Image
                  source={{ uri: 'https://images.composerapi.com/077FDAE4-B84A-4D47-BC07-082F8B373183.jpg' }}
                  className="w-5 h-5 rounded-full opacity-80"
                  resizeMode="cover"
                />
              </View>
              <Text className="text-white/80 text-xs font-medium">{originalPost.username}</Text>
            </View>

            <Text 
              className="text-center font-semibold leading-relaxed"
              style={{ color: originalPost.textColor }}
            >
              {originalPost.content}
            </Text>
          </View>
        </Animated.View>

        {/* VS Indicator */}
        <View className="items-center mb-4">
          <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center">
            <Text className="text-white font-bold">VS</Text>
          </View>
        </View>

        {/* Challenge Post Preview */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(500)}
          className="mx-4 mb-4"
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="flash" size={16} color="#EF4444" />
            <Text className="text-red-600 font-medium ml-2">Your Challenge</Text>
          </View>
          
          <View 
            className="rounded-2xl p-6 min-h-[120px] justify-center relative shadow-sm"
            style={{ backgroundColor: selectedBg }}
          >
            <View className="absolute top-4 left-4 flex-row items-center">
              <View className="w-6 h-6 bg-white/20 rounded-full items-center justify-center mr-2 p-0.5">
                <Image
                  source={{ uri: 'https://images.composerapi.com/077FDAE4-B84A-4D47-BC07-082F8B373183.jpg' }}
                  className="w-5 h-5 rounded-full opacity-80"
                  resizeMode="cover"
                />
              </View>
              <Text className="text-white/80 text-xs font-medium">{user?.name}</Text>
            </View>

            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write your counter-argument..."
              placeholderTextColor={selectedText === '#FFFFFF' ? '#FFFFFF80' : '#00000080'}
              multiline
              maxLength={200}
              className="text-center font-semibold leading-relaxed"
              style={{ color: selectedText, fontSize: 18, minHeight: 80 }}
              textAlignVertical="center"
            />

            <View className="absolute bottom-4 left-4">
              <Text className="text-white/60 text-xs">
                {content.length}/200 • Battle lasts 24h
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Background Colors */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(500)}
          className="mx-4 mb-6"
        >
          <Text className="text-gray-700 font-semibold mb-3">Background Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3 px-1">
              {backgroundColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedBg(color)}
                  className={`w-12 h-12 rounded-full border-2 ${
                    selectedBg === color ? 'border-gray-800' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedBg === color && (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons name="checkmark" size={20} color="white" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Text Colors */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(500)}
          className="mx-4 mb-6"
        >
          <Text className="text-gray-700 font-semibold mb-3">Text Color</Text>
          <View className="flex-row space-x-3">
            {textColors.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedText(color)}
                className={`w-12 h-12 rounded-full border-2 ${
                  selectedText === color ? 'border-gray-800' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              >
                {selectedText === color && (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons 
                      name="checkmark" 
                      size={20} 
                      color={color === '#FFFFFF' ? '#000000' : '#FFFFFF'} 
                    />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Battle Rules */}
        <Animated.View 
          entering={FadeInDown.delay(500).duration(500)}
          className="mx-4 mb-8 p-4 bg-red-50 rounded-xl"
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="flash" size={20} color="#EF4444" />
            <Text className="text-red-700 font-semibold ml-2">Battle Rules</Text>
          </View>
          <Text className="text-red-600 text-sm leading-relaxed">
            • Battle lasts exactly 24 hours{'\n'}
            • All users can vote once per battle{'\n'}
            • Winner's post stays visible for 48 hours{'\n'}
            • Loser's post gets deleted immediately{'\n'}
            • Same content guidelines apply
          </Text>
        </Animated.View>

      </ScrollView>
    </View>
  );
}