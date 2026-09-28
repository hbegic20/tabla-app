create table public.roadmap_topics (
  id text primary key,
  title text not null,
  note text not null,
  sort_order int not null unique
);

create table public.vocab_words (
  id bigint generated always as identity primary key,
  en text not null unique,
  bs text not null,
  example text not null
);

create table public.quiz_questions (
  id bigint generated always as identity primary key,
  quiz_key text not null check (quiz_key in ('english', 'architecture')),
  question text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  correct_index int not null,
  explain text not null,
  check (correct_index >= 0 and correct_index < jsonb_array_length(options))
);

create index quiz_questions_quiz_key_idx on public.quiz_questions (quiz_key);

create table public.roadmap_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic_id text not null references public.roadmap_topics (id) on delete cascade,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table public.vocab_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  word_id bigint not null references public.vocab_words (id) on delete cascade,
  box smallint not null default 0 check (box between 0 and 4),
  next_review timestamptz not null default now(),
  last_result text check (last_result in ('known', 'unknown')),
  primary key (user_id, word_id)
);

create table public.quiz_question_history (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id bigint not null references public.quiz_questions (id) on delete cascade,
  last_seen timestamptz not null default now(),
  correct boolean not null,
  primary key (user_id, question_id)
);

create table public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  quiz_key text not null check (quiz_key in ('english', 'architecture')),
  score int not null,
  total int not null check (total > 0),
  taken_at timestamptz not null default now(),
  check (score between 0 and total)
);

create index quiz_attempts_user_quiz_idx on public.quiz_attempts (user_id, quiz_key);

create table public.writing_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  prompt text not null,
  submission text not null,
  feedback text not null,
  created_at timestamptz not null default now()
);

create index writing_entries_user_created_idx on public.writing_entries (user_id, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger roadmap_progress_set_updated_at
before update on public.roadmap_progress
for each row execute function public.set_updated_at();

alter table public.roadmap_topics enable row level security;
alter table public.vocab_words enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.roadmap_progress enable row level security;
alter table public.vocab_progress enable row level security;
alter table public.quiz_question_history enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.writing_entries enable row level security;

create policy "Authenticated users can read roadmap topics"
on public.roadmap_topics for select to authenticated
using (true);

create policy "Authenticated users can read vocab words"
on public.vocab_words for select to authenticated
using (true);

create policy "Authenticated users can read quiz questions"
on public.quiz_questions for select to authenticated
using (true);

create policy "Users can read own roadmap progress"
on public.roadmap_progress for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own roadmap progress"
on public.roadmap_progress for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own roadmap progress"
on public.roadmap_progress for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can read own vocab progress"
on public.vocab_progress for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own vocab progress"
on public.vocab_progress for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own vocab progress"
on public.vocab_progress for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can read own quiz question history"
on public.quiz_question_history for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own quiz question history"
on public.quiz_question_history for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own quiz question history"
on public.quiz_question_history for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can read own quiz attempts"
on public.quiz_attempts for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own quiz attempts"
on public.quiz_attempts for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can read own writing entries"
on public.writing_entries for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own writing entries"
on public.writing_entries for insert to authenticated
with check ((select auth.uid()) = user_id);
