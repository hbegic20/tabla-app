export interface VocabWord {
  en: string
  bs: string
  example: string
}

export interface QuizQuestion {
  q: string
  options: string[]
  correct: number
  explain: string
}

export interface RoadmapTopic {
  id: string
  title: string
  note: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type Theme = 'light' | 'dark'

export type MainTab = 'english' | 'architecture'

export type EnglishSubTab = 'chat' | 'vocab' | 'quiz'

export type ArchSubTab = 'roadmap' | 'mentor' | 'quiz'

export type ChatMode = 'tutor' | 'mentor'
