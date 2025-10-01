import { Card, Form, Input, Button, App } from 'antd'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../slices/usersSlice'

export default function RegisterInterviewee() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const users = useAppSelector((s) => s.users)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Card title="Interviewee Register" style={{ width: '100%', maxWidth: 420 }}>
        <Form
        layout="vertical"
        onFinish={(vals: { name: string; email: string; password: string }) => {
          const emailKey = `interviewee:${vals.email.trim().toLowerCase()}`
          if (users.byKey[emailKey]) {
            message.error('Email is already taken')
            return
          }
          const nameTaken = Object.keys(users.byKey).some((k: string) => {
            const u = users.byKey[k] as { role: 'interviewee' | 'interviewer'; name?: string }
            return u.role === 'interviewee' && !!u.name && !!vals.name && u.name.trim().toLowerCase() === vals.name.trim().toLowerCase()
          })
          if (nameTaken) {
            message.error('Username is already taken')
            return
          }
          dispatch(registerUser({ role: 'interviewee', email: vals.email, name: vals.name, password: vals.password }))
          message.success('Account created')
          navigate('/')
        }}
      >
          <Form.Item label="Full name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Jane Doe" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="At least 6 characters" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Create account
          </Button>
        </Form>
      </Card>
    </div>
  )
}
