import { Card, Button, Space, Typography, Layout } from 'antd'
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../hooks'

export default function AuthLanding() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAppSelector((s) => s.session)
  const [params] = useSearchParams()
  const loggedOut = params.get('loggedOut') === '1'
  if (isAuthenticated && !loggedOut) {
    if (role === 'interviewer') return <Navigate to="/interviewer" replace />
    if (role === 'interviewee') return <Navigate to="/interviewee" replace />
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>AI Interview Assistant</div>
      </Layout.Header>
      <Layout.Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ maxWidth: 560, width: '100%' }}>
          <Typography.Title level={4} style={{ textAlign: 'center' }}>Continue as</Typography.Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card size="small" title="Interviewee">
              <Space>
                <Button type="primary" onClick={() => navigate('/login/interviewee')}>Login</Button>
                <Button type="primary" onClick={() => navigate('/register/interviewee')}>Register</Button>
              </Space>
            </Card>
            <Card size="small" title="Interviewer">
              <Space>
                <Button type="primary" onClick={() => navigate('/login/interviewer')}>Login</Button>
                <Button type="primary" onClick={() => navigate('/register/interviewer')}>Register</Button>
              </Space>
            </Card>
          </Space>
        </Card>
      </Layout.Content>
    </Layout>
  )
}
