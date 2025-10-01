import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker'
import mammoth from 'mammoth'

export interface ExtractedFields {
  name?: string
  email?: string
  phone?: string
}

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const PHONE_REGEX = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/

// Attempt to guess a human name near the start of the document using heuristics.
function guessName(rawText: string, email?: string): string | undefined {
  const text = rawText.replace(/[\t\f\v]+/g, ' ').replace(/ +/g, ' ').trim()
  const stopWords = new Set([
    'resume', 'curriculum', 'vitae', 'cv', 'profile', 'summary', 'contact', 'experience', 'education',
    'skills', 'projects', 'objective', 'professional', 'work', 'address', 'phone', 'email', 'mobile',
  ])

  const emailParts = (email?.split('@')[0] ?? '')
    .split(/[._-]+/)
    .filter(Boolean)
    .map((s) => s.toLowerCase())

  // Consider only the first ~1000 characters as the header area
  const head = text.slice(0, 1000)
  const headTokens = head
    .replace(/[^A-Za-z'\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 40) // first ~40 tokens

  let best: { name: string; score: number } | undefined

  const isNameToken = (tok: string) => {
    const t = tok.toLowerCase()
    if (stopWords.has(t)) return false
    // Accept ProperCase or ALLCAPS (length>=2)
  return /^[A-Z][a-z'-]+$/.test(tok) || /^[A-Z]{2,}$/.test(tok)
  }

  const titleCase = (s: string) => s.replace(/[A-Za-z][^\s-]*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())

  // Slide a window of 2..4 tokens and score
  for (let i = 0; i < Math.min(headTokens.length, 20); i++) {
    for (let w = 2; w <= 4 && i + w <= headTokens.length; w++) {
      const window = headTokens.slice(i, i + w)
      const raw = window.join(' ')
      if (raw.length < 3 || raw.length > 80) continue
      if (raw.toLowerCase().includes('gmail') || raw.includes('@')) continue

      // Score by token quality and email overlap
      let score = 0
      let validCount = 0
      for (const tok of window) {
        if (isNameToken(tok)) {
          validCount++
          score += /^[A-Z]{2,}$/.test(tok) ? 1 : 2 // prefer ProperCase
          if (emailParts.includes(tok.toLowerCase())) score += 2
        } else {
          score -= 1
        }
      }
      if (validCount < 2) continue
      if (!best || score > best.score) {
        // Normalize ALLCAPS to Title Case
        const normalized = /^[A-Z\s'-]+$/.test(raw) ? titleCase(raw) : raw
        best = { name: normalized, score }
      }
    }
  }
  return best?.name
}

export function extractFieldsFromText(text: string): ExtractedFields {
  const email = text.match(EMAIL_REGEX)?.[0]
  const phone = text.match(PHONE_REGEX)?.[0]

  // Try to find a likely name near the beginning, optionally using the email username for hints
  const name = guessName(text, email)
  return { name, email: email ?? undefined, phone: phone ?? undefined }
}

export async function parsePdf(file: File): Promise<string> {
  // Configure worker for pdfjs
  const worker = new (pdfWorker as unknown as { new (): unknown })()
  ;(pdfjsLib as unknown as { GlobalWorkerOptions: { workerPort: unknown } }).GlobalWorkerOptions.workerPort = worker
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // content.items types are not well exported, cast minimally
    const items = content.items as Array<{ str?: string } & Record<string, unknown>>
    text += items.map((it) => (typeof it.str === 'string' ? it.str : '')).join(' ') + '\n'
  }
  return text
}

export async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const { value } = await mammoth.extractRawText({ arrayBuffer })
  return value
}
