import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Check, 
  CheckCheck, 
  Plus, 
  Minus, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Definição dos Tubos para a Coleta do Paciente Atual
interface TuboProcedimento {
  id: string;
  codigo: string;
  nome: string;
  corHex: string;
  corNome: string;
  setor: string;
  volumeMl: number;
  ordemCLSI: number;
  coletado: boolean;
}

// Definição dos Dados do Paciente em Atendimento
interface PacienteSala {
  id: string;
  protocolo: string;
  senhaPainel: string;
  nome: string;
  idade: number;
  convenio: string;
  jejumHoras: number;
  observacaoClinica?: string;
  exames: string[];
  tubos: TuboProcedimento[];
}

// Fila de Pacientes para Simulação Realista do Tablet de Sala
const FILA_PACIENTES_SALA: PacienteSala[] = [
  {
    id: 'pac-1',
    protocolo: 'ATD-2026-08492',
    senhaPainel: 'PREF-04',
    nome: 'Carlos Eduardo Fontes de Oliveira',
    idade: 48,
    convenio: 'Bradesco Saúde Top Nacional',
    jejumHoras: 8,
    observacaoClinica: 'Paciente relata histórico de veias finas no braço esquerdo.',
    exames: ['Hemograma Completo', 'Glicemia de Jejum', 'Coagulograma (TP/TTPA)', 'Perfil Lipídico'],
    tubos: [
      {
        id: 'tb-azul',
        codigo: 'CITRATO_AZUL',
        nome: 'Coagulograma (TP + TTPA)',
        corHex: '#2980B9',
        corNome: 'Tampa Azul',
        setor: 'Hemostasia',
        volumeMl: 2.7,
        ordemCLSI: 1,
        coletado: false,
      },
      {
        id: 'tb-amarelo',
        codigo: 'SORO_AMARELO',
        nome: 'Perfil Lipídico / Colesterol',
        corHex: '#F1C40F',
        corNome: 'Tampa Amarela',
        setor: 'Bioquímica Clínica',
        volumeMl: 5.0,
        ordemCLSI: 2,
        coletado: false,
      },
      {
        id: 'tb-roxo',
        codigo: 'EDTA_ROXO',
        nome: 'Hemograma Completo c/ Plaquetas',
        corHex: '#8E44AD',
        corNome: 'Tampa Roxa',
        setor: 'Hematologia',
        volumeMl: 4.0,
        ordemCLSI: 3,
        coletado: false,
      },
      {
        id: 'tb-cinza',
        codigo: 'FLUORETO_CINZA',
        nome: 'Glicemia de Jejum',
        corHex: '#7F8C8D',
        corNome: 'Tampa Cinza',
        setor: 'Metabolismo',
        volumeMl: 2.0,
        ordemCLSI: 4,
        coletado: false,
      },
    ],
  },
  {
    id: 'pac-2',
    protocolo: 'ATD-2026-08493',
    senhaPainel: 'NORM-19',
    nome: 'Beatriz Vasconcelos de Miranda',
    idade: 34,
    convenio: 'SulAmérica Especial',
    jejumHoras: 4,
    observacaoClinica: 'Jejum de 4h verificado. Paciente tranquila.',
    exames: ['Hemograma Completo', 'TSH Ultra Sensível', 'Vitamina D (25-OH)'],
    tubos: [
      {
        id: 'tb-amarelo-2',
        codigo: 'SORO_AMARELO',
        nome: 'TSH + Vitamina D',
        corHex: '#F1C40F',
        corNome: 'Tampa Amarela',
        setor: 'Hormônios & Imunologia',
        volumeMl: 5.0,
        ordemCLSI: 2,
        coletado: false,
      },
      {
        id: 'tb-roxo-2',
        codigo: 'EDTA_ROXO',
        nome: 'Hemograma Completo',
        corHex: '#8E44AD',
        corNome: 'Tampa Roxa',
        setor: 'Hematologia',
        volumeMl: 4.0,
        ordemCLSI: 3,
        coletado: false,
      },
    ],
  },
  {
    id: 'pac-3',
    protocolo: 'ATD-2026-08494',
    senhaPainel: 'PREF-05',
    nome: 'Heitor Mendes Ramos',
    idade: 71,
    convenio: 'Unimed Pleno',
    jejumHoras: 10,
    observacaoClinica: 'Idoso. Coleta delicada com dispositivo tipo Butterfly (escalpe 23G).',
    exames: ['Glicemia de Jejum', 'Ureia e Creatinina', 'Hemograma Completo'],
    tubos: [
      {
        id: 'tb-amarelo-3',
        codigo: 'SORO_AMARELO',
        nome: 'Ureia + Creatinina',
        corHex: '#F1C40F',
        corNome: 'Tampa Amarela',
        setor: 'Função Renal',
        volumeMl: 5.0,
        ordemCLSI: 2,
        coletado: false,
      },
      {
        id: 'tb-roxo-3',
        codigo: 'EDTA_ROXO',
        nome: 'Hemograma Completo',
        corHex: '#8E44AD',
        corNome: 'Tampa Roxa',
        setor: 'Hematologia',
        volumeMl: 4.0,
        ordemCLSI: 3,
        coletado: false,
      },
      {
        id: 'tb-cinza-3',
        codigo: 'FLUORETO_CINZA',
        nome: 'Glicemia de Jejum',
        corHex: '#7F8C8D',
        corNome: 'Tampa Cinza',
        setor: 'Glicemia',
        volumeMl: 2.0,
        ordemCLSI: 4,
        coletado: false,
      },
    ],
  },
];

