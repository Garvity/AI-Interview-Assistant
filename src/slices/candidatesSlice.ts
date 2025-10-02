import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { CandidateRecord, CandidateProfile } from '../types'

interface CandidatesState {
  byId: Record<string, CandidateRecord>
  allIds: string[]
}

const initialState: CandidatesState = {
  byId: {},
  allIds: [],
}

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    upsertCandidate: (state, action: PayloadAction<CandidateRecord>) => {
      const { profile, chat } = action.payload
      const existing = state.byId[profile.id]
      if (existing) {
        // Merge profile fields without wiping existing status/score unless provided
        existing.profile = { ...existing.profile, ...profile }
        // Preserve existing chat; append only if provided non-empty chat
        if (chat && chat.length) {
          existing.chat.push(...chat)
        }
      } else {
        state.byId[profile.id] = { profile, chat: chat ?? [] }
        state.allIds.unshift(profile.id)
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<CandidateProfile> & { id: string }>) => {
      const { id, ...rest } = action.payload
      const rec = state.byId[id]
      if (rec) {
        rec.profile = { ...rec.profile, ...rest }
      }
    },
    setFinalResult: (state, action: PayloadAction<{ id: string; finalScore: number; summary: string }>) => {
      const { id, finalScore, summary } = action.payload
      const rec = state.byId[id]
      if (rec) {
        rec.profile.finalScore = finalScore
        rec.profile.summary = summary
        rec.profile.status = 'completed'
      }
    },
    appendChat: (
      state,
      action: PayloadAction<{ id: string; message: CandidateRecord['chat'][number] }>
    ) => {
      const { id, message } = action.payload
      const rec = state.byId[id]
      if (rec) rec.chat.push(message)
    },
    setCandidateRecord: (state, action: PayloadAction<CandidateRecord>) => {
      const rec = action.payload
      state.byId[rec.profile.id] = rec
      if (!state.allIds.includes(rec.profile.id)) state.allIds.unshift(rec.profile.id)
    },
    removeCandidate: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
      if (state.byId[id]) {
        delete state.byId[id]
        state.allIds = state.allIds.filter((x) => x !== id)
      }
    },
  },
})

export const { upsertCandidate, updateProfile, setFinalResult, appendChat, setCandidateRecord, removeCandidate } =
  candidatesSlice.actions

// Selectors for user-specific data
export const selectUserCandidates = (state: { candidates: CandidatesState; tests: { byId: Record<string, { createdBy?: string }> } }, userId?: string) => {
  if (!userId) return { byId: {}, allIds: [] }
  
  const userCandidates: Record<string, CandidateRecord> = {}
  const userIds: string[] = []
  
  state.candidates.allIds.forEach(id => {
    const candidate = state.candidates.byId[id]
    if (candidate && candidate.profile.testId) {
      const test = state.tests.byId[candidate.profile.testId]
      if (test && test.createdBy === userId) {
        userCandidates[id] = candidate
        userIds.push(id)
      }
    }
  })
  
  return { byId: userCandidates, allIds: userIds }
}

export default candidatesSlice.reducer
