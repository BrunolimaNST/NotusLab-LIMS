import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { logoCinesi, logoVitality, logoNotus } from '../assets';
import { 
  UserCheck, 
  Microscope, 
  ArrowLeft, 
  Shield, 
  Users, 
  Check, 
  Lock, 
  BadgeCheck 
} from 'lucide-react';

interface ProfileCardData {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  targetPath: string;
  badge: string;
  responsibilities: string[];
}

export const WorkspaceAuth: React.FC = () => {
  const navigate = useNavigate();
  const { login, activeAccount, switchAccount, contasDisponiveis, logout } = useAuth();
  const { config, tenant, resetTenant } = useTheme();

  const allProfiles: ProfileCardData[] = [
    {
      role: 'RECEPCAO',
      title: 'Recepção',
      subtitle: 'Atendimento & Triagem',
      description: 'Abertura de ordens de serviço, cadastro de pacientes, orçamento e cálculo de tubos (Norma CLSI H3-A6).',
      icon: UserCheck,
      targetPath: '/workspace/recepcao',
      badge: 'Frente de Atendimento',
      responsibilities: ['Cadastro de Pacientes', 'Orçamentos & Tubos', 'Catálogo de Exames'],
    },
    {
      role: 'LABORATORIO',
      title: 'Laboratório',
      subtitle: 'Bancada Técnica & Logística',
      description: 'Validação de amostras, triagem de interferentes, painel de recoletas, rastreio B2B e controle de qualidade.',
      icon: Microscope,
      targetPath: '/workspace/coleta',
      badge: 'Setor Analítico',
      responsibilities: ['Bancada & Recoletas', 'Logística B2B & Cadeia Fria', 'Gestão de Qualidade & POP'],
    },
    {
      role: 'ADMIN',
      title: 'Administrador',
      subtitle: 'Diretoria & Responsável Técnico',
      description: 'Supervisão integral de rotina, auditoria de custos de desperdício, controle de validade e parametrização.',
      icon: Shield,
      targetPath: '/workspace/recepcao',
      badge: 'Acesso Geral',
      responsibilities: ['Acesso Irrestrito', 'Auditoria Financeira', 'Parametrização do LIMS'],
    },
  ];

  // REGRA DE NEGÓCIO ESTRITA (RBAC):
  // Mostra APENAS os cartões de perfil aos quais a conta autenticada tem permissão
  const perfisAutorizados = allProfiles.filter((profile) => {
    if (activeAccount.perfilPrincipal === 'ADMIN') return true;
    return activeAccount.perfisPermitidos.includes(profile.role);
  });

  const handleSelectProfile = (profile: ProfileCardData) => {
    login(profile.role);
    navigate(profile.targetPath);
  };

  const clientLogo = config.logoUrl || (tenant === 'CINESI' ? logoCinesi : logoVitality);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between p-6 sm:p-10 selection:bg-secondary selection:text-white relative overflow-hidden">
      
      {/* Luzes de Fundo Sutis com as Cores da Marca do Tenant */}
      <div 
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: config.cores.primary }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: config.cores.secondary }}
      />

      {/* Topo: Informações do Tenant e Seletor de Conta Simulada para RBAC */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div 
            className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs"
            style={{ backgroundColor: config.cores.primary }}
          />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Ambiente Laboratorial • <span style={{ color: config.cores.primary }}>{config.nome}</span>
          </span>
        </div>

        {/* Simulador Rápido de Contas do Laboratório para Homologação do RBAC */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Colaborador Logado:
          </span>
          <div className="inline-flex rounded-xl p-1 bg-slate-200/70 border border-slate-300">
            {contasDisponiveis.map((conta) => {
              const isSelected = activeAccount.id === conta.id;
              return (
                <button
                  key={conta.id}
                  type="button"
                  onClick={() => switchAccount(conta.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                  <span>{conta.nome.split(' ')[0]} ({conta.perfilPrincipal === 'RECEPCAO' ? 'Recepção' : conta.perfilPrincipal === 'LABORATORIO' ? 'Bancada' : 'Admin'})</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              resetTenant();
              navigate('/login', { replace: true });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Seção da Logo do Cliente em Escala Massiva */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-6 sm:mt-8 mb-4">
        <img 
          src={clientLogo} 
          alt={config.nome} 
          className="h-40 sm:h-52 w-auto max-w-sm mx-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-sm"
        />
        <div className="flex items-center gap-2 mt-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-sm font-bold text-slate-700">
            {config.nome} <span className="text-slate-400 font-normal">• {config.cidadeUnidade}</span>
          </p>
        </div>
      </div>

      {/* Conteúdo Central: Seleção de Perfil estilo "Quem está acessando?" */}
      <main className="relative z-10 w-full max-w-5xl mx-auto my-auto py-4 flex flex-col items-center text-center">
        
        {/* Identificação do Usuário Ativo */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-3 shadow-xs border"
          style={{ 
            backgroundColor: `${config.cores.primary}15`, 
            borderColor: `${config.cores.primary}30`,
            color: config.cores.primary
          }}
        >
          <BadgeCheck className="w-4 h-4" style={{ color: config.cores.secondary }} />
          <span>Sessão de: <strong>{activeAccount.nome}</strong> ({activeAccount.cargo})</span>
        </div>

        {/* Título "Quem está acessando?" */}
        <h1 
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-['Outfit'] mb-2"
          style={{ color: config.cores.primary }}
        >
          Quem está acessando?
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mb-8 font-medium">
          {perfisAutorizados.length === 1 ? (
            <span>Seu perfil com permissão autorizada para a rotina deste terminal:</span>
          ) : (
            <span>Selecione a função operacional desejada para esta sessão no laboratório:</span>
          )}
        </p>

        {/* GRID COM OS CARDS FILTRADOS POR RBAC (Mariana vê APENAS Recepção; Lucas vê APENAS Laboratório) */}
        <div className={`grid gap-6 sm:gap-8 w-full text-left max-w-4xl mx-auto ${
          perfisAutorizados.length === 1 ? 'grid-cols-1 max-w-md' : perfisAutorizados.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
        }`}>
          {perfisAutorizados.map((profile) => {
            const Icon = profile.icon;

            return (
              <div
                key={profile.role}
                onClick={() => handleSelectProfile(profile)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectProfile(profile); }}
                className="group relative bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col justify-between overflow-hidden border-t-4"
                style={{
                  borderTopColor: config.cores.primary,
                }}
              >
                <div>
                  {/* Topo do Card: Ícone e Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: config.cores.primary }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <span 
                      className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: `${config.cores.secondary}15`,
                        borderColor: `${config.cores.secondary}40`,
                        color: config.cores.primary,
                      }}
                    >
                      {profile.badge}
                    </span>
                  </div>

                  {/* Títulos e Descrição */}
                  <h2 
                    className="text-xl font-bold font-['Outfit'] transition-colors"
                    style={{ color: config.cores.primary }}
                  >
                    {profile.title}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mb-3">
                    {profile.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {profile.description}
                  </p>

                  {/* Lista de Atribuições / Permissões */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Permissões Ativas:
                    </span>
                    {profile.responsibilities.map((resp, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <span 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: config.cores.secondary }}
                        />
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de Acesso Direto */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                    Acessar Terminal
                  </span>
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:translate-x-1 transition-all"
                    style={{ backgroundColor: config.cores.primary }}
                  >
                    →
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* Rodapé Seguro */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto pt-6 border-t border-slate-200 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img src={logoNotus} alt="NotusLab LIMS" className="h-6 w-auto object-contain" />
          <span>NotusLab LIMS • Arquitetura Multi-Tenant com RBAC Estrito</span>
        </div>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Controle de Acesso Baseado em Função (ISO 15189 / RDC 786)</span>
        </span>
      </footer>

    </div>
  );
};

export default WorkspaceAuth;
