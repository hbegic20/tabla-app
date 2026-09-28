create type public.quiz_key as enum ('english', 'architecture');

alter table public.quiz_questions drop constraint quiz_questions_quiz_key_check;
alter table public.quiz_questions
  alter column quiz_key type public.quiz_key using quiz_key::public.quiz_key;

alter table public.quiz_attempts drop constraint quiz_attempts_quiz_key_check;
alter table public.quiz_attempts
  alter column quiz_key type public.quiz_key using quiz_key::public.quiz_key;
