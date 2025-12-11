import api from './api';

class AuthService {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async register(email, password, fullName) {
    const response = await api.post('/auth/register', { email, password, fullName });
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export default new AuthService();