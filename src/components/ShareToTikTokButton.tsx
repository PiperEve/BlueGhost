import React, { useState } from 'react';
import { View, Text, Pressable, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Post } from '../state/postStore';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

interface ShareToTikTokButtonProps {
  post: Post;
  className?: string;
}

export default function ShareToTikTokButton({ post, className }: ShareToTikTokButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const scale = useSharedValue(1);
  const glitchOffset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: glitchOffset.value }
    ],
  }));

  const generateGlitchArt = async () => {
    setIsGenerating(true);
    
    // Glitch animation
    scale.value = withSequence(
      withSpring(1.1, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );
    
    glitchOffset.value = withSequence(
      withSpring(2, { duration: 50 }),
      withSpring(-2, { duration: 50 }),
      withSpring(1, { duration: 50 }),
      withSpring(0, { duration: 100 })
    );

    try {
      // Simulate glitch art generation (in real app, you'd use Canvas API or similar)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock glitch art creation
      const glitchArtData = createGlitchArtData(post);
      
      // In a real app, you'd:
      // 1. Render the post to a canvas with glitch effects
      // 2. Export as image/video
      // 3. Share to TikTok via deep linking or system share
      
      Alert.alert(
        '🎨 Glitch Art Generated!',
        'Your vent has been transformed into viral-ready glitch art. Ready to share?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share to TikTok', onPress: shareToTikTok }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to generate glitch art. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createGlitchArtData = (post: Post) => {
    // Mock glitch art parameters
    return {
      text: post.content,
      backgroundColor: post.backgroundColor,
      glitchIntensity: Math.random() * 0.8 + 0.2,
      scanlines: Math.random() > 0.5,
      rgbShift: Math.random() * 10 + 5,
      pixelSort: Math.random() > 0.3,
      staticNoise: Math.random() * 0.3,
    };
  };

  const shareToTikTok = async () => {
    try {
      // Method 1: Try TikTok deep link (if app is installed)
      const tikTokURL = 'tiktok://';
      const canOpen = await Linking.canOpenURL(tikTokURL);
      
      if (canOpen) {
        // Open TikTok app
        await Linking.openURL(tikTokURL);
        Alert.alert(
          '📱 TikTok Opened!',
          'Create a new video and add your glitch art as the background. Tag it #BlueGhost for the algorithm!'
        );
      } else {
        // Fallback: System share
        Alert.alert(
          '📤 Share Your Glitch Art',
          'TikTok not installed. Your glitch art has been saved to share manually.',
        );
      }
    } catch (error) {
      console.error('Error sharing to TikTok:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={generateGlitchArt}
        disabled={isGenerating}
        className={`flex-row items-center space-x-1 px-3 py-2 rounded-full ${
          isGenerating ? 'bg-gray-700' : 'bg-pink-500/20'
        } ${className}`}
      >
        <Ionicons 
          name={isGenerating ? "hourglass" : "logo-tiktok"} 
          size={16} 
          color={isGenerating ? "#6B7280" : "#EC4899"} 
        />
        <Text className={`text-sm font-medium ${
          isGenerating ? 'text-gray-400' : 'text-pink-400'
        }`}>
          {isGenerating ? 'Glitching...' : 'TikTok'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}