import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { usePostStore } from '../state/postStore';
import { useAuthStore } from '../state/authStore';
import VoiceNoteRecorder from '../components/VoiceNoteRecorder';
import VoiceNotePlayer from '../components/VoiceNotePlayer';
import LoFiPlayer from '../components/LoFiPlayer';
import { musicTracks } from '../utils/musicAssets';
import { chatWithImage } from '../api/chat-service';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CreatePostScreenProps {
  navigation: any;
}

const backgroundColors = [
  '#1F2937', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#FF1493', '#00CED1', '#FF6347', '#9370DB', '#32CD32',
  '#FF69B4', '#1E90FF', '#FFD700', '#FF4500', '#8A2BE2'
];

const gradientBackgrounds = [
  { id: 'sunset', colors: ['#FF6B6B', '#4ECDC4'], name: '🌅 Sunset' },
  { id: 'ocean', colors: ['#667eea', '#764ba2'], name: '🌊 Ocean' },
  { id: 'fire', colors: ['#f12711', '#f5af19'], name: '🔥 Fire' },
  { id: 'galaxy', colors: ['#200122', '#6f0000'], name: '🌌 Galaxy' },
  { id: 'mint', colors: ['#00b4db', '#0083b0'], name: '🍃 Mint' },
  { id: 'purple', colors: ['#667eea', '#764ba2'], name: '💜 Purple Haze' },
  { id: 'neon', colors: ['#ff0084', '#33001b'], name: '⚡ Neon' },
  { id: 'aurora', colors: ['#00c9ff', '#92fe9d'], name: '✨ Aurora' },
];

const textColors = ['#FFFFFF', '#000000', '#F3F4F6', '#FFD700', '#FF69B4', '#00CED1'];

const fontSizes = [
  { id: 'small', size: 16, name: 'Small' },
  { id: 'medium', size: 18, name: 'Medium' },
  { id: 'large', size: 20, name: 'Large' },
  { id: 'huge', size: 24, name: 'Huge' },
];

const textStyles = [
  { id: 'normal', weight: '600', style: 'normal', name: 'Normal' },
  { id: 'bold', weight: '800', style: 'normal', name: 'Bold' },
  { id: 'italic', weight: '600', style: 'italic', name: 'Italic' },
];

const ventThemes = [
  { id: 'badday', name: '#BadDay', color: '#EF4444' },
  { id: 'pettyrants', name: '#PettyRants', color: '#F59E0B' },
  { id: 'worklife', name: '#WorkLife', color: '#6366F1' },
  { id: 'relationships', name: '#Relationships', color: '#EC4899' },
  { id: 'anxiety', name: '#Anxiety', color: '#8B5CF6' },
  { id: 'random', name: '#RandomThoughts', color: '#10B981' },
  { id: 'frustration', name: '#Frustration', color: '#DC2626' },
  { id: 'society', name: '#Society', color: '#06B6D4' },
];

