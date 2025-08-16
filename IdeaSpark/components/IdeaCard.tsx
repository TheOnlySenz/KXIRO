import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { ColorValue } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Idea {
  id: string;
  headline: string;
  description: string;
  category: string;
  mode: 'public' | 'teaser' | 'private_match';
  user_id: string;
  created_at: string;
  user: {
    alias: string;
    roles: string[];
  };
  reactions_count: number;
  comments_count: number;
  connects_count: number;
}

interface IdeaCardProps {
  idea: Idea;
  onReaction: (ideaId: string, reactionType: 'fire' | 'comment' | 'connect') => void;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function IdeaCard({ idea, onReaction, onSwipe }: IdeaCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const theme = useTheme();
  const panRef = useRef(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const handleReaction = (reactionType: 'fire' | 'comment' | 'connect') => {
    if (reactionType === 'connect') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    onReaction(idea.id, reactionType);
  };

  const getCategoryColor = (category: string): readonly [ColorValue, ColorValue] => {
    const colors: { [key: string]: readonly [ColorValue, ColorValue] } = {
      'AI': ['#10b981', '#059669'] as const,
      'SaaS': ['#3b82f6', '#2563eb'] as const,
      'Health': ['#ef4444', '#dc2626'] as const,
      'Social': ['#8b5cf6', '#7c3aed'] as const,
      'Game': ['#f59e0b', '#d97706'] as const,
      'Fintech': ['#06b6d4', '#0891b2'] as const,
      'Education': ['#84cc16', '#65a30d'] as const,
      'E-commerce': ['#ec4899', '#db2777'] as const,
    };
    return colors[category] || ['#6b7280', '#4b5563'] as const;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <View style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: screenWidth / 2, y: 0 }}
          autoStart={true}
          colors={['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981']}
        />
      )}
      
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX },
              { scale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={getCategoryColor(idea.category)}
          style={styles.categoryTag}
        >
          <Text style={styles.categoryText}>{idea.category}</Text>
        </LinearGradient>

        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.alias}>{idea.user.alias}</Text>
            <View style={styles.roles}>
              {idea.user.roles.slice(0, 2).map((role, index) => (
                <View key={index} style={styles.roleTag}>
                  <Text style={styles.roleText}>
                    {role === 'idea_sharer' ? '💡' : 
                     role === 'builder' ? '🔨' : 
                     role === 'investor' ? '💰' : '🧠'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.timeAgo}>{formatTimeAgo(idea.created_at)}</Text>
        </View>

        <Text style={styles.headline} numberOfLines={2}>
          {idea.headline}
        </Text>

        <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 3}>
          {idea.description}
        </Text>

        {idea.description.length > 120 && (
          <TouchableOpacity
            onPress={() => setShowFullDescription(!showFullDescription)}
            style={styles.readMoreButton}
          >
            <Text style={styles.readMoreText}>
              {showFullDescription ? 'Show less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{idea.reactions_count}</Text>
            <Text style={styles.statLabel}>🔥</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{idea.comments_count}</Text>
            <Text style={styles.statLabel}>💬</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{idea.connects_count}</Text>
            <Text style={styles.statLabel}>⚡</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#fef3c7' }]}
            onPress={() => handleReaction('fire')}
          >
            <Text style={styles.actionButtonText}>🔥 React</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#dbeafe' }]}
            onPress={() => handleReaction('comment')}
          >
            <Text style={styles.actionButtonText}>💬 Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#fce7f3' }]}
            onPress={() => handleReaction('connect')}
          >
            <Text style={styles.actionButtonText}>⚡ Connect</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alias: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  roles: {
    flexDirection: 'row',
  },
  roleTag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  roleText: {
    fontSize: 12,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6b7280',
  },
  headline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 28,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  readMoreText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});