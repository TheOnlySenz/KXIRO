-- Enable extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	alias text,
	roles text[] default '{}',
	created_at timestamptz default now()
);

-- Ideas
create type idea_mode as enum ('public','teaser','private');

create table if not exists public.ideas (
	id uuid primary key default gen_random_uuid(),
	headline text not null check (char_length(headline) <= 120),
	description text not null,
	category text not null,
	mode idea_mode not null default 'public',
	required_roles text[] default null,
	og_image_url text,
	created_by uuid not null references auth.users(id) on delete cascade,
	created_at timestamptz default now()
);

-- Reactions (🔥)
create table if not exists public.idea_reactions (
	idea_id uuid references public.ideas(id) on delete cascade,
	user_id uuid references auth.users(id) on delete cascade,
	created_at timestamptz default now(),
	primary key (idea_id, user_id)
);

-- Connects (⚡)
create table if not exists public.idea_connects (
	idea_id uuid references public.ideas(id) on delete cascade,
	user_id uuid references auth.users(id) on delete cascade,
	created_at timestamptz default now(),
	primary key (idea_id, user_id)
);

-- Comments (simple count)
create table if not exists public.idea_comments (
	id uuid primary key default gen_random_uuid(),
	idea_id uuid references public.ideas(id) on delete cascade,
	user_id uuid references auth.users(id) on delete cascade,
	body text not null,
	created_at timestamptz default now()
);

-- Conversations and messages
create table if not exists public.conversations (
	id uuid primary key default gen_random_uuid(),
	idea_id uuid references public.ideas(id) on delete cascade,
	created_at timestamptz default now()
);

create table if not exists public.conversation_members (
	conversation_id uuid references public.conversations(id) on delete cascade,
	user_id uuid references auth.users(id) on delete cascade,
	primary key (conversation_id, user_id)
);

create table if not exists public.messages (
	id uuid primary key default gen_random_uuid(),
	conversation_id uuid references public.conversations(id) on delete cascade,
	user_id uuid references auth.users(id) on delete cascade,
	body text not null,
	created_at timestamptz default now()
);

-- Aggregates via views
create view public.idea_metrics as
select i.id,
	count(distinct r.user_id) as reactions_count,
	count(distinct c.user_id) as connects_count,
	count(distinct m.id) as comments_count
from public.ideas i
left join public.idea_reactions r on r.idea_id = i.id
left join public.idea_connects c on c.idea_id = i.id
left join public.idea_comments m on m.idea_id = i.id
group by i.id;

-- Leaderboard (top connected this week)
create view public.top_weekly_connected as
select i.*, coalesce(x.connects_count,0) as connects_count
from public.ideas i
left join (
	select idea_id, count(*) as connects_count
	from public.idea_connects
	where created_at >= date_trunc('week', now())
	group by idea_id
) x on x.idea_id = i.id
order by connects_count desc, i.created_at desc
limit 10;

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_reactions enable row level security;
alter table public.idea_connects enable row level security;
alter table public.idea_comments enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- Profiles: users can read all, upsert self
create policy "read profiles" on public.profiles for select using (true);
create policy "upsert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- Ideas: public readable, owner can insert/update/delete
create policy "read ideas" on public.ideas for select using (true);
create policy "insert ideas" on public.ideas for insert with check (auth.uid() = created_by);
create policy "update own ideas" on public.ideas for update using (auth.uid() = created_by);
create policy "delete own ideas" on public.ideas for delete using (auth.uid() = created_by);

-- Reactions/connects/comments: authenticated users can insert; everyone can read
create policy "read reactions" on public.idea_reactions for select using (true);
create policy "react auth" on public.idea_reactions for insert with check (auth.uid() = user_id);
create policy "unreact own" on public.idea_reactions for delete using (auth.uid() = user_id);

create policy "read connects" on public.idea_connects for select using (true);
create policy "connect auth" on public.idea_connects for insert with check (auth.uid() = user_id);
create policy "disconnect own" on public.idea_connects for delete using (auth.uid() = user_id);

create policy "read comments" on public.idea_comments for select using (true);
create policy "comment auth" on public.idea_comments for insert with check (auth.uid() = user_id);
create policy "edit own comment" on public.idea_comments for update using (auth.uid() = user_id);
create policy "delete own comment" on public.idea_comments for delete using (auth.uid() = user_id);

-- Conversations/messages: members only
create policy "read conversations" on public.conversations for select using (
	exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = auth.uid())
);
create policy "create conversations" on public.conversations for insert with check (true);

create policy "read members" on public.conversation_members for select using (
	user_id = auth.uid()
);
create policy "join leave" on public.conversation_members for insert with check (user_id = auth.uid());

create policy "read messages" on public.messages for select using (
	exists (
		select 1 from public.conversation_members cm
		where cm.conversation_id = conversation_id and cm.user_id = auth.uid()
	)
);
create policy "send message" on public.messages for insert with check (
	exists (
		select 1 from public.conversation_members cm
		where cm.conversation_id = conversation_id and cm.user_id = auth.uid()
	)
);