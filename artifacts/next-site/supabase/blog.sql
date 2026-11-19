-- Run once in the existing SuperMovers Supabase project's SQL Editor.
-- This only adds the Blog tables/functions and its image bucket.
begin;
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 180),
  title text not null check (char_length(title) between 1 and 180),
  excerpt text not null default '' check (char_length(excerpt) <= 500),
  content text not null default '' check (char_length(content) <= 50000),
  kind text not null default 'text' check (kind in ('text','video')),
  image_url text not null default '' check (char_length(image_url) <= 2048),
  youtube_url text not null default '' check (char_length(youtube_url) <= 2048),
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  like_count integer not null default 0 check (like_count >= 0),
  comment_count integer not null default 0 check (comment_count >= 0)
);
create index if not exists blog_posts_publication on public.blog_posts(status, published_at desc);
create index if not exists blog_posts_popularity on public.blog_posts(status, like_count desc);
create table if not exists public.blog_likes (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (post_id, visitor_id)
);
create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  visitor_id uuid not null,
  name text not null check (char_length(name) between 1 and 80),
  body text not null check (char_length(body) between 1 and 3000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists blog_comments_post on public.blog_comments(post_id,status,created_at);
create index if not exists blog_comments_moderation on public.blog_comments(status,created_at desc);
create table if not exists public.blog_rate_limits (
  actor text not null,
  action text not null,
  window_start timestamptz not null,
  attempts integer not null,
  primary key (actor,action)
);
alter table public.blog_posts enable row level security;
alter table public.blog_likes enable row level security;
alter table public.blog_comments enable row level security;
alter table public.blog_rate_limits enable row level security;
revoke all on public.blog_posts, public.blog_likes, public.blog_comments, public.blog_rate_limits from anon, authenticated;
grant select,insert,update,delete on public.blog_posts, public.blog_likes, public.blog_comments, public.blog_rate_limits to service_role;

create or replace function public.blog_before_post_save() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.updated_at := now();
  elsif row(new.slug,new.title,new.excerpt,new.content,new.kind,new.image_url,new.youtube_url,new.status)
    is distinct from row(old.slug,old.title,old.excerpt,old.content,old.kind,old.image_url,old.youtube_url,old.status) then
    new.updated_at := now();
  end if;
  if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
  return new;
end $$;
drop trigger if exists blog_post_save on public.blog_posts;
create trigger blog_post_save before insert or update on public.blog_posts
for each row execute function public.blog_before_post_save();

create or replace function public.blog_sync_comment_count() returns trigger
language plpgsql set search_path = public as $$
declare p uuid;
begin
  p := case when tg_op = 'DELETE' then old.post_id else new.post_id end;
  perform 1 from public.blog_posts where id = p for update;
  update public.blog_posts set comment_count = (
    select count(*) from public.blog_comments where post_id = p and status = 'approved'
  ) where id = p;
  return null;
end $$;
drop trigger if exists blog_comment_count on public.blog_comments;
create trigger blog_comment_count after insert or update or delete on public.blog_comments
for each row execute function public.blog_sync_comment_count();

create or replace function public.blog_consume_limit(p_actor text, p_action text, p_limit integer, p_seconds integer)
returns boolean language plpgsql set search_path = public as $$
declare n integer;
begin
  insert into public.blog_rate_limits(actor,action,window_start,attempts) values(p_actor,p_action,now(),1)
  on conflict(actor,action) do update set
    attempts = case when blog_rate_limits.window_start < now()-make_interval(secs=>p_seconds) then 1 else blog_rate_limits.attempts+1 end,
    window_start = case when blog_rate_limits.window_start < now()-make_interval(secs=>p_seconds) then now() else blog_rate_limits.window_start end
  returning attempts into n;
  -- Opportunistic cleanup keeps expired anonymous rate-limit rows bounded.
  delete from public.blog_rate_limits where window_start < now()-interval '2 days';
  return n <= p_limit;
end $$;

create or replace function public.blog_set_like(p_post uuid, p_visitor uuid, p_liked boolean, p_actor text)
returns jsonb language plpgsql set search_path = public as $$
declare n integer;
begin
  if not public.blog_consume_limit(p_actor,'like',30,60) then return jsonb_build_object('error','rate_limit'); end if;
  perform 1 from public.blog_posts where id=p_post and status='published' for update;
  if not found then return jsonb_build_object('error','not_found'); end if;
  if p_liked then
    insert into public.blog_likes(post_id,visitor_id) values(p_post,p_visitor) on conflict do nothing;
  else
    delete from public.blog_likes where post_id=p_post and visitor_id=p_visitor;
  end if;
  select count(*) into n from public.blog_likes where post_id=p_post;
  update public.blog_posts set like_count=n where id=p_post;
  return jsonb_build_object('liked',p_liked,'like_count',n);
end $$;

create or replace function public.blog_submit_comment(p_post uuid, p_visitor uuid, p_name text, p_body text, p_actor text)
returns jsonb language plpgsql set search_path = public as $$
begin
  if not public.blog_consume_limit(p_actor,'comment',3,600) then return jsonb_build_object('error','rate_limit'); end if;
  if not public.blog_consume_limit(p_visitor::text,'comment_visitor',3,600) then return jsonb_build_object('error','rate_limit'); end if;
  perform 1 from public.blog_posts where id=p_post and status='published' for update;
  if not found then return jsonb_build_object('error','not_found'); end if;
  insert into public.blog_comments(post_id,visitor_id,name,body) values(p_post,p_visitor,p_name,p_body);
  return jsonb_build_object('submitted',true);
end $$;
revoke all on function public.blog_before_post_save(), public.blog_sync_comment_count(), public.blog_consume_limit(text,text,integer,integer),
  public.blog_set_like(uuid,uuid,boolean,text), public.blog_submit_comment(uuid,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.blog_consume_limit(text,text,integer,integer),
  public.blog_set_like(uuid,uuid,boolean,text), public.blog_submit_comment(uuid,uuid,text,text,text) to service_role;

-- Public cover images only. There is no public upload/update/delete policy.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('blog-images','blog-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
notify pgrst, 'reload schema';
commit;
