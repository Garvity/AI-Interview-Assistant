import { Layout, Tabs, Button, Card, Form, Input, Space, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../hooks'
import { logout, setCurrentTestId } from '../slices/sessionSlice'
import ResumeStep from '../ui/ResumeStep'
import ChatStep from '../ui/ChatStep'
import WelcomeBackModal from '../ui/WelcomeBackModal'
import TopTabs from '../ui/TopTabs'
import dayjs from 'dayjs'

export default function IntervieweePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated, role, user } = useAppSelector((s) => s.session)
  const currentTestId = useAppSelector((s) => s.session.currentTestId)
  const tests = useAppSelector((s) => s.tests)
  const test = currentTestId ? tests.byId[currentTestId] : undefined
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>AI Interview Assistant</div>
        <div style={{ flex: 1 }} />
        {isAuthenticated && (
          <>
            <Tag color={role === 'interviewer' ? 'gold' : 'blue'}>{role === 'interviewer' ? 'Interviewer' : 'Interviewee'}</Tag>
            <span style={{ color: '#fff' }}>{user?.name || user?.email}</span>
            <Button onClick={() => { navigate('/?loggedOut=1', { replace: true }); setTimeout(() => dispatch(logout()), 0) }}>Logout</Button>
            <Button 
              onClick={() => {
                if (role === 'interviewer') {
                  navigate('/interviewer')
                } else {
                  alert('Please sign in as an interviewer to access the dashboard.')
                }
              }}
            >
              Interviewer Dashboard
            </Button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Button onClick={() => navigate('/login/interviewee')}>Interviewee Login</Button>
            <Button type="primary" onClick={() => navigate('/register/interviewee')}>Interviewee Register</Button>
            <Button onClick={() => navigate('/login/interviewer')}>Interviewer Login</Button>
            <Button onClick={() => navigate('/register/interviewer')}>Interviewer Register</Button>
            <Button onClick={() => navigate('/?loggedOut=1')}>All Auth Options</Button>
          </>
        )}
      </Layout.Header>
      <Layout.Content style={{ padding: '16px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <TopTabs />
        <WelcomeBackModal />
        <Card size="small" style={{ marginBottom: 16 }}>
          <Form
            layout="inline"
            onFinish={(vals: { testId: string }) => dispatch(setCurrentTestId(vals.testId.trim()))}
            initialValues={{ testId: currentTestId ?? '' }}
          >
            <Form.Item name="testId" rules={[{ required: true, message: 'Enter Test ID' }]}>
              <Input placeholder="Enter Test ID provided by interviewer" style={{ width: 360 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Use Test</Button>
            </Form.Item>
            {test && (
              <Space style={{ marginLeft: 12 }}>
                <Tag color={test.active ? 'green' : 'red'}>{test.active ? 'Active' : 'Inactive'}</Tag>
                {test.expiresAt && (
                  <Tag color={dayjs(test.expiresAt).isBefore(dayjs()) ? 'red' : 'blue'}>
                    Expires: {dayjs(test.expiresAt).format('YYYY-MM-DD HH:mm')}
                  </Tag>
                )}
              </Space>
            )}
          </Form>
        </Card>
        <Tabs
          defaultActiveKey="resume"
          items={[
            { key: 'resume', label: '1. Resume & Details', children: (test && test.active && (!test.expiresAt || dayjs(test.expiresAt).isAfter(dayjs()))) ? <ResumeStep /> : <Card>Please enter a valid, active Test ID to begin.</Card> },
            { key: 'chat', label: '2. Interview Chat', children: (test && test.active && (!test.expiresAt || dayjs(test.expiresAt).isAfter(dayjs()))) ? <ChatStep /> : <Card>Chat will be available once a valid Test ID is set.</Card> },
          ]}
        />
      </Layout.Content>
    </Layout>
  )
}
