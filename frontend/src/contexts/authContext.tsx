import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import api from '@/helpers/apiHelper';

interface AuthContextType {
  token: string | null;
  user: JwtPayload['data'] | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  // NEW for admin
  adminToken: string | null;
  admin: JwtPayload['data'] | null;
  isAdminAuthenticated: boolean;
  adminLogin: (token: string) => void;
  adminLogout: () => void;

   // KYC-specific
  isKycCompleted: boolean;
  setIsKycCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  isKycFilled: boolean;
  kycStatus: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload['data'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // NEW

  // NEW admin states
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<JwtPayload['data'] | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const url = import.meta.env.VITE_NODE_ENV == 'production' ? 'api' : 'api';
  const [isKycCompleted, setIsKycCompleted] = useState(false); 
  const [isKycFilled, setIsKycFilled] = useState(false);
  const [kycStatus, setKycStatus] = useState('');

  useEffect(() => {
  const fetchKycStatus = async () => {
    try {
      const res = await api.get(`${url}/v1/kyc/status`);
      if (res.status === 200) {
        const status = res.data.status?.toLowerCase();
        const filled = res.data.isKycFilled;

        console.log('Current KYC Status:', status);
        console.log('Is KYC Filled:', filled);
        
        setKycStatus(status);
        setIsKycFilled(filled);

        if (status === 'completed') {
          setIsKycCompleted(true);
        } else {
          setIsKycCompleted(false);
        }
      }
    } catch (error) {
      console.log('⚠️ Error fetching KYC status:', error);
    }
  };

  fetchKycStatus();
}, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && isTokenValid(storedToken)) {
      const decoded = jwtDecode<JwtPayload>(storedToken);
      setToken(storedToken);
      setUser(decoded.data);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }

    // Admin token logic
    const storedAdminToken = localStorage.getItem('admin');
    if (storedAdminToken && isTokenValid(storedAdminToken)) {
      const decoded = jwtDecode<JwtPayload>(storedAdminToken);
      setAdminToken(storedAdminToken);
      setAdmin(decoded.data);
      setIsAdminAuthenticated(true);
    } else {
      localStorage.removeItem('admin');
      setAdminToken(null);
      setAdmin(null);
      setIsAdminAuthenticated(false);
    }
    setLoading(false); // auth check finished
  }, []);

  const login = (newToken: string) => {
    if (isTokenValid(newToken)) {
      const decoded = jwtDecode<JwtPayload>(newToken);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(decoded.data);
      setIsAuthenticated(true);
    } else {
      logout();
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // NEW admin login/logout
  const adminLogin = (newToken: string) => {
    if (isTokenValid(newToken)) {
      const decoded = jwtDecode<JwtPayload>(newToken);
      localStorage.setItem('admin', newToken);
      setAdminToken(newToken);
      setAdmin(decoded.data);
      setIsAdminAuthenticated(true);
    } else {
      adminLogout();
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('admin');
    setAdminToken(null);
    setAdmin(null);
    setIsAdminAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        // NEW admin values
        adminToken,
        admin,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,

        // KYC values
        isKycCompleted,
        setIsKycCompleted,
        isKycFilled,
        kycStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
