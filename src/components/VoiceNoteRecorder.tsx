import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat } from 'react-native-reanimated';

interface VoiceNoteRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  maxDuration?: number; // in seconds
}

export default function VoiceNoteRecorder({ onRecordingComplete, maxDuration = 60 }: VoiceNoteRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  
  const scale = useSharedValue(1);
  const pulseAnimation = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
    opacity: isRecording ? 0.6 : 0,
  }));

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record voice notes.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start pulse animation
      pulseAnimation.value = withRepeat(
        withSpring(1.2, { duration: 800 }),
        -1,
        true
      );

      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      pulseAnimation.value = 1;
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri && recordingDuration >= 1) {
        onRecordingComplete(uri, recordingDuration);
      } else {
        Alert.alert('Too Short', 'Voice note must be at least 1 second long.');
      }

      setRecording(null);
      setRecordingDuration(0);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
        setRecordingDuration(0);
        pulseAnimation.value = 1;
        
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
          recordingTimer.current = null;
        }
      } catch (err) {
        console.error('Failed to cancel recording', err);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="items-center p-4">
      {isRecording && (
        <View className="mb-4">
          <Text className="text-cyan-400 text-lg font-bold text-center">
            Recording... {formatTime(recordingDuration)}/{formatTime(maxDuration)}
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-1">
            Tap to stop, hold cancel to delete
          </Text>
        </View>
      )}

      <View className="relative">
        {/* Pulse ring when recording */}
        <Animated.View
          style={pulseStyle}
          className="absolute inset-0 bg-red-500 rounded-full -m-4"
        />
        
        {/* Main record button */}
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={isRecording ? stopRecording : startRecording}
            onPressIn={() => {
              scale.value = withSpring(0.95);
            }}
            onPressOut={() => {
              scale.value = withSpring(1);
            }}
            className={`w-20 h-20 rounded-full items-center justify-center ${
              isRecording ? 'bg-red-500' : 'bg-cyan-500'
            }`}
            style={{
              shadowColor: isRecording ? '#EF4444' : '#06B6D4',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={32} 
              color={isRecording ? "white" : "black"} 
            />
          </Pressable>
        </Animated.View>
      </View>

      {isRecording && (
        <Pressable
          onPress={cancelRecording}
          className="mt-4 px-6 py-2 bg-gray-800 rounded-full border border-gray-600"
        >
          <Text className="text-gray-300 font-medium">Cancel</Text>
        </Pressable>
      )}

      {!isRecording && (
        <Text className="text-gray-400 text-sm text-center mt-3">
          Tap to record a voice note (max {maxDuration}s)
        </Text>
      )}
    </View>
  );
}