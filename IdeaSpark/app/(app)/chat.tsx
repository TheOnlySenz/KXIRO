import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Conversation {
  id: string;
  other_user: {
    alias: string;
    roles: string[];
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const SKILL_OPTIONS = [
  { id: 'code', title: '💻 Code', description: 'I can build the technical foundation' },
  { id: 'capital', title: '💰 Capital', description: 'I can provide funding and resources' },
  { id: 'community', title: '👥 Community', description: 'I can help grow the user base' },
  { id: 'design', title: '🎨 Design', description: 'I can create beautiful user experiences' },
  { id: 'marketing', title: '📢 Marketing', description: 'I can help with growth and promotion' },
  { id: 'strategy', title: '🧠 Strategy', description: 'I can help with business planning' },
];

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      // In a real app, you'd fetch conversations from Supabase
      // For now, we'll show a placeholder
      setConversations([]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConnection = () => {
    Alert.alert(
      '🎯 What do you bring?',
      'Help the other person understand how you can contribute:',
      SKILL_OPTIONS.map(skill => ({
        text: skill.title,
        onPress: () => {
          Alert.alert(
            'Connection Request Sent! 🎉',
            `You've indicated you bring: ${skill.title}\n\n${skill.description}\n\nThe other person will be notified and can start a conversation.`,
            [
              {
                text: 'Great!',
                style: 'default',
              },
            ]
          );
        },
      }))
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.conversationHeader}>
        <Text style={styles.alias}>{item.other_user.alias}</Text>
        <Text style={styles.time}>{item.last_message_time}</Text>
      </View>
      
      <View style={styles.roles}>
        {item.other_user.roles.slice(0, 2).map((role, index) => (
          <View key={index} style={styles.roleTag}>
            <Text style={styles.roleText}>
              {role === 'idea_sharer' ? '💡' : 
               role === 'builder' ? '🔨' : 
               role === 'investor' ? '💰' : '🧠'}
            </Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.lastMessage} numberOfLines={2}>
        {item.last_message}
      </Text>
      
      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient.primary} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.gradient.secondary} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Messages</Text>
        <TouchableOpacity style={styles.newButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Start connecting with people by reacting to their ideas!
            </Text>
            
            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: theme.colors.accent }]}
              onPress={handleNewConnection}
            >
              <Text style={styles.connectButtonText}>⚡ Start Connecting</Text>
            </TouchableOpacity>
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
  newButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  listContainer: {
    padding: 20,
  },
  conversationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alias: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
  },
  roles: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  roleTag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  roleText: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unreadBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  connectButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});