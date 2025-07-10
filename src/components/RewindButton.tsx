import React, { useState } from 'react';
import { View, Text, Pressable, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../state/postStore';
import { useRewindStore } from '../state/rewindStore';
import { useAuthStore } from '../state/authStore';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

interface RewindButtonProps {
  post: Post;
  className?: string;
}

export default function RewindButton({ post, className }: RewindButtonProps) {
  const { user } = useAuthStore();
  const { savePost, canSaveThisMonth, purchaseRewind } = useRewindStore();
  const [showPaywall, setShowPaywall] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const handleRewind = async () => {
    if (post.userId === user?.id) {
      Alert.alert("Your Own Post", "You can't rewind your own posts - they're already in your profile!");
      return;
    }

    if (!canSaveThisMonth()) {
      setShowPaywall(true);
      return;
    }

    // Animate the rewind
    scale.value = withSequence(
      withSpring(1.2, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );
    rotation.value = withSequence(
      withSpring(-180, { duration: 300 }),
      withSpring(0, { duration: 300 })
    );

    const success = await savePost(post);
    
    if (success) {
      Alert.alert(
        '⏪ Rewound Successfully!',
        'This ghost has been saved to your private stash. It won\'t disappear with the others.',
        [{ text: 'Nice!', style: 'default' }]
      );
    } else {
      Alert.alert('Error', 'Failed to save post. Please try again.');
    }
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      const success = await purchaseRewind();
      
      if (success) {
        setShowPaywall(false);
        Alert.alert(
          '🎉 Rewind Unlocked!',
          'You can now save one post this month. Use it wisely!',
          [{ text: 'Save This Post', onPress: handleRewind }]
        );
      } else {
        Alert.alert('Payment Failed', 'Please try again or contact support.');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={handleRewind}
        className={`flex-row items-center space-x-1 px-3 py-2 rounded-full bg-purple-500/20 ${className}`}
      >
        <Animated.View style={animatedStyle}>
          <Ionicons name="refresh" size={16} color="#8B5CF6" />
        </Animated.View>
        <Text className="text-purple-400 text-sm font-medium">Rewind</Text>
      </Pressable>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaywall(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
          <View className="bg-gray-900 rounded-3xl p-8 w-full max-w-sm border border-purple-500/30">
            
            {/* Header */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-purple-500/20 rounded-full items-center justify-center mb-4">
                <Ionicons name="refresh" size={32} color="#8B5CF6" />
              </View>
              <Text className="text-2xl font-bold text-white mb-2">Rewind Feature</Text>
              <Text className="text-gray-400 text-center text-sm">
                Save one ghost per month to your private collection
              </Text>
            </View>

            {/* Features */}
            <View className="mb-8 space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-gray-300 ml-3">Save 1 post per month</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-gray-300 ml-3">Private collection only you can see</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-gray-300 ml-3">Never expires or disappears</Text>
              </View>
            </View>

            {/* Price */}
            <View className="bg-purple-500/10 rounded-2xl p-4 mb-6 border border-purple-500/20">
              <Text className="text-center text-3xl font-bold text-purple-400 mb-1">$0.99</Text>
              <Text className="text-center text-gray-400 text-sm">per month</Text>
            </View>

            {/* Buttons */}
            <View className="space-y-3">
              <Pressable
                onPress={handlePurchase}
                disabled={isProcessing}
                className={`py-4 rounded-2xl items-center ${
                  isProcessing ? 'bg-gray-700' : 'bg-purple-500'
                }`}
              >
                <Text className={`font-bold text-lg ${
                  isProcessing ? 'text-gray-400' : 'text-white'
                }`}>
                  {isProcessing ? 'Processing...' : 'Unlock Rewind'}
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => setShowPaywall(false)}
                className="py-3 items-center"
              >
                <Text className="text-gray-400 font-medium">Maybe Later</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}