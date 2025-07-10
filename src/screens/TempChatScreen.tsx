import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface TempChatScreenProps {
  navigation: any;
  route: {
    params: {
      postId: string;
      postAuthor: string;
    };
  };
}

interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  isOwnMessage: boolean;
}

export default function TempChatScreen({ navigation, route }: TempChatScreenProps) {
  const { postId, postAuthor } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start 5-minute countdown
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          Alert.alert(
            '⏰ Chat Expired',
            'This temporary chat has ended. All messages will now disappear.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Add initial system message
    const systemMessage: Message = {
      id: 'system_1',
      text: `Connected to ${postAuthor}. This chat will auto-delete in 5 minutes.`,
      author: 'System',
      timestamp: new Date(),
      isOwnMessage: false,
    };
    setMessages([systemMessage]);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const sendMessage = () => {
    if (!inputText.trim() || !isActive) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: inputText.trim(),
      author: user!.name,
      timestamp: new Date(),
      isOwnMessage: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate reply (in real app, this would be real-time messaging)
    setTimeout(() => {
      if (Math.random() > 0.3) { // 70% chance of reply
        const replies = [
          "I totally get that feeling",
          "Thanks for sharing, that means a lot",
          "Hope things get better for you",
          "You're not alone in feeling this way",
          "That's really tough, sending support"
        ];
        
        const reply: Message = {
          id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: replies[Math.floor(Math.random() * replies.length)],
          author: postAuthor,
          timestamp: new Date(),
          isOwnMessage: false,
        };
        setMessages(prev => [...prev, reply]);
      }
    }, 2000 + Math.random() * 3000); // 2-5 second delay
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.author === 'System') {
      return (
        <View className="items-center mb-4">
          <View className="bg-gray-700 px-4 py-2 rounded-full">
            <Text className="text-gray-300 text-xs text-center">{item.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <Animated.View 
        entering={FadeInDown.duration(300)}
        className={`mb-3 ${item.isOwnMessage ? 'items-end' : 'items-start'}`}
      >
        <View 
          className={`max-w-xs px-4 py-3 rounded-2xl ${
            item.isOwnMessage 
              ? 'bg-cyan-500 rounded-br-sm' 
              : 'bg-gray-700 rounded-bl-sm'
          }`}
        >
          <Text className={`${
            item.isOwnMessage ? 'text-black' : 'text-white'
          } text-base`}>
            {item.text}
          </Text>
        </View>
        <Text className="text-gray-500 text-xs mt-1 mx-2">
          {item.author} • {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Animated.View>
    );
  };

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
          
          <View className="flex-1 items-center">
            <Text className="text-white font-semibold">Support Chat</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="time" size={16} color="#06B6D4" />
              <Text className={`text-sm ml-1 font-medium ${
                timeLeft < 60 ? 'text-red-400' : 'text-cyan-400'
              }`}>
                {formatTime(timeLeft)}
              </Text>
            </View>
          </View>
          
          <Pressable
            onPress={() => {
              Alert.alert(
                'Leave Chat?',
                'This chat will be permanently deleted if you leave.',
                [
                  { text: 'Stay', style: 'cancel' },
                  { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() }
                ]
              );
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#EF4444" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      {isActive ? (
        <View className="bg-gray-900 border-t border-gray-800 px-4 py-4">
          <View className="flex-row items-center space-x-3">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Send a supportive message..."
              placeholderTextColor="#6B7280"
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-2xl border border-gray-700"
              multiline
              maxLength={200}
            />
            <Pressable
              onPress={sendMessage}
              disabled={!inputText.trim()}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? 'black' : '#6B7280'} 
              />
            </Pressable>
          </View>
          <Text className="text-gray-500 text-xs mt-2 text-center">
            No screenshots • Auto-deletes in {formatTime(timeLeft)}
          </Text>
        </View>
      ) : (
        <View className="bg-gray-900 border-t border-gray-800 px-4 py-6">
          <Text className="text-gray-400 text-center">
            Chat has expired and will now disappear
          </Text>
        </View>
      )}
    </View>
  );
}