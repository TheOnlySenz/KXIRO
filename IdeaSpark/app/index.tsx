import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(app)/feed');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#ec4899']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
            🚀 IdeaSpark
          </Text>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: 'white', marginTop: 20, fontSize: 16 }}>
            Connecting brilliant minds...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return null;
}