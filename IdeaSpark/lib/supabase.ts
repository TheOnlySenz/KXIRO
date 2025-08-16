import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (will be generated from Supabase CLI later)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          roles: string[];
          is_anonymous: boolean;
          alias: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          roles?: string[];
          is_anonymous?: boolean;
          alias?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          roles?: string[];
          is_anonymous?: boolean;
          alias?: string | null;
        };
      };
      ideas: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          headline: string;
          description: string;
          category: string;
          mode: 'public' | 'teaser' | 'private_match';
          reactions_count: number;
          comments_count: number;
          connects_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          headline: string;
          description: string;
          category: string;
          mode?: 'public' | 'teaser' | 'private_match';
          reactions_count?: number;
          comments_count?: number;
          connects_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          headline?: string;
          description?: string;
          category?: string;
          mode?: 'public' | 'teaser' | 'private_match';
          reactions_count?: number;
          comments_count?: number;
          connects_count?: number;
        };
      };
      reactions: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          idea_id: string;
          type: 'fire' | 'comment' | 'connect';
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          idea_id: string;
          type: 'fire' | 'comment' | 'connect';
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          idea_id?: string;
          type?: 'fire' | 'comment' | 'connect';
        };
      };
      chats: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          idea_id: string;
          requester_id: string;
          owner_id: string;
          status: 'pending' | 'active' | 'closed';
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          idea_id: string;
          requester_id: string;
          owner_id: string;
          status?: 'pending' | 'active' | 'closed';
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          idea_id?: string;
          requester_id?: string;
          owner_id?: string;
          status?: 'pending' | 'active' | 'closed';
        };
      };
      messages: {
        Row: {
          id: string;
          created_at: string;
          chat_id: string;
          sender_id: string;
          content: string;
          type: 'text' | 'system';
        };
        Insert: {
          id?: string;
          created_at?: string;
          chat_id: string;
          sender_id: string;
          content: string;
          type?: 'text' | 'system';
        };
        Update: {
          id?: string;
          created_at?: string;
          chat_id?: string;
          sender_id?: string;
          content?: string;
          type?: 'text' | 'system';
        };
      };
    };
  };
}