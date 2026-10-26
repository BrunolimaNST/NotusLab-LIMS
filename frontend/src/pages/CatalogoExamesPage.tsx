import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { 
  BookOpen, 
  Search, 
  Clock, 
  Filter, 
  X
} from 'lucide-react';
import { ExameCatalogo, ApiResponse } from '../types';
import { 
  Button, 
  Card, 
  CardBody, 
  Alert, 
  TableRowSkeleton 
} from '../components/ui';
import { examesList } from '../data/examesList';

export const CatalogoExamesPage: React.FC = () => {
  const [exames, setExames] = useState<ExameCatalogo[]>(examesList as unknown as ExameCatalogo[]);
  const [busca, setBusca] = useState('');
  const [setorSelecionado, setSetorSelecionado] = useState<string>('TODOS');
  const [modalExame, setModalExame] = useState<ExameCatalogo | null>(null);
  const [loading, setLoading] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Busca o catálogo da API com tratamento real de erro e loading
  useEffect(() => {
    let isMounted = true;
    const carregarCatalogo = async () => {
      setLoading(true);
      setErroMsg(null);
      try {
        const response = await api.get<ApiResponse<ExameCatalogo[]>>('/exams');
        if (isMounted && response.data?.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          setExames(response.data.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Falha na resposta do servidor.';
          console.warn('API /exams offline, utilizando catálogo interno pré-configurado:', msg);
          setInfoMsg('Modo offline ativo: Catálogo de exames carregado a partir do cache local.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarCatalogo();
    return () => {
      isMounted = false;
    };
  }, []);

  // Performance (React): Memorização dos setores disponíveis
  const setores = useMemo(() => {
    return ['TODOS', ...Array.from(new Set(exames.map((e) => e.setorLaboratorial)))];
  }, [exames]);

  // Performance (React): Memorização de filtragem de exames
  const examesFiltrados = useMemo(() => {
    const query = busca.trim().toLowerCase();

    return exames.filter((ex) => {
      const matchBusca =
        !query ||
        ex.nome.toLowerCase().includes(query) ||
        ex.mnemonico.toLowerCase().includes(query) ||
        Boolean(ex.codigoTUSS && ex.codigoTUSS.includes(query));

      const matchSetor = setorSelecionado === 'TODOS' || ex.setorLaboratorial === setorSelecionado;

      return matchBusca && matchSetor;
    });
  }, [exames, busca, setorSelecionado]);

  const handleSelectSetor = useCallback((setor: string) => {
    setSetorSelecionado(setor);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <span>Tabela Geral</span>
            <span>•</span>
            <span className="text-secondary font-bold">Catálogo Analítico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-['Outfit']">
            Catálogo de Exames & Orientações
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulte preços base, tempos de jejum, tubos de coleta e orientações técnicas de preparo aos pacientes.
          </p>
        </div>

        {/* Totalizador */}
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Exames Cadastrados
            </span>
            <span className="text-xl font-bold text-slate-900">{exames.length}</span>
          </div>
        </div>
      </div>

      {/* Alertas e Mensagens Amigáveis */}
      {erroMsg && (
        <Alert
          type="error"
          message={erroMsg}
          onClose={() => setErroMsg(null)}
        />
      )}

      {infoMsg && (
        <Alert
          type="info"
          message={infoMsg}
          onClose={() => setInfoMsg(null)}
        />
      )}

      {/* Filtros e Barra de Pesquisa */}
      <Card>
        <CardBody className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5">
          {/* Barra de Pesquisa */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por nome, mnemônico ou código TUSS..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:bg-white transition-all shadow-inner"
            />
          </div>

          {/* Filtro de Setor */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {setores.map((setor) => (
              <button
                key={setor}
                type="button"
                onClick={() => handleSelectSetor(setor)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                  setorSelecionado === setor
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {setor}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Tabela de Exames */}
      <Card headerAccent="var(--color-primary)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3.5 px-4">Exame / Mnemônico</th>
                <th className="py-3.5 px-4">Setor</th>
                <th className="py-3.5 px-4">Tubo de Coleta</th>
                <th className="py-3.5 px-4">Jejum Obrigatório</th>
                <th className="py-3.5 px-4">Preço Base</th>
                <th className="py-3.5 px-4 text-right">Orientações de Preparo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <>
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                </>
              ) : examesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    Nenhum exame encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                examesFiltrados.map((exame) => (
                  <tr key={exame.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Nome e Mnemônico */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-primary/10 text-primary">
                          {exame.mnemonico}
                        </span>
                        {exame.codigoTUSS && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            TUSS: {exame.codigoTUSS}
                          </span>
                        )}
                        {exame.requerApoioExterno && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase">
                            B2B Apoio
                          </span>
                        )}
                      </div>
                      <strong className="text-sm font-semibold text-slate-900 block">
                        {exame.nome}
                      </strong>
                    </td>

                    {/* Setor */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {exame.setorLaboratorial}
                    </td>

                    {/* Tubo de Coleta */}
                    <td className="py-4 px-4">
                      {exame.tuboColeta ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: exame.tuboColeta.corTampaHex }}
                          />
                          <span className="font-semibold text-slate-700">
                            {exame.tuboColeta.codigo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Não vinculado</span>
                      )}
                    </td>

                    {/* Jejum */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exame.tempoJejumHoras > 0 ? `${exame.tempoJejumHoras} horas` : 'Dispensado'}</span>
                      </div>
                    </td>

                    {/* Preço */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(exame.precoBaseReais))}
                      </span>
                    </td>

                    {/* Orientações */}
                    <td className="py-4 px-4 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setModalExame(exame)}
                      >
                        Ver Detalhes
                      </Button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalhes de Preparo */}
      {modalExame && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 font-mono">
                  {modalExame.mnemonico}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 font-['Outfit']">
                  {modalExame.nome}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalExame(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Setor Técnico:</span>
                  <strong className="text-slate-800">{modalExame.setorLaboratorial}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jejum calórico:</span>
                  <strong className="text-slate-800">{modalExame.tempoJejumHoras} horas</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Prazo de laudo:</span>
                  <strong className="text-slate-800">{modalExame.prazoDiasUteis} dia(s) útil(eis)</strong>
                </div>
              </div>

              <div>
                <strong className="block text-slate-700 font-semibold mb-1">
                  Orientações Completas para o Paciente:
                </strong>
                <p className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 leading-relaxed text-xs">
                  {modalExame.orientacoesPreparo || 'Orientações padrão de jejum e repouso.'}
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setModalExame(null)}
              >
                Fechar Informações
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CatalogoExamesPage;
