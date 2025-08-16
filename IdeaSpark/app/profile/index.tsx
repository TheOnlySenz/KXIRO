import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

const BADGES = [
  {
    id: 'visionary',
    title: 'Visionary',
    emoji: '🔮',
    description: '5+ ideas posted',
    unlocked: true,
    progress: 5,
    target: 5,
  },
  {
    id: 'connector',
    title: 'Connector',
    emoji: '🤝',
    description: '5+ connects made',
    unlocked: true,
    progress: 8,
    target: 5,
  },
  {
    id: 'trending',
    title: 'Trending',
    emoji: '📈',
    description: 'Top weekly idea',
    unlocked: false,
    progress: 0,
    target: 1,
  },
  {
    id: 'spark_master',
    title: 'Spark Master',
    emoji: '⚡',
    description: '50+ reactions received',
    unlocked: false,
    progress: 23,
    target: 50,
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Innovation Guru', connects: 156, badge: '👑' },
  { rank: 2, name: 'Code Wizard', connects: 142, badge: '🧙‍♂️' },
  { rank: 3, name: 'AI Pioneer', connects: 138, badge: '🤖' },
  { rank: 4, name: 'You', connects: 47, badge: '🚀' },
  { rank: 5, name: 'Future Builder', connects: 45, badge: '🏗️' },
];

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: 'Creative Builder',
    alias: 'Code Ninja',
    roles: ['builder', 'idea_sharer'],
    isAnonymous: false,
    stats: {
      ideasPosted: 5,
      connectsReceived: 47,
      reactionsReceived: 156,
      weeklyRank: 4,
    },
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace('/auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const renderBadge = (badge: typeof BADGES[0]) => (
    <View
      key={badge.id}
      style={[styles.badgeCard, !badge.unlocked && styles.lockedBadge]}
    >
      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
      <Text style={styles.badgeTitle}>{badge.title}</Text>
      <Text style={styles.badgeDescription}>{badge.description}</Text>
      
      {badge.unlocked ? (
        <View style={styles.unlockedIndicator}>
          <Text style={styles.unlockedText}>Unlocked! ✨</Text>
        </View>
      ) : (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((badge.progress / badge.target) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {badge.progress}/{badge.target}
          </Text>
        </View>
      )}
    </View>
  );

  const renderLeaderboardItem = (item: typeof LEADERBOARD[0]) => (
    <View
      key={item.rank}
      style={[styles.leaderboardItem, item.name === 'You' && styles.currentUserItem]}
    >
      <Text style={styles.rankText}>#{item.rank}</Text>
      <Text style={styles.badgeEmoji}>{item.badge}</Text>
      <Text style={[styles.leaderboardName, item.name === 'You' && styles.currentUserName]}>
        {item.name}
      </Text>
      <Text style={styles.connectsText}>{item.connects} connects</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSignOut}>
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </LinearGradient>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userAlias}>@{user.alias}</Text>
          
          <View style={styles.rolesContainer}>
            {user.roles.map((role) => (
              <View key={role} style={styles.roleTag}>
                <Text style={styles.roleText}>
                  {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Impact ✨</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.stats.ideasPosted}</Text>
              <Text style={styles.statLabel}>Ideas Posted</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.stats.connectsReceived}</Text>
              <Text style={styles.statLabel}>Connects</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.stats.reactionsReceived}</Text>
              <Text style={styles.statLabel}>Reactions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>#{user.stats.weeklyRank}</Text>
              <Text style={styles.statLabel}>Weekly Rank</Text>
            </View>
          </View>
        </View>

        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Badges 🏆</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map(renderBadge)}
          </View>
        </View>

        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>Weekly Leaderboard 🏅</Text>
          <Text style={styles.sectionSubtitle}>Top connectors this week</Text>
          <View style={styles.leaderboardContainer}>
            {LEADERBOARD.map(renderLeaderboardItem)}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userAlias: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  roleTag: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  badgesSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lockedBadge: {
    opacity: 0.6,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  unlockedIndicator: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unlockedText: {
    fontSize: 10,
    color: '#22c55e',
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#dee2e6',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
  },
  leaderboardSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  leaderboardContainer: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  currentUserItem: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    minWidth: 30,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
  currentUserName: {
    color: '#667eea',
    fontWeight: '600',
  },
  connectsText: {
    fontSize: 12,
    color: '#666',
  },
  bottomSpacing: {
    height: 40,
  },
});