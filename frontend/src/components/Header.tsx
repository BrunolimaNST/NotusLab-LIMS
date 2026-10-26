import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useTheme, TenantId } from '../contexts/ThemeContext';
import { logoCinesi, logoVitality } from '../assets';
import {
  Sparkles,
  Building2,
  Users,
  Check,
  ShieldCheck,
  Bell,
  RefreshCw,
  LogOut,
  UserCheck,
  Microscope,
  Shield
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, activeAccount, switchAccountAndRole, logout } = useAuth();
  const { tenant, config, switchTenant, resetTenant } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    resetTenant();
    navigate('/login', { replace: true });
  };

  // Handler para troca imediata de perfil sem bloqueios do RBAC
  const handleSwitchRole = (
    accountId: 'MARIANA' | 'LUCAS' | 'CAMILA',
    targetRole: UserRole
  ) => {
    switchAccountAndRole(accountId, targetRole);

    // Redirecionamento instantâneo para a rota inicial permitida do novo perfil
    if (targetRole === 'RECEPCAO') {
      // Se estiver numa rota analítica/restrita ao laboratório, move para a recepção
      if (['/workspace/coleta', '/workspace/sala-coleta', '/workspace/logistica', '/workspace/qualidade'].includes(location.pathname)) {
        navigate('/workspace/recepcao', { replace: true });
      } else if (location.pathname === '/workspace' || location.pathname === '/workspace/') {
        navigate('/workspace/recepcao', { replace: true });
      }
    } else if (targetRole === 'LABORATORIO') {
      // Se estiver numa rota de atendimento/orçamento, move para a bancada
      if (['/workspace/recepcao', '/workspace/pacientes', '/workspace/catalogo'].includes(location.pathname)) {
        navigate('/workspace/coleta', { replace: true });
      } else if (location.pathname === '/workspace' || location.pathname === '/workspace/') {
        navigate('/workspace/coleta', { replace: true });
      }
    } else if (targetRole === 'ADMIN') {
      // Admin tem acesso universal
      if (location.pathname === '/workspace' || location.pathname === '/workspace/') {
        navigate('/workspace/recepcao', { replace: true });
      }
    }
  };

  const handleTenantSwitch = (newTenant: TenantId) => {
    switchTenant(newTenant);
  };

  const clientLogo = config.logoUrl || (tenant === 'CINESI' ? logoCinesi : logoVitality);
  const isMariana = activeAccount.id === 'usr-rec-001' || user?.perfil === 'RECEPCAO';
  const isLucas = activeAccount.id === 'usr-lab-002' || user?.perfil === 'LABORATORIO';
  const isCamila = activeAccount.id === 'usr-adm-003' || user?.perfil === 'ADMIN';

  return (
    <header className="bg-white border-b border-slate-200 z-10 shrink-0 shadow-xs flex flex-col">
      {/* ========================================================================= */}
      {/* 1. BARRA DE DEMONSTRAÇÃO / HOMOLOGAÇÃO (ATALHOS RÁPIDOS DE NAVEGAÇÃO)    */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border-b border-amber-300/60 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Bloco Visual de Aviso */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-900 border border-amber-400/50 font-bold uppercase tracking-wider text-[11px] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span>[MODO DE DEMONSTRAÇÃO ATIVO] - Atalhos de Navegação</span>
          </div>
        </div>

        {/* Atalhos Rápidos: Alternar Laboratório e Colaborador */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Seletor de Laboratório Ativo (Tenant) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Laboratório Ativo:</span>
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 border border-slate-300/80 shadow-inner">
              <button
                type="button"
                onClick={() => handleTenantSwitch('CINESI')}
                className={`px-2.5 py-1 rounded-md text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  tenant === 'CINESI'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Alternar para Cinese Análises Clínicas"
              >
                <img src={logoCinesi} alt="Cinesi" className="h-4 w-auto object-contain bg-white/90 rounded px-0.5" />
                <span>Cinesi</span>
                {tenant === 'CINESI' && <Check className="w-3 h-3 text-emerald-300" />}
              </button>

              <button
                type="button"
                onClick={() => handleTenantSwitch('VITALITY')}
                className={`px-2.5 py-1 rounded-md text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  tenant === 'VITALITY'
                    ? 'bg-cyan-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Alternar para Vitality Diagnostics"
              >
                <img src={logoVitality} alt="Vitality" className="h-4 w-auto object-contain bg-white/90 rounded px-0.5" />
                <span>Vitality</span>
                {tenant === 'VITALITY' && <Check className="w-3 h-3 text-rose-300" />}
              </button>
            </div>
          </div>

          {/* Divisor */}
          <div className="h-4 w-px bg-amber-300/70 hidden sm:block" />

          {/* Seletor de Colaborador Logado (RBAC Instantâneo) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Colaborador Logado:</span>
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 border border-slate-300/80 shadow-inner">
              
              {/* Mariana - Recepção */}
              <button
                type="button"
                onClick={() => handleSwitchRole('MARIANA', 'RECEPCAO')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isMariana
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Alternar para Mariana Souza (Recepção) e navegar para /workspace/recepcao"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mariana (Recepção)</span>
                {isMariana && <Check className="w-3 h-3 text-emerald-200" />}
              </button>

              {/* Dr. Lucas - Lab */}
              <button
                type="button"
                onClick={() => handleSwitchRole('LUCAS', 'LABORATORIO')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLucas
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Alternar para Dr. Lucas Prado (Bancada/Lab) e navegar para /workspace/coleta"
              >
                <Microscope className="w-3.5 h-3.5" />
                <span>Dr. Lucas (Lab)</span>
                {isLucas && <Check className="w-3 h-3 text-cyan-200" />}
              </button>

              {/* Dra. Camila - Admin */}
              <button
                type="button"
                onClick={() => handleSwitchRole('CAMILA', 'ADMIN')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCamila
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Alternar para Dra. Camila (Administradora / Geral)"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Dra. Camila (Admin)</span>
                {isCamila && <Check className="w-3 h-3 text-amber-200" />}
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CABEÇALHO INSTITUCIONAL DO WORKSPACE                                   */}
      {/* ========================================================================= */}
      <div className="h-16 px-6 flex items-center justify-between">
        
        {/* Lado Esquerdo: Identificação da Unidade e Laboratório */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={clientLogo} 
              alt={config.nome} 
              className="h-10 sm:h-12 w-auto max-w-[170px] object-contain drop-shadow-xs transition-transform hover:scale-105" 
            />
            <div className="hidden lg:flex flex-col border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {config.nome}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {config.cidadeUnidade}
              </span>
            </div>
          </div>

          {/* Badge de status da API */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Backend :3333 Conectado</span>
          </div>
        </div>

        {/* Lado Direito: Identificação do Tenant e Ferramentas */}
        <div className="flex items-center gap-3">
          
          {/* Selo Seguro do Laboratório Ativo */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <div 
              className="w-3 h-3 rounded-full ring-2 ring-white shadow-2xs shrink-0" 
              style={{ backgroundColor: config.cores.secondary }} 
            />
            <span className="truncate">{tenant} Licenciado</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-1" />
          </div>

          {/* Botão de Trocar Perfil (WorkspaceAuth) */}
          <button
            type="button"
            onClick={() => navigate('/workspace/auth')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            title="Trocar perfil operacional"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Trocar Perfil</span>
          </button>

          {/* Botão de Sair (Logout Completo) */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
            title="Encerrar sessão no sistema"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          {/* Separador */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Notificação Simulada */}
          <button 
            type="button" 
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
            title="Notificações do Laboratório"
          >
            <Bell className="w-5 h-5" />
            <span 
              className="w-2 h-2 rounded-full absolute top-2 right-2 ring-2 ring-white" 
              style={{ backgroundColor: config.cores.secondary }}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
