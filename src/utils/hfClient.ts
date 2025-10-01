import axios from 'axios'
import type { CandidateProfile, Question } from '../types'

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions'
const HF_API_KEY = (import.meta.env.VITE_HF_API_KEY as string | undefined)?.trim()
const HF_MODEL = (import.meta.env.VITE_HF_MODEL as string | undefined)?.trim() || 'meta-llama/Llama-3.1-8B-Instruct'
const TIMEOUT_MS = Number(import.meta.env.VITE_HF_TIMEOUT_MS ?? '30000')

export type ChatRole = 'system' | 'user' | 'assistant'
export type ChatMessage = { role: ChatRole; content: string }

async function chat(messages: ChatMessage[], opts?: { temperature?: number; max_tokens?: number }) {
  if (!HF_API_KEY) throw new Error('Missing VITE_HF_API_KEY in .env')
  let attempt = 0
  const maxRetries = Math.max(0, Number(import.meta.env.VITE_HF_MAX_RETRIES ?? '2'))
  // Router-supported sane defaults; second acts as fallback if first not enabled on the token
  const modelCandidates = [HF_MODEL, 'meta-llama/Llama-3.1-8B-Instruct', 'HuggingFaceH4/zephyr-7b-beta']
  while (true) {
    attempt++
    try {
      const model = modelCandidates[Math.min(attempt - 1, modelCandidates.length - 1)]
      const { data } = await axios.post(
        HF_API_URL,
        {
          model,
          messages,
          temperature: opts?.temperature ?? 0.4,
          max_tokens: opts?.max_tokens ?? 600,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${HF_API_KEY}`,
          },
          timeout: TIMEOUT_MS,
        }
      )
      const content = (data as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message?.content
      if (!content) throw new Error('LLM returned empty content')
      return content
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const body = err.response?.data
        const text = typeof body === 'string' ? body : JSON.stringify(body || {})
        const message = err.message || ''
        const isTimeout = err.code === 'ECONNABORTED' || /timeout/i.test(message)
        const isLoading = typeof text === 'string' && /loading/i.test(text)
        const isModelUnsupported = status === 400 && typeof text === 'string' && /model_not_supported|not supported by any provider/i.test(text)
        const retriable = isTimeout || status === 503 || status === 524 || isLoading
        if (status === 401) throw new Error('Unauthorized: Invalid or missing VITE_HF_API_KEY')
        if (isModelUnsupported) {
          // If we still have another candidate model to try, continue; else throw a helpful error
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 250))
            continue
          }
          throw new Error(
            `The model '${HF_MODEL}' is not enabled for your Router token. Try setting VITE_HF_MODEL to a supported model like 'meta-llama/Llama-3.1-8B-Instruct' or enable providers for your token in the Hugging Face UI.`
          )
        }
        if (retriable && attempt <= maxRetries) {
          await new Promise((r) => setTimeout(r, Math.min(2000 * attempt, 5000)))
          continue
        }
        if (status) throw new Error(`HF router error ${status}: ${String(text).slice(0, 300)}`)
        throw new Error('Network error calling Hugging Face Router. Check connectivity or CORS.')
      }
      throw err instanceof Error ? err : new Error(String(err))
    }
  }
}

function withDurations(items: Array<{ difficulty: 'easy' | 'medium' | 'hard'; text: string }>): Question[] {
  const durations = { easy: 20, medium: 60, hard: 120 } as const
  const maxPointsMap = { easy: 10, medium: 15, hard: 25 } as const
  return items.map((q, i) => ({
    id: `${Date.now()}_${i}`,
    difficulty: q.difficulty,
    text: q.text,
    durationSec: durations[q.difficulty],
    maxPoints: maxPointsMap[q.difficulty],
  }))
}

export async function generateQuestions(jobRole?: string, jobDescription?: string): Promise<Question[]> {
  const system: ChatMessage = {
    role: 'system',
    content:
      'You are an expert technical interviewer. Return exactly 6 questions tailored to the role. The output must be strictly 6 lines, each line formatted as: difficulty|question. The difficulty must be easy, medium, or hard. Include 2 easy, 2 medium, 2 hard IN THAT ORDER (first two lines easy, next two medium, final two hard). For EASY questions, design them so the expected answer is a single word, and append " (one word)" at the end of the easy question text.',
  }
  const user: ChatMessage = {
    role: 'user',
    content: `Role: ${jobRole || 'Software Engineer'}\nJob Description: ${jobDescription || 'N/A'}\nGenerate now.`,
  }
  const content = await chat([system, user], { temperature: 0.4, max_tokens: 800 })
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => !!l)

  const parsed = lines
    .map((l) => {
      const m = l.match(/^(easy|medium|hard)\s*\|\s*(.+)$/i)
      if (!m) return null
      return { difficulty: m[1].toLowerCase() as 'easy' | 'medium' | 'hard', text: m[2].trim() }
    })
    .filter(Boolean) as Array<{ difficulty: 'easy' | 'medium' | 'hard'; text: string }>

  if (parsed.length < 6) {
    const fallback = lines.slice(0, 6).map((q) => ({ difficulty: 'medium' as const, text: q.replace(/^[ -•\d.\s]+/, '') }))
    if (fallback.length < 6) throw new Error('LLM did not produce 6 questions. Please try again.')
    return withDurations(fallback)
  }
  // Enforce order: 2 easy, 2 medium, 2 hard in that order
  const easy = parsed.filter((q) => q.difficulty === 'easy').slice(0, 2)
  const med = parsed.filter((q) => q.difficulty === 'medium').slice(0, 2)
  const hard = parsed.filter((q) => q.difficulty === 'hard').slice(0, 2)
  const ordered = [...easy, ...med, ...hard]
  // If any bucket short, backfill from remaining parsed while preserving declared difficulty
  if (ordered.length < 6) {
    const remaining = parsed.filter((q) => !ordered.includes(q)).slice(0, 6 - ordered.length)
    ordered.push(...remaining)
  }
  return withDurations(ordered.slice(0, 6))
}

export async function scoreAnswer(question: Question, answer: string): Promise<{ score: number; feedback: string; points: number }> {
  const system: ChatMessage = {
    role: 'system',
    content: 'You are an expert interviewer. Score the candidate answer 0-10 and provide brief feedback. Return JSON only: {"score": number, "feedback": string}',
  }
  const user: ChatMessage = {
    role: 'user',
    content: `Question (${question.difficulty}): ${question.text}\nAnswer: ${answer}\nJSON only:`,
  }
  const content = await chat([system, user], { temperature: 0.2, max_tokens: 300 })
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    const max = question.maxPoints ?? 10
    const defPoints = Math.round((max * 0.7))
    return { score: 7, feedback: 'Reasonable answer.', points: defPoints }
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]) as { score?: number; feedback?: string }
    const score = Math.max(0, Math.min(10, Math.round(Number(parsed.score ?? 7))))
    const feedback = String(parsed.feedback ?? 'Good answer.')
    // Map 0-10 to points based on maxPoints
    const max = question.maxPoints ?? 10
    const points = Math.round((score / 10) * max)
    return { score, feedback, points }
  } catch {
    const max = question.maxPoints ?? 10
    const defPoints = Math.round((max * 0.7))
    return { score: 7, feedback: 'Reasonable answer.', points: defPoints }
  }
}

export async function finalizeCandidate(profile: CandidateProfile, questions: Question[]) {
  // Prefer points-based aggregation; fall back to legacy 0-10
  const hasPoints = questions.some((q) => typeof q.points === 'number' || typeof q.maxPoints === 'number')
  let finalScore = 0
  if (hasPoints) {
    const totalPts = questions.reduce((s, q) => s + (q.points ?? 0), 0)
    const maxPts = questions.reduce((s, q) => s + (q.maxPoints ?? 0), 0) || 1
    finalScore = Math.round((totalPts / maxPts) * 100)
  } else {
    const scored = questions.filter((q) => typeof q.score === 'number')
    const total = scored.reduce((s, q) => s + (q.score || 0), 0)
    const max = scored.length * 10 || 1
    finalScore = Math.round((total / max) * 100)
  }
  const system: ChatMessage = { role: 'system', content: 'Generate a concise 1-2 sentence summary under 280 characters.' }
  const scoreLine = hasPoints
    ? questions.map((q: Question, i: number) => `Q${i + 1}(${q.points ?? 0}/${q.maxPoints ?? 0})`).join(', ')
    : questions
        .map((q: Question, i: number) => `Q${i + 1}(${q.score ?? 0}/10)`) 
        .join(', ')
  const user: ChatMessage = { role: 'user', content: `Candidate: ${profile.name ?? 'N/A'}\nScores: ${scoreLine}` }
  try {
    const content = await chat([system, user], { temperature: 0.2, max_tokens: 160 })
    const summary = content.trim().replace(/^"|"$/g, '')
    return { finalScore, summary }
  } catch {
    return { finalScore, summary: `Candidate ${profile.name ?? ''} scored ${finalScore}.` }
  }
}
