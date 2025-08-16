import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function ShareScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const link = `https://ideaspark.app/idea/${id}`;
	const text = `Just dropped my viral idea on IdeaSpark 🚀\nWanna build it with me? 👀\n${link}`;
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 }}>
			<Text>Share this idea</Text>
			<Text selectable>{text}</Text>
			<Pressable onPress={() => Clipboard.setStringAsync(text)} style={{ padding: 12, backgroundColor: '#8b5cf6', borderRadius: 12 }}>
				<Text style={{ color: 'white', fontWeight: '700' }}>Copy Tweet</Text>
			</Pressable>
		</View>
	);
}