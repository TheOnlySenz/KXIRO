import { Stack } from 'expo-router';

export default function PostLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: 'Share an Idea' }} />
		</Stack>
	);
}