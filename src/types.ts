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
