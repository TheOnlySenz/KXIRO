import { Stack, Link } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function FeedLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{
				title: 'IdeaSpark',
				headerRight: () => (
					<Link href="/post" asChild>
						<Pressable style={{ marginRight: 12 }}><Text>Post</Text></Pressable>
					</Link>
				),
				headerLeft: () => (
					<Link href="/profile" asChild>
						<Pressable style={{ marginLeft: 12 }}><Text>Profile</Text></Pressable>
					</Link>
				),
			}} />
		</Stack>
	);
}