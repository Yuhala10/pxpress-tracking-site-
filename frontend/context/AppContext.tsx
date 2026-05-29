'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Lang, t } from '@/lib/i18n';
import { api } from '@/lib/api';

type User = { id: string; name: string; email: string; role: string };

type AppContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [darkMode, setDarkModeState] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const l = localStorage.getItem('px_lang') as Lang;
    if (l === 'en' || l === 'fr') setLangState(l);
    const d = localStorage.getItem('px_dark') === 'true';
    setDarkModeState(d);
    document.documentElement.classList.toggle('dark', d);
    const tk = localStorage.getItem('px_token');
    if (tk) {
      setToken(tk);
      api<{ user: User }>('/auth/me')
        .then((r) => setUser(r.user))
        .catch(() => {
          localStorage.removeItem('px_token');
          setToken(null);
        });
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('px_lang', l);
  };

  const setDarkMode = (v: boolean) => {
    setDarkModeState(v);
    localStorage.setItem('px_dark', String(v));
    document.documentElement.classList.toggle('dark', v);
  };

  const login = async (email: string, password: string) => {
    const res = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('px_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('px_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('px_token')) return;
    const res = await api<{ user: User }>('/auth/me');
    setUser(res.user);
  }, []);

  const translate = (key: string) => t(lang, key);

  return (
    <AppContext.Provider
      value={{ lang, setLang, t: translate, darkMode, setDarkMode, user, token, login, logout, refreshUser }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
