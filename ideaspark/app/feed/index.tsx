import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { fetchIdeas, Idea } from '@/lib/supabase';
import Swiper from 'react-native-deck-swiper';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

function IdeaCard({ idea, onConnect }: { idea: Idea; onConnect: () => void }) {
	const maskedDescription = idea.mode === 'teaser'
		? idea.description.split('\n')[0]
		: idea.mode === 'private'
		? 'Visible to matching roles only'
		: idea.description;
	return (
		<LinearGradient colors={['#f5f3ff','#ffe4e6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16 }}>
			<View style={{ padding: 16, borderRadius: 16, gap: 8 }}>
				<Text style={{ fontSize: 12, fontWeight: '700', color: '#6d28d9' }}>{idea.category.toUpperCase()}</Text>
				<Text style={{ fontSize: 22, fontWeight: '800' }}>{idea.headline}</Text>
				<Text numberOfLines={idea.mode === 'public' ? 3 : 2} style={{ color: '#374151' }}>{maskedDescription}</Text>
				<View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
					<Pressable style={({ pressed }) => ({ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: pressed ? '#fecaca' : '#fee2e2', borderRadius: 12 })}>
						<Text>🔥 React</Text>
					</Pressable>
					<Link href={`/idea/${idea.id}`} asChild>
						<Pressable style={({ pressed }) => ({ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: pressed ? '#c7d2fe' : '#e0e7ff', borderRadius: 12 })}>
							<Text>💬 Comment</Text>
						</Pressable>
					</Link>
					<Pressable onPress={onConnect} style={({ pressed }) => ({ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: pressed ? '#bbf7d0' : '#d1fae5', borderRadius: 12 })}>
						<Text>⚡ Connect</Text>
					</Pressable>
				</View>
			</View>
		</LinearGradient>
	);
}

export default function FeedScreen() {
	const [ideas, setIdeas] = useState<Idea[]>([]);
	const [from, setFrom] = useState(0);
	const [showConfetti, setShowConfetti] = useState(false);
	const router = useRouter();
	const confettiRef = useRef<ConfettiCannon | null>(null);

	useEffect(() => {
		(async () => {
			const { data } = await fetchIdeas({});
			setIdeas(data ?? []);
		})();
	}, []);

	function handleConnect(idea: Idea) {
		setShowConfetti(true);
		setTimeout(() => setShowConfetti(false), 1500);
		const options = ['Code', 'Capital', 'Community'];
		const picked = options[0];
		router.push({ pathname: `/chat/${idea.id}`, params: { intro: `I bring: ${picked}` } });
	}

	return (
		<View style={{ flex: 1, padding: 16, backgroundColor: '#fafafa' }}>
			{showConfetti ? (
				<ConfettiCannon ref={confettiRef as any} count={120} origin={{ x: 0, y: 0 }} autoStart fadeOut />
			) : null}
			<View style={{ height: 420 }}>
				<Swiper
					cards={ideas}
					renderCard={(card) => card ? <IdeaCard idea={card} onConnect={() => handleConnect(card)} /> : <View />}
					onSwipedRight={(idx) => ideas[idx] && handleConnect(ideas[idx])}
					backgroundColor="transparent"
					cardVerticalMargin={8}
					stackSize={3}
				/>
			</View>
			<FlatList
				contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
				data={ideas}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <IdeaCard idea={item} onConnect={() => handleConnect(item)} />}
				onEndReachedThreshold={0.6}
				onEndReached={async () => {
					const nextFrom = from + 20;
					const { data } = await fetchIdeas({ from: nextFrom });
					setIdeas((prev) => [...prev, ...(data ?? [])]);
					setFrom(nextFrom);
				}}
			/>
		</View>
	);
}