import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import Head from 'expo-router/head';
import { useEffect, useState } from 'react';
import { supabase, Idea } from '@/lib/supabase';
import { buildOgImageUrl } from '@/lib/og';

export default function IdeaDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [idea, setIdea] = useState<Idea | null>(null);

	useEffect(() => {
		(async () => {
			if (!id) return;
			const { data } = await supabase.from('ideas').select('*').eq('id', id).single();
			setIdea(data ?? null);
		})();
	}, [id]);

	const title = idea ? idea.headline : `Idea #${id} on IdeaSpark`;
	const description = idea ? idea.description.slice(0, 160) : 'Drop ideas. Find partners. Spark something viral.';
	const image = idea ? buildOgImageUrl({ id: id!, title: idea.headline, description: idea.description, category: idea.category }) : '/assets/og-default.png';

	return (
		<View style={{ flex: 1, padding: 16 }}>
			<Head>
				<title>{title}</title>
				<meta name="description" content={description} />
				<meta property="og:title" content={title} />
				<meta property="og:description" content={description} />
				<meta property="og:image" content={image} />
				<meta name="twitter:card" content="summary_large_image" />
			</Head>
			<Text style={{ fontSize: 24, fontWeight: '800' }}>{idea?.headline ?? `Idea ${id}`}</Text>
			<Text style={{ color: '#4b5563', marginTop: 8 }}>{idea?.description ?? ''}</Text>
		</View>
	);
}