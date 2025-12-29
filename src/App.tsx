import { Navigate, Route, Routes } from 'react-router-dom'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AuthStartPage from './pages/AuthStartPage'
import LoginPage from './pages/LoginPage'
import PlannerPage from './pages/PlannerPage'
import FollowupQuestionPage from './pages/FollowupQuestionPage'
import ResultPage from './pages/ResultPage'
import { isAuthed } from './storage/authStorage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthed()) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/auth/:provider" element={<AuthStartPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/planner"
        element={
          <RequireAuth>
            <PlannerPage />
          </RequireAuth>
        }
      />
      <Route
        path="/planner/question"
        element={
          <RequireAuth>
            <FollowupQuestionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/result"
        element={
          <RequireAuth>
            <ResultPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
