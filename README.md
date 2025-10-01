# AI Interview Assistant (Vite + React + TypeScript)

A single-page app for conducting AI-assisted technical interviews. It has two views: Interviewee (chat-based Q&A) and Interviewer (candidates dashboard). State is stored locally and restored on reload.

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript
- **UI Library**: Ant Design (antd) with icons
- **State Management**: Redux Toolkit + redux-persist (IndexedDB via localforage)
- **Routing**: React Router DOM
- **File Processing**: 
  - PDF: pdfjs-dist
  - DOCX: mammoth
- **HTTP Client**: axios
- **Date Handling**: dayjs
- **Testing**: Playwright (end-to-end)
- **Build/Dev**: Vite with TypeScript, ESLint, Prettier
- **AI Integration**: Hugging Face Inference Router (OpenAI-compatible)

## Authentication

The app includes a simple role-based auth flow with separate login/register screens for Interviewee and Interviewer.

- Landing: `src/pages/AuthLanding.tsx` lets you choose Interviewee or Interviewer.
- Interviewee: `src/pages/auth/LoginInterviewee.tsx`, `src/pages/auth/RegisterInterviewee.tsx`
- Interviewer: `src/pages/auth/LoginInterviewer.tsx`, `src/pages/auth/RegisterInterviewer.tsx`
- Session state is stored in Redux; the current role gates access:
  - Interviewer route: `/interviewer` → dashboard (candidates, tests)
  - Interviewee route: `/interviewee` → chat-based interview
- Logout is available from the header on each view.

Note: This app uses client-side session state only. For production, wire these screens to your backend auth provider and persist sessions with HTTP-only cookies.

## Test IDs (creating and using)

Interviewer can create and manage Test IDs to standardize interviews and optionally provide a Job Description that guides LLM question generation.

- Manage Tests: `src/ui/TestsManager.tsx` (under the Interviewer dashboard)
  - Create a test with an optional label and job description (JD)
  - Toggle active state; set optional expiry
  - Each test has a unique `id` that acts as the Test ID
- Using Test IDs:
  - When the interviewer selects a candidate and clicks Begin, the app sets the active candidate and applies the selected test (if any)
  - The Job Description from the active test is passed to the LLM prompt in `generateQuestions` to tailor questions
  - Only active, non-expired tests should be used for new interviews

Tip: You can pre-create different Test IDs (e.g., FE_JUNIOR_2025) to map to specific roles/JDs and reuse them for multiple candidates.

## Features

- Resume upload (PDF/DOCX) with basic extraction of Name/Email/Phone
- Required details gating before starting an interview
- Timed interview with 6 LLM-generated questions in this order:
  - 2 easy (single-word answer), 2 medium, 2 hard
  - Easy questions display a single-line input and only the first word is accepted
- Per-question timers and auto-submit on timeout
- Scoring (points-based):
  - Easy: 10 points each
  - Medium: 15 points each
  - Hard: 25 points each
  - Final score is out of 100
- Interviewer dashboard: list/search/sort candidates, begin new interview, and delete
- Local persistence using Redux Toolkit + redux-persist (IndexedDB via localforage)

## Welcome Back modal

If the interviewee closes the tab or refreshes during an interview, the app restores state on next load and shows a Welcome Back modal to resume where they left off or discard progress.

- Component: `src/ui/WelcomeBackModal.tsx`
- Trigger: Presence of an in-progress interview in persisted state
- Options:
  - Resume: continue from the current question and timer
  - Discard: clear the in-progress data and start fresh

To reset all local data manually, use the “Reset All Data” button in the Candidates view on the Interviewer dashboard.

## How AI generation works

The app calls the Hugging Face Inference Router (OpenAI-compatible) directly from the browser using axios.

- Endpoint: <https://router.huggingface.co/v1/chat/completions>
- Client: `src/utils/hfClient.ts`
  - `generateQuestions(jobRole?, jobDescription?)`: prompts the model to produce 6 lines in the required format and E→M→H order. Easy questions include "(one word)" and are designed for single-word answers.
  - `scoreAnswer(question, answer)`: requests a 0–10 score and feedback, then maps that score to points based on difficulty (10/15/25).
  - `finalizeCandidate(profile, questions)`: computes a final score (points mode by default) and asks the model for a concise 1–2 sentence summary.
  - Built-in timeout, retries, and fallbacks; tries alternate models if the configured model isn’t supported by your Router token.

Security note: Calling LLMs directly from the browser exposes your API key to users. For production, use a small backend proxy to keep secrets server-side.

## Environment setup

Copy `.env.example` to `.env` and set your values. At minimum:

```bash
VITE_HF_API_KEY=hf_XXXXXXXXXXXXXXXXXXXXXXXX

VITE_HF_MODEL=mistralai/Mistral-7B-Instruct-v0.2

# Optional tuning
VITE_HF_TIMEOUT_MS=30000
VITE_HF_MAX_RETRIES=2
VITE_DEBUG_AI=true
```

Restart the dev server after changing `.env`.

## Troubleshooting

- 400 model_not_supported: Your token doesn’t have a provider enabled for the chosen model. Either:
  - Set `VITE_HF_MODEL` to a supported model (e.g., `mistralai/Mistral-7B-Instruct-v0.2`), or
  - Enable providers for your token in the Hugging Face Router UI.
- 401 Unauthorized: Check `VITE_HF_API_KEY`.
- CORS/Network errors: Disable ad blockers/VPN or use a backend proxy.
- Slow “model loading”/timeouts: Increase `VITE_HF_TIMEOUT_MS` and/or `VITE_HF_MAX_RETRIES`.

## Notes

- The Interviewer candidates list details can be viwed in the interviwer tab. You can still see the scoring feedback in the chat and the candidate’s final score along with summary, you can also view the resume.
- Data is stored locally; “Reset All Data” is available in the Candidates view to clear storage.
