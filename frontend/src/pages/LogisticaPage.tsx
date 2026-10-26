import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Thermometer, 
  CheckCircle2, 
  Building2, 
  ExternalLink, 
  Search, 
  PackageCheck, 
  Table, 
  LayoutGrid, 
  Calendar 
} from 'lucide-react';
import { RemessaB2B, StatusLogistico } from '../types';
import { Card, CardHeader } from '../components/ui';
import { staggerContainer, staggerItem } from '../utils/motion';

const REMESSAS_INICIAIS: RemessaB2B[] = [
  {
    id: 'rem-1',
    codigoLote: 'REM-20261003-001',
    laboratorioApoio: 'DB Diagnósticos Apoio S.A.',
    cnpjApoio: '07.411.026/0001-44',
    transportadora: 'Polar Transportes Especializados',
    quantidadeAmostras: 14,
    dataHoraEnvio: '02/10/2026 às 11:30',
    previsaoRetornoSla: '05/10/2026 às 18:00',
    statusSla: 'NO_PRAZO',
    statusLogistico: 'RECEBIDO_APOIO',
    tempoRestanteTexto: 'Restam 48h de SLA (Dentro do prazo estipulado)',
    temperaturaEnvioGraus: 4.2,
    temperaturaMinimaGraus: 2.0,
    temperaturaMaximaGraus: 8.0,
    codigoRastreioLogistica: 'EXP-POLAR-889123-SP',
    examesPrincipais: ['Vitamina D Total', 'Cariótipo com Banda G', 'Imunofenotipagem'],
  },
  {
    id: 'rem-2',
    codigoLote: 'REM-20261003-002',
    laboratorioApoio: 'Fleury B2B Apoio Diagnóstico',
    cnpjApoio: '60.840.055/0001-31',
    transportadora: 'RV Ímola Transporte de Saúde',
    quantidadeAmostras: 8,
    dataHoraEnvio: '01/10/2026 às 14:00',
    previsaoRetornoSla: '03/10/2026 às 22:00',
    statusSla: 'ALERTA_PROXIMIDADE',
    statusLogistico: 'EM_ANALISE_APOIO',
    tempoRestanteTexto: 'Atenção: Menos de 6 horas para expirar prazo contratual',
    temperaturaEnvioGraus: 3.5,
    temperaturaMinimaGraus: 2.0,
    temperaturaMaximaGraus: 8.0,
    codigoRastreioLogistica: 'EXP-IMOLA-771239-SP',
    examesPrincipais: ['Painel NGS Genético', 'Sorologia Hepatite Delta'],
  },
  {
    id: 'rem-3',
    codigoLote: 'REM-20261003-003',
    laboratorioApoio: 'Hermes Pardini Laboratório Parceiro',
    cnpjApoio: '19.378.769/0001-12',
    transportadora: 'BioLog Logística Biológica',
    quantidadeAmostras: 5,
    dataHoraEnvio: '29/09/2026 às 09:15',
    previsaoRetornoSla: '02/10/2026 às 12:00',
    statusSla: 'ATRASADO',
    statusLogistico: 'EM_TRANSITO',
    tempoRestanteTexto: 'SLA ESTOURADO: Atrasado há 9 horas! Contatar suporte parceiro.',
    temperaturaEnvioGraus: 9.4, // Excursão de temperatura (> 8.0°C)
    temperaturaMinimaGraus: 2.0,
    temperaturaMaximaGraus: 8.0,
    codigoRastreioLogistica: 'EXP-BIOLOG-665511-MG',
    examesPrincipais: ['Biópsia Renal', 'Imunohistoquímica Especial'],
    excursaoTermica: true,
  },
  {
    id: 'rem-4',
    codigoLote: 'REM-20261003-004',
    laboratorioApoio: 'Sabin Medicina Diagnóstica',
    cnpjApoio: '02.934.821/0001-90',
    transportadora: 'Polar Transportes Especializados',
    quantidadeAmostras: 11,
    dataHoraEnvio: '03/10/2026 às 08:00',
    previsaoRetornoSla: '06/10/2026 às 12:00',
    statusSla: 'NO_PRAZO',
    statusLogistico: 'EM_TRANSITO',
    tempoRestanteTexto: 'Restam 72h de SLA (Carga embarcada)',
    temperaturaEnvioGraus: 4.8,
    temperaturaMinimaGraus: 2.0,
    temperaturaMaximaGraus: 8.0,
    codigoRastreioLogistica: 'EXP-POLAR-993214-DF',
    examesPrincipais: ['Calprotectina Fecal', 'Anti-DNA Dupla Hélice'],
  },
];

