import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { TestDefinition } from '../types'

interface TestsState {
  byId: Record<string, TestDefinition>
  allIds: string[]
}

const initialState: TestsState = {
  byId: {},
  allIds: [],
}

const testsSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    createTest: (
      state,
      action: PayloadAction<{ id?: string; label?: string; expiresAt?: number; createdBy?: string; jobDescription?: string }>
    ) => {
      const id = action.payload.id ?? nanoid(6)
      if (state.byId[id]) return // ignore duplicates
      const test: TestDefinition = {
        id,
        label: action.payload.label,
        active: true,
        createdAt: Date.now(),
        createdBy: action.payload.createdBy,
        expiresAt: action.payload.expiresAt,
        jobDescription: action.payload.jobDescription,
      }
      state.byId[id] = test
      state.allIds.unshift(id)
    },
    deleteTest: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
      if (state.byId[id]) {
        delete state.byId[id]
        state.allIds = state.allIds.filter((x) => x !== id)
      }
    },
    setActive: (state, action: PayloadAction<{ id: string; active: boolean }>) => {
      const t = state.byId[action.payload.id]
      if (t) t.active = action.payload.active
    },
    setExpiry: (state, action: PayloadAction<{ id: string; expiresAt?: number }>) => {
      const t = state.byId[action.payload.id]
      if (t) t.expiresAt = action.payload.expiresAt
    },
    setLabel: (state, action: PayloadAction<{ id: string; label?: string }>) => {
      const t = state.byId[action.payload.id]
      if (t) t.label = action.payload.label
    },
  },
})

export const { createTest, deleteTest, setActive, setExpiry, setLabel } = testsSlice.actions
export default testsSlice.reducer
