import { Modal } from 'antd'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setWelcomeBack } from '../slices/sessionSlice'

export default function WelcomeBackModal() {
  const activeId = useAppSelector((s) => s.session.activeCandidateId)
  const interview = useAppSelector((s) => (activeId ? s.chat.interviews[activeId] : undefined))
  const showFlag = useAppSelector((s) => s.session.showWelcomeBack)
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Only show if resume flag is set (e.g., after fresh login) and interview is incomplete
    if (showFlag && interview && !interview.complete) setOpen(true)
  }, [interview, showFlag])

  return (
    <Modal
      title="Welcome Back"
      open={open}
  onOk={() => { setOpen(false); dispatch(setWelcomeBack(false)) }}
  onCancel={() => { setOpen(false); dispatch(setWelcomeBack(false)) }}
      okText="Resume"
      cancelText="Close"
    >
      You have an unfinished interview. You can resume where you left off.
    </Modal>
  )
}
