import { Card, Descriptions, List, Typography, Tag, Divider, Button } from 'antd'
import { useAppSelector } from '../hooks'

export default function CandidateDetail() {
  const activeId = useAppSelector((s) => s.session.activeCandidateId)
  const candidate = useAppSelector((s) => (activeId ? s.candidates.byId[activeId] : undefined))
  const interview = useAppSelector((s) => (activeId ? s.chat.interviews[activeId] : undefined))
  const messages = useAppSelector((s) => (activeId ? s.chat.messages[activeId] ?? [] : []))
  const roleLabels: Record<string, string> = {
    full_stack: 'Full Stack',
    java_backend: 'Java Backend',
    web_development: 'Web Development',
    ai_ml_engineer: 'AI/ML Engineer',
  }

  if (!activeId || !candidate) return <Card>Pick a candidate to see details.</Card>

  return (
    <Card title={`Candidate: ${candidate.profile.name ?? candidate.profile.email ?? candidate.profile.id}`}>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Email">{candidate.profile.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{candidate.profile.phone}</Descriptions.Item>
        <Descriptions.Item label="Role">{roleLabels[candidate.profile.jobRole ?? ''] ?? '-'}</Descriptions.Item>
        {candidate.profile.resumeFileName && (
          <Descriptions.Item label="Resume">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Typography.Text>{candidate.profile.resumeFileName}</Typography.Text>
              {candidate.profile.resumeDataUrl && (
                <Button size="small" type="primary">
                  <a href={candidate.profile.resumeDataUrl} download={candidate.profile.resumeFileName} style={{ color: 'inherit' }}>Download</a>
                </Button>
              )}
            </div>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Status">
          <Tag color={candidate.profile.status === 'completed' ? 'green' : 'blue'}>{candidate.profile.status}</Tag>
        </Descriptions.Item>
        {candidate.profile.finalScore != null && (
          <Descriptions.Item label="Final Score">{candidate.profile.finalScore}</Descriptions.Item>
        )}
        {candidate.profile.summary && (
          <Descriptions.Item label="Summary">{candidate.profile.summary}</Descriptions.Item>
        )}
      </Descriptions>

      {candidate.profile.resumeDataUrl && candidate.profile.resumeMimeType?.includes('pdf') && (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5}>Resume Preview</Typography.Title>
          <iframe
            title="resume-preview"
            src={candidate.profile.resumeDataUrl}
            style={{ width: '100%', height: 480, border: '1px solid #eee', borderRadius: 4 }}
          />
        </div>
      )}

      {interview && (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5}>Questions and Scores</Typography.Title>
          <List
            dataSource={interview.questions}
            renderItem={(q: typeof interview.questions[number]) => (
              <List.Item>
                <List.Item.Meta
                  title={`${q.difficulty.toUpperCase()}: ${q.text}`}
                  description={
                    <div>
                      <div>Answer: {q.answer ? <em>{q.answer}</em> : <em>No answer</em>}</div>
                      <div>Score: {q.score != null ? `${q.score}/10` : 'Unscored'}</div>
                      {q.feedback && <div>Feedback: {q.feedback}</div>}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}

      <Divider />
      <Typography.Title level={5}>Chat History</Typography.Title>
      <List
        dataSource={messages}
        renderItem={(m: typeof messages[number]) => (
          <List.Item>
            <List.Item.Meta title={`${m.role.toUpperCase()} — ${new Date(m.timestamp).toLocaleString()}`} description={m.content} />
          </List.Item>
        )}
      />
    </Card>
  )
}
