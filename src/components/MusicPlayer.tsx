import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import { musicTracks, getMusicTrack } from '../utils/musicAssets';

interface MusicPlayerProps {
  trackId: string;
  duration: number;
  trackName: string;
  mood: string;
  color: string;
  className?: string;
}

export default function MusicPlayer({ trackId, duration, trackName, mood, color, className }: MusicPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playPauseSound = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
          pulse.value = withTiming(1);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
          pulse.value = withRepeat(withTiming(1.1, { duration: 600 }), -1, true);
        }
      } else {
        // Load and play the actual audio file
        const musicTrack = getMusicTrack(trackId);
        if (musicTrack) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            musicTrack.file,
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          setSound(newSound);
          setIsPlaying(true);
          pulse.value = withRepeat(withTiming(1.1, { duration: 600 }), -1, true);
        } else {
          // Fallback to simulation if track not found
          setIsPlaying(true);
          pulse.value = withRepeat(withTiming(1.1, { duration: 600 }), -1, true);
          
          // Simulate progress as fallback
          const interval = setInterval(() => {
            setCurrentPosition(prev => {
              const newPos = prev + 1;
              const progressPercent = (newPos / duration) * 100;
              progress.value = withTiming(progressPercent, { duration: 100 });
              
              if (newPos >= duration) {
                clearInterval(interval);
                setIsPlaying(false);
                setCurrentPosition(0);
                progress.value = withTiming(0);
                pulse.value = withTiming(1);
              }
              return newPos;
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      // Fallback to visual-only mode on error
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
        pulse.value = withRepeat(withTiming(1.1, { duration: 600 }), -1, true);
      } else {
        pulse.value = withTiming(1);
      }
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
        pulse.value = withTiming(1);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const track = musicTracks.find(t => t.id === trackId);

  return (
    <View className={`bg-black/30 rounded-2xl p-4 flex-row items-center space-x-3 ${className}`}>
      
      {/* Play/Pause Button */}
      <Animated.View style={pulseStyle}>
        <Pressable
          onPress={playPauseSound}
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: color + '40' }}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={20} 
            color={color} 
          />
        </Pressable>
      </Animated.View>

      {/* Track Info */}
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm">
          {track?.name || trackName}
        </Text>
        <Text className="text-gray-400 text-xs">
          {track?.mood || mood} • {formatTime(currentPosition)}/{formatTime(duration)}
        </Text>
        
        {/* Progress Bar */}
        <View className="bg-gray-700 h-1 rounded-full overflow-hidden mt-2">
          <Animated.View 
            style={[progressStyle, { backgroundColor: color }]}
            className="h-full rounded-full"
          />
        </View>
      </View>

      {/* Music Icon */}
      <View 
        className="w-8 h-8 rounded-full items-center justify-center"
        style={{ backgroundColor: color + '20' }}
      >
        <Ionicons name="musical-notes" size={16} style={{ color: color }} />
      </View>
    </View>
  );
}