import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoNotus, landingHero } from '../assets';
import { 
  ArrowRight, 
  FlaskConical, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Truck, 
  BarChart3, 
  Layers, 
  CheckCircle2,
  Lock
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FlaskConical,
      title: 'Agrupamento CLSI H3-A6',
      description: 'Algoritmo proprietário para cálculo automático de tubos e volumes mínimos por amostra.',
    },
    {
      icon: Truck,
      title: 'Logística B2B Integrada',
      description: 'Monitoramento de cadeia de custódia e contagem regressiva de SLA de transporte de amostras.',
    },
    {
      icon: BarChart3,
      title: 'Gestão de Qualidade & Custos',
      description: 'Auditoria de prejuízo operacional por recoletas e controle preventivo de validade de reagentes.',
    },
    {
      icon: Layers,
      title: 'Arquitetura Multi-Tenant',
      description: 'Isolamento estrito com customização white-label dinâmica por laboratório credenciado.',
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-black font-sans text-white overflow-x-hidden flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      
      {/* Background Hero com Imagem e Overlay Gradiente Progressivo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105 transform motion-safe:animate-pulse-subtle transition-transform duration-1000"
        style={{ backgroundImage: `url(${landingHero})` }}
      >
        {/* Overlay escuro em gradiente progressivo para garantir contraste ideal */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
      </div>

      {/* Cabeçalho Transparente */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo NotusLab à esquerda Ampliada (2x) */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <img 
            src={logoNotus} 
            alt="NotusLab LIMS" 
            className="h-20 sm:h-24 w-auto max-w-xs object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Link / Botão Discreto à direita */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs text-slate-100 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="drop-shadow-sm font-medium">Rede Operacional Ativa</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-black/40 hover:bg-black/60 active:bg-black/70 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/25 shadow-xl transition-all duration-200 hover:border-white/40 drop-shadow-md"
          >
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Portal do Laboratório</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Central Principal */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 sm:py-16 md:py-20 flex flex-col items-center text-center">
        
        {/* Badge de Destaque Tecnológico */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-cyan-400/40 text-cyan-300 text-xs font-semibold tracking-wide uppercase mb-6 shadow-xl backdrop-blur-md drop-shadow-md">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Plataforma LIMS de Alta Performance</span>
        </div>

        {/* Título Principal com drop-shadow reforçado */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-['Outfit'] max-w-4xl drop-shadow-2xl">
          A revolução na <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">
            gestão laboratorial
          </span>
        </h1>

        {/* Subtítulo Profissional com drop-shadow */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl font-normal leading-relaxed drop-shadow-lg">
          Software inteligente para automação pré-analítica, ordenação de tubos segundo a norma <span className="text-white font-semibold">CLSI H3-A6</span>, rastreabilidade de amostras e controle de custos de qualidade em tempo real.
        </p>

        {/* Botão de Destaque Central: Acessar Sistema */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border border-cyan-300/40 drop-shadow-md"
          >
            <span>Acessar Sistema</span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#recursos"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-black/50 hover:bg-black/70 text-slate-200 hover:text-white font-medium text-sm backdrop-blur-md border border-white/20 transition-all drop-shadow-md"
          >
            <span>Conhecer Recursos</span>
          </a>
        </div>

        {/* Cards de Métricas e Recursos em Grid */}
        <div id="recursos" className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="group p-5 rounded-2xl bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 shadow-2xl"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mb-3.5 group-hover:bg-cyan-500/25 transition-colors shadow-sm">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-200 transition-colors drop-shadow-md">
                  {item.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed drop-shadow-sm">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Chancelas de Segurança e Conformidade */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 drop-shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Padrão Internacional CLSI H3-A6</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Rastreabilidade Total com Criptografia</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Auditoria Financeira de Desperdício</span>
          </div>
        </div>

      </main>

      {/* Rodapé Institucional */}
      <footer className="relative z-10 w-full border-t border-white/15 bg-black/70 backdrop-blur-md py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 drop-shadow-sm">
          <p>© {new Date().getFullYear()} NotusLab LIMS. Todos os direitos reservados. Gestão laboratorial inteligente.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Termos de Uso</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacidade & LGPD</span>
            <span className="hover:text-white cursor-pointer transition-colors">Suporte Técnico</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
