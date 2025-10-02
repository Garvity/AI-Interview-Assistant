import { Tabs } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../hooks'

export default function TopTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role } = useAppSelector((s) => s.session)
  const key = location.pathname.startsWith('/interviewer') ? 'interviewer' : 'interviewee'
  return (
    <div style={{ marginBottom: '16px' }} className="top-tabs-wrapper">
      <Tabs
        activeKey={key}
        onChange={(k) => {
          if (k === 'interviewer') {
            if (role === 'interviewer') {
              navigate('/interviewer')
            } else {
              alert('Please sign in as an interviewer to access the dashboard.')
            }
          } else {
            navigate('/interviewee')
          }
        }}
        items={[
          { key: 'interviewee', label: 'Interviewee' },
          { key: 'interviewer', label: 'Interviewer' },
        ]}
        tabBarStyle={{
          gap: '16px',
          display: 'flex'
        }}
      />
    </div>
  )
}
