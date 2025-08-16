import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<Tabs>
					<Tabs.Screen name="feed" options={{ title: 'Feed' }} />
					<Tabs.Screen name="post" options={{ title: 'Post' }} />
					<Tabs.Screen name="profile" options={{ title: 'Profile' }} />
				</Tabs>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}