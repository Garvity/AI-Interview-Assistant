export type Difficulty = 'easy' | 'medium' | 'hard'

export interface CandidateProfile {
  id: string
  name?: string
  email?: string
  phone?: string
  jobRole?: string
  resumeFileName?: string
  resumeDataUrl?: string
  resumeMimeType?: string
  createdAt: number
  status: 'new' | 'in_progress' | 'completed'
  finalScore?: number
  summary?: string
  testId?: string
}

export interface Question {
  id: string
  difficulty: Difficulty
  text: string
  durationSec: number
  startedAt?: number
  endedAt?: number
  answer?: string
  autoSubmitted?: boolean
  // Legacy 0-10 score (kept for backward compatibility)
  score?: number
  // New points-based scoring
  points?: number
  maxPoints?: number
  feedback?: string
}

export interface Interview {
  questions: Question[]
  currentIndex: number
  complete: boolean
  createdAt?: number
  jobRole?: string
  testId?: string
  source?: 'remote' | 'local'
}

export interface ChatMessage {
  id: string
  role: 'system' | 'ai' | 'user' | 'meta'
  content: string
  timestamp: number
}

export interface CandidateRecord {
  profile: CandidateProfile
  interview?: Interview
  chat: ChatMessage[]
}

export interface TestDefinition {
  id: string // human-friendly code used by interviewee
  label?: string
  active: boolean
  createdAt: number
  createdBy?: string // interviewer user id
  expiresAt?: number // timestamp at which test becomes invalid
  jobDescription?: string // optional JD to guide LLM question generation
}
