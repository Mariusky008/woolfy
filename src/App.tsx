import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Home from "./pages/Home/Home";
import { AuthPage } from "./pages/Auth/Auth";
import { GamesPage } from "./pages/Games/Games";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { GameInProgress } from "./pages/Games/GameInProgress";
import { useAuthStore } from "./stores/authStore";
import { GamePhaseProvider } from "./contexts/GamePhaseContext";

const App: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <Box>Chargement...</Box>;
  }

  return (
    <Router>
      <GamePhaseProvider>
        <Box minH="100vh">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/games"
              element={
                isAuthenticated ? (
                  <GamesPage />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/games/in-progress/:gameId"
              element={
                isAuthenticated ? (
                  <GameInProgress />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/profilepage"
              element={
                isAuthenticated ? (
                  <ProfilePage />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </GamePhaseProvider>
    </Router>
  );
};

export default App;
