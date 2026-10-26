import React, { useState } from 'react';
import { 
  CheckSquare, 
  FileCheck, 
  Timer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Tipagem dos Materiais do Checklist Pré-Analítico
interface MaterialChecklistItem {
  id: 'urina' | 'fezes' | 'escarro';
  nome: 'Urina (EAS)' | 'Fezes (Parasitológico)' | 'Escarro';
  descricao: string;
  frasco: string;
  entregue: boolean;
}

// Tipagem do Histórico da Cadeia de Custódia (Entrega de Laudos)
interface RegistroCustodia {
  id: string;
  protocolo: string;
  paciente: string;
  entreguePor: string;
  horario: string;
  documentoConferido: string;
}

export const PainelRecepcaoOperacional: React.FC = () => {
  const { user } = useAuth();
  const nomeOperador = user?.nome || 'Mariana Duarte';

  // ============================================================================
  // ESTADO 1: CHECKLIST PRÉ-ANALÍTICO (COLETA DOMICILIAR)
  // ============================================================================
  const [materiais, setMateriais] = useState<MaterialChecklistItem[]>([
    {
      id: 'urina',
      nome: 'Urina (EAS)',
      descricao: '1ª urina da manhã (jato médio) ou retenção de 2h',
      frasco: 'Frasco coletor estéril tampa amarela',
      entregue: true,
    },
    {
      id: 'fezes',
      nome: 'Fezes (Parasitológico)',
      descricao: 'Amostra fresca sem contato com água sanitária',
      frasco: 'Coletor universal com pá dosadora',
      entregue: false,
    },
    {
      id: 'escarro',
      nome: 'Escarro',
      descricao: 'Amostra pós-expectoração profunda matinal',
      frasco: 'Pote estéril boca larga 50ml',
      entregue: false,
    },
  ]);

  const toggleMaterial = (id: 'urina' | 'fezes' | 'escarro') => {
    setMateriais((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, entregue: !item.entregue } : item
      )
    );
  };

  const totalEntregues = materiais.filter((m) => m.entregue).length;
  const haPendenciaPreAnalitica = totalEntregues < materiais.length;

  // ============================================================================
  // ESTADO 2: CUSTÓDIA DE LAUDOS FÍSICOS (CHAIN OF CUSTODY)
  // ============================================================================
  const [registrosCustodia, setRegistrosCustodia] = useState<RegistroCustodia[]>([
    {
      id: 'cust-1',
      protocolo: '8492',
      paciente: 'Carlos Eduardo Fontes',
      entreguePor: 'Mariana Duarte',
      horario: '14:35',
      documentoConferido: 'RG 48.912.003-X',
    },
    {
      id: 'cust-2',
      protocolo: '8320',
      paciente: 'Beatriz Vasconcelos',
      entreguePor: 'Mariana Duarte',
      horario: '11:20',
      documentoConferido: 'CNH 04928174920',
    },
    {
      id: 'cust-3',
      protocolo: '8104',
      paciente: 'Heitor Mendes Ramos',
      entreguePor: 'Mariana Duarte',
      horario: '09:15',
      documentoConferido: 'CPF ***.592.118-**',
    },
  ]);

  // Estados do Formulário de Entrega (Auditoria e Terminal Compartilhado)
  const [isFormularioAberto, setIsFormularioAberto] = useState(false);
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [numeroProtocolo, setNumeroProtocolo] = useState('');
  const [nomePaciente, setNomePaciente] = useState('');

  const handleConfirmarEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    const responsavelLimpo = nomeResponsavel.trim();
    const protocoloLimpo = numeroProtocolo.replace('#', '').trim();

    // Trava de segurança: impede submissão sem responsável ou protocolo
    if (!responsavelLimpo || !protocoloLimpo) return;

    const agora = new Date();
    const horarioFormatado = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const novoItem: RegistroCustodia = {
      id: `cust-${Date.now()}`,
      protocolo: protocoloLimpo,
      paciente: nomePaciente.trim() || 'Paciente Não Informado',
      entreguePor: responsavelLimpo,
      horario: horarioFormatado,
      documentoConferido: 'Identificação confirmada no balcão',
    };

    setRegistrosCustodia((prev) => [novoItem, ...prev]);
    setNomeResponsavel('');
    setNumeroProtocolo('');
    setNomePaciente('');
    setIsFormularioAberto(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* ========================================================================= */}
      {/* CABEÇALHO DO COCKPIT OPERACIONAL (APPLE HIG)                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                Cockpit da Recepção Avançada
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Fase 2 Ativa
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Gestão de pré-analítico domiciliar, custódia de laudos físicos e cronômetros de fila em tempo real.
            </p>
          </div>
        </div>

        {/* Status de Operação do Terminal */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500">Operador:</span>
          <strong className="text-slate-900 font-semibold">{nomeOperador}</strong>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRID PRINCIPAL: 3 CARDS DO COCKPIT (APPLE HIG)                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* ======================================================================= */}
        {/* CARD 1: CHECKLIST PRÉ-ANALÍTICO (AUDITORIA DE COLETA DOMICILIAR)        */}
        {/* ======================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:scale-[1.01] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between relative group">
          <div>
            {/* Cabeçalho do Card */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-100/80 transition-colors">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit'] leading-snug">
                    Checklist: Materiais Trazidos
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Auditoria Pré-Analítica Domiciliar
                  </span>
                </div>
              </div>

              {/* Indicador de Itens Entregues */}
              <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-colors ${
                haPendenciaPreAnalitica 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {totalEntregues}/{materiais.length}
              </span>
            </div>

            {/* Descrição de Negócio */}
            <p className="text-xs text-slate-500 leading-relaxed mb-5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              Evita pendências na fase pré-analítica e bloqueia a triagem no laboratório se faltar material.
            </p>

            {/* Lista dos 3 Materiais com Toggle Switch estilo iOS */}
            <div className="space-y-3.5">
              {materiais.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-2.5 ${
                    item.entregue
                      ? 'bg-emerald-50/40 border-emerald-200/70'
                      : 'bg-slate-50/70 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 font-['Outfit']">
                          {item.nome}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.frasco}
                      </p>
                    </div>

                    {/* Switch / Toggle estilo iOS */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.entregue}
                      onClick={() => toggleMaterial(item.id)}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
                        item.entregue ? 'bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    >
                      <span className="sr-only">Alternar recebimento de {item.nome}</span>
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                          item.entregue ? 'translate-x-5 text-emerald-600' : 'translate-x-0 text-slate-400'
                        }`}
                      >
                        {item.entregue ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <X className="w-3 h-3 stroke-[3]" />
                        )}
                      </span>
                    </button>
                  </div>

                  {/* UX CRUCIAL: Tag de Status Dinâmico */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      {item.descricao}
                    </span>

                    {item.entregue ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300/80 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Entregue e Etiquetado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100/80 text-amber-900 border border-amber-300 shrink-0 animate-pulse">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Material Ausente (Bloqueia Análise)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodapé do Card 1: Aviso de Bloqueio / Homologação */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            {haPendenciaPreAnalitica ? (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50/80 px-3 py-2 rounded-xl border border-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Bloqueio ativado na bancada técnica até entrega dos frascos.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-3 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Todos os materiais recebidos. Triagem liberada no laboratório.</span>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* CARD 2: CHAIN OF CUSTODY (RASTREIO E AUDITORIA DE LAUDOS FÍSICOS)       */}
        {/* ======================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:scale-[1.01] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between relative group">
          <div>
            {/* Cabeçalho do Card */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200/80 text-cyan-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-cyan-100/80 transition-colors">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit'] leading-snug">
                    Auditoria de Entrega de Laudos
                  </h3>
                  <span className="text-[11px] font-semibold text-cyan-700">
                    Chain of Custody • Exames Físicos
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {registrosCustodia.length} Entregas
              </span>
            </div>

            {/* Contexto de Negócio */}
            <p className="text-xs text-slate-500 leading-relaxed mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              Registra nominalmente a entrega do envelope impresso com identificação da recepcionista e documento, prevenindo contestações.
            </p>

            {/* Log Visual / Timeline das Últimas Entregas */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Últimas Entregas Realizadas
              </span>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {registrosCustodia.map((reg) => (
                  <div 
                    key={reg.id}
                    className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-100/80 transition-colors flex items-start gap-3 text-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-cyan-100/70 text-cyan-800 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          Laudo Físico (Protocolo #{reg.protocolo})
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {reg.horario}
                        </span>
                      </div>
                      <p className="text-slate-600 truncate mt-0.5">
                        Paciente: <strong className="text-slate-800">{reg.paciente}</strong>
                      </p>
                      <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mt-1 border-t border-slate-200/50 pt-1">
                        <span>Entregue por: <strong className="text-slate-700">{reg.entreguePor}</strong></span>
                        <span className="truncate max-w-[140px] text-slate-500">{reg.documentoConferido}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botão de Ação Primário ou Formulário de Confirmação com Trava de Segurança */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            {!isFormularioAberto ? (
              <button
                type="button"
                onClick={() => {
                  setIsFormularioAberto(true);
                  setNomeResponsavel('');
                  setNumeroProtocolo('');
                  setNomePaciente('');
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-black active:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Registrar Entrega de Protocolo</span>
              </button>
            ) : (
              <form 
                onSubmit={handleConfirmarEntrega}
                className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-100/80 text-cyan-800 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-['Outfit']">
                        Auditoria de Entrega Física
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        Terminal Compartilhado • Identificação Obrigatória
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormularioAberto(false);
                      setNomeResponsavel('');
                      setNumeroProtocolo('');
                      setNomePaciente('');
                    }}
                    className="w-6 h-6 rounded-full bg-slate-200/70 hover:bg-slate-300/80 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                    title="Cancelar registro"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* 1. Nome do Responsável pela Entrega (OBRIGATÓRIO) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nome do Responsável pela Entrega <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nomeResponsavel}
                      onChange={(e) => setNomeResponsavel(e.target.value)}
                      placeholder="Identifique quem está entregando (ex: Mariana Duarte)"
                      className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-2xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 transition-all font-medium border"
                    />
                    {!nomeResponsavel.trim() && (
                      <p className="text-[10px] text-amber-700 font-medium mt-1 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3 shrink-0 text-amber-600" />
                        Obrigatório: Identifique-se para liberar o botão de entrega.
                      </p>
                    )}
                  </div>

                  {/* 2. Número do Protocolo (OBRIGATÓRIO) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Número do Protocolo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={numeroProtocolo}
                      onChange={(e) => setNumeroProtocolo(e.target.value)}
                      placeholder="ex: #8501 ou ATD-2026-9481"
                      className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-2xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 transition-all font-mono border"
                    />
                  </div>

                  {/* 3. Nome do Paciente / Retirante */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nome do Paciente / Retirante
                    </label>
                    <input
                      type="text"
                      value={nomePaciente}
                      onChange={(e) => setNomePaciente(e.target.value)}
                      placeholder="Nome de quem retirou o envelope físico"
                      className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-2xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 transition-all border"
                    />
                  </div>
                </div>

                {/* Trava de Segurança: Botão Confirmar e Liberar Exame desabilitado sem o Nome do Responsável */}
                <div className="flex items-center gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormularioAberto(false);
                      setNomeResponsavel('');
                      setNumeroProtocolo('');
                      setNomePaciente('');
                    }}
                    className="w-1/3 py-2.5 px-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={!nomeResponsavel.trim() || !numeroProtocolo.trim()}
                    className="w-2/3 py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md shadow-slate-900/10 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:scale-100 disabled:shadow-none"
                    title={!nomeResponsavel.trim() ? 'Preencha o Nome do Responsável para habilitar' : 'Confirmar e Liberar Exame'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Confirmar e Liberar Exame</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* CARD 3: MONITORAMENTO DE SLA (CRONÔMETROS DE QUALIDADE EM TEMPO REAL)     */}
        {/* ======================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:scale-[1.01] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between relative group">
          <div>
            {/* Cabeçalho do Card */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-amber-100/80 transition-colors">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit'] leading-snug">
                    SLA de Atendimento
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-700">
                    Cronômetros de Qualidade • Tempo Real
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ao Vivo</span>
              </div>
            </div>

            {/* Contexto de Negócio */}
            <p className="text-xs text-slate-500 leading-relaxed mb-5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              Mostra à equipe da recepção se as salas de coleta estão atrasadas, permitindo gerenciar a expectativa dos pacientes no salão.
            </p>

            {/* 2 Painéis de Métricas com Fonte font-numeric (Space Grotesk) text-4xl */}
            <div className="space-y-4">
              
              {/* Métrica A: Tempo de Espera Máximo (Recepção) */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 hover:bg-amber-50 transition-colors group/metric">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">
                    Tempo de Espera Máximo (Recepção)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200/80 text-amber-900">
                    Atenção
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-amber-600 font-numeric tracking-tight">
                    18 min
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Meta &le; 15 min)
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-amber-800/90 pt-2 border-t border-amber-200/60">
                  <span>3 pacientes acima do tempo esperado</span>
                  <span className="font-semibold text-amber-900">Fila: 7 aguardando</span>
                </div>
              </div>

              {/* Métrica B: Tempo Médio da Coleta (Salas) */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 hover:bg-emerald-50 transition-colors group/metric">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">
                    Tempo Médio da Coleta (Salas)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-200/80 text-emerald-900">
                    Excelente
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-emerald-600 font-numeric tracking-tight">
                    04 min
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Meta &le; 08 min)
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-emerald-800/90 pt-2 border-t border-emerald-200/60">
                  <span>2 salas de punção operando</span>
                  <span className="font-semibold text-emerald-900">Ritmo ágil</span>
                </div>
              </div>

            </div>
          </div>

          {/* Rodapé do Card 3: Status das Salas */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Sala 1: Em coleta
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Sala 2: Liberada
            </span>
            <span className="font-semibold text-slate-700">
              Taxa de Giro: 92%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PainelRecepcaoOperacional;
