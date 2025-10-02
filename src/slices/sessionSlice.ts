import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SessionState {
  activeCandidateId?: string
  showWelcomeBack: boolean
  isAuthenticated: boolean
  role?: 'interviewee' | 'interviewer'
  user?: { id: string; name?: string; email?: string }
  currentTestId?: string
}

const initialState: SessionState = {
  activeCandidateId: undefined,
  showWelcomeBack: false,
  isAuthenticated: false,
  role: undefined,
  user: undefined,
  currentTestId: undefined,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setActiveCandidate: (state, action: PayloadAction<string | undefined>) => {
      state.activeCandidateId = action.payload
    },
    setWelcomeBack: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBack = action.payload
    },
    login: (
      state,
      action: PayloadAction<{ role: 'interviewee' | 'interviewer'; user: { id: string; name?: string; email?: string } }>
    ) => {
      // Clear any existing session data when logging in as a different user
      const previousUserId = state.user?.id
      const newUserId = action.payload.user.id
      
      if (previousUserId && previousUserId !== newUserId) {
        // User is switching accounts - clear session-specific data
        state.activeCandidateId = undefined
        state.currentTestId = undefined
      }
      
      state.isAuthenticated = true
      state.role = action.payload.role
      state.user = action.payload.user
      state.showWelcomeBack = true
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.role = undefined
      state.user = undefined
      state.showWelcomeBack = false
      state.activeCandidateId = undefined
      state.currentTestId = undefined
    },
    setCurrentTestId: (state, action: PayloadAction<string | undefined>) => {
      state.currentTestId = action.payload
    },
    clearUserData: (state) => {
      // Reset session-specific data when switching users
      state.activeCandidateId = undefined
      state.currentTestId = undefined
      state.showWelcomeBack = false
    },
  },
})

export const { setActiveCandidate, setWelcomeBack, login, logout, setCurrentTestId, clearUserData } = sessionSlice.actions
export default sessionSlice.reducer
