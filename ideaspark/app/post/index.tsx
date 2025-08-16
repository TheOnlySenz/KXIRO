import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { createIdea, IdeaMode, supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function PostScreen() {
	const [headline, setHeadline] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState('AI');
	const [mode, setMode] = useState<IdeaMode>('public');
	const router = useRouter();

	async function submit() {
		const { data: session } = await supabase.auth.getUser();
		if (!session.user) {
			Alert.alert('Please sign in');
			return;
		}
		const { data, error } = await createIdea({
			headline,
			description,
			category,
			mode,
			created_by: session.user.id,
		});
		if (error) {
			Alert.alert('Error', error.message);
			return;
		}
		Alert.alert('Posted!', 'Want to tweet it now?', [
			{ text: 'Not now' },
			{ text: 'Tweet', onPress: () => router.push(`/share?id=${data?.id}`) },
		]);
		router.replace('/feed');
	}

	return (
		<ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
			<Text style={{ fontSize: 24, fontWeight: '800' }}>Share an Idea</Text>
			<Text>Headline (max 120 chars)</Text>
			<TextInput value={headline} onChangeText={setHeadline} maxLength={120} placeholder="e.g. Tinder for hackathons" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 }} />
			<Text>Category</Text>
			<TextInput value={category} onChangeText={setCategory} placeholder="AI, SaaS, Health..." style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 }} />
			<Text>Description</Text>
			<TextInput value={description} onChangeText={setDescription} placeholder="Describe your idea" multiline numberOfLines={6} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, minHeight: 140, textAlignVertical: 'top' }} />
			<Text>Mode</Text>
			<View style={{ flexDirection: 'row', gap: 8 }}>
				{(['public','teaser','private'] as IdeaMode[]).map((m) => (
					<Pressable key={m} onPress={() => setMode(m)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: mode === m ? '#8b5cf6' : '#e5e7eb' }}>
						<Text style={{ color: mode === m ? 'white' : '#111827' }}>{m}</Text>
					</Pressable>
				))}
			</View>
			<Pressable onPress={submit} style={{ padding: 12, backgroundColor: '#8b5cf6', borderRadius: 12, alignItems: 'center' }}>
				<Text style={{ color: 'white', fontWeight: '700' }}>Post Idea</Text>
			</Pressable>
		</ScrollView>
	);
}