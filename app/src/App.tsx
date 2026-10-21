import { useEffect } from 'react'
import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { useProgress } from '@/store/useProgress'
import { useContent } from '@/store/useContent'
import { Loading, Notice } from '@/components/ui'
import Dashboard from '@/routes/Dashboard'
import Subjects from '@/routes/Subjects'
import SubjectView from '@/routes/SubjectView'
import TopicView from '@/routes/TopicView'
import Flashcards from '@/routes/Flashcards'
import Quiz from '@/routes/Quiz'
import Plan from '@/routes/Plan'
import Progress from '@/routes/Progress'
import SettingsView from '@/routes/SettingsView'

const NAV = [
  { to: '/', label: 'Today', icon: '🏠', end: true },
  { to: '/subjects', label: 'Subjects', icon: '📚' },
  { to: '/plan', label: 'Plan', icon: '🗓️' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function App() {
  const ready = useProgress((s) => s.ready)
  const init = useProgress((s) => s.init)
  const loadIndex = useContent((s) => s.loadIndex)
  const contentError = useContent((s) => s.error)

  useEffect(() => {
    void init()
    void loadIndex()
  }, [init, loadIndex])

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">🎓</span>
          <span className="brand-text">
            GCSE HQ<span className="brand-sub"> · Harry</span>
          </span>
        </NavLink>
        <div className="topbar-spacer" />
        <nav className="nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>
          ))}
        </nav>
      </header>

      <main className="content">
        {contentError ? (
          <div style={{ marginBottom: 16 }}>
            <Notice variant="danger">
              {contentError} — if this is a fresh checkout, run <code>npm run content:build</code>.
            </Notice>
          </div>
        ) : null}

        {!ready ? <Loading label="Opening your progress…" /> : (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subject/:subjectId" element={<SubjectView />} />
            <Route path="/subject/:subjectId/topic/:topicId" element={<TopicView />} />
            <Route path="/subject/:subjectId/cards" element={<Flashcards />} />
            <Route path="/subject/:subjectId/cards/:topicId" element={<Flashcards />} />
            <Route path="/cards" element={<Flashcards />} />
            <Route path="/subject/:subjectId/quiz" element={<Quiz />} />
            <Route path="/subject/:subjectId/quiz/:topicId" element={<Quiz />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>

      <nav className="tabbar">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            <span className="tab-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
