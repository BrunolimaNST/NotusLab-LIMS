import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { 
  Calculator, 
  Search, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Printer,
  ClipboardList,
  UserCheck,
  UserPlus,
  AlertTriangle,
  Trash2,
  ChevronDown,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { 
  Exame, 
  TuboCalculado, 
  ApiResponse,
  Paciente
} from '../types';
import { 
  staggerContainer, 
  staggerItem, 
  modalSpringVariants, 
  backdropVariants 
} from '../utils/motion';
import { 
  getPacientesStorage, 
  maskCPF, 
  calcularIdade 
} from '../services/pacientesStorage';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  Alert, 
  CardSkeleton 
} from '../components/ui';
import { PainelRecepcaoOperacional } from '../components/PainelRecepcaoOperacional';
import { examesList } from '../data/examesList';

export const RecepcaoPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [abaAtiva, setAbaAtiva] = useState<'cockpit' | 'orcamento'>(
    queryParams.get('tab') === 'orcamento' ? 'orcamento' : 'cockpit'
  );

  // Estados dos Exames e Catálogo (Base robusta com 40+ exames laboratoriais)
  const [examesDisponiveis, setExamesDisponiveis] = useState<Exame[]>(examesList);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('TODAS');
  const [selectedExames, setSelectedExames] = useState<Exame[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Estados do Fluxo de Vinculação de Paciente
  const [pacientesLista, setPacientesLista] = useState<Paciente[]>([]);
  const [pacienteVinculado, setPacienteVinculado] = useState<Paciente | null>(null);
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [seletorPacienteAberto, setSeletorPacienteAberto] = useState(false);

  // Modais de Atendimento e Etiquetas
  const [isAvancandoAtendimento, setIsAvancandoAtendimento] = useState(false);
  const [modalAtendimentoConcluido, setModalAtendimentoConcluido] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState<string>('');
  const [modalEtiquetasAberta, setModalEtiquetasAberta] = useState(false);
  const [nomePacienteEtiqueta, setNomePacienteEtiqueta] = useState('SILVA, J. A.');

  // 1. Carrega pacientes da base local/storage
  useEffect(() => {
    const lista = getPacientesStorage();
    setPacientesLista(lista);

    // Se veio um paciente pelo state de navegação (ex: vindo de CadastroPacientesPage)
    const statePaciente = (location.state as { pacienteSelecionado?: Paciente })?.pacienteSelecionado;
    if (statePaciente) {
      setPacienteVinculado(statePaciente);
      setNomePacienteEtiqueta(abreviarNome(statePaciente.nomeCompleto));
    }
  }, [location.state]);

  // Abreviar nome para a etiqueta térmica
  function abreviarNome(nomeCompleto: string): string {
    const partes = nomeCompleto.trim().split(' ');
    if (partes.length <= 1) return nomeCompleto.toUpperCase();
    const ultimoSobrenome = partes[partes.length - 1].toUpperCase();
    const iniciais = partes.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ');
    return `${ultimoSobrenome}, ${iniciais}`;
  }

  // 2. Busca catálogo de exames da API
  useEffect(() => {
    let isMounted = true;
    const fetchExames = async () => {
      setLoadingCatalogo(true);
      try {
        const response = await api.get<ApiResponse<Exame[]>>('/exams');
        if (isMounted && response.data?.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          setExamesDisponiveis(response.data.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const mensagem = err instanceof Error ? err.message : 'Falha na conexão';
          console.warn('Catálogo operando em contingência local:', mensagem);
          setInfoMsg('Catálogo operando com exames essenciais de referência integrados.');
        }
      } finally {
        if (isMounted) {
          setLoadingCatalogo(false);
        }
      }
    };

    fetchExames();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lista única de categorias para as abas de filtro
  const categorias = useMemo(() => {
    const set = new Set<string>();
    examesDisponiveis.forEach((ex) => {
      if (ex.setorLaboratorial) set.add(ex.setorLaboratorial);
    });
    return ['TODAS', ...Array.from(set)];
  }, [examesDisponiveis]);

  // Filtragem de exames otimizada com useMemo
  const examesFiltrados = useMemo(() => {
    const query = busca.trim().toLowerCase();
    return examesDisponiveis.filter((ex) => {
      const matchCategoria = categoriaAtiva === 'TODAS' || ex.setorLaboratorial === categoriaAtiva;
      const matchQuery =
        !query ||
        ex.nome.toLowerCase().includes(query) ||
        ex.mnemonico.toLowerCase().includes(query) ||
        ex.setorLaboratorial.toLowerCase().includes(query);
      return matchCategoria && matchQuery;
    });
  }, [examesDisponiveis, busca, categoriaAtiva]);

  // Filtragem de pacientes para o seletor do topo
  const pacientesFiltradosSeletor = useMemo(() => {
    const query = buscaPaciente.trim().toLowerCase();
    if (!query) return pacientesLista.slice(0, 5);
    return pacientesLista.filter(
      (p) =>
        p.nomeCompleto.toLowerCase().includes(query) ||
        p.cpf.replace(/\D/g, '').includes(query.replace(/\D/g, '')) ||
        p.telefoneWhatsapp.includes(query)
    );
  }, [pacientesLista, buscaPaciente]);

  // Alternar seleção do exame (cartão inteiro clicável)
  const toggleSelectExame = useCallback((exame: Exame) => {
    setErroMsg(null);
    setSelectedExames((prev) => {
      const jaSelecionado = prev.some((e) => e.id === exame.id);
      if (jaSelecionado) {
        return prev.filter((e) => e.id !== exame.id);
      }
      return [...prev, exame];
    });
  }, []);

  // Cálculos reativos de Orçamento e Totais usando useMemo
  const totalValor = useMemo(() => {
    return selectedExames.reduce((acc, cur) => acc + Number(cur.precoBaseReais || 0), 0);
  }, [selectedExames]);

  const maiorJejum = useMemo(() => {
    return selectedExames.reduce(
      (max, cur) => (cur.tempoJejumHoras > max ? cur.tempoJejumHoras : max),
      0
    );
  }, [selectedExames]);

  // Lista de alertas de preparo relevantes
  const alertasPreparo = useMemo(() => {
    return selectedExames
      .filter((ex) => ex.orientacoesPreparo && ex.orientacoesPreparo.trim().length > 0)
      .map((ex) => ({
        mnemonico: ex.mnemonico,
        nome: ex.nome,
        orientacao: ex.orientacoesPreparo as string,
      }));
  }, [selectedExames]);

  // INTELIGÊNCIA PRÉ-ANALÍTICA: Cálculo reativo de tubos (Norma CLSI H3-A6) com useMemo
  const planejamentoTubos = useMemo<TuboCalculado[]>(() => {
    if (selectedExames.length === 0) return [];

    const tubosMap = new Map<string, TuboCalculado>();

    selectedExames.forEach((ex) => {
      const tubo = ex.tuboColeta;
      if (!tubo) return;

      const codigo = tubo.codigo || 'OUTRO';

      if (!tubosMap.has(codigo)) {
        let ordem = tubo.ordemCLSI || 4;
        if (codigo.includes('CITRATO') || codigo.includes('AZUL')) ordem = 1;
        else if (codigo.includes('SORO') || codigo.includes('AMARELO') || codigo.includes('VERMELHO')) ordem = 2;
        else if (codigo.includes('HEPARINA') || codigo.includes('VERDE')) ordem = 3;
        else if (codigo.includes('EDTA') || codigo.includes('ROXO')) ordem = 4;
        else if (codigo.includes('FLUORETO') || codigo.includes('CINZA')) ordem = 5;

        tubosMap.set(codigo, {
          tuboColetaId: tubo.id,
          codigo: codigo,
          descricao: tubo.descricao || `Tubo ${codigo}`,
          corTampaHex: tubo.corTampaHex || '#4A5568',
          aditivoAnticoagulante: tubo.aditivoAnticoagulante || 'Aditivo específico',
          volumeMinimoMl: 2.0,
          ordemCLSI: ordem,
          instrucoesHomogeneizacao: 'Inverter suavemente de 5 a 8 vezes.',
          examesContidos: [],
        });
      }

      tubosMap.get(codigo)?.examesContidos.push({
        id: ex.id,
        mnemonico: ex.mnemonico,
        nome: ex.nome,
      });
    });

    return Array.from(tubosMap.values()).sort((a, b) => a.ordemCLSI - b.ordemCLSI);
  }, [selectedExames]);

  // Ação: Vincular paciente selecionado
  const handleSelecionarPaciente = (paciente: Paciente) => {
    setPacienteVinculado(paciente);
    setNomePacienteEtiqueta(abreviarNome(paciente.nomeCompleto));
    setSeletorPacienteAberto(false);
    setBuscaPaciente('');
  };

  // Ação: Desvincular paciente
  const handleDesvincularPaciente = () => {
    setPacienteVinculado(null);
    setNomePacienteEtiqueta('PACIENTE GERAL');
  };

  // Ação: Avançar para Atendimento (Gera protocolo com feedback visual)
  const handleAvancarAtendimento = () => {
    if (selectedExames.length === 0) {
      setErroMsg('Selecione pelo menos um exame para avançar com o atendimento.');
      return;
    }

    setIsAvancandoAtendimento(true);

    setTimeout(() => {
      setIsAvancandoAtendimento(false);
      const anoAtual = new Date().getFullYear();
      const numProtocolo = `ATD-${anoAtual}-${Math.floor(100000 + Math.random() * 900000)}`;
      setProtocoloGerado(numProtocolo);
      setModalAtendimentoConcluido(true);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          <span>Recepção e Atendimento</span>
          <span>•</span>
          <span className="text-secondary font-bold">Fase Pré-Analítica & Orçamentos</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-['Outfit'] tracking-tight">
              Recepção & Orçamento Inteligente
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Vincule o paciente, selecione os exames e obtenha o cálculo pré-analítico com a ordem exata de tubos (Norma CLSI H3-A6).
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/workspace/pacientes')}
            leftIcon={<UserPlus className="w-4 h-4 text-primary" />}
          >
            Base de Pacientes
          </Button>
        </div>

        {/* Segmented Control Apple HIG: Alternância entre Cockpit e Orçamento */}
        <div className="mt-5 flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setAbaAtiva('cockpit')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                abaAtiva === 'cockpit'
                  ? 'bg-white text-slate-900 shadow-xs scale-[1.01]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cockpit Operacional</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
                Fase 2
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('orcamento')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                abaAtiva === 'orcamento'
                  ? 'bg-white text-slate-900 shadow-xs scale-[1.01]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-slate-600" />
              <span>Orçamento & CLSI</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL ENTRE O COCKPIT E O ORÇAMENTO */}
      {abaAtiva === 'cockpit' ? (
        <PainelRecepcaoOperacional />
      ) : (
        <>
          {/* ALERTAS GLOBAIS */}
          {erroMsg && (
            <Alert type="error" message={erroMsg} onClose={() => setErroMsg(null)} />
          )}
          {infoMsg && (
            <Alert type="info" message={infoMsg} onClose={() => setInfoMsg(null)} />
          )}

      {/* 1. SELETOR NO TOPO: VINCULAR PACIENTE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs relative transition-all duration-200">
        {!pacienteVinculado ? (
          // Estado: Nenhum paciente vinculado ainda
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                    Vincular Paciente ao Atendimento
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecione um paciente cadastrado para personalizar o protocolo e as etiquetas de coleta.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setSeletorPacienteAberto(!seletorPacienteAberto)}
                  leftIcon={<Search className="w-4 h-4" />}
                  rightIcon={<ChevronDown className={`w-3.5 h-3.5 transition-transform ${seletorPacienteAberto ? 'rotate-180' : ''}`} />}
                >
                  Localizar Paciente
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/workspace/pacientes')}
                  leftIcon={<UserPlus className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Novo Cadastro
                </Button>
              </div>
            </div>

            {/* Dropdown / Busca Rápida de Pacientes */}
            {seletorPacienteAberto && (
              <div className="pt-4 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={buscaPaciente}
                    onChange={(e) => setBuscaPaciente(e.target.value)}
                    placeholder="Digite o nome ou CPF do paciente para vincular..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:bg-white transition-all shadow-inner font-medium"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {pacientesFiltradosSeletor.length === 0 ? (
                    <div className="col-span-full py-4 text-center text-xs text-slate-400">
                      Nenhum paciente encontrado. Verifique os dados ou cadastre um novo.
                    </div>
                  ) : (
                    pacientesFiltradosSeletor.map((paciente) => (
                      <div
                        key={paciente.id}
                        onClick={() => handleSelecionarPaciente(paciente)}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-primary/5 hover:border-primary cursor-pointer transition-all duration-150 flex items-center justify-between group"
                      >
                        <div className="truncate pr-2">
                          <strong className="text-xs font-bold text-slate-900 block truncate group-hover:text-primary">
                            {paciente.nomeCompleto}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-numeric tracking-tight">
                            CPF: {maskCPF(paciente.cpf)}
                          </span>
                        </div>
                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                          Vincular
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Estado: Paciente Vinculado com Sucesso
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white font-extrabold flex items-center justify-center text-sm shadow-sm ring-4 ring-primary/10">
                {pacienteVinculado.nomeCompleto.substring(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Paciente Vinculado
                  </span>
                  <span className="text-xs text-slate-400 font-numeric tracking-tight">ID #{pacienteVinculado.id}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit'] mt-0.5">
                  {pacienteVinculado.nomeCompleto}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                  <span className="font-numeric tracking-tight">CPF: {maskCPF(pacienteVinculado.cpf)}</span>
                  <span>•</span>
                  <span className="font-numeric tracking-tight">{calcularIdade(pacienteVinculado.dataNascimento)}</span>
                  <span>•</span>
                  <span className="font-numeric tracking-tight text-emerald-700 font-semibold">{pacienteVinculado.telefoneWhatsapp}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setSeletorPacienteAberto(!seletorPacienteAberto)}
                className="text-xs font-bold text-primary hover:text-secondary px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Trocar Paciente
              </button>
              <button
                type="button"
                onClick={handleDesvincularPaciente}
                title="Desvincular paciente deste pedido"
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GRID PRINCIPAL: CATÁLOGO DE EXAMES (ESQUERDA) & RESUMO STICKY (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* COLUNA 1: CATÁLOGO DE EXAMES (7 COLUNAS) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader
              title="Catálogo de Exames Disponíveis"
              subtitle="Clique no cartão do exame para adicioná-lo ao orçamento e ao cálculo de tubos"
              icon={<ShoppingBag className="w-5 h-5 text-primary" />}
              action={
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold font-numeric tracking-tight">
                  {examesFiltrados.length} exame(s)
                </span>
              }
            />

            <CardBody className="p-0">
              
              {/* CAMPO DE PESQUISA E FILTROS FIXOS DURANTE A ROLAGEM */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 p-5 pb-3 border-b border-slate-100 space-y-3">
                
                {/* Input de Busca */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Pesquisar por nome (ex: Hemograma) ou mnemônico (ex: TSH, GLI)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:bg-white focus:ring-1 focus:ring-secondary transition-all shadow-inner font-medium"
                  />
                  {busca && (
                    <button
                      type="button"
                      onClick={() => setBusca('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Abas de Categorias */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoriaAtiva(cat)}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                        categoriaAtiva === cat
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

              </div>

              {/* LISTA DE EXAMES CLICÁVEIS */}
              <div className="p-5 space-y-2.5 max-h-[580px] overflow-y-auto">
                {loadingCatalogo ? (
                  <div className="space-y-3">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                ) : examesFiltrados.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-2">
                    <Search className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-medium">
                      Nenhum exame encontrado para "{busca}".
                    </p>
                    <button
                      type="button"
                      onClick={() => { setBusca(''); setCategoriaAtiva('TODAS'); }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Limpar filtros
                    </button>
                  </div>
                ) : (
                  examesFiltrados.map((exame) => {
                    const isSelected = selectedExames.some((e) => e.id === exame.id);
                    const preco = Number(exame.precoBaseReais || 0);

                    return (
                      <div
                        key={exame.id}
                        onClick={() => toggleSelectExame(exame)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-4 group ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs ring-2 ring-primary/30'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-xs'
                        }`}
                      >
                        {/* Checkbox e Detalhes do Exame */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-200 shrink-0 ${
                              isSelected
                                ? 'bg-primary border-primary text-white shadow-xs'
                                : 'border-slate-300 bg-white group-hover:border-slate-400'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-numeric tracking-tight">
                                {exame.mnemonico}
                              </span>
                              <span className="text-sm font-bold text-slate-900 truncate">
                                {exame.nome}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-1">
                              <span>{exame.setorLaboratorial}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-numeric tracking-tight">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {exame.tempoJejumHoras > 0 ? `Jejum ${exame.tempoJejumHoras}h` : 'Sem jejum'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Preço e Badge do Tubo de Coleta */}
                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-slate-900 block font-numeric tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco)}
                          </span>

                          {exame.tuboColeta && (
                            <div className="flex items-center justify-end gap-1.5 mt-1" title={exame.tuboColeta.descricao}>
                              <span 
                                className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs" 
                                style={{ backgroundColor: exame.tuboColeta.corTampaHex }}
                              />
                              <span className="text-[10px] text-slate-400 font-medium font-numeric tracking-tight">
                                {exame.tuboColeta.codigo.split('_')[0]}
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </CardBody>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* COLUNA 2: PAINEL DE RESUMO DO PEDIDO ("STICKY TOP-4") */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 sticky top-4 self-start space-y-4">
          <Card>
            <CardHeader
              title="Resumo do Pedido"
              subtitle="Orçamento e inteligência pré-analítica em tempo real"
              icon={<Calculator className="w-5 h-5 text-primary" />}
              action={
                selectedExames.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedExames([])}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Limpar
                  </button>
                )
              }
            />

            <CardBody className="space-y-5">
              
              {/* ESTADO VAZIO: NADA SELECIONADO */}
              {selectedExames.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto border border-slate-100">
                    <ClipboardList className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 font-['Outfit']">
                    Selecione exames para iniciar o orçamento
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Clique nos cartões do catálogo à esquerda para calcular valores, tempo de jejum e planejar os tubos de coleta.
                  </p>
                </div>
              ) : (
                // ESTADO PREENCHIDO
                <div className="space-y-5">
                  
                  {/* Lista de Exames Escolhidos (Chips / Badges) */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                      <span>Exames selecionados (<strong className="font-numeric tracking-tight">{selectedExames.length}</strong>):</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedExames.map((ex) => (
                        <span
                          key={ex.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200 hover:bg-slate-200 transition-colors"
                        >
                          <span className="font-bold text-primary font-numeric tracking-tight">{ex.mnemonico}</span>
                          <span className="text-[11px] text-slate-500 font-numeric tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(ex.precoBaseReais || 0))}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectExame(ex);
                            }}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            aria-label={`Remover ${ex.nome}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* TOTAL FINANCEIRO EM DESTAQUE */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total Estimado
                      </span>
                      <span className="text-2xl font-black text-primary font-numeric tracking-tight">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                      <span>Total de itens:</span>
                      <strong className="text-slate-800 font-numeric tracking-tight">{selectedExames.length} exame(s)</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Jejum recomendado:
                      </span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-numeric tracking-tight">
                        {maiorJejum > 0 ? `${maiorJejum} horas` : 'Não obrigatório'}
                      </span>
                    </div>
                  </div>

                  {/* PLANEJAMENTO DE COLETA ("INTELIGÊNCIA PRÉ-ANALÍTICA") */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Inteligência Pré-Analítica
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-primary font-numeric tracking-tight bg-primary/10 px-2 py-0.5 rounded-full">
                        {planejamentoTubos.length} tubo(s)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Agrupamento automático e sequência de tiragem recomendada (Norma CLSI H3-A6):
                    </p>

                    {/* Lista visual dos tubos com tampa colorida (Cascata de Animação) */}
                    <motion.div 
                      className="space-y-2"
                      variants={staggerContainer(0.06, 0.02)}
                      initial="hidden"
                      animate="show"
                      key={`tubos-${planejamentoTubos.length}`}
                    >
                      {planejamentoTubos.map((tubo, idx) => (
                        <motion.div
                          key={tubo.codigo}
                          variants={staggerItem}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs card-lift hover:-translate-y-0.5 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-5 h-5 rounded-full ring-2 ring-white shadow-xs shrink-0 flex items-center justify-center text-[10px] font-bold text-white font-numeric tracking-tight"
                              style={{ backgroundColor: tubo.corTampaHex }}
                            >
                              {idx + 1}
                            </div>
                            <div className="truncate">
                              <strong className="text-slate-800 block text-xs truncate font-numeric tracking-tight">
                                {tubo.codigo}
                              </strong>
                              <span className="text-[10px] text-slate-400 font-numeric tracking-tight">
                                {tubo.examesContidos.length} exame(s): {tubo.examesContidos.map(e => e.mnemonico).join(', ')}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-numeric tracking-tight px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                            CLSI #{tubo.ordemCLSI}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  {/* ALERTAS DE PREPARO (SE HOUVER) */}
                  {alertasPreparo.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Orientações de Preparo para o Paciente</span>
                      </div>
                      <ul className="space-y-1 pl-4 list-disc text-[11px] text-amber-800">
                        {alertasPreparo.map((item) => (
                          <li key={item.mnemonico}>
                            <strong>{item.mnemonico}:</strong> {item.orientacao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* BOTÃO FINAL: AVANÇAR PARA ATENDIMENTO */}
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isAvancandoAtendimento}
                    isLoading={isAvancandoAtendimento}
                    onClick={handleAvancarAtendimento}
                    leftIcon={<Activity className="w-5 h-5 text-secondary" />}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="shadow-md shadow-primary/25 cursor-pointer"
                  >
                    Avançar para Atendimento
                  </Button>

                </div>
              )}

            </CardBody>
          </Card>
        </div>

      </div>
        </>
      )}

      {/* ========================================================= */}
      {/* MODAL DE ATENDIMENTO CONCLUÍDO (SPRING POP & BACKDROP-BLUR) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {modalAtendimentoConcluido && (
          <motion.div 
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              variants={modalSpringVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative"
            >
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] text-center">
              Atendimento Aberto com Sucesso!
            </h3>

            <p className="text-xs text-slate-500 text-center mt-1">
              O pedido foi gerado na fase pré-analítica e os dados foram transmitidos à bancada de coleta.
            </p>

            {/* Resumo do Atendimento */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 my-5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Protocolo de Atendimento:</span>
                <span className="font-numeric tracking-tight font-bold text-primary text-sm">{protocoloGerado}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Paciente:</span>
                <strong className="text-slate-800">
                  {pacienteVinculado ? pacienteVinculado.nomeCompleto : 'Paciente Geral (Não vinculado)'}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Total de Exames:</span>
                <span className="font-semibold text-slate-800 font-numeric tracking-tight">{selectedExames.length} exame(s)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Tubos de Coleta Necessários:</span>
                <span className="font-bold text-slate-800 font-numeric tracking-tight">{planejamentoTubos.length} tubo(s)</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-semibold">Valor Total:</span>
                <span className="text-base font-extrabold text-slate-900 font-numeric tracking-tight">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)}
                </span>
              </div>
            </div>

            {/* Ações: Imprimir Etiquetas ou Concluir */}
            <div className="space-y-2.5">
              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  setModalAtendimentoConcluido(false);
                  setModalEtiquetasAberta(true);
                }}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Imprimir Etiquetas de Tubos
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={() => {
                  setModalAtendimentoConcluido(false);
                  setSelectedExames([]);
                }}
              >
                Novo Orçamento / Concluir
              </Button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL DE IMPRESSÃO DE ETIQUETAS TÉRMICAS (SPRING POP & BLUR) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {modalEtiquetasAberta && planejamentoTubos.length > 0 && (
          <motion.div 
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              variants={modalSpringVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto relative"
            >
            
            {/* Topo do Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Impressão de Etiquetas Térmicas de Tubos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Padrão Laboratorial 50x30mm com código de barras Code 128 e cor da tampa CLSI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalEtiquetasAberta(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Configuração da Etiqueta */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Nome do Paciente na Etiqueta (Abreviado)
                </label>
                <input
                  type="text"
                  value={nomePacienteEtiqueta}
                  onChange={(e) => setNomePacienteEtiqueta(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-primary shadow-xs"
                  placeholder="SILVA, J. A."
                />
              </div>

              <div className="text-xs text-slate-500 text-right sm:self-end">
                <span className="font-semibold block text-slate-800 font-numeric tracking-tight">
                  {planejamentoTubos.length} Etiqueta(s) Prontas
                </span>
                <span>1 etiqueta por tubo compatível</span>
              </div>
            </div>

            {/* Grid das Etiquetas Térmicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-100/70 rounded-2xl border border-slate-200">
              {planejamentoTubos.map((tubo, idx) => (
                <div 
                  key={tubo.codigo}
                  className="bg-white p-4 rounded-xl border border-slate-300 shadow-md relative overflow-hidden font-mono flex flex-col justify-between select-none"
                  style={{ minHeight: '190px' }}
                >
                  {/* Faixa superior com a cor da tampa */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-2"
                    style={{ backgroundColor: tubo.corTampaHex }}
                  />

                  <div>
                    {/* Linha 1: Nome Paciente + Data / Hora */}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 pt-1">
                      <span className="truncate max-w-[180px]">{nomePacienteEtiqueta || 'PACIENTE GERAL'}</span>
                      <span className="text-[10px] text-slate-500 font-normal font-numeric tracking-tight">
                        {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Linha 2: Mnemônicos dos Exames + Ordem CLSI */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {tubo.examesContidos.map((e) => (
                          <span 
                            key={e.mnemonico}
                            className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider font-numeric"
                          >
                            {e.mnemonico}
                          </span>
                        ))}
                      </div>

                      <span 
                        className="text-[10px] px-2 py-0.5 rounded font-bold text-white shadow-2xs font-numeric tracking-tight"
                        style={{ backgroundColor: tubo.corTampaHex }}
                      >
                        CLSI #{tubo.ordemCLSI}
                      </span>
                    </div>

                    {/* Linha 3: Tubo / Aditivo */}
                    <div className="text-[10px] text-slate-600 mb-2 truncate font-sans">
                      <strong className="text-slate-800">{tubo.descricao}</strong> • Min: <span className="font-numeric tracking-tight">{tubo.volumeMinimoMl}ml</span>
                    </div>
                  </div>

                  {/* Simulação Visual do Código de Barras (Code 128) */}
                  <div className="pt-2 border-t border-dashed border-slate-200 text-center">
                    <div className="h-10 flex items-center justify-center gap-[2px] bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {[
                        2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 1, 3, 2, 4, 1, 2, 1, 3, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1
                      ].map((w, bIdx) => (
                        <div
                          key={bIdx}
                          className="bg-black h-full"
                          style={{ width: `${w}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-numeric tracking-tight text-slate-700 block mt-1 font-semibold">
                      *{protocoloGerado || 'NOTUS'}-{String(idx + 1).padStart(2, '0')}-{tubo.codigo.substring(0, 4)}*
                    </span>
                  </div>

                </div>
              ))}
            </div>

            {/* Ações do Modal de Etiquetas */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setModalEtiquetasAberta(false)}
              >
                Fechar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => {
                  alert(`Enviando ${planejamentoTubos.length} etiquetas para a impressora térmica Zebra/Elgin...`);
                  setModalEtiquetasAberta(false);
                }}
              >
                Imprimir Todas as Etiquetas
              </Button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </div>
  );
};

export default RecepcaoPage;
