import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { usePostStore } from '../state/postStore';
import { useAuthStore } from '../state/authStore';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationManager() {
  const { posts, battles } = usePostStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };

    requestPermissions();
  }, []);

  // Mock notification for when user gets likes
  useEffect(() => {
    if (!user) return;

    const userPosts = posts.filter(p => p.userId === user.id);
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);

    // This would normally track previous like count and notify on increase
    // For demo purposes, we'll just show periodic encouragement
  }, [posts, user]);

  // Mock notification for battle invitations
  useEffect(() => {
    const userInBattles = battles.filter(b => {
      const originalPost = posts.find(p => p.id === b.originalPostId);
      const challengePost = posts.find(p => p.id === b.challengePostId);
      return originalPost?.userId === user?.id || challengePost?.userId === user?.id;
    });

    // Would notify user when their post gets challenged
  }, [battles, posts, user]);

  const sendLocalNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {},
      },
      trigger: null, // Send immediately
    });
  };

  // Sample notifications (would be triggered by real events)
  const showSampleNotifications = () => {
    setTimeout(() => {
      sendLocalNotification(
        '🐰 Someone liked your post!',
        'Your post is resonating with the community!'
      );
    }, 10000); // 10 seconds after app start

    setTimeout(() => {
      sendLocalNotification(
        '⚔️ Battle Challenge!',
        'Someone wants to challenge your post to a battle!'
      );
    }, 30000); // 30 seconds after app start
  };

  useEffect(() => {
    if (user) {
      showSampleNotifications();
    }
  }, [user]);

  return null; // This is a service component with no UI
}