import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const CATEGORIES = ['AI', 'SaaS', 'Health', 'Social', 'Game', 'FinTech', 'EdTech', 'Other'];
const MODES = [
  {
    id: 'public',
    title: 'Public',
    emoji: '🌍',
    description: 'Everyone can see your full idea',
  },
  {
    id: 'teaser',
    title: 'Teaser',
    emoji: '👀',
    description: 'Show preview, full content on connect',
  },
  {
    id: 'private_match',
    title: 'Private Match',
    emoji: '🔒',
    description: 'Only visible to matching skill roles',
  },
];

export default function PostIdeaScreen() {
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMode, setSelectedMode] = useState('public');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!headline.trim()) {
      Alert.alert('Error', 'Please enter a headline');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (headline.length > 120) {
      Alert.alert('Error', 'Headline must be 120 characters or less');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      Alert.alert(
        'Idea Posted! 🎉',
        'Your idea is now live and sparking connections!',
        [
          {
            text: 'Share on Twitter',
            onPress: () => {
              // Simulate Twitter sharing
              Alert.alert(
                'Tweet This! 🐦',
                `Just dropped my viral idea on IdeaSpark 🚀\nWanna build it with me? 👀\n\n"${headline}"\n\n[idea link]`
              );
            },
          },
          {
            text: 'View Feed',
            onPress: () => router.replace('/feed'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = 120 - headline.length;

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
          <Text style={styles.headerTitle}>Share Your Idea</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Headline ✨</Text>
            <Text style={styles.sectionSubtitle}>
              Make it catchy! ({remainingChars} chars left)
            </Text>
            <TextInput
              style={[
                styles.headlineInput,
                remainingChars < 0 && styles.errorInput,
              ]}
              placeholder="AI-powered app that revolutionizes..."
              placeholderTextColor="#999"
              value={headline}
              onChangeText={setHeadline}
              maxLength={150} // Allow a bit over for warning
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description 📝</Text>
            <Text style={styles.sectionSubtitle}>
              Tell us more about your vision
            </Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe your idea in detail. What problem does it solve? How would it work? What makes it special?"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category 🏷️</Text>
            <Text style={styles.sectionSubtitle}>
              Help people find your idea
            </Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.selectedCategoryButton,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.selectedCategoryButtonText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visibility Mode 👁️</Text>
            <Text style={styles.sectionSubtitle}>
              Choose how others see your idea
            </Text>
            <View style={styles.modesContainer}>
              {MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    selectedMode === mode.id && styles.selectedModeCard,
                  ]}
                  onPress={() => setSelectedMode(mode.id)}
                >
                  <View style={styles.modeHeader}>
                    <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                    <Text
                      style={[
                        styles.modeTitle,
                        selectedMode === mode.id && styles.selectedModeTitle,
                      ]}
                    >
                      {mode.title}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.modeDescription,
                      selectedMode === mode.id && styles.selectedModeDescription,
                    ]}
                  >
                    {mode.description}
                  </Text>
                  {selectedMode === mode.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.postButton,
              (!headline.trim() || !description.trim() || !selectedCategory || remainingChars < 0) &&
                styles.disabledButton,
            ]}
            onPress={handlePost}
            disabled={
              loading ||
              !headline.trim() ||
              !description.trim() ||
              !selectedCategory ||
              remainingChars < 0
            }
          >
            <Text style={styles.postButtonText}>
              {loading ? 'Posting...' : 'Share Idea 🚀'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  headlineInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#dc3545',
  },
  descriptionInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 120,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 2,
  },
  selectedCategoryButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  modesContainer: {
    gap: 12,
  },
  modeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    position: 'relative',
  },
  selectedModeCard: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedModeTitle: {
    color: '#667eea',
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  selectedModeDescription: {
    color: '#5a67d8',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#667eea',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 40,
  },
});