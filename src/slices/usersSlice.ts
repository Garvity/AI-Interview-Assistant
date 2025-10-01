import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'interviewee' | 'interviewer'

export interface UserAccount {
  role: UserRole
  email: string
  name?: string
  password: string // NOTE: demo only, stored in plain text for local persistence
  createdAt: number
}

interface UsersState {
  byKey: Record<string, UserAccount> // key = `${role}:${email.toLowerCase()}`
}

const initialState: UsersState = {
  byKey: {},
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    registerUser: (state, action: PayloadAction<{ role: UserRole; email: string; name?: string; password: string }>) => {
      const email = action.payload.email.trim().toLowerCase()
      const key = `${action.payload.role}:${email}`
      // Do not overwrite existing accounts (idempotent register)
      if (state.byKey[key]) {
        return
      }
      state.byKey[key] = {
        role: action.payload.role,
        email,
        name: action.payload.name,
        password: action.payload.password,
        createdAt: Date.now(),
      }
    },
  },
})

export const { registerUser } = usersSlice.actions
export default usersSlice.reducer
