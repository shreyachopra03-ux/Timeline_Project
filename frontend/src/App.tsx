import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Media from './pages/Media'
import Clips from './pages/Clips'
import ClipGenerate from './pages/ClipGenerate'
import ClipDetail from './pages/ClipDetail'
import Songs from './pages/Songs'
import Shared from './pages/Shared'
import SharedCreate from './pages/SharedCreate'
import SharedDetail from './pages/SharedDetail'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/media" element={<ProtectedRoute><Layout><Media /></Layout></ProtectedRoute>} />
          <Route path="/clips" element={<ProtectedRoute><Layout><Clips /></Layout></ProtectedRoute>} />
          <Route path="/clips/generate" element={<ProtectedRoute><Layout><ClipGenerate /></Layout></ProtectedRoute>} />
          <Route path="/clips/:id" element={<ProtectedRoute><Layout><ClipDetail /></Layout></ProtectedRoute>} />
          <Route path="/songs" element={<ProtectedRoute><Layout><Songs /></Layout></ProtectedRoute>} />
          <Route path="/shared" element={<ProtectedRoute><Layout><Shared /></Layout></ProtectedRoute>} />
          <Route path="/shared/create" element={<ProtectedRoute><Layout><SharedCreate /></Layout></ProtectedRoute>} />
          <Route path="/shared/:id" element={<ProtectedRoute><Layout><SharedDetail /></Layout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
)};
