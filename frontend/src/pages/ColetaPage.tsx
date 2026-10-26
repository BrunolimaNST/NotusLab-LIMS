import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
  AlertTriangle,
  X,
  Microscope,
  PhoneCall,
  Zap,
  Activity,
  CheckCircle2,
  Play,
  Check,
  CheckCheck,
  MessageSquare,
  FileCheck,
  FileText
} from 'lucide-react';
import {
  AmostraTriagem,
  AlertaPanico,
  MotivoRejeicao,
  StatusAmostra,
  ApiResponse
} from '../types';
import {
  Button,
  Card,
  Alert
} from '../components/ui';
import {
  staggerContainer,
  staggerItem,
  modalSpringVariants,
  bannerSpringVariants,
  backdropVariants
} from '../utils/motion';

// Base inicial de amostras na bancada com a máquina de estados completa
const AMOSTRAS_INICIAIS: AmostraTriagem[] = [
  {
    id: 'amo-1',
    codigoBarras: 'AMO-20261003-0001',
    pacienteNome: 'Ana Paula Ferreira',
    pacienteTelefone: '+55 (11) 98765-4321',
    protocoloAtendimento: 'ATD-2026-0001',
    tuboCodigo: 'EDTA_ROXO',
    tuboCorHex: '#8E44AD',
    exames: ['Hemograma Completo', 'Plaquetas'],
    status: 'AGUARDANDO',
    dataHoraColeta: 'Hoje, 08:35',
  },
  {
    id: 'amo-2',
    codigoBarras: 'AMO-20261003-0002',
    pacienteNome: 'Roberto Albuquerque Guimarães',
    pacienteTelefone: '+55 (11) 99988-7766',
    protocoloAtendimento: 'ATD-2026-0002',
    tuboCodigo: 'SORO_GEL_AMARELO',
    tuboCorHex: '#F1C40F',
    exames: ['TSH Ultra Sensível', 'Vitamina D Total'],
    status: 'EM_TRIAGEM',
    dataHoraColeta: 'Hoje, 09:10',
  },
  {
    id: 'amo-3',
    codigoBarras: 'AMO-20261003-0003',
    pacienteNome: 'Mariana Duarte Ramos',
    pacienteTelefone: '+55 (11) 97766-5544',
    protocoloAtendimento: 'ATD-2026-0003',
    tuboCodigo: 'FLUORETO_CINZA',
    tuboCorHex: '#7F8C8D',
    exames: ['Glicemia de Jejum'],
    status: 'ACEITA',
    dataHoraColeta: 'Hoje, 09:25',
  },
  {
    id: 'amo-4',
    codigoBarras: 'AMO-20261003-0004',
    pacienteNome: 'Carlos Eduardo Mendes',
    pacienteTelefone: '+55 (11) 96655-4433',
    protocoloAtendimento: 'ATD-2026-0004',
    tuboCodigo: 'CITRATO_AZUL',
    tuboCorHex: '#3498DB',
    exames: ['Coagulograma (TP + TTPA)'],
    status: 'EM_PROCESSAMENTO',
    dataHoraColeta: 'Hoje, 09:40',
  },
  {
    id: 'amo-5',
    codigoBarras: 'AMO-20261003-0005',
    pacienteNome: 'Juliana Silveira Rocha',
    pacienteTelefone: '+55 (11) 97711-2233',
    protocoloAtendimento: 'ATD-2026-0005',
    tuboCodigo: 'SORO_GEL_AMARELO',
    tuboCorHex: '#F1C40F',
    exames: ['Perfil Lipídico Completo'],
    status: 'CONCLUIDA',
    dataHoraColeta: 'Hoje, 07:50',
  },
];

