import { Post, usePostStore } from '../state/postStore';
import { generateUniqueId } from './helpers';

const samplePosts: Omit<Post, 'id' | 'createdAt' | 'expiresAt'>[] = [
  {
    userId: 'sample_1',
    username: 'MysticFox47',
    content: "Coffee shops playing music so loud I can't think... is this what peace sounds like to extroverts?",
    backgroundColor: '#1F2937',
    textColor: '#FFFFFF',
    likes: 23,
    dislikes: 2,
    isInBattle: false,
    ventTheme: 'pettyrants',
  },
  {
    userId: 'sample_2',
    username: 'SilentOwl88',
    content: "That moment when you realize you've been muting yourself on video calls even when nobody else is talking",
    backgroundColor: '#10B981',
    textColor: '#FFFFFF',
    likes: 156,
    dislikes: 8,
    isInBattle: false,
    ventTheme: 'worklife',
  },
  {
    userId: 'sample_3',
    username: 'WiseRaven12',
    content: "Why do people say 'money can't buy happiness' and then stress about money all the time?",
    backgroundColor: '#F59E0B',
    textColor: '#000000',
    likes: 89,
    dislikes: 31,
    isInBattle: false,
    ventTheme: 'society',
  },
  {
    userId: 'sample_4',
    username: 'BoldEagle23',
    content: "Social media makes everyone look happy but grocery stores reveal the truth about humanity",
    backgroundColor: '#8B5CF6',
    textColor: '#FFFFFF',
    likes: 67,
    dislikes: 12,
    isInBattle: false,
    ventTheme: 'random',
  },
  {
    userId: 'sample_5',
    username: 'FreeLion91',
    content: "Adults complaining about kids being on phones while they scroll through phones during dinner",
    backgroundColor: '#EC4899',
    textColor: '#FFFFFF',
    likes: 134,
    dislikes: 45,
    isInBattle: false,
    ventTheme: 'frustration',
  },
  {
    userId: 'sample_6',
    username: 'QuietWolf66',
    content: "Voice Note",
    voiceNoteUri: 'mock_voice_note_1',
    voiceNoteDuration: 15,
    backgroundColor: '#06B6D4',
    textColor: '#FFFFFF',
    likes: 45,
    dislikes: 3,
    isInBattle: false,
    ventTheme: 'anxiety',
  },
];

export function addSamplePosts() {
  const { posts, addPost } = usePostStore.getState();

  if (posts.length === 0) {
    const now = Date.now();

    samplePosts.forEach((postData) => {
      addPost({
        ...postData,
        id: generateUniqueId(),
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours from now
      });
    });
  }
}

export default samplePosts;