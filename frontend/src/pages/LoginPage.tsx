import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, TenantId } from '../contexts/ThemeContext';
import { 
  logoNotus, 
  logoCinesi, 
  logoVitality, 
  fachadaCinesi, 
  fachadaVitality 
} from '../assets';
import { 
  Users, 
  Microscope, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Building2, 
  ChevronRight, 
  Dna, 
  Activity, 
  Pill, 
  HeartPulse, 
  Award, 
  AlertCircle
} from 'lucide-react';

// Tipos para o Smart Login em Camadas
export type SmartLoginStep = 1 | 2 | 3 | 4;
export type OperacaoModulo = 'RECEPCAO' | 'LABORATORIO';

export interface CategoriaProfissional {
  id: string;
  label: string;
  conselho: string;
  descricao: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIAS_LABORATORIO: CategoriaProfissional[] = [
  {
    id: 'biomedico',
    label: 'Biomédico(a)',
    conselho: 'CRBM',
    descricao: 'Análises clínicas, citopatologia e validação técnica de bancada.',
    icon: Dna,
  },
  {
    id: 'biologo',
    label: 'Biólogo(a)',
    conselho: 'CRBio',
    descricao: 'Diagnóstico molecular, genética e biologia laboratorial.',
    icon: Activity,
  },
  {
    id: 'farmaceutico',
    label: 'Farmacêutico(a)',
    conselho: 'CRF',
    descricao: 'Bioquímica clínica, hematologia e controle de reagentes.',
    icon: Pill,
  },
  {
    id: 'tec_enfermagem',
    label: 'Téc. Enfermagem',
    conselho: 'COREN',
    descricao: 'Coleta sanguínea, triagem pré-analítica e punção especializada.',
    icon: HeartPulse,
  },
  {
    id: 'medico',
    label: 'Médico(a)',
    conselho: 'CRM',
    descricao: 'Patologia clínica, auditoria médica e liberação de laudos críticos.',
    icon: Award,
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchAccountAndRole } = useAuth();
  const { tenant, config, switchTenant, resetTenant } = useTheme();

  // Estados do Smart Login em Camadas
  const [currentStep, setCurrentStep] = useState<SmartLoginStep>(1);
  const [domainInput, setDomainInput] = useState('');
  const [workspacePin, setWorkspacePin] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<TenantId | null>(null);
  const [selectedModule, setSelectedModule] = useState<OperacaoModulo | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Estados do Formulário de Credenciais
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVitality = 
    selectedTenant === 'VITALITY' || 
    tenant === 'VITALITY' || 
    (domainInput && domainInput.toLowerCase().includes('vitality'));

  // Seleciona a fachada correspondente para a Etapa 2 em diante
  const currentCoverImage = isVitality ? fachadaVitality : fachadaCinesi;
  const isStep1 = currentStep === 1;

  // Força o reset para a Etapa 1 e limpa qualquer resquício na montagem da LoginPage
  useEffect(() => {
    // Forçar limpeza completa e retorno irrestrito à Etapa 1
    setCurrentStep(1);
    setDomainInput('');
    setWorkspacePin('');
    setSelectedTenant(null);
    setSelectedModule(null);
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError(null);
    resetTenant();

    // Limpeza de qualquer resíduo de chave no storage
    localStorage.removeItem('@NotusLab:step');
    localStorage.removeItem('notuslab_step');
    localStorage.removeItem('@NotusLab:module');
    localStorage.removeItem('notuslab_module');
    localStorage.removeItem('@NotusLab:role');
    localStorage.removeItem('notuslab_role');
    sessionStorage.clear();
  }, [resetTenant]);

  // Manipulador para Identificação de Domínio do Laboratório (Etapa 1)
  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDomain = domainInput.trim().toLowerCase();
    const cleanPin = workspacePin.trim();

    if (!cleanDomain) {
      setError('Por favor, informe o domínio do seu laboratório (ex: cinesi).');
      return;
    }

    if (!cleanPin) {
      setError('Por favor, informe o PIN de Acesso do workspace.');
      return;
    }

    if (cleanDomain.includes('cinesi')) {
      setSelectedTenant('CINESI');
      switchTenant('CINESI');
      setError(null);
      setCurrentStep(2);
    } else if (cleanDomain.includes('vitality')) {
      setSelectedTenant('VITALITY');
      switchTenant('VITALITY');
      setError(null);
      setCurrentStep(2);
    } else {
      setError('Domínio não localizado. Verifique se digitou corretamente (ex: cinesi ou vitality) ou consulte o administrador.');
    }
  };

