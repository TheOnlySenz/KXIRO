import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';

interface IdeaCardProps {
  idea: {
    id: string;
    headline: string;
    description: string;
    category: string;
    mode: 'public' | 'teaser' | 'private_match';
    reactions_count: number;
    comments_count: number;
    connects_count: number;
    user_profile?: {
      alias?: string;
      username?: string;
      is_anonymous: boolean;
    };
  };
  currentUserRoles?: string[];
  onReact: (ideaId: string, type: 'fire' | 'comment' | 'connect') => void;
  onConnect: (ideaId: string) => void;
}

const CATEGORY_COLORS: { [key: string]: string[] } = {
  AI: ['#667eea', '#764ba2'],
  SaaS: ['#f093fb', '#f5576c'],
  Health: ['#4facfe', '#00f2fe'],
  Social: ['#43e97b', '#38f9d7'],
  Game: ['#fa709a', '#fee140'],
  FinTech: ['#a8edea', '#fed6e3'],
  EdTech: ['#ff9a9e', '#fecfef'],
  Other: ['#c2e9fb', '#a1c4fd'],
};

export default function IdeaCard({ idea, currentUserRoles = [], onReact, onConnect }: IdeaCardProps) {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [reacted, setReacted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const categoryColors = CATEGORY_COLORS[idea.category] || CATEGORY_COLORS.Other;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleReact = (type: 'fire' | 'comment' | 'connect') => {
    if (type === 'fire' && !reacted) {
      setReacted(true);
      handlePress();
    }
    onReact(idea.id, type);
  };

  const handleConnect = () => {
    setShowConfetti(true);
    handlePress();
    onConnect(idea.id);
    
    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const canSeeFullContent = () => {
    if (idea.mode === 'public') return true;
    if (idea.mode === 'teaser') return false;
    if (idea.mode === 'private_match') {
      // Check if current user roles match idea requirements
      // For now, show content to builders and investors
      return currentUserRoles.some(role => ['builder', 'investor'].includes(role));
    }
    return false;
  };

  const getDisplayDescription = () => {
    if (canSeeFullContent()) {
      return idea.description;
    }
    
    if (idea.mode === 'teaser') {
      const firstSentence = idea.description.split('.')[0];
      return `${firstSentence}...`;
    }

    return 'This idea is available for matched roles only. Connect to see more!';
  };

  const getUserDisplay = () => {
    if (idea.user_profile?.is_anonymous || !idea.user_profile?.username) {
      return idea.user_profile?.alias || 'Anonymous Spark';
    }
    return idea.user_profile.username;
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={categoryColors}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{idea.category}</Text>
            </View>
            <View style={styles.modeIndicator}>
              <Text style={styles.modeText}>
                {idea.mode === 'public' ? '🌍' : idea.mode === 'teaser' ? '👀' : '🔒'}
              </Text>
            </View>
          </View>

          <Text style={styles.headline} numberOfLines={2}>
            {idea.headline}
          </Text>

          <Text style={styles.description} numberOfLines={4}>
            {getDisplayDescription()}
          </Text>

          <View style={styles.userInfo}>
            <Text style={styles.userText}>by {getUserDisplay()}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, reacted && styles.reactedButton]}
              onPress={() => handleReact('fire')}
            >
              <Text style={styles.actionEmoji}>🔥</Text>
              <Text style={styles.actionCount}>{idea.reactions_count}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReact('comment')}
            >
              <Text style={styles.actionEmoji}>💬</Text>
              <Text style={styles.actionCount}>{idea.comments_count}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.connectButton]}
              onPress={handleConnect}
            >
              <Text style={styles.actionEmoji}>⚡</Text>
              <Text style={styles.actionCount}>{idea.connects_count}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {showConfetti && (
        <ConfettiCannon
          count={50}
          origin={{ x: -10, y: 0 }}
          explosionSpeed={350}
          fallSpeed={2000}
          fadeOut={true}
          autoStart={true}
          autoStartDelay={0}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 2,
    borderRadius: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  modeIndicator: {
    padding: 4,
  },
  modeText: {
    fontSize: 16,
  },
  headline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 16,
  },
  userText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    justifyContent: 'center',
  },
  reactedButton: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
  },
  connectButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  actionEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
});