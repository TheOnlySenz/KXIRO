import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

const USER_ROLES = [
  {
    id: 'idea_sharer',
    title: 'Idea Sharer',
    emoji: '💡',
    description: 'I have brilliant ideas to share',
  },
  {
    id: 'builder',
    title: 'Builder',
    emoji: '🔨',
    description: 'I can turn ideas into reality',
  },
  {
    id: 'investor',
    title: 'Investor',
    emoji: '💰',
    description: 'I have capital to invest',
  },
  {
    id: 'curious_mind',
    title: 'Curious Mind',
    emoji: '🤔',
    description: 'I love exploring new concepts',
  },
];

const ANONYMOUS_ALIASES = [
  'Spark Seeker',
  'Idea Explorer',
  'Innovation Scout',
  'Visionary Wanderer',
  'Creative Pioneer',
  'Dream Chaser',
  'Future Builder',
  'Bright Mind',
];

export default function OnboardingScreen() {
  const { anonymous } = useLocalSearchParams();
  const isAnonymous = anonymous === 'true';
  
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      Alert.alert('Please select at least one role');
      return;
    }

    setLoading(true);
    try {
      if (isAnonymous) {
        // For anonymous users, create a temporary profile or store in AsyncStorage
        // For now, just navigate to feed
        router.replace('/feed');
      } else {
        // For authenticated users, update their profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const alias = isAnonymous 
          ? ANONYMOUS_ALIASES[Math.floor(Math.random() * ANONYMOUS_ALIASES.length)]
          : null;

        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            roles: selectedRoles,
            is_anonymous: isAnonymous,
            alias,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        router.replace('/feed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>✨</Text>
          <Text style={styles.title}>Welcome to IdeaSpark!</Text>
          <Text style={styles.subtitle}>
            {isAnonymous 
              ? 'Tell us about yourself (anonymously)'
              : 'Tell us about yourself'
            }
          </Text>
          <Text style={styles.description}>
            Select one or more roles that describe you:
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {USER_ROLES.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRoles.includes(role.id) && styles.selectedRoleCard,
              ]}
              onPress={() => toggleRole(role.id)}
            >
              <Text style={styles.roleEmoji}>{role.emoji}</Text>
              <Text style={[
                styles.roleTitle,
                selectedRoles.includes(role.id) && styles.selectedRoleTitle,
              ]}>
                {role.title}
              </Text>
              <Text style={[
                styles.roleDescription,
                selectedRoles.includes(role.id) && styles.selectedRoleDescription,
              ]}>
                {role.description}
              </Text>
              {selectedRoles.includes(role.id) && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedRoles.length === 0 && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={loading || selectedRoles.length === 0}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Setting up...' : 'Continue to Feed'}
          </Text>
        </TouchableOpacity>

        {isAnonymous && (
          <Text style={styles.anonymousNote}>
            💭 You're browsing anonymously. You can always create an account later!
          </Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  rolesContainer: {
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedRoleCard: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: '#667eea',
  },
  roleEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedRoleTitle: {
    color: '#667eea',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectedRoleDescription: {
    color: '#5a67d8',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#667eea',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  continueButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
  },
  anonymousNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});