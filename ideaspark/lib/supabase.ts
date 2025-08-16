import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

// Fallback-safe storage that works on native and web
const storage = {
	getItem: async (key: string) => {
		try {
			if (typeof AsyncStorage?.getItem === 'function') {
				return await AsyncStorage.getItem(key);
			}
			return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null);
		} catch (e) {
			return null;
		}
	},
	setItem: async (key: string, value: string) => {
		try {
			if (typeof AsyncStorage?.setItem === 'function') {
				await AsyncStorage.setItem(key, value);
				return;
			}
			globalThis.localStorage?.setItem(key, value);
		} catch {}
	},
	removeItem: async (key: string) => {
		try {
			if (typeof AsyncStorage?.removeItem === 'function') {
				await AsyncStorage.removeItem(key);
				return;
			}
			globalThis.localStorage?.removeItem(key);
		} catch {}
	},
};

export const supabase = supabaseUrl && supabaseAnonKey
	? createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			flowType: 'pkce',
			autoRefreshToken: true,
			detectSessionInUrl: true,
			persistSession: true,
			storage,
		},
	})
	: null as unknown as ReturnType<typeof createClient>;

export async function signInWithProvider(provider: 'github' | 'google' | 'twitter') {
	const redirectTo = AuthSession.makeRedirectUri({
		scheme: 'ideaspark',
		path: 'auth/callback',
		preferLocalhost: true,
	});
	return supabase?.auth.signInWithOAuth({
		provider,
		options: { redirectTo, skipBrowserRedirect: false },
	});
}

export type IdeaMode = 'public' | 'teaser' | 'private';
export type UserRole = 'Idea Sharer' | 'Builder' | 'Investor' | 'Curious Mind';

export type Idea = {
	id: string;
	headline: string;
	description: string;
	category: string;
	mode: IdeaMode;
	created_by: string;
	created_at: string;
	og_image_url?: string | null;
	reactions_count?: number;
	comments_count?: number;
	connects_count?: number;
	required_roles?: UserRole[] | null;
};

export type Profile = {
	id: string;
	alias: string | null;
	roles: UserRole[] | null;
	created_at: string;
};

export async function upsertProfile(profile: Partial<Profile>): Promise<{ data: Profile | null; error: any | null }> {
	if (!supabase) return { data: null, error: new Error('Supabase not configured') };
	const { data, error } = await supabase.from('profiles').upsert(profile).select('*').single();
	return { data: data as Profile | null, error };
}

export async function createIdea(newIdea: Omit<Idea, 'id' | 'created_at' | 'reactions_count' | 'comments_count' | 'connects_count'>): Promise<{ data: Idea | null; error: any | null }> {
	if (!supabase) return { data: null, error: new Error('Supabase not configured') };
	const { data, error } = await supabase
		.from('ideas')
		.insert(newIdea as any)
		.select('*')
		.single();
	return { data: data as Idea | null, error };
}

export async function fetchIdeas({ limit = 20, from = 0 }: { limit?: number; from?: number }): Promise<{ data: Idea[]; error: any | null }> {
	if (!supabase) return { data: [] as Idea[], error: null };
	const { data, error } = await supabase
		.from('ideas')
		.select('*')
		.order('created_at', { ascending: false })
		.range(from, from + limit - 1);
	return { data: (data ?? []) as Idea[], error };
}