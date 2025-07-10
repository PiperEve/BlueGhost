import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface VoiceNotePlayerProps {
  uri: string;
  duration: number;
  className?: string;
}

export default function VoiceNotePlayer({ uri, duration, className }: VoiceNotePlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  
  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async () => {
    try {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentPosition(status.positionMillis / 1000);
      const progressPercent = (status.positionMillis / status.durationMillis) * 100;
      progress.value = withTiming(progressPercent, { duration: 100 });
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentPosition(0);
        progress.value = withTiming(0);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className={`bg-gray-800 rounded-2xl p-4 flex-row items-center space-x-3 ${className}`}>
      
      {/* Play/Pause Button */}
      <Pressable
        onPress={isPlaying ? pauseSound : playSound}
        className="w-12 h-12 bg-cyan-500 rounded-full items-center justify-center"
      >
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={20} 
          color="black" 
        />
      </Pressable>

      {/* Waveform Visual (simplified) */}
      <View className="flex-1">
        <View className="flex-row items-center space-x-1 mb-2">
          {Array.from({ length: 20 }).map((_, index) => (
            <View
              key={index}
              className="bg-gray-600 rounded-full"
              style={{
                width: 3,
                height: Math.random() * 20 + 8, // Random heights for waveform effect
              }}
            />
          ))}
        </View>
        
        {/* Progress Bar */}
        <View className="bg-gray-700 h-1 rounded-full overflow-hidden">
          <Animated.View 
            style={progressStyle}
            className="bg-cyan-400 h-full rounded-full"
          />
        </View>
        
        {/* Time Display */}
        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-400 text-xs">
            {formatTime(currentPosition)}
          </Text>
          <Text className="text-gray-400 text-xs">
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      {/* Voice Note Icon */}
      <View className="w-8 h-8 bg-cyan-500/20 rounded-full items-center justify-center">
        <Ionicons name="mic" size={16} color="#06B6D4" />
      </View>
    </View>
  );
}