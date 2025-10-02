import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ChatMessage, Interview, Question } from '../types'

interface ChatState {
  interviews: Record<string, Interview> // key: candidateId
  messages: Record<string, ChatMessage[]> // key: candidateId
}

const initialState: ChatState = {
  interviews: {},
  messages: {},
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    initInterview: (state, action: PayloadAction<{ candidateId: string; questions: Question[]; meta?: { jobRole?: string; testId?: string; source?: 'remote' | 'local' } }>) => {
      const { candidateId, questions, meta } = action.payload
      state.interviews[candidateId] = { questions, currentIndex: 0, complete: false, createdAt: Date.now(), jobRole: meta?.jobRole, testId: meta?.testId, source: meta?.source }
      if (!state.messages[candidateId]) state.messages[candidateId] = []
    },
    addMessage: (
      state,
      action: PayloadAction<{ candidateId: string; message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: number } }>
    ) => {
      const { candidateId, message } = action.payload
      const withMeta: ChatMessage = {
        id: message.id ?? nanoid(),
        timestamp: message.timestamp ?? Date.now(),
        role: message.role,
        content: message.content,
      }
      if (!state.messages[candidateId]) state.messages[candidateId] = []
      state.messages[candidateId].push(withMeta)
    },
    startQuestion: (state, action: PayloadAction<{ candidateId: string; questionId: string; startedAt?: number }>) => {
      const { candidateId, questionId, startedAt } = action.payload
      const interview = state.interviews[candidateId]
      if (!interview) return
      const q = interview.questions.find((q) => q.id === questionId)
      if (q) q.startedAt = startedAt ?? Date.now()
    },
    answerQuestion: (
      state,
      action: PayloadAction<{ candidateId: string; questionId: string; answer: string; autoSubmitted?: boolean }>
    ) => {
      const { candidateId, questionId, answer, autoSubmitted } = action.payload
      const interview = state.interviews[candidateId]
      if (!interview) return
      const q = interview.questions.find((q) => q.id === questionId)
      if (q) {
        q.answer = answer
        q.autoSubmitted = !!autoSubmitted
        q.endedAt = Date.now()
        // move index
        const idx = interview.questions.findIndex((x) => x.id === questionId)
        if (idx >= 0 && idx === interview.currentIndex) {
          interview.currentIndex = Math.min(interview.currentIndex + 1, interview.questions.length)
          if (interview.currentIndex === interview.questions.length) interview.complete = true
        }
      }
    },
    setGrading: (
      state,
      action: PayloadAction<{ candidateId: string; questionId: string; score: number; feedback?: string; points?: number }>
    ) => {
      const { candidateId, questionId, score, feedback, points } = action.payload
      const interview = state.interviews[candidateId]
      if (!interview) return
      const q = interview.questions.find((q) => q.id === questionId)
      if (q) {
        q.score = score
        q.feedback = feedback
        if (typeof points === 'number') q.points = points
      }
    },
    endInterview: (state, action: PayloadAction<{ candidateId: string; reason?: string }>) => {
      const { candidateId } = action.payload
      const interview = state.interviews[candidateId]
      if (!interview) return
      // Mark as complete and move index to end
      interview.currentIndex = interview.questions.length
      interview.complete = true
      // Optionally mark current question's end time if it was started but not answered
      const current = interview.questions.find((q) => q.startedAt && !q.endedAt)
      if (current) current.endedAt = Date.now()
    },
    removeCandidateData: (state, action: PayloadAction<{ candidateId: string }>) => {
      const { candidateId } = action.payload
      if (state.interviews[candidateId]) delete state.interviews[candidateId]
      if (state.messages[candidateId]) delete state.messages[candidateId]
    },
  },
})

export const { initInterview, addMessage, startQuestion, answerQuestion, setGrading, endInterview, removeCandidateData } = chatSlice.actions

// Selectors for user-specific data
export const selectUserInterviews = (state: { chat: ChatState; tests: { byId: Record<string, { createdBy?: string }> } }, userId?: string) => {
  if (!userId) return { interviews: {}, messages: {} }
  
  const userInterviews: Record<string, Interview> = {}
  const userMessages: Record<string, ChatMessage[]> = {}
  
  Object.entries(state.chat.interviews).forEach(([candidateId, interview]) => {
    if (interview.testId) {
      const test = state.tests.byId[interview.testId]
      if (test && test.createdBy === userId) {
        userInterviews[candidateId] = interview
        userMessages[candidateId] = state.chat.messages[candidateId] || []
      }
    }
  })
  
  return { interviews: userInterviews, messages: userMessages }
}

export default chatSlice.reducer
