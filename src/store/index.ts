import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import localforage from 'localforage'
import candidatesReducer from '../slices/candidatesSlice'
import sessionReducer from '../slices/sessionSlice'
import chatReducer from '../slices/chatSlice'
import testsReducer from '../slices/testsSlice'
import usersReducer from '../slices/usersSlice'

const rootReducer = combineReducers({
  candidates: candidatesReducer,
  session: sessionReducer,
  chat: chatReducer,
  tests: testsReducer,
  users: usersReducer,
})

// Function to create user-scoped persistence config
const createPersistConfig = (userId?: string) => ({
  key: userId ? `ai-interview-${userId}` : 'ai-interview-guest',
  storage: localforage,
  blacklist: [], // We'll handle user isolation at the slice level
})

// Default persist config for guest/initial state
const defaultPersistConfig = createPersistConfig()
const persistedReducer = persistReducer(defaultPersistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

// Function to create a new store with user-scoped persistence
export const createUserStore = (userId: string) => {
  const userPersistConfig = createPersistConfig(userId)
  const userPersistedReducer = persistReducer(userPersistConfig, rootReducer)
  
  const userStore = configureStore({
    reducer: userPersistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  })
  
  const userPersistor = persistStore(userStore)
  
  return { store: userStore, persistor: userPersistor }
}

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
