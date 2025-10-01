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

const persistConfig = {
  key: 'root',
  storage: localforage,
  blacklist: [],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

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

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
