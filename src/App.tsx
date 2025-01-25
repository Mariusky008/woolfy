import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { HomePage } from './pages/Home/Home'
import { AuthPage } from './pages/Auth/Auth'
import { GamesPage } from './pages/Games/Games'

function App() {
  return (
    <Box minH="100vh" bg="gray.900">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/game" element={<div>Game In Progress</div>} />
        </Routes>
      </Router>
    </Box>
  )
}

export default App
