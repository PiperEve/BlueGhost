import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';

interface LoFiPlayerProps {
  shouldFadeOut?: boolean;
  onFadeComplete?: () => void;
}

export default function LoFiPlayer({ shouldFadeOut = false, onFadeComplete }: LoFiPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const fadeRef = useRef<any>(null);
  
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const vinylStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    // Load a mock lo-fi track (in real app, you'd have actual audio files)
    loadLoFiTrack();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (shouldFadeOut && sound && isPlaying) {
      fadeOutMusic();
    }
  }, [shouldFadeOut]);

  const loadLoFiTrack = async () => {
    try {
      // In a real app, you'd load actual lo-fi tracks
      // For now, we'll simulate the music player UI
      console.log('Lo-fi track loaded (simulated)');
    } catch (error) {
      console.error('Error loading lo-fi track:', error);
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      rotation.value = 0;
      if (sound) {
        await sound.pauseAsync();
      }
    } else {
      // Play
      setIsPlaying(true);
      rotation.value = withRepeat(
        withTiming(360, { duration: 10000 }),
        -1,
        false
      );
      
      // In a real app, you'd start the audio here
      console.log('Lo-fi music playing (simulated)');
    }
  };

  const fadeOutMusic = async () => {
    if (!sound || !isPlaying) return;

    // Fade out audio
    const steps = 20;
    const stepDuration = 1000 / steps; // 1 second total fade
    const volumeStep = volume / steps;

    for (let i = 0; i < steps; i++) {
      const newVolume = volume - (volumeStep * (i + 1));
      await sound.setVolumeAsync(Math.max(0, newVolume));
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    // Stop and reset
    await sound.stopAsync();
    setIsPlaying(false);
    rotation.value = withTiming(0, { duration: 500 });
    
    if (onFadeComplete) {
      onFadeComplete();
    }
  };

  if (!isPlaying) {
    return (
      <Pressable
        onPress={togglePlayback}
        className="absolute top-16 right-4 w-12 h-12 bg-gray-800/80 rounded-full items-center justify-center border border-gray-600"
      >
        <Ionicons name="musical-notes" size={20} color="#06B6D4" />
      </Pressable>
    );
  }

  return (
    <Animated.View 
      style={animatedStyle}
      className="absolute top-16 right-4 items-center"
    >
      {/* Vinyl Record Animation */}
      <Animated.View 
        style={vinylStyle}
        className="w-12 h-12 bg-gray-900 rounded-full border-2 border-cyan-400/30 items-center justify-center mb-2"
      >
        <View className="w-3 h-3 bg-cyan-400 rounded-full" />
        <View className="absolute w-8 h-8 border border-cyan-400/20 rounded-full" />
        <View className="absolute w-6 h-6 border border-cyan-400/20 rounded-full" />
      </Animated.View>

      {/* Now Playing */}
      <View className="bg-gray-800/90 px-3 py-1 rounded-full">
        <Text className="text-cyan-400 text-xs font-medium">Lo-Fi Vibes</Text>
      </View>

      {/* Controls */}
      <View className="flex-row items-center mt-2 space-x-2">
        <Pressable
          onPress={togglePlayback}
          className="w-8 h-8 bg-gray-800/80 rounded-full items-center justify-center"
        >
          <Ionicons name="pause" size={14} color="#06B6D4" />
        </Pressable>
        
        <Pressable
          onPress={() => {
            // Skip track simulation
            console.log('Skipping to next lo-fi track');
          }}
          className="w-8 h-8 bg-gray-800/80 rounded-full items-center justify-center"
        >
          <Ionicons name="play-skip-forward" size={14} color="#06B6D4" />
        </Pressable>
      </View>
    </Animated.View>
  );
}