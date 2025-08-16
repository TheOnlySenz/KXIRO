# IdeaSpark 💡

**Where ideas ignite connections**

A React Native + Expo + Supabase cross-platform app (iOS, Android, Web) for sharing startup ideas and connecting with builders, investors, and curious minds.

## 🚀 Features

### ✨ Core Features
- **Authentication**: Email + social logins (Google, GitHub, Twitter) with anonymous posting
- **User Roles**: Idea Sharer, Builder, Investor, Curious Mind with customizable profiles
- **Smart Feed**: Infinite scroll with category filtering and Tinder-style swipe mode
- **Idea Posting**: Rich posting form with headline (120 chars), description, categories, and visibility modes
- **Connect System**: Instant connections with confetti animations and skill-based matching
- **Real-time Chat**: Direct messaging with context about the connected idea
- **Gamification**: Badges, leaderboards, and achievement system

### 🎨 UI/UX Highlights
- Modern Twitter-friendly design with pastel gradients
- Rounded cards with micro-interactions (hover/press scaling)
- Swipeable feed like Tinder (swipe left to pass, right to like, up to connect)
- Confetti animations on successful connections
- Responsive design for all screen sizes

### 📱 Platform Support
- **iOS**: Native mobile experience
- **Android**: Native mobile experience  
- **Web**: Progressive web app with Expo Web

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Navigation**: Expo Router v3
- **Animations**: React Native Reanimated, React Native Confetti Cannon
- **UI**: Custom components with Linear Gradients
- **Gestures**: React Native Gesture Handler, React Native Deck Swiper

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account (free tier available)

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd IdeaSpark
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your keys
3. Update `lib/supabase.ts` with your credentials:

```typescript
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

### 3. Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  roles text[] default '{}',
  is_anonymous boolean default false,
  alias text
);

-- Ideas table
create table public.ideas (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  headline text not null,
  description text not null,
  category text not null,
  mode text not null default 'public',
  reactions_count integer default 0,
  comments_count integer default 0,
  connects_count integer default 0
);

-- Reactions table
create table public.reactions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  type text not null,
  unique(user_id, idea_id, type)
);

-- Chats table
create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending'
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  type text not null default 'text'
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.reactions enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Policies (basic - customize as needed)
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Ideas are viewable by everyone." on ideas for select using (true);
create policy "Users can insert their own ideas." on ideas for insert with check (auth.uid() = user_id);
create policy "Users can update own ideas." on ideas for update using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table chats;
alter publication supabase_realtime add table messages;
```

### 4. Environment Setup (Optional)

Create `.env.local` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then update `lib/supabase.ts` to use environment variables:

```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://your-project-ref.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'your-anon-key';
```

### 5. Run the App

```bash
# Web development
npm run web

# iOS (requires macOS)
npm run ios

# Android
npm run android

# Preview with Expo Go
npx expo start
```

## 📱 App Structure

```
app/
├── _layout.tsx          # Root layout with providers
├── index.tsx            # Splash screen with auto-redirect
├── auth/
│   ├── index.tsx        # Login/signup screen
│   └── onboarding.tsx   # Role selection onboarding
├── feed/
│   └── index.tsx        # Main feed (list + swipe modes)
├── post/
│   └── index.tsx        # Create new idea form
├── chat/
│   └── [id].tsx         # Real-time chat screen
└── profile/
    └── index.tsx        # User profile, badges, leaderboard

components/
├── IdeaCard.tsx         # Individual idea card with actions
└── SwipeableFeed.tsx    # Tinder-style swipe interface

lib/
└── supabase.ts          # Supabase client configuration
```

## 🎯 Usage Guide

### For Idea Sharers
1. **Sign up** and select "Idea Sharer" role
2. **Post your idea** with compelling headline and description
3. **Choose visibility**: Public, Teaser, or Private Match
4. **Watch connections** roll in from interested builders/investors

### For Builders & Investors
1. **Browse the feed** in list or swipe mode
2. **React with 🔥** to show interest
3. **Swipe up or tap ⚡** to connect instantly
4. **Select your skill** (Code, Capital, Community, etc.)
5. **Start chatting** with idea owners

### For Curious Minds
1. **Explore trending ideas** across categories
2. **React and comment** to engage with the community
3. **Connect with like-minded** innovators

## 🏆 Gamification

### Badges
- **Visionary** 🔮: Post 5+ ideas
- **Connector** 🤝: Make 5+ connections
- **Trending** 📈: Get a top weekly idea
- **Spark Master** ⚡: Receive 50+ reactions

### Leaderboard
- Weekly top connectors
- Global stats tracking
- Personal progress metrics

## 🚀 Growth Features

### Social Sharing
- Auto-generated Twitter previews for each idea
- "Share this idea" buttons with pre-written templates
- Growth hooks on successful posts

### Anonymous Mode
- Post ideas without revealing identity
- Auto-generated creative aliases
- Convert to full account later

## 🌐 Deployment

### Expo Web
```bash
npm run web
npx expo export -p web
# Deploy to Vercel, Netlify, or any static host
```

### Mobile App Stores
```bash
# Build for production
eas build --platform all

# Submit to stores
eas submit --platform all
```

## 🔧 Customization

### Themes
Update gradient colors in each component's `StyleSheet` to match your brand.

### Categories
Modify the `CATEGORIES` array in `app/feed/index.tsx` to add new idea categories.

### User Roles
Update `USER_ROLES` in `app/auth/onboarding.tsx` to customize available roles.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 💬 Support

- Create an issue for bugs or feature requests
- Join our community discussions
- Check out the Supabase docs for backend questions

---

**Built with ❤️ using React Native, Expo, and Supabase**

🚀 **Ready to spark the next big idea?** Get started today!