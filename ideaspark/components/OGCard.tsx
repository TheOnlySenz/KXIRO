import { View, Text } from 'react-native';

export function OGCard({ title, description, category }: { title: string; description: string; category: string }) {
	return (
		<View style={{ width: 1200, height: 630, backgroundColor: '#f5f3ff', padding: 48, justifyContent: 'space-between' }}>
			<Text style={{ fontSize: 24, color: '#8b5cf6' }}>{category.toUpperCase()}</Text>
			<View>
				<Text style={{ fontSize: 64, fontWeight: '900' }}>{title}</Text>
				<Text numberOfLines={3} style={{ fontSize: 28, color: '#4b5563', marginTop: 24 }}>{description}</Text>
			</View>
			<Text style={{ fontSize: 24, color: '#8b5cf6' }}>ideaspark.app</Text>
		</View>
	);
}