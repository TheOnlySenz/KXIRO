# 🚀 IdeaSpark

A React Native + Expo + Supabase cross-platform app where users can share startup/viral ideas anonymously or under an alias, and connect instantly with other users (founders, developers, investors, or curious minds).

## ✨ Features

### 🔐 Authentication
- Supabase auth with email + social logins (Google, GitHub, Twitter)
- Anonymous posting option with auto-generated aliases
- Secure user profiles and role management

### 👥 User Roles
- **Idea Sharer** 💡 - Share startup ideas and get feedback
- **Builder** 🔨 - Help bring ideas to life with technical skills
- **Investor** 💰 - Discover and invest in promising ideas
- **Curious Mind** 🧠 - Explore and learn from innovative ideas

### 📱 Core Features
- **Infinite Scroll Feed** - Swipeable Tinder-like interface for idea cards
- **Idea Cards** - Beautiful cards with headlines, categories, and action buttons
- **Three Action Buttons**:
  - 🔥 React - Show appreciation for ideas
  - 💬 Comment - Engage in discussions
  - ⚡ Connect - Instant DM with confetti animation

### 🎯 Smart Visibility
- **Public** 🌍 - Full idea visible to everyone
- **Teaser** 🔒 - First line visible, rest hidden until connect
- **Private Match** 🎯 - Only visible to matching skill roles

### 🎉 Gamification
- **Badges**: Visionary, Connector, Trending, Early Bird, Commenter
- **Leaderboard**: Top 10 connected ideas weekly
- **Stats Tracking**: Ideas posted, connections made, reactions received

### 📱 Cross-Platform
- iOS, Android, and Web support with Expo
- Responsive design with beautiful pastel gradients
- Micro-interactions and smooth animations

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Navigation**: Expo Router
- **Backend**: Supabase (Auth, Database, Realtime)
- **Styling**: React Native StyleSheet + Linear Gradients
- **Animations**: React Native Reanimated + Confetti
- **Icons**: Expo Vector Icons
- **Web Support**: Expo Web + Webpack

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd IdeaSpark
npm install
```

### 2. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key

#### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Database Schema
Run the following SQL in your Supabase SQL editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  alias TEXT UNIQUE NOT NULL,
  bio TEXT,
  roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ideas table
CREATE TABLE ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  headline TEXT NOT NULL CHECK (char_length(headline) <= 120),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('public', 'teaser', 'private_match')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reactions_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  connects_count INTEGER DEFAULT 0
);

-- Create reactions table
CREATE TABLE reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'comment', 'connect')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id, reaction_type)
);

-- Create connections table
CREATE TABLE connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_offered TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Ideas policies
CREATE POLICY "Users can view public ideas" ON ideas FOR SELECT USING (mode = 'public');
CREATE POLICY "Users can view teaser ideas" ON ideas FOR SELECT USING (mode = 'teaser');
CREATE POLICY "Users can view private match ideas if they have matching roles" ON ideas FOR SELECT USING (
  mode = 'private_match' AND (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND roles && (SELECT roles FROM profiles WHERE id = ideas.user_id)
    )
  )
);
CREATE POLICY "Users can insert own ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON ideas FOR UPDATE USING (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Users can view all reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Users can insert own reactions" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Connections policies
CREATE POLICY "Users can view their connections" ON connections FOR SELECT USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);
CREATE POLICY "Users can create connections" ON connections FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update their connections" ON connections FOR UPDATE USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);

-- Messages policies
CREATE POLICY "Users can view messages in their connections" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM connections 
    WHERE connections.id = messages.connection_id 
    AND (connections.from_user_id = auth.uid() OR connections.to_user_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages in their connections" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM connections 
    WHERE connections.id = messages.connection_id 
    AND (connections.from_user_id = auth.uid() OR connections.to_user_id = auth.uid())
  )
);

-- Create indexes for performance
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_category ON ideas(category);
CREATE INDEX idx_ideas_mode ON ideas(mode);
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX idx_reactions_idea_id ON reactions(idea_id);
CREATE INDEX idx_connections_idea_id ON connections(idea_id);
CREATE INDEX idx_messages_connection_id ON messages(connection_id);

-- Create functions for updating counts
CREATE OR REPLACE FUNCTION update_idea_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ideas SET 
      reactions_count = (SELECT COUNT(*) FROM reactions WHERE idea_id = NEW.idea_id),
      comments_count = (SELECT COUNT(*) FROM reactions WHERE idea_id = NEW.idea_id AND reaction_type = 'comment'),
      connects_count = (SELECT COUNT(*) FROM reactions WHERE idea_id = NEW.idea_id AND reaction_type = 'connect')
    WHERE id = NEW.idea_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ideas SET 
      reactions_count = (SELECT COUNT(*) FROM reactions WHERE idea_id = OLD.idea_id),
      comments_count = (SELECT COUNT(*) FROM reactions WHERE idea_id = OLD.idea_id AND reaction_type = 'comment'),
      connects_count = (SELECT COUNT(*) FROM reactions WHERE idea_id = OLD.idea_id AND reaction_type = 'connect')
    WHERE id = OLD.idea_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_idea_counts
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_idea_counts();
```

### 3. Run the App
```bash
# Start the development server
npm start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

## 📱 App Structure

```
app/
├── (auth)/           # Authentication screens
│   ├── login.tsx     # Login screen
│   ├── signup.tsx    # Signup screen
│   └── onboarding.tsx # Role selection
├── (app)/            # Main app screens
│   ├── feed.tsx      # Idea feed with swipe
│   ├── post.tsx      # Create new idea
│   ├── chat.tsx      # DM conversations
│   └── profile.tsx   # User profile & badges
├── _layout.tsx       # Root layout
└── index.tsx         # Entry point

components/
└── IdeaCard.tsx      # Idea card component

contexts/
├── AuthContext.tsx   # Authentication state
└── ThemeContext.tsx  # UI theme & colors
```

## 🎨 Design System

### Colors
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#ec4899` (Pink)
- **Background**: `#fafafa` (Light Gray)
- **Surface**: `#ffffff` (White)

### Typography
- **Headlines**: 20-32px, Bold
- **Body**: 14-16px, Regular
- **Captions**: 12px, Medium

### Spacing
- **XS**: 4px, **SM**: 8px, **MD**: 16px
- **LG**: 24px, **XL**: 32px, **XXL**: 48px

## 🚀 Growth Hooks

### On Sign-up
- Prompt users to share their first idea immediately
- Guide them through role selection

### On Successful Post
- Auto-show "🎉 Tweet this idea" button
- Pre-written template for social sharing
- Encourage viral distribution

### On Connect
- Confetti animation celebration
- "What do you bring?" skill selection
- Instant DM channel creation

## 🌐 Web Features

- **Twitter Card Previews** - Open Graph meta tags for idea sharing
- **Responsive Design** - Mobile-first approach that scales to desktop
- **SEO Optimized** - Clean URLs and meta descriptions

## 🔧 Configuration

### Supabase Auth Providers
Enable these in your Supabase dashboard:
- Email/Password
- Google OAuth
- GitHub OAuth
- Twitter OAuth

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📱 Platform Support

- ✅ **iOS** - Native performance with Expo
- ✅ **Android** - Material Design components
- ✅ **Web** - Progressive Web App ready

## 🎯 Future Features

- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Idea collaboration tools
- [ ] Investment tracking
- [ ] Analytics dashboard
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ideaspark/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ideaspark/discussions)
- **Email**: support@ideaspark.com

---

Built with ❤️ by the IdeaSpark team