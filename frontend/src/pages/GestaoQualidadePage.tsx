import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Package, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  Check, 
  AlertOctagon
} from 'lucide-react';
import { 
  AlertaControleAnalitico, 
  OcorrenciaPreAnalitica, 
  ReagenteEstoque 
} from '../types';
import { Card, CardHeader, Button } from '../components/ui';

// SEÇÃO A: DADOS DE OCORRÊNCIAS PRÉ-ANALÍTICAS
const OCORRENCIAS_MOCK: OcorrenciaPreAnalitica[] = [
  {
    id: 'oc-1',
    codigoBarrasAmostra: 'AMO-20261003-0001',
    protocoloAtendimento: 'ATD-2026-0001',
    pacienteNome: 'Ana Paula Ferreira',
    motivo: 'HEMOLISE',
    custoDesperdicio: 38.50,
    custoDesperdicioFormatado: 'R$ 38,50',
    descricaoDetalhada: 'Hemólise grau 3 confirmada após centrifugação na triagem. Interferência em K+ e TGO.',
    tuboDescricao: 'EDTA K3 4ml',
    dataRegistro: 'Hoje, 09:15',
  },
  {
    id: 'oc-2',
    codigoBarrasAmostra: 'AMO-20261002-0044',
    protocoloAtendimento: 'ATD-2026-0922',
    pacienteNome: 'Marcos Vinicius Santos',
    motivo: 'COAGULACAO',
    custoDesperdicio: 45.00,
    custoDesperdicioFormatado: 'R$ 45,00',
    descricaoDetalhada: 'Microcoágulo filamentar visível ao teste com palito. Punção difícil no leito.',
    tuboDescricao: 'Citrato 3,2% 3,5ml',
    dataRegistro: 'Ontem, 16:40',
  },
  {
    id: 'oc-3',
    codigoBarrasAmostra: 'AMO-20261002-0019',
    protocoloAtendimento: 'ATD-2026-0881',
    pacienteNome: 'Beatriz Helena Lima',
    motivo: 'VOLUME_INSUFICIENTE',
    custoDesperdicio: 25.00,
    custoDesperdicioFormatado: 'R$ 25,00',
    descricaoDetalhada: 'Volume aspirado de apenas 0,8ml (necessário 3,0ml para testes hormonais múltiplos).',
    tuboDescricao: 'Gel Separador 5ml',
    dataRegistro: '02/10/2026, 11:20',
  },
];

// SEÇÃO B: DADOS DE CONTROLE DE QUALIDADE ANALÍTICA (CIQ & CALIBRAÇÃO)
const ALERTAS_ANALITICOS_MOCK: AlertaControleAnalitico[] = [
  {
    id: 'calib-1',
    equipamentoNome: 'Analisador Bioquímica Cobas c311',
    setor: 'Bioquímica Clínica',
    tipo: 'CALIBRACAO_PENDENTE',
    parametro: 'Calibração do Módulo de Enzimas (AST, ALT, Amilase)',
    severidade: 'CRITICA',
    mensagem: 'Calibração periódica expira em 1 hora e 30 minutos. Novos lotes serão bloqueados.',
    tempoRestante: '1h 30m restantes',
    statusAcao: 'PENDENTE',
  },
  {
    id: 'ciq-2',
    equipamentoNome: 'Coagulômetro Automatizado Stago Compact Max',
    setor: 'Hematologia / Hemostasia',
    tipo: 'CIQ_FORA_CONTROLE',
    parametro: 'Controle Nível 2 de Fibrinogênio',
    severidade: 'CRITICA',
    mensagem: 'Violação da Regra de Westgard 1:3s (+3.2 DP acima da média histórica do lote).',
    regraViolada: 'Regra Westgard 1:3s',
    statusAcao: 'EM_AJUSTE',
  },
  {
    id: 'ciq-3',
    equipamentoNome: 'Contador Hematológico Sysmex XN-550',
    setor: 'Hematologia',
    tipo: 'CIQ_FORA_CONTROLE',
    parametro: 'Controle e-CHECK Nível Normal (Plaquetas)',
    severidade: 'ALERTA',
    mensagem: 'Tendência consecutiva de 4 resultados acima de +1 DP (Regra 4:1s). Monitorar drift analítico.',
    regraViolada: 'Regra Westgard 4:1s',
    statusAcao: 'PENDENTE',
  },
];

