import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StartSessionResponse } from '../types';
import apiClient from '../api/client';

const SESSION_STORAGE_KEY = 'table-order-session';

interface SessionContextType {
  session: StartSessionResponse | null;
  isAuthenticated: boolean;
  setSession: (session: StartSessionResponse | null) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<StartSessionResponse | null>(null);

  useEffect(() => {
    // Load session from localStorage on mount
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession) as StartSessionResponse;
        // Check if session is still valid
        const expiresAt = new Date(parsed.expiresAt);
        if (expiresAt > new Date()) {
          setSessionState(parsed);
          apiClient.setSessionToken(parsed.sessionToken);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, []);

  const setSession = (newSession: StartSessionResponse | null) => {
    setSessionState(newSession);
    if (newSession) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      apiClient.setSessionToken(newSession.sessionToken);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      apiClient.setSessionToken(null);
    }
  };

  const clearSession = () => {
    setSession(null);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        isAuthenticated: session !== null,
        setSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
