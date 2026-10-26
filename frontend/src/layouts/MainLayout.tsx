import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../utils/motion';

export const MainLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Se não houver funcionário autenticado, redireciona para a seleção de perfil
  if (!isAuthenticated || !user) {
    return <Navigate to="/workspace/auth" state={{ from: location }} replace />;
  }

  // 1. Verificação de Rota: Deteta se o utilizador está no Modo Quiosque do Tablet
  const isKioskMode = location.pathname.includes('/workspace/sala-coleta') || location.pathname.includes('/totem/sala-coleta');

  // 2. Renderização Condicional & 3. Ecrã Inteiro: Se for a rota da Sala de Coleta, esconde Header e Sidebar
  if (isKioskMode) {
    return (
      <div className="w-screen h-screen overflow-auto bg-slate-100/90 font-sans">
        <main className="w-full min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // 4. Proteção do Restante: Mantém o layout global padrão com Sidebar e Header para os demais módulos
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar com identidade do cliente e bg-primary */}
      <Sidebar />

      {/* Conteúdo Principal + Cabeçalho Superior com Atalhos de Demonstração */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        {/* Área de Visualização das Páginas com Animação de Entrada Fade-In / Slide-Up */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/80">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
