import { Card, Form, Input, Button, Typography, App } from 'antd'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { login } from '../../slices/sessionSlice'
import { useNavigate } from 'react-router-dom'

export default function LoginInterviewee() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const users = useAppSelector((s) => s.users)
  const { message } = App.useApp()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Card title="Interviewee Login" style={{ width: '100%', maxWidth: 420 }}>
        <Form
        layout="vertical"
        onFinish={(vals: { email: string; password: string }) => {
          const key = `interviewee:${vals.email.trim().toLowerCase()}`
          const acc = users.byKey[key]
          if (!acc || acc.password !== vals.password) {
            message.error('Password is incorrect')
            return
          }
          const id = acc.email
          dispatch(login({ role: 'interviewee', user: { id, name: acc.name, email: acc.email } }))
          message.open({ type: 'success', content: 'Login successful', duration: 1.5 })
          setTimeout(() => navigate('/interviewee'), 150)
        }}
        initialValues={{ email: '', password: '' }}
        >
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="you@example.com" />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true }]}>
          <Input.Password placeholder="Your password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Login
        </Button>
        <Typography.Paragraph style={{ marginTop: 12 }}>
          New here? Use Register instead.
        </Typography.Paragraph>
        </Form>
      </Card>
    </div>
  )
}
