import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  'AI', 'SaaS', 'Health', 'Social', 'Game', 'Fintech', 'Education', 'E-commerce',
  'Travel', 'Food', 'Fashion', 'Sports', 'Music', 'Art', 'Tech', 'Other'
];

const MODES = [
  { id: 'public', title: '🌍 Public', description: 'Everyone can see your full idea' },
  { id: 'teaser', title: '🔒 Teaser', description: 'Show first line, rest hidden until connect' },
  { id: 'private_match', title: '🎯 Private Match', description: 'Only visible to matching skill roles' },
];

export default function Post() {
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('public');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const handlePost = async () => {
    if (!headline.trim() || !description.trim() || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (headline.length > 120) {
      Alert.alert('Error', 'Headline must be 120 characters or less');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ideas')
        .insert({
          headline: headline.trim(),
          description: description.trim(),
          category,
          mode,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          reactions_count: 0,
          comments_count: 0,
          connects_count: 0,
        });

      if (error) throw error;

      // Show success with growth hook
      Alert.alert(
        '🎉 Idea Posted Successfully!',
        'Your idea is now live! Want to share it on Twitter?',
        [
          {
            text: 'Tweet This Idea',
            onPress: () => {
              const tweetText = `Just dropped my viral idea on IdeaSpark 🚀\n\n"${headline}"\n\nWanna build it with me? 👀\n\n#IdeaSpark #StartupIdeas`;
              // In a real app, you'd integrate with Twitter API or use a sharing library
              Alert.alert('Tweet Ready!', tweetText);
            },
          },
          {
            text: 'View in Feed',
            onPress: () => router.push('/(app)/feed'),
          },
        ]
      );

      // Reset form
      setHeadline('');
      setDescription('');
      setCategory('');
      setMode('public');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.colors.gradient.primary} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>💡 Share Your Idea</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>What's your brilliant idea?</Text>
            
            <TextInput
              style={[styles.input, styles.headlineInput, { borderColor: theme.colors.border }]}
              placeholder="Your idea in one sentence (max 120 chars)"
              placeholderTextColor={theme.colors.textSecondary}
              value={headline}
              onChangeText={setHeadline}
              maxLength={120}
              multiline
            />
            <Text style={styles.charCount}>{headline.length}/120</Text>

            <Text style={styles.sectionTitle}>Tell us more about it</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput, { borderColor: theme.colors.border }]}
              placeholder="Describe your idea in detail..."
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
            />

            <Text style={styles.sectionTitle}>Choose a category</Text>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: category === cat ? theme.colors.primary : 'transparent',
                      borderColor: category === cat ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: category === cat ? 'white' : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>How visible should your idea be?</Text>
            {MODES.map((modeOption) => (
              <TouchableOpacity
                key={modeOption.id}
                style={[
                  styles.modeCard,
                  {
                    borderColor: mode === modeOption.id ? theme.colors.accent : theme.colors.border,
                    backgroundColor: mode === modeOption.id ? `${theme.colors.accent}10` : 'white',
                  },
                ]}
                onPress={() => setMode(modeOption.id)}
              >
                <View style={styles.modeContent}>
                  <Text style={styles.modeTitle}>{modeOption.title}</Text>
                  <Text style={[styles.modeDescription, { color: theme.colors.textSecondary }]}>
                    {modeOption.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.modeCheckbox,
                    {
                      backgroundColor: mode === modeOption.id ? theme.colors.accent : 'transparent',
                      borderColor: mode === modeOption.id ? theme.colors.accent : theme.colors.border,
                    },
                  ]}
                >
                  {mode === modeOption.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.postButton,
                {
                  backgroundColor: headline.trim() && description.trim() && category ? theme.colors.accent : theme.colors.border,
                },
              ]}
              onPress={handlePost}
              disabled={loading || !headline.trim() || !description.trim() || !category}
            >
              <Text style={styles.postButtonText}>
                {loading ? 'Posting...' : '🚀 Post My Idea'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 20,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  headlineInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
  },
  modeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});