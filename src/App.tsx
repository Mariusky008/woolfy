import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { HomePage } from './pages/Home/Home'
import { AuthPage } from './pages/Auth/Auth'
import { GamesPage } from './pages/Games/Games'
import { ProfilePage } from './pages/Profile/ProfilePage'
import { RankingPage } from './pages/Ranking/RankingPage'

function App() {
  return (
    <Box minH="100vh" bg="gray.900">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/game" element={<div>Game In Progress</div>} />
        </Routes>
      </Router>
    </Box>
  )
}

export default App
