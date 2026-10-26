/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logoCinesi, logoVitality } from '../assets';

export type TenantId = 'CINESI' | 'VITALITY';

export interface TenantConfig {
  id: TenantId;
  nome: string;
  subtitulo: string;
  cidadeUnidade: string;
  cnpj: string;
  logoUrl: string;
  cores: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    secondary: string;
    secondaryHover: string;
    secondaryLight: string;
  };
}

export const TENANTS: Record<TenantId, TenantConfig> = {
  CINESI: {
    id: 'CINESI',
    nome: 'Cinese Análises Clínicas',
    subtitulo: 'Unidade Central de Diagnóstico',
    cidadeUnidade: 'São Paulo - SP',
    cnpj: '12.345.678/0001-90',
    logoUrl: logoCinesi,
    cores: {
      primary: '#371E54', // Roxo Profundo
      primaryHover: '#2A1640',
      primaryLight: '#F4EBF9',
      secondary: '#78C4A4', // Verde Menta
      secondaryHover: '#5DAF8E',
      secondaryLight: '#E8F7F1',
    },
  },
  VITALITY: {
    id: 'VITALITY',
    nome: 'Vitality Diagnostics',
    subtitulo: 'Centro de Diagnósticos Avançados',
    cidadeUnidade: 'Campinas - SP',
    cnpj: '98.765.432/0001-10',
    logoUrl: logoVitality,
    cores: {
      primary: '#004B66', // Azul Petróleo
      primaryHover: '#00374D',
      primaryLight: '#E0F2F7',
      secondary: '#8B0000', // Vermelho Sangue
      secondaryHover: '#6D0000',
      secondaryLight: '#FCEBEB',
    },
  },
};

export interface ThemeContextData {
  tenant: TenantId | null;
  config: TenantConfig;
  switchTenant: (newTenant: TenantId) => void;
  resetTenant: () => void;
  availableTenants: TenantConfig[];
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const STORAGE_KEY = '@NotusLab:tenant';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantId | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('notuslab_tenant');
    if (saved === 'CINESI' || saved === 'VITALITY') {
      return saved as TenantId;
    }
    return null;
  });

  const config = tenant ? TENANTS[tenant] : TENANTS.CINESI;

  // Injeta dinamicamente as variáveis no :root da página
  useEffect(() => {
    const root = document.documentElement;

    if (tenant) {
      root.setAttribute('data-tenant', tenant);
      root.style.setProperty('--color-primary', config.cores.primary);
      root.style.setProperty('--color-primary-hover', config.cores.primaryHover);
      root.style.setProperty('--color-primary-light', config.cores.primaryLight);
      root.style.setProperty('--color-secondary', config.cores.secondary);
      root.style.setProperty('--color-secondary-hover', config.cores.secondaryHover);
      root.style.setProperty('--color-secondary-light', config.cores.secondaryLight);

      localStorage.setItem(STORAGE_KEY, tenant);
      localStorage.setItem('notuslab_tenant', tenant);
    } else {
      root.removeAttribute('data-tenant');
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-primary-hover');
      root.style.removeProperty('--color-primary-light');
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--color-secondary-hover');
      root.style.removeProperty('--color-secondary-light');

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('notuslab_tenant');
    }
  }, [tenant, config]);

  const switchTenant = useCallback((newTenant: TenantId) => {
    setTenant(newTenant);
  }, []);

  const resetTenant = useCallback(() => {
    setTenant(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('notuslab_tenant');
    const root = document.documentElement;
    root.removeAttribute('data-tenant');
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-primary-hover');
    root.style.removeProperty('--color-primary-light');
    root.style.removeProperty('--color-secondary');
    root.style.removeProperty('--color-secondary-hover');
    root.style.removeProperty('--color-secondary-light');
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        tenant,
        config,
        switchTenant,
        resetTenant,
        availableTenants: Object.values(TENANTS),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextData => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
};