  // Manipulador para Seleção do Módulo (Etapa 2)
  const handleSelectModule = (module: OperacaoModulo) => {
    setSelectedModule(module);
    setError(null);

    if (module === 'RECEPCAO') {
      // Se for Recepção, avança direto para a Etapa 4 (Credenciais)
      setSelectedRole('Recepcionista');
      if (!email) {
        setEmail(selectedTenant === 'CINESI' ? 'mariana.recepcao@cinesi.com.br' : 'mariana@vitality.com.br');
      }
      setCurrentStep(4);
    } else {
      // Se for Laboratório, avança para a Etapa 3 (Conselho de Classe)
      setCurrentStep(3);
    }
  };

  // Manipulador para Seleção do Conselho de Classe (Etapa 3)
  const handleSelectRole = (roleLabel: string) => {
    setSelectedRole(roleLabel);
    setError(null);
    if (!email) {
      setEmail(selectedTenant === 'CINESI' ? 'lucas.prado@cinesi.com.br' : 'operacao@vitality.com.br');
    }
    setCurrentStep(4);
  };

  // Navegação Retroativa Inteligente (Voltar)
  const handleBackStep = () => {
    setError(null);
    if (currentStep === 4) {
      if (selectedModule === 'RECEPCAO') {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleResetFlow();
    }
  };

  // Reiniciar Fluxo Completo
  const handleResetFlow = () => {
    setError(null);
    setSelectedModule(null);
    setSelectedRole(null);
    setSelectedTenant(null);
    setDomainInput('');
    setWorkspacePin('');
    setPassword('');
    setEmail('');
    resetTenant();
    setCurrentStep(1);
  };

  // Finalização do Login (Etapa 4)
  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Por favor, informe seu e-mail institucional corporativo.');
      return;
    }

