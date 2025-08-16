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
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../contexts/AuthContext';

const ROLES = [
  { id: 'idea_sharer', title: '💡 Idea Sharer', description: 'Share your startup ideas and get feedback' },
  { id: 'builder', title: '🔨 Builder', description: 'Help bring ideas to life with your skills' },
  { id: 'investor', title: '💰 Investor', description: 'Discover and invest in promising ideas' },
  { id: 'curious_mind', title: '🧠 Curious Mind', description: 'Explore and learn from innovative ideas' },
];

export default function Onboarding() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [alias, setAlias] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const generateAlias = () => {
    const adjectives = ['Swift', 'Bright', 'Creative', 'Dynamic', 'Innovative', 'Bold', 'Clever', 'Sharp'];
    const nouns = ['Thinker', 'Creator', 'Visionary', 'Builder', 'Explorer', 'Pioneer', 'Dreamer', 'Maker'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    setAlias(`${randomAdjective}${randomNoun}${randomNumber}`);
  };

  const handleComplete = async () => {
    if (selectedRoles.length === 0) {
      Alert.alert('Error', 'Please select at least one role');
      return;
    }

    if (!alias.trim()) {
      Alert.alert('Error', 'Please enter an alias');
      return;
    }

    setLoading(true);
    try {
      // Create or update user profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          alias: alias.trim(),
          bio: bio.trim(),
          roles: selectedRoles,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Show success and redirect to feed
      Alert.alert(
        'Welcome to IdeaSpark! 🎉',
        'Your profile has been created. Ready to share your first idea?',
        [
          {
            text: 'Share My First Idea',
            onPress: () => router.replace('/(app)/post'),
          },
          {
            text: 'Explore Feed',
            onPress: () => router.replace('/(app)/feed'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.colors.gradient.accent} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>🎯 Tell us about yourself</Text>
            <Text style={styles.subtitle}>Help us connect you with the right people</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>What brings you to IdeaSpark?</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  {
                    borderColor: selectedRoles.includes(role.id) ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selectedRoles.includes(role.id) ? `${theme.colors.accent}10` : 'white',
                  },
                ]}
                onPress={() => toggleRole(role.id)}
              >
                <View style={styles.roleContent}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={[styles.roleDescription, { color: theme.colors.textSecondary }]}>
                    {role.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.roleCheckbox,
                    {
                      backgroundColor: selectedRoles.includes(role.id) ? theme.colors.accent : 'transparent',
                      borderColor: selectedRoles.includes(role.id) ? theme.colors.accent : theme.colors.border,
                    },
                  ]}
                >
                  {selectedRoles.includes(role.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Your Profile</Text>
            
            <View style={styles.aliasContainer}>
              <TextInput
                style={[styles.input, { borderColor: theme.colors.border }]}
                placeholder="Choose your alias"
                placeholderTextColor={theme.colors.textSecondary}
                value={alias}
                onChangeText={setAlias}
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.generateButton, { backgroundColor: theme.colors.secondary }]}
                onPress={generateAlias}
              >
                <Text style={styles.generateButtonText}>🎲 Generate</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, styles.textArea, { borderColor: theme.colors.border }]}
              placeholder="Tell us about yourself (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: selectedRoles.length > 0 ? theme.colors.accent : theme.colors.border,
                },
              ]}
              onPress={handleComplete}
              disabled={loading || selectedRoles.length === 0}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Setting up...' : 'Complete Setup'}
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
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
  },
  roleCheckbox: {
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
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 24,
  },
  aliasContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  generateButton: {
    borderRadius: 12,
    padding: 16,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});