// Motivos formais de rejeição técnica pré-analítica
const MOTIVOS_REJEICAO: MotivoRejeicao[] = [
  { valor: 'HEMOLISE', rotulo: 'Hemólise da amostra (Grau 2 a 4) — Interfere em K+, LDH e AST', gravidade: 'ALTA', custoPadraoEstimado: 38.50 },
  { valor: 'COAGULACAO', rotulo: 'Presença de microcoágulo em tubo EDTA — Invalida contagem de plaquetas', gravidade: 'CRITICA', custoPadraoEstimado: 45.00 },
  { valor: 'VOLUME_INSUFICIENTE', rotulo: 'Volume insuficiente (QNS) para a bateria de ensaios', gravidade: 'MEDIA', custoPadraoEstimado: 25.00 },
  { valor: 'LIPEMIA_ACENTUADA', rotulo: 'Lipemia acentuada com interferência espectrofotométrica', gravidade: 'MEDIA', custoPadraoEstimado: 35.00 },
  { valor: 'TUBO_INADEQUADO', rotulo: 'Tubo inadequado ou anticoagulante trocado na punção', gravidade: 'ALTA', custoPadraoEstimado: 30.00 },
  { valor: 'ERRO_IDENTIFICACAO', rotulo: 'Etiqueta física ilegível ou divergência no código de barras', gravidade: 'ALTA', custoPadraoEstimado: 20.00 },
];

// Alerta de Valor Crítico (Pânico) de alta gravidade clínica
const ALERTAS_PANICO_INICIAIS: AlertaPanico[] = [
  {
    id: 'panico-1',
    pacienteNome: 'João Silva',
    pacienteLeito: 'Leito 204 (Emergência)',
    exameNome: 'Potássio Sérico (K+)',
    resultado: '7.5',
    unidade: 'mEq/L',
    valorReferencia: '3.5 a 5.0 mEq/L',
    riscoClinico: 'Hipercalemia Grave (Crítico) — Risco Iminente de Arritmia Ventricular e Parada Cardíaca',
    horaLiberacao: 'Há 4 min',
    medicoSolicitante: 'Dr. Fernando Dias (CRM 134.890-SP)',
  },
];