export const LogisticaPage: React.FC = () => {
  const [remessas] = useState<RemessaB2B[]>(REMESSAS_INICIAIS);
  const [busca, setBusca] = useState('');
  const [filtroSla, setFiltroSla] = useState<string>('TODOS');
  const [modoVisualizacao, setModoVisualizacao] = useState<'CARDS' | 'TABELA'>('TABELA');

  // Filtragem
  const remessasFiltradas = useMemo(() => {
    return remessas.filter((r) => {
      const matchSla = 
        filtroSla === 'TODOS' ||
        (filtroSla === 'EXCURSAO' ? r.temperaturaEnvioGraus < r.temperaturaMinimaGraus || r.temperaturaEnvioGraus > r.temperaturaMaximaGraus : r.statusSla === filtroSla);

      const query = busca.trim().toLowerCase();
      const matchQuery =
        !query ||
        r.codigoLote.toLowerCase().includes(query) ||
        r.laboratorioApoio.toLowerCase().includes(query) ||
        r.transportadora.toLowerCase().includes(query) ||
        r.codigoRastreioLogistica.toLowerCase().includes(query);

      return matchSla && matchQuery;
    });
  }, [remessas, filtroSla, busca]);

  // Contadores
  const contadores = useMemo(() => {
    const total = remessas.length;
    const noPrazo = remessas.filter((r) => r.statusSla === 'NO_PRAZO').length;
    const alerta = remessas.filter((r) => r.statusSla === 'ALERTA_PROXIMIDADE').length;
    const atrasado = remessas.filter((r) => r.statusSla === 'ATRASADO').length;
    const comExcursao = remessas.filter(
      (r) => r.temperaturaEnvioGraus < r.temperaturaMinimaGraus || r.temperaturaEnvioGraus > r.temperaturaMaximaGraus
    ).length;

    return { total, noPrazo, alerta, atrasado, comExcursao };
  }, [remessas]);

  // Renderizador de Status Logístico
  const renderStatusLogistico = (status: StatusLogistico) => {
    switch (status) {
      case 'EM_TRANSITO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
            <Truck className="w-3 h-3 text-blue-600 animate-pulse" />
            <span>Em Trânsito</span>
          </span>
        );
      case 'RECEBIDO_APOIO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
            <Building2 className="w-3 h-3 text-emerald-600" />
            <span>Recebido no Apoio</span>
          </span>
        );
      case 'EM_ANALISE_APOIO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
            <PackageCheck className="w-3 h-3 text-purple-600" />
            <span>Em Análise Técnica</span>
          </span>
        );
      case 'LAUDO_LIBERADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Laudo Liberado</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <span>Bancada & Terceirização</span>
            <span>•</span>
            <span className="text-secondary font-bold">Rastreabilidade B2B</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-['Outfit'] tracking-tight">
            Logística B2B & Monitor de Remessas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoramento de cadeia fria em tempo real e controle de SLA contratual com laboratórios de apoio externos.
          </p>
        </div>

        {/* Toggle de Visualização (Cards vs Tabela) */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setModoVisualizacao('TABELA')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modoVisualizacao === 'TABELA'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Visão em Tabela</span>
          </button>
          <button
            type="button"
            onClick={() => setModoVisualizacao('CARDS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modoVisualizacao === 'CARDS'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Visão em Cards</span>
          </button>
        </div>
      </div>

      {/* METRICAS DE SLA E CADEIA FRIA COM HOVER LIFT */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs card-lift hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Remessas</span>
          <span className="text-xl font-black text-slate-800 font-numeric tracking-tight mt-0.5 block">{contadores.total}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs card-lift hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">No Prazo (SLA)</span>
          <span className="text-xl font-bold text-emerald-700 font-numeric tracking-tight mt-0.5 block">{contadores.noPrazo}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs card-lift hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">Alerta (&lt; 24h)</span>
          <span className="text-xl font-bold text-amber-700 font-numeric tracking-tight mt-0.5 block">{contadores.alerta}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs card-lift hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">SLA Atrasado</span>
          <span className="text-xl font-bold text-rose-700 font-numeric tracking-tight mt-0.5 block">{contadores.atrasado}</span>
        </div>

        <div className={`p-3.5 rounded-2xl border shadow-xs card-lift hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${
          contadores.comExcursao > 0 
            ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200 animate-pulse' 
            : 'bg-white border-slate-200'
        }`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${
            contadores.comExcursao > 0 ? 'text-rose-700' : 'text-slate-500'
          }`}>
            Excursão Térmica
          </span>
          <span className={`text-xl font-black font-numeric tracking-tight mt-0.5 block ${
            contadores.comExcursao > 0 ? 'text-rose-700' : 'text-slate-800'
          }`}>
            {contadores.comExcursao} alerta(s)
          </span>
        </div>
      </div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por lote, apoio, transportadora ou rastreio..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:bg-white transition-all shadow-inner font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto">
          {[
            { id: 'TODOS', label: 'Todos os Lotes' },
            { id: 'NO_PRAZO', label: 'No Prazo' },
            { id: 'ALERTA_PROXIMIDADE', label: 'Alerta < 24h' },
            { id: 'ATRASADO', label: 'Atrasados' },
            { id: 'EXCURSAO', label: 'Excursão Térmica' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltroSla(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                filtroSla === f.id
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISUALIZAÇÃO EM TABELA DE SLA E RASTREABILIDADE */}
      {/* ========================================================================= */}
      {modoVisualizacao === 'TABELA' && (
        <Card headerAccent="var(--color-primary)">
          <CardHeader
            title={`Monitoramento Logístico & SLAs Contratuais (${remessasFiltradas.length})`}
            subtitle="Rastreabilidade contínua de remessas com controle rigoroso de temperatura e prazos"
            icon={<Truck className="w-5 h-5 text-slate-700" />}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Remessa / Lote</th>
                  <th className="py-3.5 px-4">Laboratório de Apoio</th>
                  <th className="py-3.5 px-4">Transportadora</th>
                  <th className="py-3.5 px-4">Cadeia Fria (Temperatura)</th>
                  <th className="py-3.5 px-4">Retorno Previsto</th>
                  <th className="py-3.5 px-4">SLA Restante</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Status Logístico</th>
                </tr>
              </thead>
              <motion.tbody 
                className="divide-y divide-slate-100"
                variants={staggerContainer(0.06, 0.03)}
                initial="hidden"
                animate="show"
                key={`tbody-${filtroSla}`}
              >
                {remessasFiltradas.map((r) => {
                  const isExcursao = r.temperaturaEnvioGraus < r.temperaturaMinimaGraus || r.temperaturaEnvioGraus > r.temperaturaMaximaGraus;

                  return (
                    <motion.tr 
                      key={r.id} 
                      variants={staggerItem}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isExcursao ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      {/* Lote */}
                      <td className="py-4 px-4 sm:px-6">
                        <strong className="font-numeric tracking-tight font-bold text-slate-900 text-sm block">
                          {r.codigoLote}
                        </strong>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          <span className="font-numeric tracking-tight font-semibold">{r.quantidadeAmostras}</span> amostras • <span className="font-numeric tracking-tight">{r.codigoRastreioLogistica}</span>
                        </span>
                      </td>

                      {/* Apoio */}
                      <td className="py-4 px-4">
                        <strong className="text-slate-900 font-bold block">
                          {r.laboratorioApoio}
                        </strong>
                        <span className="text-slate-400 font-numeric tracking-tight text-[10px] block">
                          CNPJ: {r.cnpjApoio}
                        </span>
                      </td>

                      {/* Transportadora */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {r.transportadora}
                        </span>
                        <span className="text-slate-400 text-[10px] block mt-0.5 font-numeric tracking-tight">
                          Envio: {r.dataHoraEnvio}
                        </span>
                      </td>

                      {/* MONITORAMENTO DA CADEIA FRIA: ATUAL VS LIMITE */}
                      <td className="py-4 px-4">
                        <div className={`p-2 rounded-xl border inline-block ${
                          isExcursao
                            ? 'bg-rose-100 border-rose-300 text-rose-900 animate-pulse'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}>
                          <div className="flex items-center gap-1.5 font-numeric tracking-tight font-bold text-xs">
                            <Thermometer className={`w-3.5 h-3.5 ${isExcursao ? 'text-rose-600' : 'text-emerald-600'}`} />
                            <span>Atual: {r.temperaturaEnvioGraus.toFixed(1)}°C</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-numeric tracking-tight mt-0.5">
                            Limite: {r.temperaturaMinimaGraus}°C a {r.temperaturaMaximaGraus}°C
                          </div>
                          {isExcursao && (
                            <span className="mt-1 block text-[9px] font-black uppercase text-rose-700 bg-rose-200 px-1.5 py-0.5 rounded text-center">
                              Excursão de Temperatura
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Previsão de Retorno */}
                      <td className="py-4 px-4 font-numeric tracking-tight font-medium text-slate-800">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.previsaoRetornoSla}</span>
                        </div>
                      </td>

                      {/* SLA Restante */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg border font-numeric tracking-tight ${
                            r.statusSla === 'NO_PRAZO'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : r.statusSla === 'ALERTA_PROXIMIDADE'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {r.tempoRestanteTexto.split('(')[0]}
                          </span>
                        </div>
                      </td>

                      {/* Status Logístico */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {renderStatusLogistico(r.statusLogistico)}
                      </td>

                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* VISUALIZAÇÃO EM CARDS DA CADEIA FRIA E REMESSAS (CASCATA & HOVER LIFT) */}
      {/* ========================================================================= */}
      {modoVisualizacao === 'CARDS' && (
        <motion.div 
          variants={staggerContainer(0.08, 0.04)}
          initial="hidden"
          animate="show"
          key={`grid-cards-${filtroSla}`}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {remessasFiltradas.map((r) => {
            const isExcursao = r.temperaturaEnvioGraus < r.temperaturaMinimaGraus || r.temperaturaEnvioGraus > r.temperaturaMaximaGraus;

            return (
              <motion.div
                key={r.id}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
                className={`bg-white rounded-3xl p-6 border shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between card-lift ${
                  isExcursao
                    ? 'border-2 border-rose-500 bg-rose-50/30 ring-2 ring-rose-200'
                    : 'border-slate-200 hover:shadow-xl'
                }`}
              >
                {/* Linha superior de destaque */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-2 ${
                    isExcursao 
                      ? 'bg-rose-600' 
                      : r.statusSla === 'NO_PRAZO' 
                      ? 'bg-emerald-500' 
                      : r.statusSla === 'ALERTA_PROXIMIDADE' 
                      ? 'bg-amber-500' 
                      : 'bg-rose-500'
                  }`}
                />

                <div className="space-y-4">
                  
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-numeric tracking-tight font-bold uppercase tracking-wider text-slate-400">
                        Lote B2B
                      </span>
                      <h3 className="text-base font-black text-slate-900 font-numeric tracking-tight">
                        {r.codigoLote}
                      </h3>
                      <p className="text-xs font-bold text-primary mt-0.5">
                        {r.laboratorioApoio}
                      </p>
                    </div>

                    <div className="text-right">
                      {renderStatusLogistico(r.statusLogistico)}
                      <span className="text-[10px] text-slate-400 font-numeric tracking-tight block mt-1">
                        {r.quantidadeAmostras} amostras
                      </span>
                    </div>
                  </div>

                  {/* MONITORAMENTO TÉRMICO DA CADEIA FRIA */}
                  <div className={`p-4 rounded-2xl border ${
                    isExcursao
                      ? 'bg-rose-100/80 border-rose-300 text-rose-950 shadow-inner'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className={`w-5 h-5 ${isExcursao ? 'text-rose-600 animate-bounce' : 'text-emerald-600'}`} />
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider block">
                            Cadeia Fria Biológica
                          </span>
                          <span className="text-base font-numeric tracking-tight font-black block">
                            Atual: {r.temperaturaEnvioGraus.toFixed(1)}°C | Limite: {r.temperaturaMinimaGraus}°C a {r.temperaturaMaximaGraus}°C
                          </span>
                        </div>
                      </div>

                      {isExcursao ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-rose-600 text-white animate-pulse">
                          Excursão de Temperatura
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Conforme
                        </span>
                      )}
                    </div>

                    {isExcursao && (
                      <p className="text-xs font-semibold text-rose-800 mt-2 pt-2 border-t border-rose-200">
                        ⚠️ Alerta crítico: O lote excedeu a temperatura máxima de segurança. Notificar a transportadora {r.transportadora} imediatamente.
                      </p>
                    )}
                  </div>

                  {/* Detalhes de Transporte e SLA */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Transportadora:</span>
                      <strong className="text-slate-800">{r.transportadora}</strong>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Código de Rastreio:</span>
                      <strong className="font-numeric tracking-tight text-slate-900">{r.codigoRastreioLogistica}</strong>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Previsão de Laudo:</span>
                      <strong className="font-numeric tracking-tight text-slate-900">{r.previsaoRetornoSla}</strong>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-500">SLA Contratual:</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md font-numeric tracking-tight ${
                        r.statusSla === 'NO_PRAZO'
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.statusSla === 'ALERTA_PROXIMIDADE'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {r.tempoRestanteTexto}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Exames Principais */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {r.examesPrincipais.map((ex, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {ex}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Consultando API de telemetria da transportadora ${r.transportadora} para o rastreio ${r.codigoRastreioLogistica}...`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary cursor-pointer shrink-0 ml-2"
                  >
                    <span>Telemetria</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </motion.div>
      )}

    </div>
  );
};

export default LogisticaPage;
