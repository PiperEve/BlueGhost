// Real music track definitions with asset references
export const musicTracks = [
  { 
    id: 'lofi-chill', 
    name: '🎵 Lo-Fi Chill', 
    mood: 'Relaxed', 
    duration: 30, 
    color: '#10B981',
    file: require('../../assets/music/lofi-chill.wav')
  },
  { 
    id: 'sad-piano', 
    name: '🎹 Melancholy Piano', 
    mood: 'Sad', 
    duration: 25, 
    color: '#6B7280',
    file: require('../../assets/music/sad-piano.wav')
  },
  { 
    id: 'upbeat-synth', 
    name: '🎹 Upbeat Synth', 
    mood: 'Happy', 
    duration: 20, 
    color: '#F59E0B',
    file: require('../../assets/music/upbeat-synth.wav')
  },
  { 
    id: 'dark-ambient', 
    name: '🌙 Dark Ambient', 
    mood: 'Moody', 
    duration: 35, 
    color: '#1F2937',
    file: require('../../assets/music/dark-ambient.wav')
  },
  { 
    id: 'angry-rock', 
    name: '🎸 Angry Rock', 
    mood: 'Frustrated', 
    duration: 15, 
    color: '#EF4444',
    file: require('../../assets/music/angry-rock.wav')
  },
  { 
    id: 'dreamy-synth', 
    name: '✨ Dreamy Synth', 
    mood: 'Ethereal', 
    duration: 40, 
    color: '#8B5CF6',
    file: require('../../assets/music/dreamy-synth.wav')
  },
  { 
    id: 'anxiety-beats', 
    name: '💔 Anxiety Beats', 
    mood: 'Anxious', 
    duration: 22, 
    color: '#EC4899',
    file: require('../../assets/music/anxiety-beats.wav')
  },
  { 
    id: 'peace-nature', 
    name: '🍃 Peaceful Nature', 
    mood: 'Calm', 
    duration: 45, 
    color: '#059669',
    file: require('../../assets/music/peace-nature.wav')
  },
];

export const getMusicTrack = (trackId: string) => {
  return musicTracks.find(track => track.id === trackId);
};