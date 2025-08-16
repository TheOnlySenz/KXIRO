import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface LeaderboardEntry {
  rank: number;
  alias: string;
  score: number;
  role: string;
}

const BADGES: Badge[] = [
  {
    id: 'visionary',
    title: 'Visionary',
    description: 'Posted 5+ ideas',
    icon: '💡',
    unlocked: false,
  },
  {
    id: 'connector',
    title: 'Connector',
    description: 'Made 5+ connections',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'trending',
    title: 'Trending',
    description: 'Had a top weekly idea',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Joined in the first week',
    icon: '🐦',
    unlocked: false,
  },
  {
    id: 'commenter',
    title: 'Commenter',
    description: 'Left 10+ thoughtful comments',
    icon: '💬',
    unlocked: false,
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, alias: 'InnovationKing', score: 1250, role: '💡' },
  { rank: 2, alias: 'StartupGuru', score: 1100, role: '🔨' },
  { rank: 3, alias: 'IdeaMaster', score: 950, role: '💡' },
  { rank: 4, alias: 'TechVisionary', score: 875, role: '🔨' },
  { rank: 5, alias: 'CreativeMind', score: 800, role: '🧠' },
  { rank: 6, alias: 'BuildMaster', score: 750, role: '🔨' },
  { rank: 7, alias: 'IdeaHunter', score: 700, role: '🧠' },
  { rank: 8, alias: 'StartupNinja', score: 650, role: '💡' },
  { rank: 9, alias: 'InnovationPro', score: 600, role: '🔨' },
  { rank: 10, alias: 'CreativePro', score: 550, role: '🧠' },
];

export default function Profile() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    ideasPosted: 0,
    connectionsMade: 0,
    commentsLeft: 0,
    totalReactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (user) {
        // Fetch user profile from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(profile);

        // Fetch user stats
        const { data: ideas } = await supabase
          .from('ideas')
          .select('reactions_count')
          .eq('user_id', user.id);

        const totalReactions = ideas?.reduce((sum, idea) => sum + (idea.reactions_count || 0), 0) || 0;
        
        setUserStats({
          ideasPosted: ideas?.length || 0,
          connectionsMade: Math.floor(Math.random() * 10) + 1, // Placeholder
          commentsLeft: Math.floor(Math.random() * 15) + 1, // Placeholder
          totalReactions,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const getUnlockedBadges = () => {
    const unlocked: Badge[] = [];
    
    if (userStats.ideasPosted >= 5) {
      unlocked.push({ ...BADGES[0], unlocked: true, unlockedAt: new Date().toISOString() });
    }
    
    if (userStats.connectionsMade >= 5) {
      unlocked.push({ ...BADGES[1], unlocked: true, unlockedAt: new Date().toISOString() });
    }
    
    if (userStats.totalReactions >= 50) {
      unlocked.push({ ...BADGES[2], unlocked: true, unlockedAt: new Date().toISOString() });
    }
    
    // Early bird badge (placeholder)
    if (userProfile?.created_at) {
      const joinDate = new Date(userProfile.created_at);
      const now = new Date();
      const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceJoin <= 7) {
        unlocked.push({ ...BADGES[3], unlocked: true, unlockedAt: userProfile.created_at });
      }
    }
    
    if (userStats.commentsLeft >= 10) {
      unlocked.push({ ...BADGES[4], unlocked: true, unlockedAt: new Date().toISOString() });
    }
    
    return unlocked;
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient.primary} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  const unlockedBadges = getUnlockedBadges();

  return (
    <LinearGradient colors={theme.colors.gradient.accent} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>👤 Profile</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.alias?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.alias}>{userProfile?.alias || 'Anonymous User'}</Text>
              <Text style={styles.bio}>{userProfile?.bio || 'No bio yet'}</Text>
              <View style={styles.roles}>
                {userProfile?.roles?.map((role: string, index: number) => (
                  <View key={index} style={styles.roleTag}>
                    <Text style={styles.roleText}>
                      {role === 'idea_sharer' ? '💡 Idea Sharer' : 
                       role === 'builder' ? '🔨 Builder' : 
                       role === 'investor' ? '💰 Investor' : '🧠 Curious Mind'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.ideasPosted}</Text>
              <Text style={styles.statLabel}>Ideas Posted</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.connectionsMade}</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.commentsLeft}</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.totalReactions}</Text>
              <Text style={styles.statLabel}>Reactions</Text>
            </View>
          </View>
        </View>

        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>🏆 Badges</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map((badge) => {
              const isUnlocked = unlockedBadges.some(b => b.id === badge.id);
              return (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    {
                      opacity: isUnlocked ? 1 : 0.5,
                      backgroundColor: isUnlocked ? 'white' : '#f3f4f6',
                    },
                  ]}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={[styles.badgeDescription, { color: theme.colors.textSecondary }]}>
                    {badge.description}
                  </Text>
                  {isUnlocked && (
                    <View style={styles.unlockedIndicator}>
                      <Text style={styles.unlockedText}>✓</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>🏅 Top 10 This Week</Text>
          <View style={styles.leaderboardContainer}>
            {LEADERBOARD.map((entry) => (
              <View key={entry.rank} style={styles.leaderboardRow}>
                <View style={styles.rankContainer}>
                  <Text style={styles.rank}>{entry.rank}</Text>
                </View>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryAlias}>{entry.alias}</Text>
                  <Text style={styles.entryRole}>{entry.role}</Text>
                </View>
                <Text style={styles.entryScore}>{entry.score}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  signOutButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  alias: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 22,
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleTag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  badgesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  unlockedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaderboardSection: {
    marginBottom: 24,
  },
  leaderboardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  entryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  entryAlias: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  entryRole: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  entryScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    opacity: 0.8,
  },
});