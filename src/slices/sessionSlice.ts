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
    },
    setCurrentTestId: (state, action: PayloadAction<string | undefined>) => {
      state.currentTestId = action.payload
    },
  },
})

export const { setActiveCandidate, setWelcomeBack, login, logout, setCurrentTestId } = sessionSlice.actions
export default sessionSlice.reducer