// SEÇÃO C: DADOS DE ESTOQUE CRÍTICO E VALIDADE
const REAGENTES_ESTOQUE_MOCK: ReagenteEstoque[] = [
  {
    id: 'rea-1',
    nome: 'Tromboplastina Liofilizada TP Citrato',
    lote: 'TP-LIOF-2026-09',
    setor: 'Hemostasia',
    dataValidade: '25/09/2026',
    diasAteVencer: -8, // Vencido
    quantidadeAtual: 4,
    quantidadeMinima: 10,
    unidade: 'frascos',
    statusCriticidade: 'VENCIDO',
  },
  {
    id: 'rea-2',
    nome: 'Reagente Glicose Enzimática GOD-PAP',
    lote: 'GLIC-2026-B81',
    setor: 'Bioquímica',
    dataValidade: '12/10/2026',
    diasAteVencer: 9, // Validade crítica (< 15 dias)
    quantidadeAtual: 2,
    quantidadeMinima: 8,
    unidade: 'kits (500 testes)',
    statusCriticidade: 'VALIDADE_CRITICA',
  },
  {
    id: 'rea-3',
    nome: 'Diluente Celular Cellpack DCL Sysmex',
    lote: 'DCL-2026-778',
    setor: 'Hematologia',
    dataValidade: '15/12/2026',
    diasAteVencer: 73,
    quantidadeAtual: 1, // Estoque abaixo do mínimo
    quantidadeMinima: 5,
    unidade: 'galões 20L',
    statusCriticidade: 'ESTOQUE_BAIXO',
  },
  {
    id: 'rea-4',
    nome: 'Substrato Quimioluminescente TSH Immulite',
    lote: 'IMM-TSH-901',
    setor: 'Hormônios',
    dataValidade: '05/11/2026',
    diasAteVencer: 33,
    quantidadeAtual: 12,
    quantidadeMinima: 6,
    unidade: 'kits',
    statusCriticidade: 'NORMAL',
  },
];

