import React from 'react';
import { View, Text, Pressable, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Post, usePostStore } from '../state/postStore';
import { useAuthStore } from '../state/authStore';
import VoiceNotePlayer from './VoiceNotePlayer';
import MusicPlayer from './MusicPlayer';
import RewindButton from './RewindButton';
import ShareToTikTokButton from './ShareToTikTokButton';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onBattlePress?: () => void;
  onSupportPress?: () => void;
}

export default function PostCard({ post, onBattlePress, onSupportPress }: PostCardProps) {
  const { likePost, dislikePost, deletePost } = usePostStore();
  const { user } = useAuthStore();
  const scale = useSharedValue(1);
  
  const timeLeft = formatDistanceToNow(new Date(post.expiresAt), { addSuffix: true });
  const isExpiringSoon = new Date(post.expiresAt).getTime() - Date.now() < 2 * 60 * 60 * 1000; // 2 hours

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLike = () => {
    scale.value = withSpring(1.1, { duration: 150 }, () => {
      scale.value = withSpring(1, { duration: 150 });
    });
    likePost(post.id);
  };

  const handleDislike = () => {
    scale.value = withSpring(0.9, { duration: 150 }, () => {
      scale.value = withSpring(1, { duration: 150 });
    });
    dislikePost(post.id);
  };

  const handleBattle = () => {
    if (post.isInBattle) {
      Alert.alert("Battle in Progress", "This post is already in an active battle! Check the Battles tab to vote.");
      return;
    }
    
    if (post.userId === user?.id) {
      Alert.alert("Your Post", "You cannot challenge your own post to a battle!");
      return;
    }
    
    Alert.alert(
      "Start Battle? ⚔️",
      "Challenge this post to a 24-hour battle. The community will vote and the winner stays visible for 48 hours!",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Battle!", style: "destructive", onPress: onBattlePress }
      ]
    );
  };

  const handleDelete = () => {
    if (post.userId === user?.id) {
      Alert.alert(
        "Delete Post",
        "Are you sure you want to delete this post?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deletePost(post.id) }
        ]
      );
    }
  };

  const renderPostContent = () => (
    <>
        
        {/* Battle Badge - Compact */}
        {post.isInBattle && (
          <View className="absolute top-3 right-3 bg-red-500 px-2 py-1 rounded-full flex-row items-center">
            <Ionicons name="flash" size={12} color="white" />
            <Text className="text-white text-xs font-bold ml-1">LIVE</Text>
          </View>
        )}

        {/* Theme Badge - Minimal */}
        {post.ventTheme && !post.isInBattle && (
          <View className="absolute top-3 right-3 bg-black/30 px-2 py-0.5 rounded-full">
            <Text className="text-white/60 text-xs">
              #{post.ventTheme}
            </Text>
          </View>
        )}

        {/* Username - Minimal */}
        <View className="absolute top-3 left-3 flex-row items-center">
          <View className="w-6 h-6 bg-white/20 rounded-full items-center justify-center mr-1.5">
            <Image
              source={{ uri: 'https://images.composerapi.com/077FDAE4-B84A-4D47-BC07-082F8B373183.jpg' }}
              className="w-4 h-4 rounded-full opacity-80"
              resizeMode="cover"
            />
          </View>
          <Text className="text-white/70 text-xs font-medium">{post.username}</Text>
        </View>

        {/* Main Content - Support for all types */}
        {post.voiceNoteUri ? (
          <View className="items-center px-2">
            <VoiceNotePlayer 
              uri={post.voiceNoteUri} 
              duration={post.voiceNoteDuration || 0}
              className="w-full"
            />
          </View>
        ) : post.musicTrackId ? (
          <View className="px-2">
            <MusicPlayer 
              trackId={post.musicTrackId}
              duration={post.musicDuration || 30}
              trackName="Music Track"
              mood="Vibe"
              color="#A855F7"
              className="w-full mb-3"
            />
            {post.content !== 'Music Post' && (
              <Text 
                className="text-center leading-snug"
                style={{ 
                  color: post.textColor,
                  fontSize: post.fontSize || 16,
                  fontWeight: post.fontWeight || '600',
                  fontStyle: post.fontStyle || 'normal'
                }}
              >
                {post.content}
              </Text>
            )}
          </View>
        ) : post.imageUrl ? (
          <View className="items-center px-2">
            <Image
              source={{ uri: post.imageUrl }}
              className="w-full h-40 rounded-xl"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/10 rounded-xl items-center justify-center">
              <View className="bg-black/30 px-2 py-1 rounded-full">
                <Text className="text-white/80 text-xs">🔒 Privacy Protected</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text 
            className="text-center leading-snug px-2"
            style={{ 
              color: post.textColor,
              fontSize: post.fontSize || 18,
              fontWeight: post.fontWeight || '600',
              fontStyle: post.fontStyle || 'normal'
            }}
          >
            {post.content}
          </Text>
        )}

        {/* Time indicator - Minimal */}
        <View className="absolute bottom-3 left-3">
          <Text className={`text-xs ${isExpiringSoon ? 'text-red-300' : 'text-white/50'}`}>
            {timeLeft.replace('in ', '')}
          </Text>
        </View>

        {/* Delete button - Smaller */}
        {post.userId === user?.id && (
          <Pressable
            onPress={handleDelete}
            className="absolute bottom-3 right-3 w-6 h-6 bg-red-500/70 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={12} color="white" />
          </Pressable>
        )}
    </>
  );

  return (
    <Animated.View
      style={animatedStyle}
      entering={FadeInDown.delay(100).duration(500)}
      className="mx-4 mb-3 rounded-3xl overflow-hidden"
    >
      {/* Post Background - Support for gradients */}
      {post.backgroundColor.startsWith('{') ? (
        <LinearGradient
          colors={JSON.parse(post.backgroundColor).colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-4 min-h-[160px] justify-center"
        >
          {renderPostContent()}
        </LinearGradient>
      ) : (
        <View 
          className="p-4 min-h-[160px] justify-center"
          style={{ backgroundColor: post.backgroundColor }}
        >
          {renderPostContent()}
        </View>
      )}

      {/* Action Bar - Mobile Optimized */}
      <View className="bg-black/30 px-3 py-2 flex-row items-center justify-between">
        
        {/* Reactions - Minimal */}
        <View className="flex-row items-center space-x-4">
          <Pressable
            onPress={handleLike}
            className="flex-row items-center space-x-1"
          >
            <Ionicons 
              name={post.userLiked ? "heart" : "heart-outline"} 
              size={18} 
              color={post.userLiked ? "#10B981" : "#6B7280"} 
            />
            <Text className={`text-sm ${post.userLiked ? 'text-green-400' : 'text-gray-400'}`}>
              {post.likes}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDislike}
            className="flex-row items-center space-x-1"
          >
            <Ionicons 
              name={post.userDisliked ? "thumbs-down" : "thumbs-down-outline"} 
              size={16} 
              color={post.userDisliked ? "#EF4444" : "#6B7280"} 
            />
            <Text className={`text-sm ${post.userDisliked ? 'text-red-400' : 'text-gray-400'}`}>
              {post.dislikes}
            </Text>
          </Pressable>
        </View>

        {/* Action Buttons - Streamlined */}
        <View className="flex-row items-center space-x-4">
          <Pressable
            onPress={onSupportPress}
            className="flex-row items-center space-x-1"
          >
            <Ionicons name="chatbubble-outline" size={16} color="#10B981" />
            <Text className="text-green-400 text-sm">Chat</Text>
          </Pressable>
          
          <Pressable
            onPress={handleBattle}
            disabled={post.isInBattle}
          >
            <Ionicons 
              name="flash" 
              size={18} 
              color={post.isInBattle ? "#F97316" : "#EF4444"} 
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}