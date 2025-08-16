import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: 'text' | 'system';
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'You connected with Capital! 🎉',
    senderId: 'system',
    senderName: 'System',
    timestamp: new Date(Date.now() - 86400000),
    type: 'system',
  },
  {
    id: '2',
    content: 'Hey! I love your AI meal planning idea. I have experience in food tech and some capital to invest. Would love to discuss this further!',
    senderId: 'other',
    senderName: 'Food Tech Investor',
    timestamp: new Date(Date.now() - 43200000),
    type: 'text',
  },
  {
    id: '3',
    content: 'Hi! Thanks for connecting. I\'d love to hear about your experience in the food tech space. What kind of projects have you worked on before?',
    senderId: 'me',
    senderName: 'You',
    timestamp: new Date(Date.now() - 21600000),
    type: 'text',
  },
  {
    id: '4',
    content: 'I\'ve invested in 3 food tech startups over the past 2 years. Two focused on supply chain optimization, and one on dietary tracking. Your idea about learning taste preferences is really interesting - that\'s where the real personalization happens.',
    senderId: 'other',
    senderName: 'Food Tech Investor',
    timestamp: new Date(Date.now() - 10800000),
    type: 'text',
  },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const otherUser = {
    name: 'Food Tech Investor',
    alias: 'Capital Connector',
    roles: ['investor'],
    isAnonymous: true,
  };

  const ideaContext = {
    headline: 'AI-powered meal planning app that learns your taste preferences and dietary needs',
    yourRole: 'Code',
  };

  useEffect(() => {
    // In a real app, this would establish Supabase Realtime connection
    // For now, simulate receiving a message after a delay
    const timer = setTimeout(() => {
      const newMsg: Message = {
        id: Date.now().toString(),
        content: 'What stage is your project at? Do you have any prototypes or mockups?',
        senderId: 'other',
        senderName: 'Food Tech Investor',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, newMsg]);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: 'me',
      senderName: 'You',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // In a real app, this would send to Supabase
    console.log('Sending message:', message);

    // Simulate typing indicator and response
    setLoading(true);
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: 'That sounds great! I\'d love to see what you have so far. Do you have a deck or any technical specs?',
        senderId: 'other',
        senderName: 'Food Tech Investor',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, response]);
      setLoading(false);
    }, 2000);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }

    const isMe = item.senderId === 'me';
    
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

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
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{otherUser.name}</Text>
            <Text style={styles.userRoles}>
              {otherUser.roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>⋯</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.ideaContext}>
        <View style={styles.contextCard}>
          <Text style={styles.contextTitle}>💡 Connected about:</Text>
          <Text style={styles.contextIdea} numberOfLines={2}>
            {ideaContext.headline}
          </Text>
          <Text style={styles.contextRole}>
            You bring: <Text style={styles.roleHighlight}>{ideaContext.yourRole}</Text>
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        {loading && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{otherUser.name} is typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  userInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userRoles: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  ideaContext: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  contextCard: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  contextTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  contextIdea: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  contextRole: {
    fontSize: 12,
    color: '#666',
  },
  roleHighlight: {
    color: '#667eea',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myText: {
    color: 'white',
  },
  otherText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#999',
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  systemMessageText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  typingIndicator: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});