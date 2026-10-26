import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { logoCinesi, logoVitality } from '../assets';
import {
  UserPlus,
  Calculator,
  BookOpen,
  AlertTriangle,
  Truck,
  ShieldAlert,
  LogOut,
  Shield,
  Microscope,
  UserCheck,
  FileText,
  Tablet,
  User,
  RefreshCw
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { config, tenant, resetTenant } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  // Definição dos itens de menu com controle estrito de RBAC
  const menuItems = [
    {
      title: 'Cadastro de Pacientes',
      path: '/workspace/pacientes',
      icon: UserPlus,
      roles: ['RECEPCAO', 'ADMIN'],
      badge: 'Atendimento',
    },
    {
      title: 'Orçamento & Recepção',
      path: '/workspace/recepcao',
      icon: Calculator,
      roles: ['RECEPCAO', 'ADMIN'],
      badge: 'CLSI H3-A6',
    },
    {
      title: 'Catálogo de Exames',
      path: '/workspace/catalogo',
      icon: BookOpen,
      roles: ['RECEPCAO', 'ADMIN'],
      badge: null,
    },
    {
      title: 'Bancada & Recoletas',
      path: '/workspace/coleta',
      icon: AlertTriangle,
      roles: ['LABORATORIO', 'ADMIN'],
      badge: 'Triagem',
    },
    {
      title: 'Tablet Sala de Coleta',
      path: '/workspace/sala-coleta',
      icon: Tablet,
      roles: ['LABORATORIO', 'ADMIN'],
      badge: 'Touch Kiosk',
    },
    {
      title: 'Logística B2B',
      path: '/workspace/logistica',
      icon: Truck,
      roles: ['LABORATORIO', 'ADMIN'],
      badge: 'Apoio Externo',
    },
    {
      title: 'Gestão de Qualidade',
      path: '/workspace/qualidade',
      icon: ShieldAlert,
      roles: ['LABORATORIO', 'ADMIN'],
      badge: 'POP & Estoque',
    },
    {
      title: 'Laudo Autenticado',
      path: '/workspace/laudo',
      icon: FileText,
      roles: ['RECEPCAO', 'LABORATORIO', 'ADMIN'],
      badge: 'Oficial',
    },
  ];

  // REGRA DE NEGÓCIO ESTRITA (RBAC):
  // Recepção: NÃO vê Bancada/Recoletas, Tablet Sala de Coleta, Logística e Qualidade.
  // Laboratório: NÃO vê Cadastro de Pacientes, Orçamento e Catálogo de Atendimento.
  const filteredItems = menuItems.filter((item) => {
    if (user.perfil === 'ADMIN') return true;
    return item.roles.includes(user.perfil);
  });

  const getProfileBadge = () => {
    switch (user.perfil) {
      case 'ADMIN':
        return { label: 'Administrador (Total)', icon: Shield, bg: 'bg-amber-400/20 text-amber-200 border-amber-400/30' };
      case 'LABORATORIO':
        return { label: 'Bancada Analítica', icon: Microscope, bg: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30' };
      case 'RECEPCAO':
        return { label: 'Recepção & Triagem', icon: UserCheck, bg: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' };
    }
  };

  const badgeInfo = getProfileBadge();
  const BadgeIcon = badgeInfo.icon;

  const handleLogout = () => {
    logout();
    resetTenant();
    navigate('/login', { replace: true });
  };

  const clientLogo = config.logoUrl || (tenant === 'CINESI' ? logoCinesi : logoVitality);

  return (
    <aside 
      className="w-72 text-white flex flex-col justify-between shrink-0 shadow-2xl z-20 border-r border-black/20 transition-colors duration-300"
      style={{ backgroundColor: config.cores.primary }}
    >
      
      {/* Topo da Sidebar: Bloco Branco Exclusivo para Destaque da Logo em Escala Ampliada */}
      <div>
        <div className="bg-white p-5 border-b border-black/10 flex flex-col items-center justify-center text-center shadow-inner">
          <img 
            src={clientLogo} 
            alt={config.nome} 
            className="h-28 sm:h-36 max-h-40 w-full max-w-[220px] object-contain mx-auto transition-transform duration-300 hover:scale-105"
          />
          <h2 className="font-extrabold text-sm leading-tight text-slate-900 font-['Outfit'] tracking-wide truncate max-w-full mt-2">
            {config.nome}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <p className="text-[11px] text-slate-500 font-medium truncate">{config.cidadeUnidade}</p>
          </div>
        </div>

        {/* Badge Institucional do Tenant */}
        <div className="px-4 pt-4 pb-1">
          <div className="px-3.5 py-2 rounded-xl bg-black/25 border border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-white/70 font-medium">Ambiente Seguro:</span>
            <span 
              className="font-extrabold uppercase tracking-wider text-xs"
              style={{ color: config.cores.secondary }}
            >
              {tenant}
            </span>
          </div>
        </div>

        {/* Lista de Navegação RBAC com Fundo bg-primary e Ativo em bg-secondary */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3.5 pb-1.5 text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center justify-between">
            <span>Módulos ({user.perfil})</span>
            <span className="text-[9px] lowercase bg-white/10 px-1.5 py-0.5 rounded font-mono">rbac ativo</span>
          </div>

          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor: config.cores.secondary,
                        color: '#FFFFFF',
                      }
                    : {}
                }
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'font-bold shadow-lg shadow-black/20 transform translate-x-1'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon 
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span 
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isActive 
                            ? 'bg-black/20 text-white' 
                            : 'bg-white/15 text-white/80'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Dados do Usuário & Ações */}
      <div className="p-4 border-t border-white/15 bg-black/25">
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate leading-tight">
              {user.nome}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border font-semibold ${badgeInfo.bg}`}>
                <BadgeIcon className="w-3 h-3" />
                <span>{badgeInfo.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ações: Trocar Perfil / Encerrar Sessão */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate('/workspace/auth')}
            title="Trocar perfil operacional"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Perfil</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Encerrar sessão no sistema"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-500/40 border border-rose-400/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
