import { useState, useMemo } from 'react'
import { Card, Form, Input, DatePicker, Switch, Button, Table, Popconfirm, Space, Tag } from 'antd'
import dayjs from 'dayjs'
import { useAppDispatch, useAppSelector } from '../hooks'
import { createTest, deleteTest, setActive, setExpiry, setLabel } from '../slices/testsSlice'
import type { TestDefinition } from '../types'

export default function TestsManager() {
  const dispatch = useAppDispatch()
  const tests = useAppSelector((s) => s.tests)
  const user = useAppSelector((s) => s.session.user)
  const data: TestDefinition[] = useMemo(() => tests.allIds.map((id: string) => tests.byId[id]), [tests])
  const [form] = Form.useForm()
  const [creating, setCreating] = useState(false)

  return (
    <Card title="Manage Tests">
      <Form
        form={form}
        layout="inline"
        onFinish={(vals: { label?: string; expiresAt?: dayjs.Dayjs; jobDescription?: string }) => {
          setCreating(true)
          dispatch(createTest({ label: vals.label, expiresAt: vals.expiresAt?.valueOf(), createdBy: user?.id, jobDescription: vals.jobDescription }))
          form.resetFields()
          setCreating(false)
        }}
      >
        <Form.Item name="label">
          <Input placeholder="Test label (optional)" />
        </Form.Item>
        <Form.Item name="jobDescription">
          <Input.TextArea placeholder="Job description (optional, used to guide LLM questions)" autoSize={{ minRows: 1, maxRows: 3 }} style={{ width: 360 }} />
        </Form.Item>
        <Form.Item name="expiresAt">
          <DatePicker showTime placeholder="Expiry (optional)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={creating}>Create Test</Button>
        </Form.Item>
      </Form>

      <Table<TestDefinition>
        style={{ marginTop: 16 }}
        rowKey={(r) => r.id}
        dataSource={data}
        columns={[
          { title: 'Test ID', dataIndex: 'id', key: 'id' },
          { title: 'Label', dataIndex: 'label', key: 'label', render: (v: string | undefined, r: TestDefinition) => (
            <Input defaultValue={v} onBlur={(e) => dispatch(setLabel({ id: r.id, label: e.target.value || undefined }))} />
          ) },
          { title: 'Job Description', dataIndex: 'jobDescription', key: 'jobDescription', ellipsis: true, render: (v: string | undefined) => v || '-' },
          { title: 'Active', dataIndex: 'active', key: 'active', render: (v: boolean, r: TestDefinition) => (
            <Switch checked={v} onChange={(checked) => dispatch(setActive({ id: r.id, active: checked }))} />
          ) },
          { title: 'Expires', dataIndex: 'expiresAt', key: 'expiresAt', render: (ts: number | undefined, r: TestDefinition) => (
            <Space>
              {ts ? <Tag color={dayjs(ts).isBefore(dayjs()) ? 'red' : 'green'}>{dayjs(ts).format('YYYY-MM-DD HH:mm')}</Tag> : <Tag>None</Tag>}
              <DatePicker
                showTime
                value={ts ? dayjs(ts) : undefined}
                onChange={(d) => dispatch(setExpiry({ id: r.id, expiresAt: d ? d.valueOf() : undefined }))}
              />
            </Space>
          ) },
          { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (ts: number) => dayjs(ts).format('YYYY-MM-DD HH:mm') },
          { title: 'Actions', key: 'actions', render: (_: unknown, r: TestDefinition) => (
            <Popconfirm title="Delete test?" onConfirm={() => dispatch(deleteTest({ id: r.id }))}>
              <Button danger size="small">Delete</Button>
            </Popconfirm>
          ) },
        ]}
      />
    </Card>
  )
}
