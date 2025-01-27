import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box, useToast } from '@chakra-ui/react'
import { HomePage } from './pages/Home/Home'
import { AuthPage } from './pages/Auth/Auth'
import { GamesPage } from './pages/Games/Games'
import { ProfilePage } from './pages/Profile/ProfilePage'
import { RankingPage } from './pages/Ranking/RankingPage'
import { Navbar } from './components/Navbar'

const App = () => {
  const toast = useToast()

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
    <Router>
      <Box minH="100vh" bg="gray.900">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/game" element={<div>Game In Progress</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Router>
  )
}

export default App
