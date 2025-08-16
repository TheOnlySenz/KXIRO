import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import IdeaCard from '../../components/IdeaCard';
import SwipeableFeed from '../../components/SwipeableFeed';

// Mock data for development
const MOCK_IDEAS = [
  {
    id: '1',
    headline: 'AI-powered meal planning app that learns your taste preferences and dietary needs',
    description: 'Imagine an app that not only suggests meals but actually learns from your feedback, dietary restrictions, and health goals. It would integrate with grocery stores for seamless shopping and meal prep timing.',
    category: 'AI',
    mode: 'public' as const,
    reactions_count: 42,
    comments_count: 12,
    connects_count: 8,
    user_profile: {
      alias: 'Food Tech Dreamer',
      is_anonymous: true,
    },
  },
  {
    id: '2',
    headline: 'Virtual reality workspace for remote teams with haptic feedback collaboration',
    description: 'A VR platform where remote teams can collaborate in shared virtual spaces with haptic feedback gloves. Team members can manipulate 3D objects together, feel textures, and have truly immersive meetings.',
    category: 'SaaS',
    mode: 'teaser' as const,
    reactions_count: 67,
    comments_count: 23,
    connects_count: 15,
    user_profile: {
      alias: 'VR Pioneer',
      is_anonymous: true,
    },
  },
  {
    id: '3',
    headline: 'Blockchain-based carbon credit marketplace for individuals',
    description: 'Connect individuals to verified carbon offset projects through a transparent blockchain marketplace. Users can track their carbon footprint and purchase credits for specific projects.',
    category: 'FinTech',
    mode: 'private_match' as const,
    reactions_count: 89,
    comments_count: 34,
    connects_count: 22,
    user_profile: {
      alias: 'Climate Builder',
      is_anonymous: true,
    },
  },
  {
    id: '4',
    headline: 'Social fitness app that gamifies outdoor exploration with AR treasure hunts',
    description: 'An app that creates AR treasure hunts in your neighborhood, encouraging people to explore while exercising. Players find virtual treasures, complete fitness challenges, and build community.',
    category: 'Health',
    mode: 'public' as const,
    reactions_count: 156,
    comments_count: 45,
    connects_count: 31,
    user_profile: {
      alias: 'Fitness Innovator',
      is_anonymous: true,
    },
  },
];

const CATEGORIES = ['All', 'AI', 'SaaS', 'Health', 'Social', 'Game', 'FinTech', 'EdTech', 'Other'];

interface ConnectModalProps {
  visible: boolean;
  onClose: () => void;
  onConnect: (skill: string) => void;
}

function ConnectModal({ visible, onClose, onConnect }: ConnectModalProps) {
  const skills = ['Code', 'Capital', 'Community', 'Connections', 'Marketing', 'Design'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>What do you bring? ⚡</Text>
          <Text style={styles.modalSubtitle}>Let them know your superpower!</Text>
          
          <View style={styles.skillsGrid}>
            {skills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={styles.skillButton}
                onPress={() => onConnect(skill)}
              >
                <Text style={styles.skillText}>{skill}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function FeedScreen() {
  const [ideas, setIdeas] = useState(MOCK_IDEAS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>(['builder']);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>('list');

  useEffect(() => {
    loadIdeas();
    getCurrentUserProfile();
  }, []);

  const getCurrentUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single();
        
        if (profile?.roles) {
          setCurrentUserRoles(profile.roles);
        }
      }
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
  };

  const loadIdeas = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Supabase
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
    } catch (error) {
      console.log('Error loading ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadIdeas();
    setRefreshing(false);
  }, []);

  const handleReact = async (ideaId: string, type: 'fire' | 'comment' | 'connect') => {
    try {
      // Update local state optimistically
      setIdeas(prev => prev.map(idea => {
        if (idea.id === ideaId) {
          if (type === 'fire') {
            return { ...idea, reactions_count: idea.reactions_count + 1 };
          } else if (type === 'comment') {
            return { ...idea, comments_count: idea.comments_count + 1 };
          }
        }
        return idea;
      }));

      // In a real app, this would sync with Supabase
      console.log(`Reacted to idea ${ideaId} with ${type}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to react to idea');
    }
  };

  const handleConnect = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setConnectModalVisible(true);
  };

  const handleConnectWithSkill = async (skill: string) => {
    if (!selectedIdeaId) return;

    try {
      // Update connect count optimistically
      setIdeas(prev => prev.map(idea => {
        if (idea.id === selectedIdeaId) {
          return { ...idea, connects_count: idea.connects_count + 1 };
        }
        return idea;
      }));

      setConnectModalVisible(false);
      
      // In a real app, this would create a chat and navigate to it
      Alert.alert(
        'Connection Sent! 🎉',
        `You've connected with "${skill}" as your superpower. Check your DMs!`,
        [
          {
            text: 'View Chat',
            onPress: () => router.push(`/chat/mock-chat-id`),
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect');
    }
  };

  const filteredIdeas = selectedCategory === 'All' 
    ? ideas 
    : ideas.filter(idea => idea.category === selectedCategory);

  const renderIdeaCard = ({ item }: { item: typeof ideas[0] }) => (
    <IdeaCard
      idea={item}
      currentUserRoles={currentUserRoles}
      onReact={handleReact}
      onConnect={handleConnect}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'list' ? 'swipe' : 'list')}
          >
            <Text style={styles.viewToggleText}>
              {viewMode === 'list' ? '💫' : '📱'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>IdeaSpark 💡</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.profileButtonText}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.postButton}
              onPress={() => router.push('/post')}
            >
              <Text style={styles.postButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={filteredIdeas}
          keyExtractor={(item) => item.id}
          renderItem={renderIdeaCard}
          contentContainerStyle={styles.feedContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#667eea"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <SwipeableFeed
          ideas={filteredIdeas}
          currentUserRoles={currentUserRoles}
          onReact={handleReact}
          onConnect={handleConnect}
          onSwipeLeft={(ideaId) => console.log('Passed on idea:', ideaId)}
          onSwipeRight={(ideaId) => console.log('Interested in idea:', ideaId)}
          onSwipeTop={(ideaId) => console.log('Super interested in idea:', ideaId)}
        />
      )}

      <ConnectModal
        visible={connectModalVisible}
        onClose={() => setConnectModalVisible(false)}
        onConnect={handleConnectWithSkill}
      />
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
  viewToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggleText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 18,
  },
  postButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedCategoryButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  feedContainer: {
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  skillButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    margin: 4,
  },
  skillText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
});