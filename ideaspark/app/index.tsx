import { Redirect, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase, signInWithProvider } from '@/lib/supabase';
import { Text, View, Pressable, Alert } from 'react-native';

export default function Index() {
	const [sessionChecked, setSessionChecked] = useState(false);
	const [isSignedIn, setIsSignedIn] = useState(false);

	useEffect(() => {
		(async () => {
			if (!supabase) {
				Alert.alert('Missing Supabase config', 'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
				setSessionChecked(true);
				return;
			}
			const { data } = await supabase.auth.getSession();
			setIsSignedIn(!!data.session);
			setSessionChecked(true);
		})();
	}, []);

	if (!sessionChecked) return null;
	if (isSignedIn) return <Redirect href="/feed" />;

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 }}>
			<Text style={{ fontSize: 36, fontWeight: '900' }}>IdeaSpark</Text>
			<Text style={{ textAlign: 'center' }}>Drop ideas. Find partners. Spark something viral.</Text>
			<View style={{ height: 8 }} />
			<Pressable style={{ padding: 12, backgroundColor: '#111827', borderRadius: 12, minWidth: 260, alignItems: 'center' }} onPress={() => signInWithProvider('github')}>
				<Text style={{ color: 'white', fontWeight: '700' }}>Continue with GitHub</Text>
			</Pressable>
			<Pressable style={{ padding: 12, backgroundColor: '#0ea5e9', borderRadius: 12, minWidth: 260, alignItems: 'center' }} onPress={() => signInWithProvider('twitter')}>
				<Text style={{ color: 'white', fontWeight: '700' }}>Continue with Twitter</Text>
			</Pressable>
			<Pressable style={{ padding: 12, backgroundColor: '#10b981', borderRadius: 12, minWidth: 260, alignItems: 'center' }} onPress={() => signInWithProvider('google')}>
				<Text style={{ color: 'white', fontWeight: '700' }}>Continue with Google</Text>
			</Pressable>
			<View style={{ height: 12 }} />
			<Link href="/post" asChild>
				<Pressable style={{ padding: 12, backgroundColor: '#8b5cf6', borderRadius: 12, minWidth: 260, alignItems: 'center' }}>
					<Text style={{ color: 'white', fontWeight: '700' }}>Share your first idea</Text>
				</Pressable>
			</Link>
		</View>
	);
}