export const TabletSalaColeta: React.FC = () => {
  const { user } = useAuth();

  // ============================================================================
  // ESTADOS DO TABLET DE SALA
  // ============================================================================
  const [indiceFila, setIndiceFila] = useState(0);
  const [pacienteAtual, setPacienteAtual] = useState<PacienteSala>(FILA_PACIENTES_SALA[0]);
  
  // Status: 'aguardando' (sala livre) | 'em_andamento' (coleta ocorrendo) | 'concluido'
  const [statusAtendimento, setStatusAtendimento] = useState<'aguardando' | 'em_andamento' | 'concluido'>('aguardando');
  
  // Cronômetro do Procedimento
  const [segundosDecorridos, setSegundosDecorridos] = useState(0);

  // Métrica Crítica de Qualidade: Tentativas de Punção (Piques de Agulha)
  const [tentativasPuncao, setTentativasPuncao] = useState(1);

  // Tubos checados (aspiração realizada)
  const [tubos, setTubos] = useState<TuboProcedimento[]>(FILA_PACIENTES_SALA[0].tubos);

  // Relógio em tempo real do cabeçalho
  const [horaAtual, setHoraAtual] = useState(new Date());

  // Modal / Overlay de Sucesso ao Finalizar
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
  const [resumoFinal, setResumoFinal] = useState<{ tempo: string; puncoes: number; totalTubos: number } | null>(null);

  // Atualização contínua do relógio
  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Atualização do cronômetro quando em atendimento
  useEffect(() => {
    let cronometro: NodeJS.Timeout | null = null;
    if (statusAtendimento === 'em_andamento') {
      cronometro = setInterval(() => {
        setSegundosDecorridos((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (cronometro) clearInterval(cronometro);
    };
  }, [statusAtendimento]);

  // Formatação do tempo do cronômetro (MM:SS)
  const formatarTempo = (totalSegundos: number) => {
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  };

  // ============================================================================
  // AÇÕES TOUCH DO TABLET
  // ============================================================================

  // Iniciar Procedimento
  const handleIniciarProcedimento = () => {
    setStatusAtendimento('em_andamento');
    setSegundosDecorridos(0);
  };

  // Alternar Checkbox do Tubo
  const handleToggleTubo = (tuboId: string) => {
    setTubos((prev) =>
      prev.map((t) => (t.id === tuboId ? { ...t, coletado: !t.coletado } : t))
    );
  };

  // Incrementar / Decrementar Punções
  const handleIncrementarPuncao = () => {
    setTentativasPuncao((prev) => Math.min(prev + 1, 6));
  };

  const handleDecrementarPuncao = () => {
    setTentativasPuncao((prev) => Math.max(prev - 1, 1));
  };

  // Finalizar Coleta
  const handleFinalizarColeta = () => {
    const tempoFormatado = formatarTempo(segundosDecorridos);
    setResumoFinal({
      tempo: tempoFormatado,
      puncoes: tentativasPuncao,
      totalTubos: tubos.filter((t) => t.coletado).length,
    });
    setStatusAtendimento('concluido');
    setMostrarModalSucesso(true);
  };

  // Chamar Próximo Paciente
  const handleChamarProximoPaciente = () => {
    const proximoIndice = (indiceFila + 1) % FILA_PACIENTES_SALA.length;
    const proximoPaciente = FILA_PACIENTES_SALA[proximoIndice];

    setIndiceFila(proximoIndice);
    setPacienteAtual(proximoPaciente);
    setTubos(proximoPaciente.tubos.map((t) => ({ ...t, coletado: false })));
    setTentativasPuncao(1);
    setSegundosDecorridos(0);
    setStatusAtendimento('aguardando');
    setMostrarModalSucesso(false);
  };

  const totalTubosColetados = tubos.filter((t) => t.coletado).length;

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. CABEÇALHO DO TABLET: STATUS DA SALA & RELÓGIO AO VIVO                  */}
      {/* ========================================================================= */}
      <header className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Identificação da Sala de Coleta e Indicador de Presença */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs transition-colors ${
            statusAtendimento === 'em_andamento'
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-emerald-500 text-white'
          }`}>
            <Activity className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                Sala de Coleta 01
              </h1>

              {/* Indicador Visual Verde (Livre) ou Vermelho (Em Atendimento) */}
              {statusAtendimento === 'aguardando' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs sm:text-sm font-extrabold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SALA LIVRE</span>
                </div>
              )}

              {statusAtendimento === 'em_andamento' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-xs sm:text-sm font-extrabold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>EM ATENDIMENTO</span>
                </div>
              )}

              {statusAtendimento === 'concluido' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-300 text-cyan-700 text-xs sm:text-sm font-extrabold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>FINALIZADO</span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Terminal Operacional de Parede • Flebotomista: <strong className="text-slate-800">{user?.nome || 'Mariana Duarte'}</strong>
            </p>
          </div>
        </div>

        {/* Relógio em Tempo Real e Botão de Saída do Modo Quiosque */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 px-5 py-3 rounded-2xl">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                {horaAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-numeric tracking-tight">
                {horaAtual.toLocaleTimeString('pt-BR')}
              </span>
            </div>
            <Clock className="w-7 h-7 text-slate-400 shrink-0" />
          </div>

          <Link
            to="/workspace/coleta"
            className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Sair do Modo Quiosque (Voltar ao Painel Geral)"
          >
            <LogOut className="w-5 h-5" />
          </Link>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. CARD PRINCIPAL DO PACIENTE (CENTRO DA TELA)                            */}
      {/* ========================================================================= */}
      <main className="my-4 sm:my-6 space-y-4 sm:space-y-6">
        
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-md relative overflow-hidden">
          
          {/* Tarja Superior Dinâmica de Status */}
          <div 
            className="absolute top-0 left-0 right-0 h-2 transition-all duration-300"
            style={{
              backgroundColor: statusAtendimento === 'em_andamento' ? '#E11D48' : '#10B981'
            }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            
            {/* Informações Principais do Paciente */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-mono text-xs sm:text-sm font-bold shadow-2xs">
                  {pacienteAtual.protocolo}
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs sm:text-sm">
                  SENHA: {pacienteAtual.senhaPainel}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-500">
                  {pacienteAtual.idade} anos • {pacienteAtual.convenio}
                </span>
              </div>

              {/* Nome do Paciente em Destaque Gigante */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight leading-tight">
                {pacienteAtual.nome}
              </h2>

              {pacienteAtual.observacaoClinica && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200/80 inline-flex mt-1">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{pacienteAtual.observacaoClinica}</span>
                </div>
              )}
            </div>

            {/* Exames Solicitados */}
            <div className="lg:max-w-sm w-full bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Exames Solicitados na Ordem:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pacienteAtual.exames.map((exame, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-2xs"
                  >
                    {exame}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* BOTÃO GIGANTE CENTRALIZADO: INICIAR OU CRONÔMETRO RODANDO */}
          <div className="pt-6 sm:pt-8 flex flex-col items-center justify-center">
            
            {statusAtendimento === 'aguardando' ? (
              <button
                type="button"
                onClick={handleIniciarProcedimento}
                className="w-full max-w-xl py-6 sm:py-8 px-8 rounded-3xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-2xl sm:text-3xl shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-7 h-7 fill-current" />
                </div>
                <span>Iniciar Procedimento</span>
              </button>
            ) : (
              <div className="w-full max-w-xl p-5 sm:p-7 rounded-3xl bg-rose-50/70 border-2 border-rose-200 shadow-inner flex flex-col items-center justify-center animate-in fade-in duration-300">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-rose-600 mb-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  Procedimento de Punção em Andamento
                </span>

                {/* Cronômetro Gigante */}
                <div className="text-5xl sm:text-7xl font-extrabold text-slate-900 font-numeric tracking-tight my-1">
                  {formatarTempo(segundosDecorridos)}
                </div>

                <span className="text-xs font-semibold text-slate-500 mt-1">
                  Tempo decorrido • Meta máxima da sala: 08:00 min
                </span>
              </div>
            )}

          </div>

        </div>

        {/* ======================================================================= */}
        {/* 3. PAINEL DE QUALIDADE CLÍNICA (TUBOS CLSI & CONTADOR DE PUNÇÕES)       */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* COLUNA ESQUERDA (8 COLUNAS): TUBOS A COLETAR NA ORDEM CLSI */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                  CLSI
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
                    Tubos a Coletar (Ordem CLSI H3-A6)
                  </h3>
                  <span className="text-xs text-slate-500">
                    Toque no tubo para confirmar a aspiração completa
                  </span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-xl bg-slate-100 text-xs sm:text-sm font-bold text-slate-700">
                {totalTubosColetados} de {tubos.length} Coletados
              </div>
            </div>

            {/* Grid dos Tubos Touch-Friendly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {tubos.map((tubo) => (
                <div
                  key={tubo.id}
                  onClick={() => handleToggleTubo(tubo.id)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 active:scale-[0.98] ${
                    tubo.coletado
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Indicador de Cor Oficial da Tampa */}
                    <div 
                      className="w-5 h-12 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: tubo.corHex }}
                      title={tubo.corNome}
                    />

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          #{tubo.ordemCLSI}
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit'] truncate">
                          {tubo.corNome}
                        </h4>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                        {tubo.nome}
                      </p>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {tubo.setor} • {tubo.volumeMl}ml
                      </span>
                    </div>
                  </div>

                  {/* Checkbox Circular ENORME */}
                  <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-colors ${
                    tubo.coletado
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-white border-slate-300 text-transparent'
                  }`}>
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUNA DIREITA (4 COLUNAS): CONTADOR GIGANTE DE PUNÇÕES */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
                    Tentativas de Punção
                  </h3>
                  <span className="text-xs text-slate-500">
                    Piques de agulha no paciente
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  SLA
                </div>
              </div>

              {/* Controle Touch ENORME: [-] [ NÚMERO ] [+] */}
              <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={handleDecrementarPuncao}
                  disabled={tentativasPuncao <= 1}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-8 h-8 stroke-[3]" />
                </button>

                <div className="flex flex-col items-center">
                  <span className="text-5xl sm:text-6xl font-extrabold text-slate-900 font-numeric tracking-tight">
                    {tentativasPuncao}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    {tentativasPuncao === 1 ? 'Punção' : 'Punções'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleIncrementarPuncao}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 hover:bg-black active:bg-slate-800 text-white flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-8 h-8 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Feedback Clínico e Qualidade */}
            <div className="pt-2">
              {tentativasPuncao === 1 && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Excelente: Punção única realizada com sucesso.</span>
                </div>
              )}
              {tentativasPuncao === 2 && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Atenção: 2ª punção. Verificar calibre de escalpe.</span>
                </div>
              )}
              {tentativasPuncao >= 3 && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Crítico: &ge;3 punções requer auxílio de outro profissional.</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 4. RODAPÉ FIXO DE AÇÃO FINAL: BOTÃO GIGANTE W-FULL                        */}
      {/* ========================================================================= */}
      <footer className="pt-2">
        <button
          type="button"
          onClick={handleFinalizarColeta}
          disabled={statusAtendimento === 'aguardando'}
          className={`w-full py-5 sm:py-7 px-8 rounded-3xl text-white font-extrabold text-xl sm:text-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer select-none active:scale-[0.99] ${
            statusAtendimento === 'aguardando'
              ? 'bg-slate-400 opacity-50 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-600/30'
          }`}
        >
          <CheckCheck className="w-7 h-7 sm:w-8 sm:h-8" />
          <span>Finalizar Coleta e Enviar para Triagem</span>
        </button>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL / OVERLAY APPLE HIG DE CONCLUSÃO E PRÓXIMO PACIENTE                 */}
      {/* ========================================================================= */}
      {mostrarModalSucesso && resumoFinal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
            
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                Amostras Coletadas com Sucesso
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
                Procedimento Finalizado
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Os tubos foram registrados e transferidos digitalmente para a triagem da bancada técnica.
              </p>
            </div>

            {/* Resumo da Coleta */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Tempo</span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-numeric">{resumoFinal.tempo}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Tubos</span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-numeric">{resumoFinal.totalTubos}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Punções</span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-numeric">{resumoFinal.puncoes}</span>
              </div>
            </div>

            {/* Botão para Chamar o Próximo Paciente */}
            <button
              type="button"
              onClick={handleChamarProximoPaciente}
              className="w-full py-5 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-slate-900/15 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Chamar Próximo Paciente</span>
              <ArrowRight className="w-6 h-6" />
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default TabletSalaColeta;
