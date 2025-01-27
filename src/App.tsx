import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box, useToast } from '@chakra-ui/react'
import { HomePage } from './pages/Home/Home'
import { AuthPage } from './pages/Auth/Auth'
import { GamesPage } from './pages/Games/Games'
import { ProfilePage } from './pages/Profile/ProfilePage'
import { RankingPage } from './pages/Ranking/RankingPage'
import { Navbar } from './components/Navbar'
import { useAuthStore } from './stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}

const App = () => {
  const toast = useToast()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  const isPublicRoute = location.pathname === '/' || location.pathname === '/auth'

  useEffect(() => {
    // Log environment information
    console.log('Environment:', {
      NODE_ENV: import.meta.env.MODE,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      BASE_URL: import.meta.env.BASE_URL,
    })

    // Add global error handler
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      toast({
        title: 'Une erreur est survenue',
        description: event.error?.message || 'Veuillez réessayer plus tard',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [toast])

  return (
    <Box minH="100vh" bg="gray.900">
      {isAuthenticated && !isPublicRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/games" element={
          <ProtectedRoute>
            <GamesPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/ranking" element={
          <ProtectedRoute>
            <RankingPage />
          </ProtectedRoute>
        } />
        <Route path="/game" element={
          <ProtectedRoute>
            <div>Game In Progress</div>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  )
}

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper
