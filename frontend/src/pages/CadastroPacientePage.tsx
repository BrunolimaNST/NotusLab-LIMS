import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Phone, 
  Search, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Edit3, 
  X, 
  ShieldCheck, 
  Activity,
  SearchX,
  Sparkles,
  MapPin,
  Trees,
  UserSquare
} from 'lucide-react';
import { Paciente, Patient, Pronomes, SexoBiologico, SexoBiologicoClinico, TipoFaturamento } from '../types';
import { 
  getPacientesStorage, 
  maskCPF, 
  calcularIdade 
} from '../services/pacientesStorage';
import { Button } from '../components/ui';
import { PatientRegistrationForm } from '../components/PatientRegistrationForm';

export const CadastroPacientePage: React.FC = () => {
  const navigate = useNavigate();

  // Estados principais da base de pacientes
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState('');
  const [debouncedBusca, setDebouncedBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'lista' | 'cadastro'>('lista');

  // Modais de apoio
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [modalPosSalvarAberto, setModalPosSalvarAberto] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [ultimoPacienteSalvo, setUltimoPacienteSalvo] = useState<Paciente | null>(null);
  const [pacienteParaEdicao, setPacienteParaEdicao] = useState<Partial<Patient> | undefined>(undefined);

  // Feedback de alerta
  const [alertaSucesso, setAlertaSucesso] = useState<string | null>(null);

  // Carrega pacientes do storage
  const carregarPacientes = useCallback(() => {
    const lista = getPacientesStorage();
    setPacientes(lista);
  }, []);

  useEffect(() => {
    carregarPacientes();
    const handleUpdate = () => carregarPacientes();
    window.addEventListener('notuslab_pacientes_updated', handleUpdate);
    return () => window.removeEventListener('notuslab_pacientes_updated', handleUpdate);
  }, [carregarPacientes]);

  // Debounce da barra de pesquisa (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusca(busca.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(timer);
  }, [busca]);

  // Filtragem performática com useMemo
  const pacientesFiltrados = useMemo(() => {
    if (!debouncedBusca) return pacientes;
    return pacientes.filter((p) => {
      const nomeMatch = p.nomeCompleto.toLowerCase().includes(debouncedBusca);
      const cpfLimpo = p.cpf.replace(/\D/g, '');
      const buscaLimpa = debouncedBusca.replace(/\D/g, '');
      const cpfMatch = buscaLimpa && cpfLimpo.includes(buscaLimpa);
      const telMatch = p.telefoneWhatsapp.replace(/\D/g, '').includes(debouncedBusca);
      const emailMatch = p.email?.toLowerCase().includes(debouncedBusca);
      return nomeMatch || cpfMatch || telMatch || emailMatch;
    });
  }, [pacientes, debouncedBusca]);

  // Abertura de Novo Cadastro direto no formulário
  const handleAbrirNovo = () => {
    setPacienteParaEdicao(undefined);
    setAbaAtiva('cadastro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Abertura de Edição
  const handleAbrirEditar = (paciente: Paciente) => {
    const dadosFormatados: Partial<Patient> = {
      id: paciente.id,
      nomeCivil: paciente.nomeCivil || paciente.nomeCompleto,
      nomeSocial: paciente.nomeSocial,
      pronomes: (paciente.pronomes as Pronomes) || 'Ela/Dela',
      identidadeGenero: paciente.identidadeGenero || 'Mulher Cisgênero',
      cpf: paciente.cpf,
      rg: paciente.rg,
      orgaoEmissor: paciente.orgaoEmissor,
      nomeMae: paciente.nomeMae,
      nomePai: paciente.nomePai,
      cep: paciente.cep,
      logradouro: paciente.logradouro,
      numero: paciente.numero,
      complemento: paciente.complemento,
      bairro: paciente.bairro,
      cidade: paciente.cidade,
      estado: paciente.estado || 'SP',
      zonaRural: paciente.zonaRural || false,
      sexoBiologico: (paciente.sexoBiologico === 'MASCULINO' ? 'Masculino' : paciente.sexoBiologico === 'FEMININO' ? 'Feminino' : 'Intersexo') as SexoBiologicoClinico,
      dataNascimento: paciente.dataNascimento,
      tipoFaturamento: (paciente.tipoFaturamento as TipoFaturamento) || 'convenio',
      convenioNome: paciente.convenioNome || 'Unimed',
      convenioCarteira: paciente.convenioCarteira || '',
      whatsapp: paciente.whatsapp || paciente.telefoneWhatsapp,
      email: paciente.email
    };

    setPacienteParaEdicao(dadosFormatados);
    setAbaAtiva('cadastro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Abrir modal de visualização
  const handleAbrirVisualizar = (paciente: Paciente) => {
    setPacienteSelecionado(paciente);
    setModalVisualizarAberto(true);
  };

  // Iniciar Atendimento diretamente
  const handleIniciarAtendimento = (paciente: Paciente) => {
    navigate('/workspace/recepcao', {
      state: { pacienteSelecionado: paciente },
    });
  };

  // Callback de sucesso ao salvar paciente
  const handleSuccessSalvar = (pacienteSalvo: Patient) => {
    carregarPacientes();
    const pacienteBase: Paciente = {
      id: pacienteSalvo.id,
      nomeCompleto: pacienteSalvo.nomeSocial || pacienteSalvo.nomeCivil,
      nomeCivil: pacienteSalvo.nomeCivil,
      nomeSocial: pacienteSalvo.nomeSocial,
      pronomes: pacienteSalvo.pronomes,
      identidadeGenero: pacienteSalvo.identidadeGenero,
      cpf: pacienteSalvo.cpf || '***.***.***-**',
      rg: pacienteSalvo.rg,
      orgaoEmissor: pacienteSalvo.orgaoEmissor,
      nomeMae: pacienteSalvo.nomeMae,
      nomePai: pacienteSalvo.nomePai,
      cep: pacienteSalvo.cep,
      logradouro: pacienteSalvo.logradouro,
      numero: pacienteSalvo.numero,
      complemento: pacienteSalvo.complemento,
      bairro: pacienteSalvo.bairro,
      cidade: pacienteSalvo.cidade,
      estado: pacienteSalvo.estado,
      zonaRural: pacienteSalvo.zonaRural,
      dataNascimento: pacienteSalvo.dataNascimento,
      sexoBiologico: pacienteSalvo.sexoBiologico.toUpperCase() as SexoBiologico,
      telefoneWhatsapp: pacienteSalvo.whatsapp,
      whatsapp: pacienteSalvo.whatsapp,
      email: pacienteSalvo.email || '',
      dataCadastro: 'Cadastrado agora'
    };

    setUltimoPacienteSalvo(pacienteBase);
    setPacienteParaEdicao(undefined);
    setModalPosSalvarAberto(true);
    setAbaAtiva('lista');
    setAlertaSucesso(
      pacienteParaEdicao?.id 
        ? 'Cadastro do paciente atualizado com sucesso!' 
        : 'Novo paciente cadastrado com sucesso!'
    );
    setTimeout(() => setAlertaSucesso(null), 4500);
  };

  return (
    // Recuo no container max-w-6xl garantindo que o formulário e a lista iniciem perfeitamente abaixo do banner amarelo de Demonstração
    <div className="space-y-6 max-w-6xl mx-auto w-full pt-16 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. CABEÇALHO COM ESTÉTICA APPLE HIG & SEGMENTED CONTROL                  */}
      {/* ========================================================================= */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xl shadow-black/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              <span>Recepção e Atendimento</span>
              <span>•</span>
              <span className="text-secondary font-bold">Identificação Civil & Demografia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-['Outfit'] tracking-tight">
              Pacientes & Cadastro
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gestão demográfica completa, rastreabilidade de homônimos, logística de coleta e parâmetros para laudos.
            </p>
          </div>

          {/* Segmented Control no Estilo Apple HIG */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setPacienteParaEdicao(undefined);
                  setAbaAtiva('lista');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === 'lista'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Base de Pacientes ({pacientes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPacienteParaEdicao(undefined);
                  setAbaAtiva('cadastro');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === 'cadastro'
                    ? 'bg-white text-primary shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{pacienteParaEdicao ? 'Editando Paciente' : 'Formulário de Cadastro'}</span>
              </button>
            </div>

            {abaAtiva === 'lista' && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAbrirNovo}
                leftIcon={<UserPlus className="w-4 h-4" />}
                className="shadow-md ml-2"
              >
                Cadastrar Paciente
              </Button>
            )}
          </div>
        </div>

        {/* Métricas Rápidas / Resumo Operacional */}
        {abaAtiva === 'lista' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total na Base
              </span>
              <span className="text-xl font-bold text-slate-800 font-numeric">
                {pacientes.length}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Resultados Filtrados
              </span>
              <span className="text-xl font-bold text-primary font-numeric">
                {pacientesFiltrados.length}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Segurança LGPD
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-4 h-4" /> Mascaramento Ativo
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Fase do LIMS
              </span>
              <span className="text-xs font-bold text-secondary flex items-center gap-1 mt-1">
                <Activity className="w-4 h-4" /> Pré-Analítica
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Alerta de Sucesso Flutuante */}
      {alertaSucesso && (
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{alertaSucesso}</span>
          </div>
          <button
            onClick={() => setAlertaSucesso(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VISUALIZAÇÃO: ABA LISTA OU ABA FORMULÁRIO DE CADASTRO                  */}
      {/* ========================================================================= */}
      {abaAtiva === 'cadastro' ? (
        <div className="animate-in fade-in duration-300">
          <PatientRegistrationForm
            initialData={pacienteParaEdicao}
            onSuccess={handleSuccessSalvar}
            onCancel={() => {
              setPacienteParaEdicao(undefined);
              setAbaAtiva('lista');
            }}
            className="pt-0"
          />
        </div>
      ) : (
        /* TABELA E LISTA DE PACIENTES */
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xl shadow-black/5 overflow-hidden animate-in fade-in duration-200">
          
          {/* Barra de Filtro e Busca com Debounce */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por nome, CPF ou WhatsApp..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all shadow-inner"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
              Mostrando <strong className="text-slate-800">{pacientesFiltrados.length}</strong> de{' '}
              <strong className="text-slate-800">{pacientes.length}</strong> pacientes cadastrados
            </div>
          </div>

          {/* Tabela ou Empty State */}
          {pacientesFiltrados.length === 0 ? (
            <div className="py-16 px-6 text-center">
              {pacientes.length === 0 ? (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Nenhum paciente cadastrado
                  </h3>
                  <p className="text-sm text-slate-500">
                    Cadastre o primeiro paciente do laboratório para iniciar a emissão de orçamentos, abertura de ordens e coleta.
                  </p>
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleAbrirNovo}
                      leftIcon={<UserPlus className="w-4 h-4" />}
                    >
                      Cadastrar Primeiro Paciente
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <SearchX className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 font-['Outfit']">
                    Nenhum paciente encontrado para "{busca}"
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verifique se o nome, CPF ou número de WhatsApp foram digitados corretamente.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setBusca('')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Limpar filtro de busca
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Paciente</th>
                    <th className="py-3.5 px-4">CPF (LGPD)</th>
                    <th className="py-3.5 px-4">WhatsApp</th>
                    <th className="py-3.5 px-4">Idade / Sexo</th>
                    <th className="py-3.5 px-4">Logística / Região</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pacientesFiltrados.map((paciente) => {
                    const idade = calcularIdade(paciente.dataNascimento);
                    return (
                      <tr
                        key={paciente.id}
                        className="hover:bg-slate-50/90 transition-colors duration-150 group"
                      >
                        {/* Nome e E-mail */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 font-['Outfit']">
                              {paciente.nomeCompleto.substring(0, 2)}
                            </div>
                            <div>
                              <strong className="text-slate-900 font-bold block text-sm group-hover:text-primary transition-colors">
                                {paciente.nomeCompleto}
                              </strong>
                              <span className="text-slate-400 text-[11px] block truncate max-w-[200px]">
                                {paciente.email || 'E-mail não informado'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* CPF Mascarado */}
                        <td className="py-4 px-4 font-numeric font-medium text-slate-700">
                          <span className="bg-slate-100 px-2 py-1 rounded-md text-[11px] border border-slate-200">
                            {maskCPF(paciente.cpf)}
                          </span>
                        </td>

                        {/* Telefone / WhatsApp */}
                        <td className="py-4 px-4 font-numeric text-emerald-700 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{paciente.telefoneWhatsapp}</span>
                          </div>
                        </td>

                        {/* Idade e Sexo */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-700 text-xs font-numeric">
                              {idade || 'Idade não calculada'}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              {paciente.sexoBiologico === 'FEMININO' ? 'Feminino' : paciente.sexoBiologico === 'MASCULINO' ? 'Masculino' : 'Outro'}
                            </span>
                          </div>
                        </td>

                        {/* Logística / Região */}
                        <td className="py-4 px-4">
                          {paciente.zonaRural ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Trees className="w-3 h-3 text-emerald-600" />
                              Zona Rural / Interior
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {paciente.cidade || 'Urbana'}
                            </span>
                          )}
                        </td>

                        {/* Menu de Ações */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Visualizar */}
                            <button
                              type="button"
                              onClick={() => handleAbrirVisualizar(paciente)}
                              title="Visualizar ficha completa"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Editar */}
                            <button
                              type="button"
                              onClick={() => handleAbrirEditar(paciente)}
                              title="Editar cadastro"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Iniciar Atendimento */}
                            <button
                              type="button"
                              onClick={() => handleIniciarAtendimento(paciente)}
                              title="Iniciar Atendimento / Orçamento"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-xs transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                            >
                              <span>Iniciar Atendimento</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL PÓS-SALVAR: "Paciente Salvo! Deseja iniciar um atendimento agora?" */}
      {/* ========================================================================= */}
      {modalPosSalvarAberto && ultimoPacienteSalvo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
              Paciente Salvo com Sucesso!
            </h3>

            <p className="text-sm text-slate-600 mt-2">
              Os dados cadastrais de <strong className="text-slate-900">{ultimoPacienteSalvo.nomeCompleto}</strong> foram registrados na base com validação de homônimos e logística de coleta.
            </p>

            {/* Cartão de Resumo do Paciente */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 my-5 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">CPF:</span>
                <span className="font-numeric font-semibold text-slate-800">{maskCPF(ultimoPacienteSalvo.cpf)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Idade / Sexo:</span>
                <span className="font-semibold text-slate-800">
                  {calcularIdade(ultimoPacienteSalvo.dataNascimento)} • {ultimoPacienteSalvo.sexoBiologico}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp:</span>
                <span className="font-numeric text-emerald-700 font-semibold">{ultimoPacienteSalvo.telefoneWhatsapp}</span>
              </div>
              {ultimoPacienteSalvo.zonaRural && (
                <div className="flex justify-between pt-1 border-t border-slate-200/60 text-emerald-700 font-bold">
                  <span>Logística:</span>
                  <span>Zona Rural / Interior</span>
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-primary mb-5">
              Deseja iniciar um atendimento agora para este paciente?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setModalPosSalvarAberto(false)}
              >
                Concluir / Lista
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  setModalPosSalvarAberto(false);
                  handleIniciarAtendimento(ultimoPacienteSalvo);
                }}
                leftIcon={<Sparkles className="w-4 h-4 text-secondary" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Iniciar Agora
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL DE VISUALIZAÇÃO COMPLETA DA FICHA DO PACIENTE                    */}
      {/* ========================================================================= */}
      {modalVisualizarAberto && pacienteSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-extrabold flex items-center justify-center text-base shadow-sm font-['Outfit']">
                  {pacienteSelecionado.nomeCompleto.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    {pacienteSelecionado.nomeCompleto}
                  </h3>
                  <span className="text-xs text-slate-400 font-numeric">
                    ID Cadastral: #{pacienteSelecionado.id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalVisualizarAberto(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações da Ficha Apple HIG */}
            <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
              
              {/* Documentação Civil & Filiação */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <UserSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Documentação Civil & Filiação</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nome Civil:</span>
                    <strong className="text-slate-800 text-[11px] block truncate">
                      {pacienteSelecionado.nomeCivil || pacienteSelecionado.nomeCompleto}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CPF:</span>
                    <strong className="text-slate-800 font-numeric text-[11px] block">
                      {maskCPF(pacienteSelecionado.cpf)}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">RG / Órgão:</span>
                    <strong className="text-slate-800 font-numeric text-[11px] block">
                      {pacienteSelecionado.rg ? `${pacienteSelecionado.rg} ${pacienteSelecionado.orgaoEmissor || ''}` : 'Não informado'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nome da Mãe:</span>
                    <strong className="text-slate-800 text-[11px] block truncate text-amber-900 font-semibold" title={pacienteSelecionado.nomeMae || 'Não informado'}>
                      {pacienteSelecionado.nomeMae || 'Não informado'}
                    </strong>
                  </div>
                </div>

                {pacienteSelecionado.nomePai && (
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[10px]">Nome do Pai:</span>
                    <strong className="text-slate-800 text-[11px] block truncate">
                      {pacienteSelecionado.nomePai}
                    </strong>
                  </div>
                )}
              </div>

              {/* Endereço & Logística de Coleta */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Endereço & Logística</span>
                  </div>
                  {pacienteSelecionado.zonaRural && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Trees className="w-3 h-3 text-emerald-600" />
                      Zona Rural / Interior
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-700 leading-relaxed pt-1">
                  {pacienteSelecionado.logradouro ? (
                    <div>
                      <p className="font-semibold text-slate-800">
                        {pacienteSelecionado.logradouro}, {pacienteSelecionado.numero || 'S/N'}
                        {pacienteSelecionado.complemento ? ` - ${pacienteSelecionado.complemento}` : ''}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        {pacienteSelecionado.bairro ? `${pacienteSelecionado.bairro}, ` : ''}
                        {pacienteSelecionado.cidade || 'São Paulo'} - {pacienteSelecionado.estado || 'SP'} • CEP: <span className="font-numeric">{pacienteSelecionado.cep || 'N/A'}</span>
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Endereço ainda não cadastrado.</span>
                  )}
                </div>

                {pacienteSelecionado.zonaRural && (
                  <p className="text-[10px] text-emerald-700 bg-emerald-50/80 p-2 rounded-xl border border-emerald-100 mt-2">
                    Sinaliza necessidade de logística especial para cálculo de rotas de coleta domiciliar.
                  </p>
                )}
              </div>

              {/* Dados Clínicos & Contato */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Idade / Sexo Clínico</span>
                  <strong className="text-slate-800 text-xs block mt-0.5 font-numeric">
                    {calcularIdade(pacienteSelecionado.dataNascimento)} • {pacienteSelecionado.sexoBiologico}
                  </strong>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">WhatsApp p/ Laudos</span>
                  <strong className="text-emerald-700 font-numeric text-xs block mt-0.5 truncate">
                    {pacienteSelecionado.whatsapp || pacienteSelecionado.telefoneWhatsapp}
                  </strong>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Data de Nascimento:</span>
                <strong className="text-slate-800 font-numeric">
                  {pacienteSelecionado.dataNascimento.split('-').reverse().join('/')}
                </strong>
              </div>
            </div>

            {/* Ações do Modal de Ficha */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setModalVisualizarAberto(false)}
              >
                Fechar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  setModalVisualizarAberto(false);
                  handleIniciarAtendimento(pacienteSelecionado);
                }}
                leftIcon={<Activity className="w-4 h-4" />}
              >
                Iniciar Atendimento
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CadastroPacientePage;
