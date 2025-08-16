import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.replace('/feed');
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for verification link!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'ideaspark://auth/callback',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAnonymousLogin = () => {
    // For now, navigate to onboarding with anonymous flag
    router.push('/auth/onboarding?anonymous=true');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.logo}>💡</Text>
            <Text style={styles.title}>IdeaSpark</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Join the community'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={styles.switchText}>
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[styles.button, styles.socialButton]}
                onPress={() => handleSocialAuth('google')}
              >
                <Text style={styles.socialButtonText}>🔍 Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.socialButton]}
                onPress={() => handleSocialAuth('github')}
              >
                <Text style={styles.socialButtonText}>🐙 Continue with GitHub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.socialButton]}
                onPress={() => handleSocialAuth('twitter')}
              >
                <Text style={styles.socialButtonText}>🐦 Continue with Twitter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.anonymousButton]}
                onPress={handleAnonymousLogin}
              >
                <Text style={styles.anonymousButtonText}>👤 Continue Anonymously</Text>
              </TouchableOpacity>
            </View>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 10,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#667eea',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  switchText: {
    color: '#667eea',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dee2e6',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#6c757d',
    fontSize: 14,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  socialButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '500',
  },
  anonymousButton: {
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    borderWidth: 1,
    borderColor: '#6c757d',
    marginTop: 10,
  },
  anonymousButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
});