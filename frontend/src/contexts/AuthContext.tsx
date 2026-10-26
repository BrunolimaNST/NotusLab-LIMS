/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, User, UserAccount } from '../types';

export type { UserRole, User, UserAccount };

export interface AuthContextData {
  user: User | null;
  activeAccount: UserAccount;
  contasDisponiveis: UserAccount[];
  isAuthenticated: boolean;
  login: (perfil: UserRole) => void;
  switchAccount: (accountIdOrKey: string) => void;
  switchAccountAndRole: (accountIdOrKey: string, targetRole?: UserRole) => void;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const STORAGE_AUTH_KEY = '@NotusLab:user';
const STORAGE_ACCOUNT_KEY = '@NotusLab:activeAccount';

export const CONTAS_SIMULADAS: Record<string, UserAccount> = {
  MARIANA: {
    id: 'usr-rec-001',
    nome: 'Mariana Souza',
    email: 'mariana.recepcao@cinesi.com.br',
    cargo: 'Recepcionista e Triagem de Pacientes',
    perfilPrincipal: 'RECEPCAO',
    perfisPermitidos: ['RECEPCAO'],
  },
  LUCAS: {
    id: 'usr-lab-002',
    nome: 'Dr. Lucas Prado',
    email: 'lucas.prado@cinesi.com.br',
    cargo: 'Biomédico Analista de Bancada',
    perfilPrincipal: 'LABORATORIO',
    perfisPermitidos: ['LABORATORIO'],
  },
  CAMILA: {
    id: 'usr-adm-003',
    nome: 'Dra. Camila Vasconcelos',
    email: 'camila.admin@cinesi.com.br',
    cargo: 'Responsável Técnica & Gestora Geral',
    perfilPrincipal: 'ADMIN',
    perfisPermitidos: ['RECEPCAO', 'LABORATORIO', 'ADMIN'],
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Conta do Colaborador Autenticado (Mariana, Lucas ou Camila)
  const [activeAccount, setActiveAccount] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(STORAGE_ACCOUNT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.perfisPermitidos) return parsed;
      } catch {
        // fallback
      }
    }
    return CONTAS_SIMULADAS.MARIANA;
  });

  // 2. Sessão Operacional Ativa (com perfil selecionado em WorkspaceAuth)
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_AUTH_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Salva no storage quando houver alterações
  useEffect(() => {
    localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(activeAccount));
  }, [activeAccount]);

  const getAccountByKey = (accountIdOrKey: string): UserAccount => {
    const key = accountIdOrKey.toUpperCase();
    if (CONTAS_SIMULADAS[key]) return CONTAS_SIMULADAS[key];
    return Object.values(CONTAS_SIMULADAS).find(
      (a) => a.id === accountIdOrKey || a.nome.toLowerCase().includes(accountIdOrKey.toLowerCase())
    ) || CONTAS_SIMULADAS.MARIANA;
  };

  const switchAccount = (accountIdOrKey: string) => {
    const account = getAccountByKey(accountIdOrKey);
    setActiveAccount(account);
    // Se o usuário logado tiver perfil incompatível com a nova conta, desloga para reautenticar
    if (user && !account.perfisPermitidos.includes(user.perfil) && account.perfilPrincipal !== 'ADMIN') {
      setUser(null);
      localStorage.removeItem(STORAGE_AUTH_KEY);
    }
  };

  const switchAccountAndRole = (accountIdOrKey: string, targetRole?: UserRole) => {
    const account = getAccountByKey(accountIdOrKey);
    const roleToSet = targetRole || account.perfilPrincipal;

    setActiveAccount(account);
    localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(account));

    const sessionUser: User = {
      id: account.id,
      nome: account.nome,
      email: account.email,
      perfil: roleToSet,
      cargo: account.cargo,
      perfisPermitidos: account.perfisPermitidos,
    };

    setUser(sessionUser);
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(sessionUser));
  };

  const login = (perfil: UserRole) => {
    // Validação estrita de RBAC: a conta precisa ter permissão para o perfil selecionado
    if (!activeAccount.perfisPermitidos.includes(perfil) && activeAccount.perfilPrincipal !== 'ADMIN') {
      console.error(`Acesso negado: a conta ${activeAccount.nome} não possui o perfil ${perfil}.`);
      return;
    }

    const sessionUser: User = {
      id: activeAccount.id,
      nome: activeAccount.nome,
      email: activeAccount.email,
      perfil: perfil,
      cargo: activeAccount.cargo,
      perfisPermitidos: activeAccount.perfisPermitidos,
    };

    setUser(sessionUser);
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(sessionUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_AUTH_KEY);
    localStorage.removeItem(STORAGE_ACCOUNT_KEY);
    localStorage.removeItem('@NotusLab:tenant');
    localStorage.removeItem('notuslab_tenant');
    localStorage.removeItem('@NotusLab:step');
    localStorage.removeItem('notuslab_step');
    localStorage.removeItem('@NotusLab:module');
    localStorage.removeItem('notuslab_module');
    localStorage.removeItem('@NotusLab:role');
    localStorage.removeItem('notuslab_role');
    sessionStorage.clear();
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.perfil === 'ADMIN') return true; // ADMIN possui acesso universal
    return allowedRoles.includes(user.perfil);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeAccount,
        contasDisponiveis: Object.values(CONTAS_SIMULADAS),
        isAuthenticated: !!user,
        login,
        switchAccount,
        switchAccountAndRole,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