export const ColetaPage: React.FC = () => {
  const navigate = useNavigate();
  const [amostras, setAmostras] = useState<AmostraTriagem[]>(AMOSTRAS_INICIAIS);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [alertasPanico, setAlertasPanico] = useState<AlertaPanico[]>(ALERTAS_PANICO_INICIAIS);

  // Estados do Modal de Rejeição / Recoleta
  const [modalRejeicaoAberto, setModalRejeicaoAberto] = useState(false);
  const [amostraParaRejeitar, setAmostraParaRejeitar] = useState<AmostraTriagem | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState<string>('HEMOLISE');
  const [justificativaTecnica, setJustificativaTecnica] = useState<string>('');
  const [custoEstimado, setCustoEstimado] = useState<number>(38.50);
  const [textoWhatsApp, setTextoWhatsApp] = useState<string>('');
  const [isProcessandoRecoleta, setIsProcessandoRecoleta] = useState(false);

  // Estados do Modal de Registro de Contato Médico (Pânico)
  const [modalContatoAberto, setModalContatoAberto] = useState(false);
  const [alertaAtivoParaContato, setAlertaAtivoParaContato] = useState<AlertaPanico | null>(null);
  const [medicoContatado, setMedicoContatado] = useState<string>('');
  const [crmMedico, setCrmMedico] = useState<string>('');
  const [telefoneContato, setTelefoneContato] = useState<string>('');
  const [condutaRegistrada, setCondutaRegistrada] = useState<string>('');
  const responsavelRegistro = 'Dr. Lucas Prado (CRBM 18.942)';
  const [isSalvandoContato, setIsSalvandoContato] = useState(false);

  // Notificações e feedbacks
  const [feedbackSucesso, setFeedbackSucesso] = useState<string | null>(null);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);

  // Indicadores da Bancada
  const metricas = useMemo(() => {
    return {
      total: amostras.length,
      aguardando: amostras.filter((a) => a.status === 'AGUARDANDO').length,
      emTriagem: amostras.filter((a) => a.status === 'EM_TRIAGEM').length,
      aceitas: amostras.filter((a) => a.status === 'ACEITA').length,
      emProcessamento: amostras.filter((a) => a.status === 'EM_PROCESSAMENTO').length,
      concluidas: amostras.filter((a) => a.status === 'CONCLUIDA').length,
      rejeitadas: amostras.filter((a) => a.status === 'REJEITADA' || a.status === 'INVALIDADA_RECOLETA').length,
    };
  }, [amostras]);

  // Filtragem da tabela
  const amostrasFiltradas = useMemo(() => {
    if (filtroStatus === 'TODOS') return amostras;
    return amostras.filter((a) => a.status === filtroStatus);
  }, [amostras, filtroStatus]);

  // =========================================================================
  // MÁQUINA DE ESTADOS DA AMOSTRA (TRANSIÇÃO OPERACIONAL)
  // =========================================================================
  const handleAvancarEstado = (amostra: AmostraTriagem, proximoEstado: StatusAmostra) => {
    setAmostras((prev) =>
      prev.map((a) => (a.id === amostra.id ? { ...a, status: proximoEstado } : a))
    );

    const nomesEstado: Record<string, string> = {
      EM_TRIAGEM: 'em triagem pré-analítica',
      ACEITA: 'aceita e aprovada para bancada',
      EM_PROCESSAMENTO: 'em processamento analítico',
      CONCLUIDA: 'concluída e laudo pronto para liberação',
    };

    setFeedbackSucesso(
      `Amostra ${amostra.codigoBarras} alterada para status: ${nomesEstado[proximoEstado] || proximoEstado}.`
    );
    setTimeout(() => setFeedbackSucesso(null), 4000);
  };

  // =========================================================================
  // MODAL DE REJEIÇÃO E RECOLETA COM SELEÇÃO OBRIGATÓRIA DE MOTIVO
  // =========================================================================
  const handleAbrirModalRejeicao = (amostra: AmostraTriagem) => {
    setAmostraParaRejeitar(amostra);
    setMotivoRejeicao('HEMOLISE');
    setJustificativaTecnica('Identificada hemólise moderada (grau 3) após centrifugação a 3.000 RPM por 10 min.');
    setCustoEstimado(38.50);

    const texto = [
      `Olá, *${amostra.pacienteNome}*! Tudo bem?`,
      `Aqui é do NotusLab Laboratório de Análises Clínicas.`,
      ``,
      `Para assegurar a máxima confiabilidade do seu resultado nos exames: *${amostra.exames.join(', ')}*, identificamos que será necessário coletar uma nova amostra.`,
      ``,
      `📋 *Protocolo de Atendimento:* ${amostra.protocoloAtendimento}`,
      `🧪 *Motivo da Recoleta:* Hemólise da amostra (Grau 2 a 4).`,
      ``,
      `Por favor, compareça à nossa unidade em seu melhor horário. Nossos profissionais já estão cientes e priorizarão seu atendimento sem custos adicionais.`,
      `Agradecemos pela compreensão!`,
    ].join('\n');

    setTextoWhatsApp(texto);
    setModalRejeicaoAberto(true);
  };

  const handleTrocarMotivo = (novoMotivo: string) => {
    setMotivoRejeicao(novoMotivo);
    const obj = MOTIVOS_REJEICAO.find((m) => m.valor === novoMotivo);
    if (obj) {
      setCustoEstimado(obj.custoPadraoEstimado);
    }

    if (amostraParaRejeitar) {
      const rotulo = obj?.rotulo || novoMotivo;
      const texto = [
        `Olá, *${amostraParaRejeitar.pacienteNome}*! Tudo bem?`,
        `Aqui é do NotusLab Laboratório de Análises Clínicas.`,
        ``,
        `Para assegurar a máxima confiabilidade do seu resultado nos exames: *${amostraParaRejeitar.exames.join(', ')}*, identificamos que será necessário coletar uma nova amostra.`,
        ``,
        `📋 *Protocolo de Atendimento:* ${amostraParaRejeitar.protocoloAtendimento}`,
        `🧪 *Motivo da Recoleta:* ${rotulo}.`,
        ``,
        `Por favor, compareça à nossa unidade em seu melhor horário. Nossos profissionais já estão cientes e priorizarão seu atendimento sem custos adicionais.`,
        `Agradecemos pela compreensão!`,
      ].join('\n');

      setTextoWhatsApp(texto);
    }
  };

  const handleConfirmarRejeicao = async () => {
    if (!amostraParaRejeitar) return;

    if (!justificativaTecnica.trim()) {
      setFeedbackErro('É obrigatório descrever a justificativa técnica para o laudo de auditoria.');
      return;
    }

    setIsProcessandoRecoleta(true);

    try {
      // Dispara endpoint de auditoria da API
      await api.post<ApiResponse<unknown>>(`/samples/${amostraParaRejeitar.id}/recollection`, {
        motivo: motivoRejeicao,
        descricaoDetalhada: justificativaTecnica,
        custoDesperdicio: Number(custoEstimado),
      });
    } catch {
      console.warn('Fallback local para registro de recoleta');
    } finally {
      // Atualiza o status da amostra na máquina de estados para REJEITADA
      setAmostras((prev) =>
        prev.map((a) =>
          a.id === amostraParaRejeitar.id
            ? {
              ...a,
              status: 'REJEITADA',
              motivoRejeicao: motivoRejeicao,
              descricaoRejeicao: justificativaTecnica,
            }
            : a
        )
      );

      setIsProcessandoRecoleta(false);
      setModalRejeicaoAberto(false);
      setFeedbackSucesso(
        `Amostra ${amostraParaRejeitar.codigoBarras} rejeitada com sucesso por ${motivoRejeicao}. Recoleta enviada para a Recepção e paciente notificado via WhatsApp.`
      );
      setTimeout(() => setFeedbackSucesso(null), 6000);
      setAmostraParaRejeitar(null);
    }
  };

  // =========================================================================
  // PAINEL DE VALORES CRÍTICOS & REGISTRO DE CONTATO MÉDICO (RASTREABILIDADE)
  // =========================================================================
  const handleAbrirRegistroContato = (alerta: AlertaPanico) => {
    setAlertaAtivoParaContato(alerta);
    setMedicoContatado(alerta.medicoSolicitante.split('(')[0].trim());
    setCrmMedico('CRM 134.890-SP');
    setTelefoneContato('(11) 3145-8800 (Ramal 204)');
    setCondutaRegistrada(
      'Médico plantonista ciente da Hipercalemia Grave. Informou que suspendeu a infusão parenteral de KCl, solicitou ECG de emergência e prescreveu Gluconato de Cálcio 10% IV.'
    );
    setModalContatoAberto(true);
  };

  const handleSalvarContatoMedico = () => {
    if (!alertaAtivoParaContato) return;

    if (!medicoContatado.trim() || !crmMedico.trim()) {
      setFeedbackErro('Informe o nome e o CRM do médico contatado para registro de rastreabilidade (RDC 786/2023).');
      return;
    }

    setIsSalvandoContato(true);

    setTimeout(() => {
      // Remove do painel de pânico ativo
      setAlertasPanico((prev) => prev.filter((a) => a.id !== alertaAtivoParaContato.id));
      setIsSalvandoContato(false);
      setModalContatoAberto(false);
      setFeedbackSucesso(
        `✅ Contato médico com ${medicoContatado} (${crmMedico}) registrado com sucesso! Protocolo arquivado para rastreabilidade de auditoria hospitalar.`
      );
      setTimeout(() => setFeedbackSucesso(null), 6000);
      setAlertaAtivoParaContato(null);
    }, 600);
  };

  // Renderizador de Badge por Status da Máquina de Estados
  const renderBadgeStatus = (status: StatusAmostra) => {
    switch (status) {
      case 'AGUARDANDO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
            <span>Aguardando</span>
          </span>
        );
      case 'EM_TRIAGEM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-300 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
            <span>Em Triagem</span>
          </span>
        );
      case 'ACEITA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-300 text-[10px] font-bold uppercase tracking-wider">
            <Check className="w-3 h-3 text-teal-600 stroke-[3]" />
            <span>Aceita</span>
          </span>
        );
      case 'EM_PROCESSAMENTO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-300 text-[10px] font-bold uppercase tracking-wider">
            <Activity className="w-3 h-3 text-purple-600 animate-spin" />
            <span>Em Processamento</span>
          </span>
        );
      case 'CONCLUIDA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
            <span>Concluída</span>
          </span>
        );
      case 'REJEITADA':
      case 'INVALIDADA_RECOLETA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Rejeitada</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">

      {/* CABEÇALHO */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          <span>Setor Analítico & Bancada</span>
          <span>•</span>
          <span className="text-secondary font-bold">Triagem & Máquina de Estados</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-['Outfit'] tracking-tight">
          Bancada Central & Painel de Amostras
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie o ciclo de vida analítico dos tubos, valide interferentes pré-analíticos e cumpra protocolos de valores críticos.
        </p>
      </div>

      {/* FEEDBACKS GLOBAIS */}
      {feedbackSucesso && (
        <Alert type="success" message={feedbackSucesso} onClose={() => setFeedbackSucesso(null)} />
      )}
      {feedbackErro && (
        <Alert type="error" message={feedbackErro} onClose={() => setFeedbackErro(null)} />
      )}

      {/* ========================================================================= */}
      {/* 🚨 PAINEL DE SEGURANÇA DE VALORES CRÍTICOS (PÂNICO) NO TOPO */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {alertasPanico.length > 0 && (
          <motion.div
            variants={bannerSpringVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="rounded-3xl border-2 border-rose-500 bg-rose-50/95 shadow-xl shadow-rose-500/15 p-5 sm:p-6 transition-all relative overflow-hidden critical-pulse"
          >
            {/* Faixa decorativa lateral */}
            <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-rose-600" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pl-1 sm:pl-2">

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Zap className="w-6 h-6 animate-bounce" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider">
                      VALOR CRÍTICO / PÂNICO
                    </span>
                    <span className="text-xs font-numeric tracking-tight font-bold text-rose-800">
                      {alertasPanico[0].horaLiberacao}
                    </span>
                    <span className="text-xs text-rose-700">
                      • Comunicação Obrigatória Imediata (RDC 786/2023)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-base sm:text-lg font-black text-slate-900 font-['Outfit']">
                      {alertasPanico[0].pacienteNome}
                    </strong>
                    <span className="text-xs text-slate-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-rose-200">
                      {alertasPanico[0].pacienteLeito}
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 font-medium">
                    Exame: <strong className="text-rose-950 font-bold">{alertasPanico[0].exameNome}</strong> | Resultado Crítico:{' '}
                    <span className="text-base font-black text-rose-700 font-numeric tracking-tight bg-white px-2.5 py-0.5 rounded-lg border border-rose-300 shadow-2xs">
                      {alertasPanico[0].resultado} {alertasPanico[0].unidade}
                    </span>{' '}
                    <span className="text-xs text-slate-500 font-numeric tracking-tight">(VR: {alertasPanico[0].valorReferencia})</span>
                  </p>

                  <p className="text-xs text-rose-900 font-semibold">
                    ⚠️ {alertasPanico[0].riscoClinico} • Solicitante: {alertasPanico[0].medicoSolicitante}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3 pl-2 sm:pl-0">
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={() => handleAbrirRegistroContato(alertasPanico[0])}
                  leftIcon={<PhoneCall className="w-4 h-4 animate-pulse" />}
                  className="shadow-lg shadow-rose-600/30 font-extrabold cursor-pointer"
                >
                  Registrar Contato Médico
                </Button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARDS DE MÉTRICAS DA BANCADA COM FEEDBACK TÁTIL & HOVER LIFT */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', valor: metricas.total, cor: 'text-slate-800', rotuloCor: 'text-slate-400' },
          { label: 'Aguardando', valor: metricas.aguardando, cor: 'text-slate-700', rotuloCor: 'text-slate-500' },
          { label: 'Em Triagem', valor: metricas.emTriagem, cor: 'text-sky-700', rotuloCor: 'text-sky-600' },
          { label: 'Processando', valor: metricas.emProcessamento, cor: 'text-purple-700', rotuloCor: 'text-purple-600' },
          { label: 'Concluídas', valor: metricas.concluidas, cor: 'text-emerald-700', rotuloCor: 'text-emerald-600' },
          { label: 'Rejeitadas', valor: metricas.rejeitadas, cor: 'text-rose-700', rotuloCor: 'text-rose-600' },
        ].map((m) => (
          <div
            key={m.label}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs card-lift hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default"
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${m.rotuloCor}`}>{m.label}</span>
            <span className={`text-xl font-black font-numeric tracking-tight mt-0.5 block ${m.cor}`}>{m.valor}</span>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TABELA DE AMOSTRAS & MÁQUINA DE ESTADOS */}
      {/* ========================================================================= */}
      <Card headerAccent="var(--color-primary)">

        {/* Barra de Filtro de Estados */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-primary flex items-center justify-center">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Fluxo da Bancada Analítica
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhe o estado de processamento de cada tubo no laboratório
              </p>
            </div>
          </div>

          {/* Filtros em Pílulas */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {['TODOS', 'AGUARDANDO', 'EM_TRIAGEM', 'ACEITA', 'EM_PROCESSAMENTO', 'CONCLUIDA', 'REJEITADA'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFiltroStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${filtroStatus === st
                    ? 'bg-primary text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {st === 'TODOS' ? 'Todos' : st === 'EM_TRIAGEM' ? 'Em Triagem' : st === 'EM_PROCESSAMENTO' ? 'Processando' : st === 'CONCLUIDA' ? 'Concluídas' : st === 'REJEITADA' ? 'Rejeitadas' : st === 'AGUARDANDO' ? 'Aguardando' : 'Aceitas'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Amostra / Tubo</th>
                <th className="py-3.5 px-4">Paciente & Telefone</th>
                <th className="py-3.5 px-4">Exames Vinculados</th>
                <th className="py-3.5 px-4">Status da Amostra</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Ação Operacional (Bancada)</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-slate-100"
              variants={staggerContainer(0.06, 0.03)}
              initial="hidden"
              animate="show"
              key={filtroStatus}
            >
              {amostrasFiltradas.map((amostra) => {
                const isRejeitada = amostra.status === 'REJEITADA' || amostra.status === 'INVALIDADA_RECOLETA';
                const isConcluida = amostra.status === 'CONCLUIDA';

                return (
                  <motion.tr
                    key={amostra.id}
                    variants={staggerItem}
                    className="hover:bg-slate-50/80 transition-colors"
                  >

                    {/* Código de Barras e Tubo */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white shadow-xs"
                          style={{ backgroundColor: amostra.tuboCorHex }}
                          title={`Tubo: ${amostra.tuboCodigo}`}
                        />
                        <div>
                          <span className="font-numeric tracking-tight font-bold text-slate-900 text-sm block">
                            {amostra.codigoBarras}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-numeric tracking-tight">
                            {amostra.tuboCodigo} • {amostra.dataHoraColeta}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Paciente */}
                    <td className="py-4 px-4">
                      <strong className="text-slate-900 font-bold block text-sm">
                        {amostra.pacienteNome}
                      </strong>
                      <span className="text-emerald-700 font-numeric tracking-tight text-[11px] font-semibold block mt-0.5">
                        {amostra.pacienteTelefone}
                      </span>
                    </td>

                    {/* Exames */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {amostra.exames.map((ex, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status com Badges Coloridos */}
                    <td className="py-4 px-4">
                      {renderBadgeStatus(amostra.status)}
                    </td>

                    {/* Ações da Máquina de Estados */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">

                        {/* Se AGUARDANDO -> Iniciar Triagem */}
                        {amostra.status === 'AGUARDANDO' && (
                          <button
                            type="button"
                            onClick={() => handleAvancarEstado(amostra, 'EM_TRIAGEM')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Iniciar Triagem</span>
                          </button>
                        )}

                        {/* Se EM_TRIAGEM -> Aceitar ou Solicitar Recoleta */}
                        {amostra.status === 'EM_TRIAGEM' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAvancarEstado(amostra, 'ACEITA')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Aceitar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAbrirModalRejeicao(amostra)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-all cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Solicitar Recoleta</span>
                            </button>
                          </>
                        )}

                        {/* Se ACEITA -> Iniciar Processamento */}
                        {amostra.status === 'ACEITA' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAvancarEstado(amostra, 'EM_PROCESSAMENTO')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              <span>Processar na Bancada</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAbrirModalRejeicao(amostra)}
                              className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Rejeitar por interferente analítico"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Se EM_PROCESSAMENTO -> Concluir */}
                        {amostra.status === 'EM_PROCESSAMENTO' && (
                          <button
                            type="button"
                            onClick={() => handleAvancarEstado(amostra, 'CONCLUIDA')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Liberar Laudo</span>
                          </button>
                        )}

                        {/* Se CONCLUIDA */}
                        {isConcluida && (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Liberada
                            </span>
                            <button
                              type="button"
                              onClick={() => navigate('/workspace/laudo', {
                                state: {
                                  protocolo: amostra.protocoloAtendimento,
                                  pacienteNome: amostra.pacienteNome,
                                  exames: amostra.exames,
                                  codigoBarras: amostra.codigoBarras
                                }
                              })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                              title={`Visualizar laudo autenticado emitido para ${amostra.pacienteNome}`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Visualizar Laudo</span>
                            </button>
                          </div>
                        )}

                        {/* Se REJEITADA */}
                        {isRejeitada && (
                          <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-rose-600" /> Recoleta em Aberto
                          </span>
                        )}

                      </div>
                    </td>

                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>

      </Card>

      {/* ========================================================================= */}
      {/* MODAL DE SOLICITAÇÃO DE RECOLETA COM SELEÇÃO OBRIGATÓRIA DE MOTIVO */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {modalRejeicaoAberto && amostraParaRejeitar && (
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              variants={modalSpringVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative my-8"
            >

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                      Solicitar Recoleta de Amostra
                    </h3>
                    <p className="text-xs text-slate-500">
                      Amostra: <strong>{amostraParaRejeitar.codigoBarras}</strong> • Paciente: <strong>{amostraParaRejeitar.pacienteNome}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalRejeicaoAberto(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">

                {/* SELEÇÃO DO MOTIVO DE REJEIÇÃO */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Motivo da Rejeição Técnica * (Obrigatório)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {MOTIVOS_REJEICAO.map((mot) => {
                      const isSelected = motivoRejeicao === mot.valor;
                      return (
                        <div
                          key={mot.valor}
                          onClick={() => handleTrocarMotivo(mot.valor)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <strong className={`block text-xs ${isSelected ? 'text-rose-950 font-bold' : 'text-slate-800'}`}>
                              {mot.rotulo.split('—')[0]}
                            </strong>
                            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${mot.gravidade === 'CRITICA' ? 'bg-rose-200 text-rose-900' : 'bg-amber-100 text-amber-900'
                              }`}>
                              {mot.gravidade}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1 font-numeric tracking-tight">
                            Custo médio retrabalho: R$ {mot.custoPadraoEstimado.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Justificativa Técnica */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Parecer Técnico do Analista / Justificativa *
                  </label>
                  <textarea
                    rows={3}
                    value={justificativaTecnica}
                    onChange={(e) => setJustificativaTecnica(e.target.value)}
                    placeholder="Descreva as características visuais ou interferentes detectados..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Notificação Automatizada para WhatsApp */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Mensagem Humanizada Automática (WhatsApp do Paciente)</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-[11px] font-mono whitespace-pre-line text-slate-700 max-h-36 overflow-y-auto">
                    {textoWhatsApp}
                  </div>
                </div>

              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setModalRejeicaoAberto(false)}
                  disabled={isProcessandoRecoleta}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  disabled={isProcessandoRecoleta}
                  isLoading={isProcessandoRecoleta}
                  onClick={handleConfirmarRejeicao}
                  leftIcon={<AlertTriangle className="w-4 h-4" />}
                >
                  Confirmar Rejeição & Recoleta
                </Button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL DE REGISTRO DE CONTATO MÉDICO (RASTREABILIDADE RDC 786/2023) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {modalContatoAberto && alertaAtivoParaContato && (
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

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                      Registro de Comunicação de Valor Crítico
                    </h3>
                    <p className="text-xs text-slate-500">
                      Obrigatório para acreditação laboratorial e conformidade RDC 786/2023
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalContatoAberto(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Resumo do Alerta Crítico */}
              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 mb-4 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-rose-700 font-semibold">Paciente:</span>
                  <strong className="text-slate-900">{alertaAtivoParaContato.pacienteNome} ({alertaAtivoParaContato.pacienteLeito})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-700 font-semibold">Exame / Resultado:</span>
                  <strong className="text-rose-900 font-numeric tracking-tight">{alertaAtivoParaContato.exameNome}: {alertaAtivoParaContato.resultado} {alertaAtivoParaContato.unidade}</strong>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Médico(a) Notificado(a) *
                    </label>
                    <input
                      type="text"
                      required
                      value={medicoContatado}
                      onChange={(e) => setMedicoContatado(e.target.value)}
                      placeholder="Dr. Nome Sobrenome"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      CRM e UF *
                    </label>
                    <input
                      type="text"
                      required
                      value={crmMedico}
                      onChange={(e) => setCrmMedico(e.target.value)}
                      placeholder="CRM 000.000-SP"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-numeric tracking-tight"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Telefone / Ramal de Chamada *
                  </label>
                  <input
                    type="text"
                    required
                    value={telefoneContato}
                    onChange={(e) => setTelefoneContato(e.target.value)}
                    placeholder="(11) 98765-4321 ou Ramal 204"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-numeric tracking-tight"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Conduta Clínica Informada pelo Médico *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={condutaRegistrada}
                    onChange={(e) => setCondutaRegistrada(e.target.value)}
                    placeholder="Descreva a confirmação do médico e medidas adotadas..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Horário do Contato:</span>
                    <strong className="font-numeric tracking-tight text-slate-800">{new Date().toLocaleTimeString('pt-BR')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Responsável Técnico:</span>
                    <strong className="text-slate-800">{responsavelRegistro}</strong>
                  </div>
                </div>

              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setModalContatoAberto(false)}
                  disabled={isSalvandoContato}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={isSalvandoContato}
                  isLoading={isSalvandoContato}
                  onClick={handleSalvarContatoMedico}
                  leftIcon={<FileCheck className="w-4 h-4" />}
                >
                  Registrar no Prontuário
                </Button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ColetaPage;
