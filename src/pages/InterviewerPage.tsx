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
      <Layout.Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        padding: '0 16px',
        flexWrap: 'wrap',
        minHeight: '64px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{ 
          color: '#fff', 
          fontWeight: 700,
          fontSize: window.innerWidth < 768 ? '13px' : '16px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '0.5px'
        }}>
          Interviewer Dashboard
        </div>
        <div style={{ flex: 1, minWidth: '16px' }} />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: window.innerWidth < 768 ? '6px' : '12px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          <Tag 
            color="gold" 
            style={{ 
              margin: 0,
              fontWeight: 600,
              borderRadius: '16px',
              padding: '2px 8px',
              fontSize: '11px'
            }}
          >
            Interviewer
          </Tag>
          <span style={{ 
            color: '#fff',
            fontSize: window.innerWidth < 768 ? '11px' : '13px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: window.innerWidth < 768 ? '80px' : '150px',
            fontWeight: 500
          }}>
            {user?.name || user?.email}
          </span>
          <Button 
            size={window.innerWidth < 768 ? 'small' : 'middle'}
            onClick={() => { navigate('/?loggedOut=1', { replace: true }); setTimeout(() => dispatch(logout()), 0) }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: '20px',
              fontWeight: 500,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Logout
          </Button>
          <Button 
            size={window.innerWidth < 768 ? 'small' : 'middle'}
            onClick={() => navigate('/interviewee')}
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#667eea',
              borderRadius: '20px',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {window.innerWidth < 768 ? 'Interviewee' : 'Back to Interviewee'}
          </Button>
        </div>
      </Layout.Header>
      <Layout.Content style={{ 
        padding: window.innerWidth < 768 ? '12px 16px' : '24px 32px', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%',
        minHeight: 'calc(100vh - 64px)',
        background: '#f8fafc'
      }}>
        <>
          <TopTabs />
          <div className="interviewer-tabs-wrapper">
            <Tabs
              defaultActiveKey="list"
              items={[
                { key: 'list', label: 'Candidates', children: <CandidatesList /> },
                { key: 'detail', label: 'Selected Candidate', children: <CandidateDetail /> },
                { key: 'tests', label: 'Tests', children: <TestsManager /> },
              ]}
              tabBarStyle={{
                gap: '16px',
                display: 'flex'
              }}
            />
          </div>
        </>
      </Layout.Content>
    </Layout>
  )
}
