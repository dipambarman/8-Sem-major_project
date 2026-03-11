import { AuthProvider } from 'react-admin';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth', JSON.stringify(data));
        return Promise.resolve();
      } else {
        return Promise.reject(new Error('Invalid credentials'));
      }
    } catch (error) {
      return Promise.reject(new Error('Network error'));
    }
  },

  logout: () => {
    localStorage.removeItem('auth');
    return Promise.resolve();
  },

  checkAuth: () => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const authData = JSON.parse(auth);
      // Check if token is expired
      const tokenExpiry = new Date(authData.expiresAt);
      if (tokenExpiry > new Date()) {
        return Promise.resolve();
      }
    }
    localStorage.removeItem('auth');
    return Promise.reject();
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const { user } = JSON.parse(auth);
      return Promise.resolve({
        id: user.id,
        fullName: user.fullName,
        avatar: user.avatar,
      });
    }
    return Promise.reject();
  },

  getPermissions: () => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const { user } = JSON.parse(auth);
      return Promise.resolve(user.role);
    }
    return Promise.reject();
  },
};
