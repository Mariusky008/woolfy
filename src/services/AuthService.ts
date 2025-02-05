import { AxiosResponse } from 'axios';
import axios from 'axios';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  lastActive: Date;
  status: 'online' | 'offline' | 'in_game';
  gamesPlayed: number;
  gamesWon: number;
  correctAccusations: number;
  totalAccusations: number;
  totalKills: number;
  favoriteRole: string;
  badges: string[];
  trophies: string[];
  points: number;
  rank: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthCheckResponse {
  isAuthenticated: boolean;
  message?: string;
  debug?: any;
}

class AuthService {
  private static instance: AuthService;
  private baseURL: string;

  private constructor() {
    this.baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth`;

    // Configure axios defaults
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    
    // Configure request interceptor for debugging
    axios.interceptors.request.use(
      (config) => {
        console.log('Making request to:', config.url);
        console.log('Request headers:', config.headers);
        console.log('Request config:', {
          method: config.method,
          withCredentials: config.withCredentials,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Configure response interceptor for debugging
    axios.interceptors.response.use(
      (response) => {
        console.log('Received response:', {
          status: response.status,
          headers: response.headers,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('Response error:', error);
        if (error.response?.status === 500) {
          console.error('Server error details:', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/register`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/login`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async checkAuth(): Promise<AuthCheckResponse> {
    try {
      console.log('Checking auth status...');
      console.log('Using base URL:', this.baseURL);
      
      const response: AxiosResponse<AuthCheckResponse> = await axios.get(
        `${this.baseURL}/check`,
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Auth check response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Auth check error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      throw this.handleError(error);
    }
  }

  public async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<{ user: User }> = await axios.get(
        `${this.baseURL}/me`,
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    console.error('Handling error in AuthService:', error);
    
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error?.message || error.response.data || 'An error occurred during authentication';
      console.error('Server response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        message: errorMessage
      });
      return new Error(errorMessage);
    } else if (error.request) {
      console.error('No response received:', error.request);
      return new Error('No response received from server');
    } else {
      console.error('Request setup error:', error.message);
      return new Error('Error setting up the request');
    }
  }
}

export default AuthService.getInstance(); 