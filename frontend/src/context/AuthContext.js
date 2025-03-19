import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      // Format the avatar URL if it exists
      const formattedUser = {
        ...res.data,
        profileImage: res.data.profileImage ? `http://localhost:9000${res.data.profileImage}` : null
      };
      setUser(formattedUser);
    } catch (err) {
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', {
      email,
      password
    });
    
    const { token, user } = res.data;
    
    // Format the avatar URL if it exists
    const formattedUser = {
      ...user,
      profileImage: user.profileImage ? `http://localhost:9000${user.profileImage}` : null
    };
    
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(formattedUser);
  };

  const register = async (userData) => {
    const res = await axiosInstance.post('/auth/register', userData);
    
    const { token, user } = res.data;
    
    // Format the avatar URL if it exists
    const formattedUser = {
      ...user,
      profileImage: user.profileImage ? `http://localhost:9000${user.profileImage}` : null
    };
    
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(formattedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
