import api from '../config/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'engineer' | 'manager';
  skills?: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  maxCapacity?: number;
  department?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      
      // Save to sessionStorage
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      
      // Save to sessionStorage
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getUser(): any {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

const authService = new AuthService();

export const getAllEngineers = async () => {
  const response = await api.get('http://localhost:3000/api/engineers');
  return response.data;
};

export const getEngineerCapacity = async (id) => {
  const response = await api.get(`http://localhost:3000/api/engineers/${id}/capacity`);
  return response.data;
};

export { authService };
export default authService; 