import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';
import IdeaCard from '../../components/IdeaCard';
import { Ionicons } from '@expo/vector-icons';

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

export default function Feed() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const { user } = useAuth();
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const panRef = useRef(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          user:profiles!ideas_user_id_fkey(alias, roles),
          reactions_count,
          comments_count,
          connects_count
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIdeas();
    setRefreshing(false);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex < ideas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReaction = async (ideaId: string, reactionType: 'fire' | 'comment' | 'connect') => {
    try {
      // Handle different reaction types
      switch (reactionType) {
        case 'fire':
          // Increment reactions count
          break;
        case 'comment':
          // Navigate to comments
          break;
        case 'connect':
          // Show confetti and open DM
          break;
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const renderIdeaCard = ({ item, index }: { item: Idea; index: number }) => {
    if (index < currentIndex) return null;

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              {
                translateX: swipeAnim.interpolate({
                  inputRange: [-screenWidth, 0, screenWidth],
                  outputRange: [-screenWidth, 0, screenWidth],
                }),
              },
            ],
          },
        ]}
      >
        <IdeaCard
          idea={item}
          onReaction={handleReaction}
          onSwipe={handleSwipe}
        />
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient.primary} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading brilliant ideas...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.gradient.primary} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚀 IdeaSpark</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.feedContainer}>
        {ideas.length > 0 ? (
          <FlatList
            data={ideas}
            renderItem={renderIdeaCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            onEndReached={() => {
              // Load more ideas when reaching end
            }}
            onEndReachedThreshold={0.1}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No ideas yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share a brilliant idea!
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  filterButton: {
    padding: 8,
  },
  feedContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  listContainer: {
    padding: 20,
  },
  cardContainer: {
    marginBottom: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});