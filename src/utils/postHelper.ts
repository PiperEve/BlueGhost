// postHelpers.ts
import * as ImageManipulator from 'expo-image-manipulator';

// COLORS
export const backgroundColors = [
  '#000000', '#1C1917', '#1E293B', '#334155', '#4B5563', '#6B7280', '#9CA3AF',
  '#D1D5DB', '#E5E7EB', '#F3F4F6', '#F9FAFB', '#FEF3C7', '#FDE68A', '#FCD34D', 
  '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', '#581C00',
];

export const gradientBackgrounds = [
  { id: 'sunset', colors: ['#ff7e5f', '#feb47b'] },
  { id: 'ocean', colors: ['#00c6ff', '#0072ff'] },
  { id: 'purple', colors: ['#7b2ff7', '#f107a3'] },
  // add more gradients as you want
];

export const textColors = [
  '#FFFFFF', '#FFD700', '#FF4500', '#1E90FF', '#32CD32', '#FF69B4', '#8A2BE2', '#00CED1',
];

export const fontSizes = [
  { id: 'small', name: 'Small', size: 14 },
  { id: 'medium', name: 'Medium', size: 18 },
  { id: 'large', name: 'Large', size: 24 },
];

export const textStyles = [
  { id: 'normal', name: 'Normal', weight: '400', style: 'normal' },
  { id: 'bold', name: 'Bold', weight: '700', style: 'normal' },
  { id: 'italic', name: 'Italic', weight: '400', style: 'italic' },
];

// Optional themes for posts (ventThemes)
export const ventThemes = [
  { id: 'anger', name: 'Anger' },
  { id: 'sadness', name: 'Sadness' },
  { id: 'joy', name: 'Joy' },
  { id: 'love', name: 'Love' },
  // extend as needed
];

// IMAGE UTILS
export const blurSensitiveAreas = async (imageUri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error('Image processing failed:', error);
    return imageUri;
  }
};

// BLOCKED WORDS (content moderation)
export const blockedWords = [
  'hate', 'kill', 'die', 'murder', 'suicide', 'racist', 'nazi', 'terrorist',
  'sexual', 'porn', 'nude', 'naked', 'sex', 'fuck', 'shit', 'damn',
  'trump', 'biden', 'politics', 'election', 'vote', 'democrat', 'republican',
  'jesus', 'god', 'allah', 'muslim', 'christian', 'jew', 'religion',
  'child', 'kid', 'minor', 'baby', 'teen'
];

export const containsBlockedContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return blockedWords.some(word => lowerText.includes(word));
};
// Add other helpers here later, e.g. content moderation filters, validation, etc.