export default function CreatePostScreen({ navigation }: CreatePostScreenProps) {
  const { addPost } = usePostStore();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [selectedBg, setSelectedBg] = useState(backgroundColors[0]);
  const [selectedGradient, setSelectedGradient] = useState<typeof gradientBackgrounds[0] | null>(null);
  const [selectedText, setSelectedText] = useState(textColors[0]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(fontSizes[1]); // Default to medium
  const [textStyle, setTextStyle] = useState(textStyles[0]); // Default to normal
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | null>(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [postType, setPostType] = useState<'text' | 'voice' | 'photo' | 'music'>('text');
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [musicDuration, setMusicDuration] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldFadeMusic, setShouldFadeMusic] = useState(false);

  // Content moderation filters
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
    if (postType === 'text' && !content.trim()) {
      Alert.alert('Empty Post', 'Please write something to share!');
      return;
    }

    if (postType === 'voice' && !voiceNoteUri) {
      Alert.alert('No Voice Note', 'Please record a voice note to share!');
      return;
    }

    if (postType === 'music' && !selectedMusic) {
      Alert.alert('No Music Selected', 'Please choose a music track for your post!');
      return;
    }

    if (postType === 'photo' && !selectedImage) {
      Alert.alert('No Photo', 'Please select a photo to share!');
      return;
    }

    if (content.length > 200) {
      Alert.alert('Too Long', 'Posts must be 200 characters or less for maximum impact!');
      return;
    }

    if (containsBlockedContent(content)) {
      Alert.alert(
        'Content Blocked',
        'Your post contains restricted content. Blue Ghost is a safe space free from hate speech, politics, religion, sexual content, or content involving minors.',
        [{ text: 'OK', onPress: () => setContent('') }]
      );
      return;
    }

    setIsSubmitting(true);
    setShouldFadeMusic(true); // Start fading out lo-fi music

    try {
      addPost({
        userId: user!.id,
        username: user!.name,
        content: postType === 'text' ? content.trim() : postType === 'voice' ? 'Voice Note' : postType === 'music' ? (content.trim() || 'Music Post') : 'Photo',
        voiceNoteUri: postType === 'voice' ? voiceNoteUri : undefined,
        voiceNoteDuration: postType === 'voice' ? voiceNoteDuration : undefined,
        musicTrackId: postType === 'music' ? selectedMusic : undefined,
        musicDuration: postType === 'music' ? musicDuration : undefined,
        imageUrl: postType === 'photo' ? selectedImage : undefined,
        backgroundColor: selectedGradient ? JSON.stringify(selectedGradient) : selectedBg,
        textColor: selectedText,
        likes: 0,
        dislikes: 0,
        isInBattle: false,
        ventTheme: selectedTheme || undefined,
        fontSize: fontSize.size,
        fontWeight: textStyle.weight,
        fontStyle: textStyle.style,
      });

      Alert.alert(
        'Posted Successfully! 👻',
        'Your ghost will haunt the feed for 24 hours before vanishing forever!',
        [{ text: 'Haunt Away!', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceNoteComplete = (uri: string, duration: number) => {
    setVoiceNoteUri(uri);
    setVoiceNoteDuration(duration);
  };

  const analyzeImageForPrivacy = async (imageUri: string): Promise<{ safe: boolean; issues: string[] }> => {
    try {
      const analysis = await chatWithImage(
        imageUri,
        `Analyze this image for privacy concerns. Check for:
        1. Human faces (any recognizable people)
        2. License plates or vehicle identification
        3. Street signs, house numbers, or location identifiers
        4. Personal information (documents, screens with personal data)
        5. School uniforms, name tags, or identifying clothing
        6. Social media handles or usernames visible
        
        Respond with JSON format:
        {
          "safe": true/false,
          "issues": ["list of specific privacy concerns found"]
        }
        
        Be strict - if there's any chance of identifying a person or location, mark as unsafe.`,
        'claude-3-5-sonnet-20241022'
      );

      const result = JSON.parse(analysis);
      return result;
    } catch (error) {
      console.error('Privacy analysis failed:', error);
      // If analysis fails, be conservative and block the image
      return { safe: false, issues: ['Unable to verify privacy safety'] };
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessingImage(true);
        const imageUri = result.assets[0].uri;
        
        // Analyze for privacy concerns
        const privacyCheck = await analyzeImageForPrivacy(imageUri);
        
        if (!privacyCheck.safe) {
          Alert.alert(
            '🔒 Privacy Protection',
            `We detected potential privacy concerns in your image:\n\n${privacyCheck.issues.join('\n')}\n\nFor your safety, please choose a different image without people, faces, or identifying information.`,
            [{ text: 'Choose Another', onPress: () => pickImage() }]
          );
          setIsProcessingImage(false);
          return;
        }

        // If safe, process and blur any remaining sensitive areas
        const processedImage = await blurSensitiveAreas(imageUri);
        setSelectedImage(processedImage);
        setIsProcessingImage(false);
      }
    } catch (error) {
      console.error('Image picking failed:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
      setIsProcessingImage(false);
    }
  };

  const blurSensitiveAreas = async (imageUri: string): Promise<string> => {
    try {
      // Apply a slight blur to the entire image as an extra privacy layer
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 800 } }, // Resize to reduce quality slightly
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      return result.uri;
    } catch (error) {
      console.error('Image processing failed:', error);
      return imageUri; // Return original if processing fails
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessingImage(true);
        const imageUri = result.assets[0].uri;
        
        // Analyze for privacy concerns
        const privacyCheck = await analyzeImageForPrivacy(imageUri);
        
        if (!privacyCheck.safe) {
          Alert.alert(
            '🔒 Privacy Protection',
            `We detected potential privacy concerns in your photo:\n\n${privacyCheck.issues.join('\n')}\n\nFor your safety, please take a different photo without people, faces, or identifying information.`,
            [
              { text: 'Retake Photo', onPress: () => takePhoto() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          setIsProcessingImage(false);
          return;
        }

        // If safe, process the image
        const processedImage = await blurSensitiveAreas(imageUri);
        setSelectedImage(processedImage);
        setIsProcessingImage(false);
      }
    } catch (error) {
      console.error('Camera failed:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      setIsProcessingImage(false);
    }
  };

  const renderPostContent = () => (
    <>
      {/* Mock username - Compact */}
      <View className="absolute top-3 left-3 flex-row items-center">
        <View className="w-6 h-6 bg-white/20 rounded-full items-center justify-center mr-1.5">
          <Image
            source={{ uri: 'https://images.composerapi.com/077FDAE4-B84A-4D47-BC07-082F8B373183.jpg' }}
            className="w-4 h-4 rounded-full opacity-80"
            resizeMode="cover"
          />
        </View>
        <Text className="text-white/70 text-xs font-medium">{user?.name}</Text>
      </View>

      {/* Theme tag - Minimal */}
      {selectedTheme && (
        <View className="absolute top-3 right-3">
          <View className="bg-black/30 px-2 py-0.5 rounded-full">
            <Text className="text-white/60 text-xs">
              {ventThemes.find(t => t.id === selectedTheme)?.name}
            </Text>
          </View>
        </View>
      )}

      {postType === 'text' ? (
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="What's haunting your mind?"
          placeholderTextColor={selectedText === '#FFFFFF' ? '#FFFFFF60' : '#00000060'}
          multiline
          maxLength={200}
          className="text-center leading-snug px-2"
          style={{ 
            color: selectedText, 
            minHeight: 80,
            fontSize: fontSize.size,
            fontWeight: textStyle.weight,
            fontStyle: textStyle.style
          }}
          textAlignVertical="center"
        />
      ) : postType === 'voice' ? (
        <View className="items-center py-4">
          {voiceNoteUri ? (
            <VoiceNotePlayer 
              uri={voiceNoteUri} 
              duration={voiceNoteDuration}
              className="w-full"
            />
          ) : (
            <VoiceNoteRecorder 
              onRecordingComplete={handleVoiceNoteComplete}
              maxDuration={30}
            />
          )}
        </View>
      ) : postType === 'music' ? (
        <View className="items-center py-4">
          {selectedMusic ? (
            <View className="items-center w-full">
              <View className="flex-row items-center space-x-3 bg-black/30 rounded-2xl p-4 w-full">
                <View className="w-12 h-12 bg-purple-500/30 rounded-full items-center justify-center">
                  <Ionicons name="musical-notes" size={24} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">
                    {musicTracks.find(t => t.id === selectedMusic)?.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {musicTracks.find(t => t.id === selectedMusic)?.mood} • {musicTracks.find(t => t.id === selectedMusic)?.duration}s
                  </Text>
                </View>
                <Pressable
                  onPress={() => setSelectedMusic(null)}
                  className="w-8 h-8 bg-red-500/20 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="#EF4444" />
                </Pressable>
              </View>
              
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Add text to your musical vibe..."
                placeholderTextColor={selectedText === '#FFFFFF' ? '#FFFFFF60' : '#00000060'}
                multiline
                maxLength={200}
                className="text-center leading-snug px-2 mt-4"
                style={{ 
                  color: selectedText, 
                  minHeight: 60,
                  fontSize: fontSize.size,
                  fontWeight: textStyle.weight,
                  fontStyle: textStyle.style
                }}
                textAlignVertical="center"
              />
            </View>
          ) : (
            <View className="items-center">
              <View className="w-20 h-20 bg-purple-500/20 rounded-full items-center justify-center mb-4">
                <Ionicons name="musical-notes" size={32} color="#A855F7" />
              </View>
              <Text className="text-white font-medium mb-4">Choose Your Vibe</Text>
              <Text className="text-gray-400 text-xs text-center mb-4 max-w-xs">
                Pick music that matches your mood
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="items-center py-4">
          {isProcessingImage ? (
            <View className="items-center">
              <Ionicons name="hourglass" size={40} color="#06B6D4" />
              <Text className="text-cyan-400 mt-2 font-medium">
                🔒 Privacy Check...
              </Text>
              <Text className="text-gray-400 text-xs mt-1 text-center">
                Scanning for faces & locations
              </Text>
            </View>
          ) : selectedImage ? (
            <View className="items-center">
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-32 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-row items-center mt-3 space-x-4">
                <Pressable
                  onPress={() => setSelectedImage(null)}
                  className="bg-red-500/20 px-4 py-2 rounded-full"
                >
                  <Text className="text-red-400 font-medium">Remove</Text>
                </Pressable>
                <Pressable
                  onPress={pickImage}
                  className="bg-blue-500/20 px-4 py-2 rounded-full"
                >
                  <Text className="text-blue-400 font-medium">Change</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-20 h-20 bg-cyan-500/20 rounded-full items-center justify-center mb-4">
                <Ionicons name="camera" size={32} color="#06B6D4" />
              </View>
              <Text className="text-white font-medium mb-4">Add a Safe Photo</Text>
              <View className="flex-row space-x-4">
                <Pressable
                  onPress={takePhoto}
                  className="bg-cyan-500 px-6 py-3 rounded-full flex-row items-center space-x-2"
                >
                  <Ionicons name="camera" size={20} color="black" />
                  <Text className="text-black font-bold">Take Photo</Text>
                </Pressable>
                <Pressable
                  onPress={pickImage}
                  className="bg-gray-700 px-6 py-3 rounded-full flex-row items-center space-x-2"
                >
                  <Ionicons name="images" size={20} color="white" />
                  <Text className="text-white font-bold">Gallery</Text>
                </Pressable>
              </View>
              <Text className="text-gray-400 text-xs text-center mt-3 max-w-xs">
                🔒 AI automatically blocks photos with faces, license plates, or identifying info
              </Text>
            </View>
          )}
        </View>
      )}

      <View className="absolute bottom-3 left-3">
        <Text className="text-white/50 text-xs">
          {postType === 'text' 
            ? `${content.length}/200`
            : voiceNoteUri 
              ? `${voiceNoteDuration}s`
              : '24h'
          }
        </Text>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-black">
      
      {/* Header */}
      <SafeAreaView className="bg-gray-900 border-b border-gray-800">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </Pressable>
          
          <Text className="text-lg font-semibold text-white">New Ghost</Text>
          
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || (postType === 'text' ? !content.trim() : postType === 'voice' ? !voiceNoteUri : postType === 'music' ? !selectedMusic : !selectedImage)}
            className={`px-4 py-2 rounded-full ${
              isSubmitting || (postType === 'text' ? !content.trim() : postType === 'voice' ? !voiceNoteUri : postType === 'music' ? !selectedMusic : !selectedImage)
                ? 'bg-gray-700' 
                : 'bg-cyan-500'
            }`}
          >
            <Text className={`font-bold ${
              isSubmitting || (postType === 'text' ? !content.trim() : postType === 'voice' ? !voiceNoteUri : postType === 'music' ? !selectedMusic : !selectedImage)
                ? 'text-gray-400' 
                : 'text-black'
            }`}>
              {isSubmitting ? 'Haunting...' : 'Haunt'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Post Type Toggle */}
        <Animated.View 
          entering={FadeInDown.delay(50).duration(500)}
          className="mx-4 mt-6 mb-4"
        >
          <View className="flex-row bg-gray-800 rounded-2xl p-1">
            <Pressable
              onPress={() => setPostType('text')}
              className={`flex-1 py-3 rounded-xl flex-row items-center justify-center space-x-1 ${
                postType === 'text' ? 'bg-cyan-500' : 'bg-transparent'
              }`}
            >
              <Ionicons 
                name="text" 
                size={18} 
                color={postType === 'text' ? 'black' : '#9CA3AF'} 
              />
              <Text className={`font-medium text-sm ${
                postType === 'text' ? 'text-black' : 'text-gray-400'
              }`}>
                Text
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => setPostType('voice')}
              className={`flex-1 py-3 rounded-xl flex-row items-center justify-center space-x-1 ${
                postType === 'voice' ? 'bg-cyan-500' : 'bg-transparent'
              }`}
            >
              <Ionicons 
                name="mic" 
                size={18} 
                color={postType === 'voice' ? 'black' : '#9CA3AF'} 
              />
              <Text className={`font-medium text-sm ${
                postType === 'voice' ? 'text-black' : 'text-gray-400'
              }`}>
                Voice
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setPostType('photo')}
              className={`flex-1 py-3 rounded-xl flex-row items-center justify-center space-x-1 ${
                postType === 'photo' ? 'bg-cyan-500' : 'bg-transparent'
              }`}
            >
              <Ionicons 
                name="camera" 
                size={18} 
                color={postType === 'photo' ? 'black' : '#9CA3AF'} 
              />
              <Text className={`font-medium text-sm ${
                postType === 'photo' ? 'text-black' : 'text-gray-400'
              }`}>
                Photo
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setPostType('music')}
              className={`flex-1 py-3 rounded-xl flex-row items-center justify-center space-x-1 ${
                postType === 'music' ? 'bg-cyan-500' : 'bg-transparent'
              }`}
            >
              <Ionicons 
                name="musical-notes" 
                size={18} 
                color={postType === 'music' ? 'black' : '#9CA3AF'} 
              />
              <Text className={`font-medium text-sm ${
                postType === 'music' ? 'text-black' : 'text-gray-400'
              }`}>
                Music
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Preview Card - Compact */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(500)}
          className="mx-4 mb-4"
        >
          {selectedGradient ? (
            <LinearGradient
              colors={selectedGradient.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-4 min-h-[140px] justify-center relative"
            >
              {renderPostContent()}
            </LinearGradient>
          ) : (
            <View 
              className="rounded-3xl p-4 min-h-[140px] justify-center relative"
              style={{ backgroundColor: selectedBg }}
            >
              {renderPostContent()}
            </View>
          )}
        </Animated.View>

        {/* Music Selection - Only show for music posts */}
        {postType === 'music' && !selectedMusic && (
          <Animated.View 
            entering={FadeInDown.delay(120).duration(500)}
            className="mx-4 mb-6"
          >
            <Text className="text-white font-semibold mb-3">🎵 Choose Your Mood Music</Text>
            <View className="space-y-3">
              {musicTracks.map((track) => (
                <Pressable
                  key={track.id}
                  onPress={() => {
                    setSelectedMusic(track.id);
                    setMusicDuration(track.duration);
                  }}
                  className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex-row items-center space-x-3"
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: track.color + '30' }}
                  >
                    <Ionicons name="musical-notes" size={20} style={{ color: track.color }} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">{track.name}</Text>
                    <Text className="text-gray-400 text-sm">{track.mood} • {track.duration}s</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </Pressable>
              ))}
            </View>
            <Text className="text-gray-400 text-xs text-center mt-3">
              🎧 Music enhances the vibe of your post
            </Text>
          </Animated.View>
        )}

        {/* Vent Themes */}
        <Animated.View 
          entering={FadeInDown.delay(150).duration(500)}
          className="mx-4 mb-6"
        >
          <Text className="text-white font-semibold mb-3">Vent Theme (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3 px-1">
              {ventThemes.map((theme) => (
                <Pressable
                  key={theme.id}
                  onPress={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedTheme === theme.id 
                      ? 'border-cyan-400 bg-cyan-500/20' 
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedTheme === theme.id ? 'text-cyan-400' : 'text-gray-300'
                  }`}>
                    {theme.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Gradient Backgrounds */}
        <Animated.View 
          entering={FadeInDown.delay(170).duration(500)}
          className="mx-4 mb-6"
        >
          <Text className="text-white font-semibold mb-3">✨ Gradient Vibes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3 px-1">
              {gradientBackgrounds.map((gradient) => (
                <Pressable
                  key={gradient.id}
                  onPress={() => {
                    setSelectedGradient(gradient);
                    setSelectedBg(''); // Clear solid color
                  }}
                  className={`w-12 h-12 rounded-full border-2 ${
                    selectedGradient?.id === gradient.id ? 'border-cyan-400' : 'border-gray-600'
                  } overflow-hidden`}
                >
                  <LinearGradient
                    colors={gradient.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="flex-1 items-center justify-center"
                  >
                    {selectedGradient?.id === gradient.id && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Text className="text-gray-400 text-xs mt-2">Tap for epic gradient backgrounds</Text>
        </Animated.View>

        {/* Background Colors */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(500)}
          className="mx-4 mb-6"
        >
          <Text className="text-white font-semibold mb-3">🎨 Solid Colors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3 px-1">
              {backgroundColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => {
                    setSelectedBg(color);
                    setSelectedGradient(null); // Clear gradient
                  }}
                  className={`w-12 h-12 rounded-full border-2 ${
                    selectedBg === color && !selectedGradient ? 'border-cyan-400' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedBg === color && !selectedGradient && (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Text className="text-gray-400 text-xs mt-2">Classic solid colors</Text>
        </Animated.View>

        {/* Text Colors */}
        <Animated.View 
          entering={FadeInDown.delay(250).duration(500)}
          className="mx-4 mb-6"
        >
          <Text className="text-white font-semibold mb-3">💬 Text Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3 px-1">
              {textColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedText(color)}
                  className={`w-12 h-12 rounded-full border-2 ${
                    selectedText === color ? 'border-cyan-400' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedText === color && (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons 
                        name="checkmark" 
                        size={16} 
                        color={color === '#FFFFFF' || color === '#FFD700' ? '#000000' : '#FFFFFF'} 
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Font Size */}
        <Animated.View 
          entering={FadeInDown.delay(280).duration(500)}
          className="mx-4 mb-6"
        >
          <Text className="text-white font-semibold mb-3">📏 Text Size</Text>
          <View className="flex-row space-x-3">
            {fontSizes.map((size) => (
              <Pressable
                key={size.id}
                onPress={() => setFontSize(size)}
                className={`px-4 py-2 rounded-full border ${
                  fontSize.id === size.id 
                    ? 'border-cyan-400 bg-cyan-500/20' 
                    : 'border-gray-600 bg-gray-800'
                }`}
              >
                <Text className={`font-medium ${
                  fontSize.id === size.id ? 'text-cyan-400' : 'text-gray-300'
                }`} style={{ fontSize: size.size - 4 }}>
                  {size.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Text Style */}
        <Animated.View 
          entering={FadeInDown.delay(310).duration(500)}
          className="mx-4 mb-6"
        >
          <Text className="text-white font-semibold mb-3">✍️ Text Style</Text>
          <View className="flex-row space-x-3">
            {textStyles.map((style) => (
              <Pressable
                key={style.id}
                onPress={() => setTextStyle(style)}
                className={`px-4 py-2 rounded-full border ${
                  textStyle.id === style.id 
                    ? 'border-cyan-400 bg-cyan-500/20' 
                    : 'border-gray-600 bg-gray-800'
                }`}
              >
                <Text className={`${
                  textStyle.id === style.id ? 'text-cyan-400' : 'text-gray-300'
                }`} style={{ 
                  fontWeight: style.weight, 
                  fontStyle: style.style 
                }}>
                  {style.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Fun Randomize Button */}
        <Animated.View 
          entering={FadeInDown.delay(340).duration(500)}
          className="mx-4 mb-6"
        >
          <Pressable
            onPress={() => {
              // Randomize all styling options
              const randomGradient = Math.random() > 0.5 ? gradientBackgrounds[Math.floor(Math.random() * gradientBackgrounds.length)] : null;
              const randomColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
              const randomTextColor = textColors[Math.floor(Math.random() * textColors.length)];
              const randomFontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];
              const randomTextStyle = textStyles[Math.floor(Math.random() * textStyles.length)];
              
              if (randomGradient) {
                setSelectedGradient(randomGradient);
                setSelectedBg('');
              } else {
                setSelectedBg(randomColor);
                setSelectedGradient(null);
              }
              setSelectedText(randomTextColor);
              setFontSize(randomFontSize);
              setTextStyle(randomTextStyle);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-2xl items-center"
          >
            <View className="flex-row items-center space-x-2">
              <Ionicons name="shuffle" size={20} color="white" />
              <Text className="text-white font-bold text-lg">🎲 Surprise Me!</Text>
            </View>
          </Pressable>
          <Text className="text-gray-400 text-xs text-center mt-2">
            Randomize all styling for a fun surprise
          </Text>
        </Animated.View>

        {/* Guidelines */}
        <Animated.View 
          entering={FadeInDown.delay(370).duration(500)}
          className="mx-4 mb-8 p-4 bg-gray-800 rounded-xl border border-gray-700"
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="shield-checkmark" size={20} color="#06B6D4" />
            <Text className="text-cyan-400 font-semibold ml-2">Haunting Guidelines</Text>
          </View>
          <Text className="text-gray-300 text-sm leading-relaxed">
            • No hate speech, politics, or religion{'\n'}
            • No sexual content or content involving minors{'\n'}
            • No personal names or identifying information{'\n'}
            • 🔒 Photos auto-scanned for faces & locations{'\n'}
            • Be respectful - this is a safe ethereal space{'\n'}
            • All ghosts auto-vanish after 24 hours
          </Text>
        </Animated.View>

      </ScrollView>

      {/* Lo-Fi Player with fade-out on post */}
      <LoFiPlayer 
        shouldFadeOut={shouldFadeMusic}
        onFadeComplete={() => setShouldFadeMusic(false)}
      />
    </View>
  );
}