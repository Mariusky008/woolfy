import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaGoogle, FaDiscord } from 'react-icons/fa';
import './styles/auth.css';

interface AuthFormData {
  username?: string;
  email: string;
  password: string;
}

export const AuthPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState<AuthFormData>({
    username: '',
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuthStore();
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isLogin: boolean) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.PROD 
        ? import.meta.env.VITE_PROD_API_URL 
        : import.meta.env.VITE_API_URL;
      const endpoint = isLogin ? `${baseUrl}/api/auth/login` : `${baseUrl}/api/auth/register`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isLogin ? {
          email: formData.email,
          password: formData.password
        } : {
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      setIsAuthenticated(true);
      setUser(data.user);

      toast({
        title: isLogin ? 'Connexion réussie' : 'Compte créé avec succès',
        description: isLogin ? 'Bienvenue sur Woolfy !' : 'Bienvenue dans la meute !',
        status: 'success',
        duration: 2000,
        isClosable: true,
        onCloseComplete: () => {
          navigate('/games', { replace: true });
        }
      });

    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="cyberpunk-overlay"></div>
      <div className="neon-grid"></div>

      <div className="auth-container cyber-panel">
        <div className="auth-header">
          <div className="woolfy-logo">
            <div className="mascot-woolfy-auth">
              <div className="mascot-woolfy-inner">
                <div className="mascot-woolfy-eyes"></div>
              </div>
            </div>
          </div>
          <h1 className="glitch-title" data-text="WOOLFY">WOOLFY</h1>
          <p className="auth-subtitle neon-text">Rejoignez la meute</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            <span className="glitch-text" data-text="Connexion">Connexion</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <span className="glitch-text" data-text="Inscription">Inscription</span>
          </button>
        </div>

        <div className="auth-content">
          <form onSubmit={(e) => handleSubmit(e, activeTab === 'login')} className="auth-form">
            {activeTab === 'register' && (
              <div className="form-group">
                <label className="cyber-label">Nom d'utilisateur</label>
                <input
                  type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="cyber-input"
                  required
                    />
              </div>
            )}

            <div className="form-group">
              <label className="cyber-label">Email</label>
              <input
                type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="cyber-input"
                required
                    />
            </div>

            <div className="form-group">
              <label className="cyber-label">Mot de passe</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="cyber-input"
                  required
                      />
                <button
                  type="button"
                  className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button 
                    type="submit"
              className="submit-button glitch-button"
              disabled={isLoading}
            >
              <span className="glitch-text" data-text={activeTab === 'login' ? 'CONNEXION' : 'INSCRIPTION'}>
                {activeTab === 'login' ? 'CONNEXION' : 'INSCRIPTION'}
              </span>
              <span className="button-effect"></span>
            </button>
          </form>

          <div className="auth-divider">
            <span>OU</span>
          </div>

          <div className="social-auth">
            <button className="social-button google">
              <FaGoogle /> Continuer avec Google
            </button>
            <button className="social-button discord">
              <FaDiscord /> Continuer avec Discord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 