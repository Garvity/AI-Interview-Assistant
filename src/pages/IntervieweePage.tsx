import { Layout, Tabs, Button, Card, Form, Input, Tag } from 'antd'
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
  
  // Validate test access - interviewees can access any active test
  const isValidTest = test && test.active && (!test.expiresAt || test.expiresAt > Date.now())
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        padding: '0 16px',
        flexWrap: 'wrap',
        minHeight: '64px',
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{ 
          color: '#fff', 
          fontWeight: 700,
          fontSize: window.innerWidth < 768 ? '13px' : '16px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.5px'
        }}>
          AI Interview Assistant
        </div>
        <div style={{ flex: 1, minWidth: '16px' }} />
        {isAuthenticated && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: window.innerWidth < 768 ? '6px' : '12px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
            <Tag 
              color={role === 'interviewer' ? 'gold' : 'blue'} 
              style={{ 
                margin: 0, 
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '16px',
                padding: '2px 8px'
              }}
            >
              {role === 'interviewer' ? 'Interviewer' : 'Interviewee'}
            </Tag>
            <span style={{ 
              color: '#fff',
              fontSize: window.innerWidth < 768 ? '11px' : '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: window.innerWidth < 768 ? '80px' : '120px',
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
              onClick={() => {
                if (role === 'interviewer') {
                  navigate('/interviewer')
                } else {
                  alert('Please sign in as an interviewer to access the dashboard.')
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#1890ff',
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
              Interviewer Dashboard
            </Button>
          </div>
        )}
        {!isAuthenticated && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: window.innerWidth < 768 ? '6px' : '8px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
            <Button 
              size={window.innerWidth < 768 ? 'small' : 'middle'}
              onClick={() => navigate('/login/interviewee')}
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
              Login
            </Button>
            <Button 
              size={window.innerWidth < 768 ? 'small' : 'middle'}
              type="primary"
              onClick={() => navigate('/register/interviewee')}
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#1890ff',
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
              Register
            </Button>
            <Button 
              size={window.innerWidth < 768 ? 'small' : 'middle'}
              onClick={() => navigate('/?loggedOut=1')}
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
              More
            </Button>
          </div>
        )}
      </Layout.Header>
      <Layout.Content style={{ 
        padding: window.innerWidth < 768 ? '12px 16px' : '24px 32px', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%',
        minHeight: 'calc(100vh - 64px)',
        background: '#f8fafc'
      }}>
        <TopTabs />
        <WelcomeBackModal />
        <Card 
          size="small" 
          style={{ 
            marginBottom: 16,
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e8f4f8',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fdff 100%)'
          }}
        >
          <Form
            layout="vertical"
            onFinish={(vals: { testId: string }) => dispatch(setCurrentTestId(vals.testId.trim()))}
            initialValues={{ testId: currentTestId ?? '' }}
            style={{ marginBottom: 0 }}
          >
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              gap: '12px',
              alignItems: window.innerWidth < 768 ? 'stretch' : 'flex-end'
            }}>
              <Form.Item 
                name="testId" 
                rules={[{ required: true, message: 'Enter Test ID' }]}
                style={{ flex: 1, marginBottom: window.innerWidth < 768 ? 12 : 0 }}
              >
                <Input 
                  placeholder="Enter Test ID provided by interviewer" 
                  style={{ 
                    width: '100%',
                    borderRadius: '8px',
                    border: '2px solid #e1f5fe',
                    fontSize: '14px',
                    padding: '8px 12px'
                  }}
                  size="large"
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  size="large"
                  style={{ 
                    width: window.innerWidth < 768 ? '100%' : 'auto',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(24, 144, 255, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.3)'
                  }}
                >
                  Use Test
                </Button>
              </Form.Item>
            </div>
            {test && (
              <div style={{ 
                display: 'flex', 
                gap: '4px', 
                marginTop: 8,
                flexWrap: 'wrap'
              }}>
                <Tag color={test.active ? 'green' : 'red'}>
                  {test.active ? 'Active' : 'Inactive'}
                </Tag>
                {test.expiresAt && (
                  <Tag color={dayjs(test.expiresAt).isBefore(dayjs()) ? 'red' : 'blue'}>
                    Expires: {dayjs(test.expiresAt).format(window.innerWidth < 768 ? 'MM/DD HH:mm' : 'YYYY-MM-DD HH:mm')}
                  </Tag>
                )}
              </div>
            )}
          </Form>
        </Card>
        <div className="interviewee-tabs-wrapper">
          <Tabs
            defaultActiveKey="resume"
            items={[
              { 
                key: 'resume', 
                label: '1. Resume & Details', 
                children: isValidTest ? <ResumeStep /> : (
                  <Card>
                    {currentTestId && !test ? 
                      'Test ID not found. Please check with your interviewer for the correct Test ID.' :
                      !test?.active ? 
                        'This test is currently inactive. Please contact your interviewer.' :
                        'Please enter a valid, active Test ID to begin.'
                    }
                  </Card>
                )
              },
              { 
                key: 'chat', 
                label: '2. Interview Chat', 
                children: isValidTest ? <ChatStep /> : (
                  <Card>
                    {currentTestId && !test ? 
                      'Test ID not found. Interview chat is not available.' :
                      !test?.active ? 
                        'Interview chat is not available - test is inactive.' :
                        'Chat will be available once a valid Test ID is set.'
                    }
                  </Card>
                )
              },
            ]}
            tabBarStyle={{
              gap: '16px',
              display: 'flex'
            }}
          />
        </div>
      </Layout.Content>
    </Layout>
  )
}
