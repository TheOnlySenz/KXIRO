import { Stack } from 'expo-router';

export default function IdeaLayout() {
	return (
		<Stack>
			<Stack.Screen name="[id]" options={{ title: 'Idea' }} />
		</Stack>
	);
}