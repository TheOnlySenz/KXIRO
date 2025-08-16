import { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { supabase } from '@/lib/supabase';

export default function ChatScreen() {
	const { id, intro } = useLocalSearchParams<{ id: string; intro?: string }>();
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [userId, setUserId] = useState<string>('');

	useEffect(() => {
		(async () => {
			const { data } = await supabase.auth.getUser();
			setUserId(data.user?.id ?? '');
		})();
	}, []);

	useEffect(() => {
		if (!id) return;
		const channel = supabase.channel(`chat-${id}`);
		channel
			.on('broadcast', { event: 'message' }, (payload) => {
				const msg = payload.payload as IMessage;
				setMessages((prev) => GiftedChat.append(prev, [msg]));
			})
			.subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [id]);

	useEffect(() => {
		if (intro && userId) {
			const msg: IMessage = {
				_id: Math.random().toString(36),
				text: String(intro),
				createdAt: new Date(),
				user: { _id: userId },
			};
			setMessages((prev) => GiftedChat.append(prev, [msg]));
			supabase.channel(`chat-${id}`).send({ type: 'broadcast', event: 'message', payload: msg });
		}
	}, [intro, userId, id]);

	const onSend = useCallback((newMessages: IMessage[] = []) => {
		setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
		supabase.channel(`chat-${id}`).send({ type: 'broadcast', event: 'message', payload: newMessages[0] });
	}, [id]);

	return (
		<>
			<Stack.Screen options={{ title: 'Chat • Code/Capital/Community' }} />
			<GiftedChat
				messages={messages}
				onSend={(msgs) => onSend(msgs)}
				user={{ _id: userId || 'anon' }}
			/>
		</>
	);
}