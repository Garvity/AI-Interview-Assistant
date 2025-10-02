import { useMemo, useState } from 'react'
import { Card, Input, Table, Tag, Popconfirm, Button, Space, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setActiveCandidate, setCurrentTestId } from '../slices/sessionSlice'
import { removeCandidate, selectUserCandidates, updateProfile } from '../slices/candidatesSlice'
import { removeCandidateData } from '../slices/chatSlice'
import { persistor } from '../store'
import { useNavigate } from 'react-router-dom'

export default function CandidatesList() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.session.user)
  const { byId, allIds } = useAppSelector((s) => selectUserCandidates(s, user?.id))
  const [query, setQuery] = useState('')

  const roleLabels: Record<string, string> = {
    full_stack: 'Full Stack',
    java_backend: 'Java Backend',
    web_development: 'Web Development',
    ai_ml_engineer: 'AI/ML Engineer',
  }

  const data = useMemo(() => {
    const rows = allIds.map((id: string) => byId[id]).filter(Boolean)
    const filtered = rows.filter((r: typeof byId[string]) => {
      const t = `${r.profile.name ?? ''} ${r.profile.email ?? ''}`.toLowerCase()
      return t.includes(query.toLowerCase())
    })
    // Order by score desc, then createdAt desc
  return filtered.sort((a: typeof rows[number], b: typeof rows[number]) => (b.profile.finalScore ?? -1) - (a.profile.finalScore ?? -1) || b.profile.createdAt - a.profile.createdAt)
  }, [byId, allIds, query])

  type Row = NonNullable<(typeof data)[number]>
  
  // Mobile-friendly columns configuration
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  const columns: ColumnsType<Row> = [
    { 
      title: 'Name', 
      dataIndex: ['profile', 'name'], 
      key: 'name', 
      sorter: (a, b) => (a.profile.name ?? '').localeCompare(b.profile.name ?? ''),
      width: isMobile ? 100 : undefined,
      ellipsis: true
    },
    { 
      title: 'Email', 
      dataIndex: ['profile', 'email'], 
      key: 'email', 
      sorter: (a, b) => (a.profile.email ?? '').localeCompare(b.profile.email ?? ''),
      responsive: ['md'],
      ellipsis: true
    },
    { 
      title: 'Phone', 
      dataIndex: ['profile', 'phone'], 
      key: 'phone',
      responsive: ['lg'],
      ellipsis: true
    },
    {
      title: 'Role',
      dataIndex: ['profile', 'jobRole'],
      key: 'jobRole',
      filters: [
        { text: 'Full Stack', value: 'full_stack' },
        { text: 'Java Backend', value: 'java_backend' },
        { text: 'Web Development', value: 'web_development' },
        { text: 'AI/ML Engineer', value: 'ai_ml_engineer' },
      ],
      onFilter: (v, r) => r.profile.jobRole === v,
      render: (r?: string) => (
        <Tag style={{ fontSize: isMobile ? '10px' : '12px' }}>
          {isMobile ? (r === 'full_stack' ? 'FS' : r === 'java_backend' ? 'Java' : r === 'web_development' ? 'Web' : r === 'ai_ml_engineer' ? 'AI/ML' : '-') : (roleLabels[r ?? ''] ?? '-')}
        </Tag>
      ),
      sorter: (a, b) => (roleLabels[a.profile.jobRole ?? ''] ?? '').localeCompare(roleLabels[b.profile.jobRole ?? ''] ?? ''),
      width: isMobile ? 60 : undefined
    },
    { 
      title: 'Test ID', 
      dataIndex: ['profile', 'testId'], 
      key: 'testId',
      responsive: ['lg'],
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: ['profile', 'status'],
      key: 'status',
      filters: [
        { text: 'New', value: 'new' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Completed', value: 'completed' },
      ],
      onFilter: (v, r) => r.profile.status === v,
      render: (s: string) => (
        <Tag 
          color={s === 'completed' ? 'green' : s === 'in_progress' ? 'blue' : 'default'}
          style={{ fontSize: isMobile ? '9px' : '11px', padding: isMobile ? '1px 4px' : undefined }}
        >
          {isMobile ? (s === 'completed' ? 'Done' : s === 'in_progress' ? 'Active' : 'New') : s}
        </Tag>
      ),
      width: isMobile ? 50 : undefined
    },
    { 
      title: 'Score', 
      dataIndex: ['profile', 'finalScore'], 
      key: 'score', 
      sorter: (a, b) => (a.profile.finalScore ?? -1) - (b.profile.finalScore ?? -1),
      width: isMobile ? 50 : undefined,
      render: (score) => score != null ? score : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: isMobile ? 80 : 140,
      render: (_: unknown, r) => (
        <Space size={isMobile ? 4 : 8}>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              dispatch(setActiveCandidate(r.profile.id))
              if (r.profile.testId) dispatch(setCurrentTestId(r.profile.testId))
              if (typeof window !== 'undefined') window.localStorage.setItem('activeCandidateId', r.profile.id)
              // Reset status and clear previous interview/messages so candidate can retake with fresh LLM questions
              dispatch(updateProfile({ id: r.profile.id, status: 'in_progress', finalScore: undefined, summary: undefined }))
              dispatch(removeCandidateData({ candidateId: r.profile.id }))
              navigate('/interviewee')
            }}
            style={{ 
              fontSize: isMobile ? '10px' : '12px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(82, 196, 26, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(82, 196, 26, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(82, 196, 26, 0.3)'
            }}
          >
            {isMobile ? 'Start' : 'Begin'}
          </Button>
          <Popconfirm
            title="Delete candidate?"
            description={`Remove ${r.profile.name || r.profile.email}? This cannot be undone.`}
            okText="Delete"
            okButtonProps={{ 
              danger: true,
              style: {
                borderRadius: '6px',
                fontWeight: 600
              }
            }}
            onConfirm={() => {
              const currentActive = (typeof window !== 'undefined' ? window.localStorage.getItem('activeCandidateId') : undefined)
              dispatch(removeCandidate({ id: r.profile.id }))
              dispatch(removeCandidateData({ candidateId: r.profile.id }))
              if (currentActive === r.profile.id) {
                dispatch(setActiveCandidate(undefined))
                if (typeof window !== 'undefined') window.localStorage.removeItem('activeCandidateId')
              }
              message.success('Candidate deleted')
            }}
          >
            <Button 
              danger 
              size="small"
              style={{ 
                fontSize: isMobile ? '10px' : '12px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(255, 77, 79, 0.3)',
                transition: 'all 0.2s ease',
                color: '#fff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 77, 79, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(255, 77, 79, 0.3)'
              }}
            >
              {isMobile ? 'Del' : 'Delete'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="Candidates"
      extra={
        <Space>
          <Popconfirm
            title="Reset all data?"
            description="This will clear all candidates and sessions from local storage."
            onConfirm={async () => {
              await persistor.purge()
              window.location.reload()
            }}
          >
            <Button danger>Reset All Data</Button>
          </Popconfirm>
        </Space>
      }
    >
      <Input.Search 
        placeholder="Search by name or email" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        style={{ marginBottom: 12 }}
        size={isMobile ? 'large' : 'middle'}
      />
      <Table
        rowKey={(r) => r.profile.id}
        dataSource={data}
        columns={columns}
        onRow={(record) => ({ onClick: () => dispatch(setActiveCandidate(record.profile.id)) })}
        pagination={{ 
          pageSize: isMobile ? 5 : 8, 
          responsive: true,
          showSizeChanger: false,
          showQuickJumper: false,
          size: isMobile ? 'small' : 'default'
        }}
        scroll={{ x: isMobile ? 400 : 1024 }}
        size={isMobile ? 'small' : 'middle'}
        rowClassName={(record) => (record.profile.id === (typeof window !== 'undefined' ? window.localStorage.getItem('activeCandidateId') : '') ? 'ant-table-row-selected' : '')}
      />
    </Card>
  )
}
