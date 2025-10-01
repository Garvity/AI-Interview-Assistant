import { useState } from 'react'
import { Card, Upload, Form, Input, Space, Button, Tag, App, Select } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { parsePdf, parseDocx, extractFieldsFromText } from '../utils/resume'
import { useAppDispatch, useAppSelector } from '../hooks'
import { upsertCandidate, updateProfile } from '../slices/candidatesSlice'
import { removeCandidateData } from '../slices/chatSlice'
import { setActiveCandidate } from '../slices/sessionSlice'

export default function ResumeStep() {
  const dispatch = useAppDispatch()
  const candidates = useAppSelector((s) => s.candidates)
  const currentTestId = useAppSelector((s) => s.session.currentTestId)
  useAppSelector((s) => s.candidates.allIds.length) // trigger re-render on changes
  const [form] = Form.useForm()
  const [uploading, setUploading] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const { message } = App.useApp()

  const beforeUpload = async (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isDocx = file.name.toLowerCase().endsWith('.docx')
    if (!isPdf && !isDocx) {
      message.error('Please upload a PDF or DOCX resume')
      return Upload.LIST_IGNORE
    }
    setUploading(true)
    try {
      // Read file as data URL for preview/download later
      const dataUrl: string = await new Promise((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = () => resolve(String(fr.result))
        fr.onerror = reject
        fr.readAsDataURL(file)
      })
      const text = isPdf ? await parsePdf(file) : await parseDocx(file)
      const fields = extractFieldsFromText(text)
      if (!currentTestId) {
        message.error('Please enter a Test ID before uploading a resume.')
        setUploading(false)
        return Upload.LIST_IGNORE
      }
      // de-dup by email + testId
      const dupId = candidates.allIds.find((cid: string) => {
        const rec = candidates.byId[cid]
        return rec?.profile.email && rec.profile.email.toLowerCase() === (fields.email ?? '').toLowerCase() && rec.profile.testId === currentTestId
      })
      if (dupId) {
        // Update existing record with the new resume file and clear old interview/messages
        dispatch(updateProfile({ id: dupId, resumeFileName: file.name, resumeDataUrl: dataUrl, resumeMimeType: file.type || (isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') }))
        dispatch(removeCandidateData({ candidateId: dupId }))
        dispatch(setActiveCandidate(dupId))
  form.setFieldsValue({ name: candidates.byId[dupId].profile.name, email: candidates.byId[dupId].profile.email, phone: candidates.byId[dupId].profile.phone, jobRole: candidates.byId[dupId].profile.jobRole })
        message.info('An entry for this email already exists for this Test ID. Switched to existing record.')
        setUploading(false)
        return Upload.LIST_IGNORE
      }
      const id = uuidv4()
      dispatch(
        upsertCandidate({
          profile: {
            id,
            name: fields.name,
            email: fields.email,
            phone: fields.phone,
            resumeFileName: file.name,
            resumeDataUrl: dataUrl,
            resumeMimeType: file.type || (isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
            createdAt: Date.now(),
            status: 'new',
            testId: currentTestId,
          },
          chat: [],
        })
      )
      dispatch(setActiveCandidate(id))
  form.setFieldsValue({ name: fields.name, email: fields.email, phone: fields.phone })
      message.success('Resume parsed! Please confirm your details below.')
    } catch (e) {
      console.error(e)
      message.error('Failed to parse resume. You can fill details manually.')
    } finally {
      setUploading(false)
    }
    return Upload.LIST_IGNORE
  }

  const onFinish = (values: { name: string; email: string; phone: string; jobRole?: string }) => {
    if (!currentTestId) {
      message.error('Please enter a Test ID before saving details.')
      return
    }
    // de-dup by email + testId
    const dupId = candidates.allIds.find((cid: string) => {
      const rec = candidates.byId[cid]
      return rec?.profile.email && rec.profile.email.toLowerCase() === values.email.toLowerCase() && rec.profile.testId === currentTestId
    })
    if (dupId) {
      // Update existing candidate details for this Test ID and clear any previous interview/messages so LLM questions regenerate
      dispatch(updateProfile({ id: dupId, name: values.name, email: values.email, phone: values.phone, jobRole: values.jobRole }))
      dispatch(removeCandidateData({ candidateId: dupId }))
      dispatch(setActiveCandidate(dupId))
      message.success('Details saved! Switch to the Interview Chat tab to start.')
      setSavedAt(Date.now())
      return
    }
    const id = uuidv4()
    dispatch(
      upsertCandidate({
        profile: {
          id,
          name: values.name,
          email: values.email,
          phone: values.phone,
          jobRole: values.jobRole,
          createdAt: Date.now(),
          status: 'new',
          testId: currentTestId,
        },
        chat: [],
      })
    )
    dispatch(setActiveCandidate(id))
    message.success('Details saved! Switch to the Interview Chat tab to start.')
    setSavedAt(Date.now())
  }

  return (
    <Card title="Upload Resume and Confirm Details">
      <Upload.Dragger multiple={false} beforeUpload={beforeUpload} disabled={uploading} accept=".pdf,.docx">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">PDF preferred. DOCX supported.</p>
      </Upload.Dragger>

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
        onFinish={onFinish}
        onValuesChange={() => savedAt && setSavedAt(null)}
      >
        <Form.Item label="Full Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
          <Input placeholder="Jane Doe" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
          <Input placeholder="jane@example.com" />
        </Form.Item>
        <Form.Item label="Phone" name="phone" rules={[{ required: true, message: 'Please enter your phone' }]}>
          <Input placeholder="+1 555 123 4567" />
        </Form.Item>
        <Form.Item label="Job Role" name="jobRole" rules={[{ required: true, message: 'Select a job role' }]}>
          <Select
            placeholder="Select the interview role"
            options={[
              { value: 'full_stack', label: 'Full Stack' },
              { value: 'java_backend', label: 'Java Backend' },
              { value: 'web_development', label: 'Web Development' },
              { value: 'ai_ml_engineer', label: 'AI/ML Engineer' },
            ]}
            style={{ maxWidth: 360 }}
          />
        </Form.Item>
        <Space align="center" size="middle">
          <Button type="primary" htmlType="submit" loading={uploading}>
            Save Details
          </Button>
          {savedAt && <Tag color="green">Details saved</Tag>}
        </Space>
      </Form>
    </Card>
  )
}