    if (!password) {
      setError('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    // Simulação de Autenticação Segura com Transição Apple HIG
    setTimeout(() => {
      setIsLoading(false);

      if (selectedModule === 'RECEPCAO') {
        switchAccountAndRole('MARIANA', 'RECEPCAO');
        navigate('/workspace/recepcao', { replace: true });
      } else {
        switchAccountAndRole('LUCAS', 'LABORATORIO');
        navigate('/workspace/coleta', { replace: true });
      }
    }, 600);
  };

  // Preenchimento Rápido para Demonstração / Homologação
  const handleQuickDemoFill = (conta: 'MARIANA' | 'LUCAS') => {
    if (conta === 'MARIANA') {
      setEmail(selectedTenant === 'CINESI' ? 'mariana.recepcao@cinesi.com.br' : 'mariana@vitality.com.br');
      setPassword('cinesi2026@demo');
    } else {
      setEmail(selectedTenant === 'CINESI' ? 'lucas.prado@cinesi.com.br' : 'lucas@vitality.com.br');
      setPassword('lab2026@demo');
    }
  };

  // Título Dinâmico Adaptável para a Etapa 4
  const getStep4Title = () => {
    if (selectedModule === 'RECEPCAO') {
      return `Acesso Recepção • ${selectedTenant === 'CINESI' ? 'Cinesi' : 'Vitality'}`;
    }
    return `Acesso ${selectedRole || 'Laboratório'} • ${selectedTenant === 'CINESI' ? 'Cinesi' : 'Vitality'}`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans selection:bg-slate-900 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. LADO ESQUERDO: ÁREA DE AUTENTICAÇÃO (100% na Etapa 1, 50% nas Etapas 2+) */}
      {/* ========================================================================= */}
      <div className={`w-full ${
        isStep1 ? 'lg:w-full' : 'lg:w-1/2'
      } flex flex-col items-center justify-between p-8 sm:p-12 lg:p-16 xl:p-20 bg-white relative z-10 min-h-screen overflow-y-auto transition-all duration-700 ease-in-out`}>
        
        {/* Topo do Lado Esquerdo: Navegação Início e Selo de Segurança */}
        <header className={`w-full ${isStep1 ? 'max-w-lg' : 'max-w-md'} flex items-center justify-between pt-2 pb-6 transition-all duration-500`}>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <span>Início</span>
          </Link>

          {/* Selo de Criptografia / Ambiente Seguro */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Smart Login v2.0</span>
          </div>
        </header>

        {/* Conteúdo Central Clean: Formulários e Passos Fundidos no Fundo Branco */}
        <main className={`w-full ${isStep1 ? 'max-w-lg' : 'max-w-md'} my-auto py-4 transition-all duration-500`}>
          <div className="w-full">

            
            {/* Barra de Navegação & Indicador de Etapas (Apple Segmented Pills) */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              {/* Botão Voltar Etapa (quando aplicável) */}
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 cursor-pointer -ml-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Acesso Seguro</span>
                </div>
              )}


            {/* Pílulas Indicadoras de Progresso (Apple Step Indicators) */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((stepNumber) => {
                // Se o módulo for recepção, a etapa 3 é pulada logicamente
                const isSkippedStep3 = selectedModule === 'RECEPCAO' && stepNumber === 3;
                const isStepActive = currentStep === stepNumber;
                const isStepCompleted = currentStep > stepNumber;

                if (isSkippedStep3) return null;

                return (
                  <div
                    key={stepNumber}
                    className="flex items-center gap-1"
                  >
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isStepActive 
                          ? 'w-7 bg-slate-900' 
                          : isStepCompleted 
                            ? 'w-2 bg-emerald-500' 
                            : 'w-2 bg-slate-200'
                      }`}
                      title={`Etapa ${stepNumber}`}
                    />
                  </div>
                );
              })}
              <span className="text-[11px] font-semibold text-slate-400 ml-1.5 font-mono">
                {currentStep === 4 && selectedModule === 'RECEPCAO' ? '3/3' : `${currentStep}/4`}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ETAPA 1: IDENTIFICAÇÃO DO WORKSPACE (DOMÍNIO DO LABORATÓRIO + PIN)        */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div 
              key="step-1"
              className="animate-in fade-in slide-in-from-right space-y-6"
            >
              {/* Logo Oficial NotusLab LIMS Centralizada no Topo do Card */}
              <div className="flex flex-col items-center justify-center">
                <img 
                  src={logoNotus} 
                  alt="NotusLab LIMS" 
                  className="w-72 sm:w-80 md:w-96 h-auto object-contain mx-auto transform scale-150 -my-10 drop-shadow-sm"
                />
              </div>

              <div className="text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Etapa 1 de 4 • Workspace Seguro
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                  Identifique seu Laboratório
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
                  Informe o domínio institucional e o PIN de acesso da sua unidade para carregar as políticas clínicas e a identidade visual.
                </p>
              </div>

              {/* Mensagem de Erro de Validação de Domínio / PIN */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Formulário com Domínio e PIN de Acesso */}
              <form onSubmit={handleDomainSubmit} className="space-y-4 pt-1">
                {/* Campo 1: Domínio do Laboratório */}
                <div>
                  <label 
                    htmlFor="domainInput" 
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >
                    Domínio do Laboratório
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      id="domainInput"
                      type="text"
                      autoFocus
                      value={domainInput}
                      onChange={(e) => {
                        setDomainInput(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="ex: cinesi"
                      className="w-full bg-slate-50/80 border border-slate-300 rounded-2xl pl-10 pr-24 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all shadow-inner font-medium"
                    />
                    <div className="absolute right-3.5 text-[11px] font-mono font-medium text-slate-400 pointer-events-none select-none hidden sm:block">
                      .notuslab.lims
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Subdomínio corporativo cadastrado (ex: cinesi ou vitality).
                  </p>
                </div>

                {/* Campo 2: PIN de Acesso / Senha do Workspace */}
                <div>
                  <label 
                    htmlFor="workspacePin" 
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >
                    PIN de Acesso
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="workspacePin"
                      type="password"
                      value={workspacePin}
                      onChange={(e) => {
                        setWorkspacePin(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="••••••"
                      required
                      className="w-full bg-slate-50/80 border border-slate-300 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all shadow-inner font-mono tracking-widest"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Código de segurança institucional fornecido pela gestão do laboratório.
                  </p>
                </div>

                {/* Botão Primário Apple HIG: Avançar */}
                <button
                  type="submit"
                  className="w-full mt-2 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-black active:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/15 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Avançar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 2: SELEÇÃO DE MÓDULO (ÁREA DE ATUAÇÃO)                              */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div 
              key="step-2"
              className="animate-in fade-in slide-in-from-right space-y-6"
            >
              {/* LOGO DO LABORATÓRIO GIGANTE FLUTUANDO NO FUNDO BRANCO (SEM FUNDO/QUADRADO) */}
              <div className="flex flex-col items-center w-full text-center pt-2">
                <img 
                  src={selectedTenant === 'CINESI' ? logoCinesi : logoVitality} 
                  alt={isVitality ? 'Vitality Diagnostics' : (selectedTenant === 'CINESI' ? 'Cinese Análises Clínicas' : config.nome)}
                  className="w-64 sm:w-80 h-auto object-contain mx-auto mb-6"
                />

                {/* Nome do Laboratório e Tag CONECTADO */}
                <div className="flex flex-col items-center justify-center gap-2 mb-4 w-full">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight text-center w-full">
                    {isVitality ? 'Vitality Diagnostics' : (selectedTenant === 'CINESI' ? 'Cinese Análises Clínicas' : config.nome)}
                  </h2>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">
                      CONECTADO
                    </span>
                  </div>

                  {/* Botão (Trocar) posicionado logo abaixo da tag CONECTADO mantendo a simetria central */}
                  <button
                    type="button"
                    onClick={handleResetFlow}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                    title="Trocar laboratório"
                  >
                    <span>(Trocar)</span>
                  </button>

                  <p className="text-xs text-slate-400 font-mono">
                    {domainInput.trim().toLowerCase() || (selectedTenant === 'CINESI' ? 'cinesi' : 'vitality')}.notuslab.lims
                  </p>
                </div>
              </div>


              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Etapa 2 de 4 • Setor de Operação
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                  Onde você vai atuar hoje?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Defina a estação de trabalho para carregar a interface otimizada com regras clínicas correspondentes.
                </p>
              </div>

              {/* Grid com 2 Módulos Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                
                {/* 1. RECEPÇÃO (Pula direto para Etapa 4) */}
                <button
                  type="button"
                  onClick={() => handleSelectModule('RECEPCAO')}
                  className="text-left p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-200 group cursor-pointer flex flex-col justify-between card-lift"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-950 font-['Outfit']">
                        Recepção
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Abertura de ordens de serviço, cadastro de pacientes, orçamentos e cálculo automático de tubos (Norma CLSI H3-A6).
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>Acesso Direto</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* 2. LABORATÓRIO / BANCADA (Avança para Etapa 3) */}
                <button
                  type="button"
                  onClick={() => handleSelectModule('LABORATORIO')}
                  className="text-left p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-300 shadow-sm hover:shadow-xl transition-all duration-200 group cursor-pointer flex flex-col justify-between card-lift"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200/70 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Microscope className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-cyan-950 font-['Outfit']">
                        Laboratório / Bancada
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Triagem analítica, recoletas, conferência de interferentes (hemólise/lipemia), controle de qualidade e bancada técnica.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
                    <span>Definir Categoria</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 3: CONSELHO DE CLASSE (EXCLUSIVO PARA LABORATÓRIO)                   */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div 
              key="step-3"
              className="animate-in fade-in slide-in-from-right space-y-6"
            >
              {/* Badge Contextual */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/70 text-xs font-semibold text-cyan-800">
                <Microscope className="w-3.5 h-3.5 text-cyan-600" />
                <span>Módulo: <strong>Laboratório & Bancada Analítica</strong></span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Etapa 3 de 4 • Habilitação Técnica
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                  Qual a sua categoria profissional?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  O conselho de classe habilitará a chancela digital e as permissões de assinatura nos laudos conforme a RDC 786/2023.
                </p>
              </div>

              {/* Grid com os 5 Conselhos de Classe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {CATEGORIAS_LABORATORIO.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectRole(cat.label)}
                      className="text-left p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 shadow-2xs hover:shadow-md transition-all duration-200 group cursor-pointer flex items-center justify-between gap-3 card-lift"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                              {cat.label}
                            </h3>
                          </div>
                          <span className="text-[11px] font-extrabold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200/60 uppercase">
                            {cat.conselho}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 4: CREDENCIAIS (O LOGIN FINAL)                                      */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div 
              key="step-4"
              className="animate-in fade-in slide-in-from-right space-y-6"
            >
              {/* Card Resumo do Perfil Configurado (Apple HIG Pill Banner) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0">
                    <img 
                      src={selectedTenant === 'CINESI' ? logoCinesi : logoVitality} 
                      alt={config.nome}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {config.nome}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {selectedModule === 'RECEPCAO' ? 'Recepção' : selectedRole || 'Lab'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {selectedModule === 'RECEPCAO' ? 'Triagem & Faturamento' : 'Bancada Analítica & Laudos'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetFlow}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
                  title="Trocar unidade ou perfil de acesso"
                >
                  Alterar
                </button>
              </div>

              {/* Título Adaptável da Etapa */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Etapa Final • Autenticação Biométrica / Senha
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                  {getStep4Title()}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Digite seu usuário ou e-mail corporativo para descriptografar os dados do terminal.
                </p>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Formulário de Credenciais */}
              <form onSubmit={handleSubmitLogin} className="space-y-4">
                {/* Campo E-mail / Usuário */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    E-mail Institucional ou Usuário
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.nome@laboratorio.com.br"
                      required
                      className="w-full bg-slate-50/80 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all shadow-inner font-medium"
                    />
                  </div>
                </div>

                {/* Campo Senha Corporativa */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Senha Corporativa
                    </label>
                    <a
                      href="#recuperar"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Para redefinir sua senha, solicite suporte ao Responsável Técnico de TI do laboratório.');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
                    >
                      Esqueceu a senha?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-slate-50/80 border border-slate-300 rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all shadow-inner font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botão Primário: Entrar no Sistema */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-black active:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/15 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Autenticando Terminal...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar no Sistema</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Botão Secundário / Link Sutil: Voltar / Trocar de Perfil */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResetFlow}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar / Trocar de perfil</span>
                  </button>
                </div>
              </form>

              {/* ========================================================================= */}
              {/* ATALHOS RÁPIDOS PARA DEMONSTRAÇÃO (MODO HOMOLOGAÇÃO)                      */}
              {/* ========================================================================= */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Atalho Rápido (Homologação):
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedModule === 'RECEPCAO' ? (
                    <button
                      type="button"
                      onClick={() => handleQuickDemoFill('MARIANA')}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                    >
                      Preencher Credencial: Mariana (Recepção)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleQuickDemoFill('LUCAS')}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                    >
                      Preencher Credencial: Dr. Lucas (Bancada)
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          </div>
        </main>

        {/* Rodapé do Lado Esquerdo */}
        <footer className={`w-full ${isStep1 ? 'max-w-lg' : 'max-w-md'} text-center py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 transition-all duration-500`}>
          <div className="flex items-center gap-2">
            <img src={logoNotus} alt="NotusLab LIMS" className="h-4 w-auto object-contain opacity-70" />
            <span>NotusLab LIMS</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Conformidade RDC 786/2023 & ISO 15189
          </span>
        </footer>

      </div>

      {/* ========================================================================= */}
      {/* 2. LADO DIREITO: FACHADA IMERSIVA (ATIVADO DA ETAPA 2 EM DIANTE)          */}
      {/* ========================================================================= */}
      <div 
        className={`${
          isStep1 
            ? 'hidden' 
            : 'hidden lg:block lg:w-1/2'
        } relative overflow-hidden bg-slate-900 transition-all duration-700 ease-in-out`}
      >
        {/* Imagem de Fundo Dinâmica com Transição Suave de 700ms */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out"
          style={{ backgroundImage: `url(${currentCoverImage})` }}
        />

        {/* Gradiente Elegante para Contraste Apple HIG */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 transition-opacity duration-700 ease-in-out" />

        {/* Informações Flutuantes no Lado Direito */}
        <div className="absolute inset-0 p-12 xl:p-16 flex flex-col justify-between text-white z-10 min-w-[480px]">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{config.nome}</span>
            </div>

            <span className="text-xs font-mono text-white/80 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
              {domainInput.trim().toLowerCase() || (selectedTenant === 'CINESI' ? 'cinesi' : 'vitality')}.notuslab.lims
            </span>
          </div>

          <div className="space-y-3 max-w-lg">
            <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              Unidade Conectada
            </div>
            <h3 className="text-3xl xl:text-4xl font-extrabold tracking-tight font-['Outfit'] leading-tight">
              {config.nome}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              Terminal operacional de atendimento e bancada técnica em conformidade com as normas CLSI e ISO 15189.
            </p>
          </div>
        </div>
      </div>

    </div>

  );
};

export default LoginPage;