export const GestaoQualidadePage: React.FC = () => {
  const [secaoAtiva, setSecaoAtiva] = useState<'TODAS' | 'PRE_ANALITICO' | 'ANALITICO' | 'ESTOQUE'>('TODAS');
  const [alertasAnaliticos, setAlertasAnaliticos] = useState(ALERTAS_ANALITICOS_MOCK);

  const handleResolverAlertaAnalitico = (id: string) => {
    setAlertasAnaliticos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, statusAcao: 'CONCLUIDO' } : a))
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <span>Garantia da Qualidade & Risco Clínico</span>
            <span>•</span>
            <span className="text-secondary font-bold">Diretrizes RDC 786 & ISO 15189</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-['Outfit'] tracking-tight">
            Gestão da Qualidade Laboratorial
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Painel operacional para vigilância pré-analítica, calibrações de bancada e controle preventivo de desabastecimento.
          </p>
        </div>

        {/* Filtro Rápido de Seções */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs self-start md:self-auto overflow-x-auto">
          {[
            { id: 'TODAS', label: 'Visão Completa' },
            { id: 'PRE_ANALITICO', label: 'A. Pré-Analítico' },
            { id: 'ANALITICO', label: 'B. Controle Analítico' },
            { id: 'ESTOQUE', label: 'C. Estoque & Validade' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSecaoAtiva(s.id as typeof secaoAtiva)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                secaoAtiva === s.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* METRICAS OPERACIONAIS EM DESTAQUE COM HOVER LIFT */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs card-lift hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Taxa de Recoletas
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-numeric tracking-tight">
              Meta &lt; 2.0%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-numeric tracking-tight">1.8%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center font-numeric tracking-tight">
              <TrendingDown className="w-3.5 h-3.5" /> -0.3% vs mês anterior
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            <strong className="font-numeric tracking-tight">14</strong> recoletas em <strong className="font-numeric tracking-tight">780</strong> atendimentos
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs card-lift hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Índice de Rejeição
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              Fase Pré-Analítica
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-700 font-numeric tracking-tight">0.42%</span>
            <span className="text-xs text-slate-500 font-medium">do volume total</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Hemólise é o principal interferente (<strong className="font-numeric tracking-tight">54%</strong>)
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs card-lift hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              CIQ em Conformidade
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              Westgard
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-800 font-numeric tracking-tight">98.2%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Conforme
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            <strong className="font-numeric tracking-tight">2</strong> alertas de calibração ativa
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs card-lift hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Vigilância Insumos
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Ação Requerida
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 font-numeric tracking-tight">3 itens</span>
            <span className="text-xs text-amber-700 font-medium">críticos</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            <strong className="font-numeric tracking-tight">1</strong> vencido e <strong className="font-numeric tracking-tight">2</strong> abaixo do mínimo
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO A: OCORRÊNCIAS PRÉ-ANALÍTICAS (TAXA DE RECOLETA & REJEIÇÃO) */}
      {/* ========================================================================= */}
      {(secaoAtiva === 'TODAS' || secaoAtiva === 'PRE_ANALITICO') && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
            <div className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-black">
              A
            </div>
            <h2 className="text-lg font-black text-slate-900 font-['Outfit']">
              Ocorrências Pré-Analíticas (Recoletas & Rejeições de Amostras)
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gráfico / Distribuição de Causas de Rejeição */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                    Distribuição dos Motivos de Recoleta
                  </h3>
                  <p className="text-xs text-slate-400">Interferentes detectados na rotina deste mês</p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full font-numeric tracking-tight">
                  14 ocorrências
                </span>
              </div>

              {/* Barras de Distribuição */}
              <div className="space-y-3 pt-2">
                {[
                  { motivo: 'Hemólise da Amostra (Grau 2 a 4)', pct: 54, cor: 'bg-rose-500', barBg: 'bg-rose-100', qtd: 8 },
                  { motivo: 'Presença de Microcoágulo em EDTA', pct: 26, cor: 'bg-purple-600', barBg: 'bg-purple-100', qtd: 4 },
                  { motivo: 'Volume Insuficiente (QNS)', pct: 13, cor: 'bg-amber-500', barBg: 'bg-amber-100', qtd: 2 },
                  { motivo: 'Lipemia / Outros Interferentes', pct: 7, cor: 'bg-slate-400', barBg: 'bg-slate-100', qtd: 1 },
                ].map((item) => (
                  <div key={item.motivo} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.motivo}</span>
                      <span className="font-numeric tracking-tight font-bold text-slate-900">{item.pct}% ({item.qtd})</span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full ${item.barBg} overflow-hidden`}>
                      <div 
                        className={`h-full rounded-full ${item.cor}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 mt-4 space-y-1">
                <span className="font-bold text-slate-800 block">💡 Ação Preventiva de POP:</span>
                <p className="text-[11px] text-slate-500">
                  Treinamento agendado com a equipe de punção venosa sobre o uso de agulhas de calibre adequado para mitigar hemólise em pacientes idosos e pediátricos.
                </p>
              </div>
            </div>

            {/* Tabela de Ocorrências Recentes */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                    Registro de Ocorrências com Bloqueio de Análise
                  </h3>
                  <p className="text-xs text-slate-400">Rastreabilidade completa de recoletas e custos operacionais</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Amostra / Paciente</th>
                      <th className="py-2.5 px-3">Motivo Rejeição</th>
                      <th className="py-2.5 px-3">Impacto / Parecer</th>
                      <th className="py-2.5 px-3 text-right">Data / Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {OCORRENCIAS_MOCK.map((oc) => (
                      <tr key={oc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <strong className="text-slate-900 font-bold block">{oc.pacienteNome}</strong>
                          <span className="font-numeric tracking-tight text-[10px] text-slate-500">{oc.codigoBarrasAmostra}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px]">
                            {oc.motivo}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <p className="text-[11px] text-slate-600 truncate">{oc.descricaoDetalhada}</p>
                          <span className="text-[10px] text-slate-400 font-numeric tracking-tight font-semibold">Retrabalho: {oc.custoDesperdicioFormatado}</span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-400 font-numeric tracking-tight text-[11px]">
                          {oc.dataRegistro}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO B: CONTROLE DE QUALIDADE ANALÍTICA (CIQ & CALIBRAÇÃO DE BANCADA) */}
      {/* ========================================================================= */}
      {(secaoAtiva === 'TODAS' || secaoAtiva === 'ANALITICO') && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black">
              B
            </div>
            <h2 className="text-lg font-black text-slate-900 font-['Outfit']">
              Controle de Qualidade Analítica (Calibrações & CIQ - Regras de Westgard)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {alertasAnaliticos.map((alerta) => {
              const isConcluido = alerta.statusAcao === 'CONCLUIDO';

              return (
                <div
                  key={alerta.id}
                  className={`p-5 rounded-3xl border shadow-card transition-all flex flex-col justify-between ${
                    isConcluido
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : alerta.severidade === 'CRITICA'
                      ? 'bg-white border-2 border-rose-400 ring-2 ring-rose-100 shadow-md'
                      : 'bg-white border-2 border-amber-300 ring-2 ring-amber-100 shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Topo do Card */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isConcluido
                          ? 'bg-slate-200 text-slate-700'
                          : alerta.severidade === 'CRITICA'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {alerta.tipo === 'CALIBRACAO_PENDENTE' ? 'Calibração Pendente' : 'Alerta CIQ'}
                      </span>

                      {alerta.regraViolada && (
                        <span className="text-[10px] font-numeric tracking-tight font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {alerta.regraViolada}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-['Outfit'] leading-tight">
                        {alerta.equipamentoNome}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Setor: {alerta.setor}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                      <strong className="text-xs text-slate-800 block">
                        {alerta.parametro}
                      </strong>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {alerta.mensagem}
                      </p>
                    </div>
                  </div>

                  {/* Ação Operacional de Bancada */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {alerta.tempoRestante && (
                      <span className="text-xs font-numeric tracking-tight font-bold text-rose-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {alerta.tempoRestante}
                      </span>
                    )}

                    {!isConcluido ? (
                      <Button
                        type="button"
                        variant={alerta.severidade === 'CRITICA' ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => handleResolverAlertaAnalitico(alerta.id)}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                        className="ml-auto"
                      >
                        {alerta.tipo === 'CALIBRACAO_PENDENTE' ? 'Calibrar Agora' : 'Repassar Controle'}
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 ml-auto">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ação Concluída
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO C: VIGILÂNCIA DE ESTOQUE CRÍTICO & VALIDADE (TRAVA DE ROTINA) */}
      {/* ========================================================================= */}
      {(secaoAtiva === 'TODAS' || secaoAtiva === 'ESTOQUE') && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
            <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xs font-black">
              C
            </div>
            <h2 className="text-lg font-black text-slate-900 font-['Outfit']">
              Vigilância de Estoque Crítico & Validade de Reagentes
            </h2>
          </div>

          <Card headerAccent="var(--color-primary)">
            <CardHeader
              title="Reagentes de Bancada Próximos do Vencimento ou com Estoque Abaixo do Mínimo"
              subtitle="Itens prioritários que oferecem risco de paralisação técnica da rotina laboratorial"
              icon={<Package className="w-5 h-5 text-slate-700" />}
              action={
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold font-numeric tracking-tight">
                  3 Insumos em Alerta Operacional
                </span>
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Reagente / Kit Diagnóstico</th>
                    <th className="py-3.5 px-4">Setor</th>
                    <th className="py-3.5 px-4">Lote / Fabricante</th>
                    <th className="py-3.5 px-4">Saldo vs Mínimo</th>
                    <th className="py-3.5 px-4">Data de Validade</th>
                    <th className="py-3.5 px-4">Criticidade Operacional</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Ação Recomendada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {REAGENTES_ESTOQUE_MOCK.map((reagente) => {
                    const isVencido = reagente.statusCriticidade === 'VENCIDO';
                    const isValidadeCritica = reagente.statusCriticidade === 'VALIDADE_CRITICA';
                    const isEstoqueBaixo = reagente.statusCriticidade === 'ESTOQUE_BAIXO';

                    return (
                      <tr 
                        key={reagente.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isVencido ? 'bg-rose-50/30' : isValidadeCritica ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Nome do Reagente */}
                        <td className="py-4 px-4 sm:px-6">
                          <strong className="text-slate-900 font-bold block text-sm">
                            {reagente.nome}
                          </strong>
                          <span className="text-slate-400 text-[11px] block mt-0.5">
                            Unidade de Consumo: {reagente.unidade}
                          </span>
                        </td>

                        {/* Setor */}
                        <td className="py-4 px-4 font-semibold text-slate-700">
                          {reagente.setor}
                        </td>

                        {/* Lote */}
                        <td className="py-4 px-4 font-numeric tracking-tight font-medium text-slate-600">
                          {reagente.lote}
                        </td>

                        {/* Saldo vs Mínimo */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 font-numeric tracking-tight">
                            <span className={`font-bold text-sm ${
                              reagente.quantidadeAtual < reagente.quantidadeMinima ? 'text-rose-600' : 'text-slate-800'
                            }`}>
                              {reagente.quantidadeAtual}
                            </span>
                            <span className="text-slate-400 text-xs">/ min: {reagente.quantidadeMinima}</span>
                          </div>
                          {reagente.quantidadeAtual < reagente.quantidadeMinima && (
                            <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                              ⚠️ Abaixo da margem de segurança
                            </span>
                          )}
                        </td>

                        {/* Validade */}
                        <td className="py-4 px-4 font-numeric tracking-tight">
                          <span className="font-bold text-slate-800 block">{reagente.dataValidade}</span>
                          {isVencido ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full inline-block mt-0.5 font-numeric tracking-tight">
                              Vencido há {Math.abs(reagente.diasAteVencer)} dias!
                            </span>
                          ) : isValidadeCritica ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5 font-numeric tracking-tight">
                              Expira em {reagente.diasAteVencer} dias
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium font-numeric tracking-tight">
                              Válido ({reagente.diasAteVencer} dias)
                            </span>
                          )}
                        </td>

                        {/* Criticidade */}
                        <td className="py-4 px-4">
                          {isVencido ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse">
                              <AlertOctagon className="w-3 h-3" />
                              <span>Trava de Bancada</span>
                            </span>
                          ) : isValidadeCritica ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Validade Iminente</span>
                            </span>
                          ) : isEstoqueBaixo ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-bold text-[10px] uppercase tracking-wider">
                              <span>Reposição Urgente</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] uppercase tracking-wider">
                              <span>Regular</span>
                            </span>
                          )}
                        </td>

                        {/* Ação Recomendada */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          {isVencido ? (
                            <button
                              type="button"
                              onClick={() => alert(`Reagente ${reagente.nome} descartado e recolhido para incineração biológica conforme POP-AMB-04.`)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                            >
                              Bloquear / Descarte
                            </button>
                          ) : isEstoqueBaixo || isValidadeCritica ? (
                            <button
                              type="button"
                              onClick={() => alert(`Pedido de compra emergencial disparado para o insumo ${reagente.nome}.`)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                            >
                              Pedir Compra
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Estoque Estável</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}

    </div>
  );
};

export default GestaoQualidadePage;
