import { useState, useMemo } from 'react'
import { Card, Form, Input, DatePicker, Switch, Button, Table, Popconfirm, Tag } from 'antd'
import dayjs from 'dayjs'
import { useAppDispatch, useAppSelector } from '../hooks'
import { createTest, deleteTest, setActive, setExpiry, setLabel, selectUserTests } from '../slices/testsSlice'
import type { TestDefinition } from '../types'

export default function TestsManager() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.session.user)
  const tests = useAppSelector((s) => selectUserTests(s, user?.id))
  const data: TestDefinition[] = useMemo(() => tests.allIds.map((id: string) => tests.byId[id]), [tests])
  const [form] = Form.useForm()
  const [creating, setCreating] = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <Card title="Manage Tests">
      <Form
        form={form}
        layout={isMobile ? "vertical" : "inline"}
        onFinish={(vals: { label?: string; expiresAt?: dayjs.Dayjs; jobDescription?: string }) => {
          setCreating(true)
          dispatch(createTest({ label: vals.label, expiresAt: vals.expiresAt?.valueOf(), createdBy: user?.id, jobDescription: vals.jobDescription }))
          form.resetFields()
          setCreating(false)
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '8px',
          alignItems: isMobile ? 'stretch' : 'flex-end',
          flexWrap: isMobile ? 'nowrap' : 'wrap'
        }}>
          <Form.Item name="label" style={{ flex: isMobile ? undefined : 1, marginBottom: isMobile ? 12 : 0 }}>
            <Input 
              placeholder="Test label (optional)" 
              size={isMobile ? 'large' : 'middle'}
            />
          </Form.Item>
          <Form.Item name="jobDescription" style={{ flex: isMobile ? undefined : 2, marginBottom: isMobile ? 12 : 0 }}>
            <Input.TextArea 
              placeholder="Job description (optional, used to guide LLM questions)" 
              autoSize={{ minRows: 1, maxRows: 3 }} 
              style={{ width: '100%' }}
              size={isMobile ? 'large' : 'middle'}
            />
          </Form.Item>
          <Form.Item name="expiresAt" style={{ marginBottom: isMobile ? 12 : 0 }}>
            <DatePicker 
              showTime 
              placeholder="Expiry (optional)" 
              style={{ width: isMobile ? '100%' : 'auto' }}
              size={isMobile ? 'large' : 'middle'}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={creating}
              size={isMobile ? 'large' : 'middle'}
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              Create Test
            </Button>
          </Form.Item>
        </div>
      </Form>

      <Table<TestDefinition>
        style={{ marginTop: isMobile ? 12 : 16 }}
        rowKey={(r) => r.id}
        dataSource={data}
        size={isMobile ? 'small' : 'middle'}
        scroll={{ x: isMobile ? 800 : 1200 }}
        pagination={{ 
          pageSize: isMobile ? 5 : 10,
          size: isMobile ? 'small' : 'default',
          showSizeChanger: false
        }}
        columns={[
          { 
            title: 'Test ID', 
            dataIndex: 'id', 
            key: 'id',
            width: isMobile ? 120 : 150,
            ellipsis: true,
            render: (v: string) => isMobile ? v.substring(0, 8) + '...' : v
          },
          { 
            title: 'Label', 
            dataIndex: 'label', 
            key: 'label',
            width: isMobile ? 100 : 150,
            render: (v: string | undefined, r: TestDefinition) => (
              <Input 
                defaultValue={v} 
                onBlur={(e) => dispatch(setLabel({ id: r.id, label: e.target.value || undefined }))}
                size={isMobile ? 'small' : 'middle'}
                style={{ fontSize: isMobile ? '11px' : undefined }}
              />
            )
          },
          { 
            title: 'Job Description', 
            dataIndex: 'jobDescription', 
            key: 'jobDescription', 
            ellipsis: true, 
            render: (v: string | undefined) => v || '-',
            responsive: ['md']
          },
          { 
            title: 'Active', 
            dataIndex: 'active', 
            key: 'active',
            width: isMobile ? 60 : 80,
            render: (v: boolean, r: TestDefinition) => (
              <Switch 
                checked={v} 
                onChange={(checked) => dispatch(setActive({ id: r.id, active: checked }))}
                size={isMobile ? 'small' : 'default'}
              />
            )
          },
          { 
            title: 'Expires', 
            dataIndex: 'expiresAt', 
            key: 'expiresAt',
            width: isMobile ? 120 : 250,
            render: (ts: number | undefined, r: TestDefinition) => (
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '4px' }}>
                {ts ? (
                  <Tag 
                    color={dayjs(ts).isBefore(dayjs()) ? 'red' : 'green'}
                    style={{ fontSize: isMobile ? '9px' : '11px', margin: 0 }}
                  >
                    {dayjs(ts).format(isMobile ? 'MM/DD HH:mm' : 'YYYY-MM-DD HH:mm')}
                  </Tag>
                ) : (
                  <Tag style={{ fontSize: isMobile ? '9px' : '11px', margin: 0 }}>None</Tag>
                )}
                <DatePicker
                  showTime
                  value={ts ? dayjs(ts) : undefined}
                  onChange={(d) => dispatch(setExpiry({ id: r.id, expiresAt: d ? d.valueOf() : undefined }))}
                  size={isMobile ? 'small' : 'middle'}
                  style={{ width: isMobile ? '100%' : 'auto' }}
                />
              </div>
            )
          },
          { 
            title: 'Created', 
            dataIndex: 'createdAt', 
            key: 'createdAt', 
            render: (ts: number) => dayjs(ts).format(isMobile ? 'MM/DD' : 'YYYY-MM-DD HH:mm'),
            responsive: ['lg']
          },
          { 
            title: 'Actions', 
            key: 'actions',
            width: isMobile ? 60 : 80,
            fixed: 'right',
            render: (_: unknown, r: TestDefinition) => (
              <Popconfirm title="Delete test?" onConfirm={() => dispatch(deleteTest({ id: r.id }))}>
                <Button 
                  danger 
                  size="small"
                  style={{ fontSize: isMobile ? '10px' : '12px' }}
                >
                  {isMobile ? 'Del' : 'Delete'}
                </Button>
              </Popconfirm>
            )
          },
        ]}
      />
    </Card>
  )
}
