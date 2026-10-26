import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layouts & Páginas do Novo Fluxo
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { WorkspaceAuth } from './pages/WorkspaceAuth';

// Módulos Internos do LIMS
import { RecepcaoPage } from './pages/RecepcaoPage';
import { CadastroPacientePage } from './pages/CadastroPacientePage';
import { CatalogoExamesPage } from './pages/CatalogoExamesPage';
import { ColetaPage } from './pages/ColetaPage';
import { LogisticaPage } from './pages/LogisticaPage';
import { GestaoQualidadePage } from './pages/GestaoQualidadePage';
import { LaudoPage } from './pages/LaudoPage';
import { TabletSalaColeta } from './pages/TabletSalaColeta';

// Componente para Redirecionamento Inicial Inteligente no Workspace
const WorkspaceHomeRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redireciona a tela inicial de acordo com o papel do profissional
  if (user.perfil === 'LABORATORIO') {
    return <Navigate to="/workspace/coleta" replace />;
  }
  return <Navigate to="/workspace/recepcao" replace />;
};

// Componente de Guarda de Rota (RBAC)
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    // Se o usuário não tiver permissão para a tela específica, redireciona para a home autorizada
    return <Navigate to="/workspace" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Landing Page Institucional NotusLab */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Login do Laboratório (Smart Login em Camadas Apple HIG) */}
            <Route path="/login" element={<LoginPage />} />

            {/* 3. Seleção de Perfil de Funcionário (Estilo "Quem está acessando?") */}
            <Route path="/workspace/auth" element={<WorkspaceAuth />} />

            {/* Totem/Tablet Kiosk Fullscreen da Sala de Coleta de Sangue */}
            <Route
              path="/totem/sala-coleta"
              element={
                <ProtectedRoute allowedRoles={['LABORATORIO', 'RECEPCAO', 'ADMIN']}>
                  <TabletSalaColeta />
                </ProtectedRoute>
              }
            />

            {/* 4. Sistema Interno Protegido (/workspace/*) */}
            <Route
              path="/workspace"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Redirecionador Inteligente da Raiz do Workspace */}
              <Route index element={<WorkspaceHomeRedirect />} />

              {/* Módulo Recepção & Pré-Analítico (RECEPCAO e ADMIN) */}
              <Route
                path="recepcao"
                element={
                  <ProtectedRoute allowedRoles={['RECEPCAO', 'ADMIN']}>
                    <RecepcaoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pacientes"
                element={
                  <ProtectedRoute allowedRoles={['RECEPCAO', 'ADMIN']}>
                    <CadastroPacientePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="catalogo"
                element={
                  <ProtectedRoute allowedRoles={['RECEPCAO', 'ADMIN']}>
                    <CatalogoExamesPage />
                  </ProtectedRoute>
                }
              />

              {/* Módulo Bancada, Coleta & Logística (LABORATORIO e ADMIN) */}
              <Route
                path="coleta"
                element={
                  <ProtectedRoute allowedRoles={['LABORATORIO', 'ADMIN']}>
                    <ColetaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="sala-coleta"
                element={
                  <ProtectedRoute allowedRoles={['LABORATORIO', 'ADMIN']}>
                    <TabletSalaColeta />
                  </ProtectedRoute>
                }
              />
              <Route
                path="logistica"
                element={
                  <ProtectedRoute allowedRoles={['LABORATORIO', 'ADMIN']}>
                    <LogisticaPage />
                  </ProtectedRoute>
                }
              />

              {/* Módulo Gestão de Qualidade & Custos (LABORATORIO e ADMIN) */}
              <Route
                path="qualidade"
                element={
                  <ProtectedRoute allowedRoles={['LABORATORIO', 'ADMIN']}>
                    <GestaoQualidadePage />
                  </ProtectedRoute>
                }
              />

              {/* Módulo Laudo Autenticado & Validação Digital (RECEPCAO, LABORATORIO e ADMIN) */}
              <Route
                path="laudo"
                element={
                  <ProtectedRoute allowedRoles={['RECEPCAO', 'LABORATORIO', 'ADMIN']}>
                    <LaudoPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Redirecionamentos de conveniência para rotas legadas */}
            <Route path="/recepcao" element={<Navigate to="/workspace/recepcao" replace />} />
            <Route path="/coleta" element={<Navigate to="/workspace/coleta" replace />} />
            <Route path="/pacientes" element={<Navigate to="/workspace/pacientes" replace />} />
            <Route path="/catalogo" element={<Navigate to="/workspace/catalogo" replace />} />
            <Route path="/logistica" element={<Navigate to="/workspace/logistica" replace />} />
            <Route path="/qualidade" element={<Navigate to="/workspace/qualidade" replace />} />
            <Route path="/laudo" element={<Navigate to="/workspace/laudo" replace />} />

            {/* Rota Coringa: Redireciona para a Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
