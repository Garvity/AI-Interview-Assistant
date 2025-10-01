import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ConfigProvider, App as AntApp } from 'antd'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { store, persistor } from './store'
const IntervieweePage = React.lazy(() => import('./pages/IntervieweePage'))
const InterviewerPage = React.lazy(() => import('./pages/InterviewerPage'))
const AuthLanding = React.lazy(() => import('./pages/AuthLanding'))
const LoginInterviewee = React.lazy(() => import('./pages/auth/LoginInterviewee'))
const RegisterInterviewee = React.lazy(() => import('./pages/auth/RegisterInterviewee'))
const LoginInterviewer = React.lazy(() => import('./pages/auth/LoginInterviewer'))
const RegisterInterviewer = React.lazy(() => import('./pages/auth/RegisterInterviewer'))
import './index.css'

const router = createBrowserRouter([
  { path: '/', element: <AuthLanding /> },
  { path: '/interviewer', element: <InterviewerPage /> },
  { path: '/login/interviewee', element: <LoginInterviewee /> },
  { path: '/register/interviewee', element: <RegisterInterviewee /> },
  { path: '/login/interviewer', element: <LoginInterviewer /> },
  { path: '/register/interviewer', element: <RegisterInterviewer /> },
  { path: '/interviewee', element: <IntervieweePage /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
          <AntApp>
            <React.Suspense fallback={null}>
              <RouterProvider router={router} />
            </React.Suspense>
          </AntApp>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
