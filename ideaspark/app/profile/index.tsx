import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Profile, upsertProfile, UserRole, supabase } from '@/lib/supabase';

const ROLES: UserRole[] = ['Idea Sharer', 'Builder', 'Investor', 'Curious Mind'];

export default function ProfileScreen() {
	const [alias, setAlias] = useState('');
	const [roles, setRoles] = useState<UserRole[]>([]);

	useEffect(() => {
		(async () => {
			const { data } = await supabase.auth.getUser();
			if (!data.user) return;
			const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
			if (prof) {
				setAlias(prof.alias ?? '');
				setRoles(prof.roles ?? []);
			}
		})();
	}, []);

	async function save() {
		const { data } = await supabase.auth.getUser();
		if (!data.user) return;
		const { error } = await upsertProfile({ id: data.user.id, alias: alias || null, roles });
		if (error) Alert.alert('Error', error.message);
		else Alert.alert('Saved');
	}

	return (
		<ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
			<Text style={{ fontSize: 24, fontWeight: '800' }}>Your Profile</Text>
			<Text>Alias</Text>
			<TextInput value={alias} onChangeText={setAlias} placeholder="Anon Spark" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 }} />
			<Text>Roles</Text>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
				{ROLES.map((role) => {
					const active = roles.includes(role);
					return (
						<Pressable key={role} onPress={() => setRoles((prev) => active ? prev.filter((r) => r !== role) : [...prev, role])} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: active ? '#8b5cf6' : '#e5e7eb' }}>
							<Text style={{ color: active ? 'white' : '#111827' }}>{role}</Text>
						</Pressable>
					);
				})}
			</View>
			<Pressable onPress={save} style={{ padding: 12, backgroundColor: '#8b5cf6', borderRadius: 12, alignItems: 'center' }}>
				<Text style={{ color: 'white', fontWeight: '700' }}>Save</Text>
			</Pressable>
		</ScrollView>
	);
}