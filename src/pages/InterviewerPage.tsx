import { Layout, Button, Tabs, Tag } from 'antd'
import { useNavigate, Navigate } from 'react-router-dom'
import CandidatesList from '../ui/CandidatesList'
import CandidateDetail from '../ui/CandidateDetail'
import TopTabs from '../ui/TopTabs'
import TestsManager from '../ui/TestsManager'
import { useAppSelector, useAppDispatch } from '../hooks'
import { logout } from '../slices/sessionSlice'

export default function InterviewerPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const activeId = useAppSelector((s) => s.session.activeCandidateId)
  const { isAuthenticated, role, user } = useAppSelector((s) => s.session)
  if (typeof window !== 'undefined' && activeId) window.localStorage.setItem('activeCandidateId', activeId)
  if (!isAuthenticated || role !== 'interviewer') {
    return <Navigate to="/?loggedOut=1" replace />
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>Interviewer Dashboard</div>
        <div style={{ flex: 1 }} />
        <>
          <Tag color="gold">Interviewer</Tag>
          <span style={{ color: '#fff' }}>{user?.name || user?.email}</span>
          <Button onClick={() => { navigate('/?loggedOut=1', { replace: true }); setTimeout(() => dispatch(logout()), 0) }}>Logout</Button>
        </>
  <Button onClick={() => navigate('/interviewee')}>Back to Interviewee</Button>
      </Layout.Header>
      <Layout.Content style={{ padding: '16px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <>
          <TopTabs />
          <Tabs
            defaultActiveKey="list"
            items={[
              { key: 'list', label: 'Candidates', children: <CandidatesList /> },
              { key: 'detail', label: 'Selected Candidate', children: <CandidateDetail /> },
              { key: 'tests', label: 'Tests', children: <TestsManager /> },
            ]}
          />
        </>
      </Layout.Content>
    </Layout>
  )
}
