import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Media from './pages/Media'
import Clips from './pages/Clips'
import ClipGenerate from './pages/ClipGenerate'
import ClipDetail from './pages/ClipDetail'
import Shared from './pages/Shared'
import SharedCreate from './pages/SharedCreate'
import SharedDetail from './pages/SharedDetail'

export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/media" element={<Media />} />
          <Route path="/clips" element={<Clips />} />
          <Route path="/clips/generate" element={<ClipGenerate />} />
          <Route path="/clips/:id" element={<ClipDetail />} />
          <Route path="/shared" element={<Shared />} />
          <Route path="/shared/create" element={<SharedCreate />} />
          <Route path="/shared/:id" element={<SharedDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ToastProvider>
  )
}
