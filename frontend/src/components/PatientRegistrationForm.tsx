import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  UserSquare,
  CreditCard, 
  Calendar, 
  Phone, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw, 
  MapPin, 
  Trees
} from 'lucide-react';
import { Patient, Pronomes, SexoBiologico, SexoBiologicoClinico, TipoFaturamento } from '../types';
import { 
  formatCPFInput, 
  formatPhoneInput, 
  calcularIdade,
  savePacienteStorage 
} from '../services/pacientesStorage';
import { formatCEPInput } from '../utils/formatters';
import { 
  gerarNotificacaoInclusiva, 
  extrairNomeTratamento, 
  extrairSaudacaoInclusiva,
  TipoNotificacaoLims 
} from '../utils/notificationHelper';

export interface PatientRegistrationFormProps {
  onSuccess?: (patient: Patient) => void;
  onCancel?: () => void;
  initialData?: Partial<Patient>;
  className?: string;
  hideHeader?: boolean;
}

// Principais Convênios de Saúde no Brasil
const CONVENIOS_BRASIL = [
  'Unimed',
  'Amil',
  'Bradesco Saúde',
  'SulAmérica',
  'Hapvida',
  'NotreDame Intermédica',
  'Cassi',
  'Saúde Caixa',
  'Prevent Senior',
  'Outro Convênio'
] as const;

// Opções de Pronomes
const PRONOMES_OPCOES: Pronomes[] = [
  'Ele/Dele',
  'Ela/Dela',
  'Elu/Delu',
  'Não informar'
];

// Identidades de Gênero
const IDENTIDADES_GENERO = [
  'Mulher Cisgênero',
  'Homem Cisgênero',
  'Mulher Transgênero',
  'Homem Transgênero',
  'Pessoa Não-Binária',
  'Travesti',
  'Agênero',
  'Prefiro não informar',
  'Outro'
];

// Estados do Brasil (UF)
const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;



export const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  className,
  hideHeader = false
}) => {
  // --- 1. Acolhimento e Identidade Social ---
  const [nomeSocial, setNomeSocial] = useState(initialData?.nomeSocial || '');
  const [pronomes, setPronomes] = useState<Pronomes>((initialData?.pronomes as Pronomes) || 'Ela/Dela');
  const [identidadeGenero, setIdentidadeGenero] = useState(initialData?.identidadeGenero || 'Mulher Cisgênero');

  // --- 2. Documentação Civil e Filiação (Rastreabilidade Clínica & Desempate de Homônimos) ---
  const [nomeCivil, setNomeCivil] = useState(initialData?.nomeCivil || '');
  const [cpf, setCpf] = useState(initialData?.cpf || '');
  const [rg, setRg] = useState(initialData?.rg || '');
  const [orgaoEmissor, setOrgaoEmissor] = useState(initialData?.orgaoEmissor || 'SSP/SP');
  const [nomeMae, setNomeMae] = useState(initialData?.nomeMae || '');
  const [nomePai, setNomePai] = useState(initialData?.nomePai || '');

  // --- 3. Endereço Completo e Logística de Coleta ---
  const [cep, setCep] = useState(initialData?.cep || '');
  const [logradouro, setLogradouro] = useState(initialData?.logradouro || '');
  const [numero, setNumero] = useState(initialData?.numero || '');
  const [complemento, setComplemento] = useState(initialData?.complemento || '');
  const [bairro, setBairro] = useState(initialData?.bairro || '');
  const [cidade, setCidade] = useState(initialData?.cidade || '');
  const [estado, setEstado] = useState(initialData?.estado || 'SP');
  const [zonaRural, setZonaRural] = useState(initialData?.zonaRural || false);

  // --- 4. Dados Clínicos Isolados (Parâmetros Técnicos para Laudos) ---
  const [sexoBiologico, setSexoBiologico] = useState<SexoBiologicoClinico>(
    (initialData?.sexoBiologico as SexoBiologicoClinico) || 'Feminino'
  );
  const [dataNascimento, setDataNascimento] = useState(initialData?.dataNascimento || '');

  // --- 5. Dados de Faturamento ---
  const [tipoFaturamento, setTipoFaturamento] = useState<TipoFaturamento>(
    initialData?.tipoFaturamento || 'convenio'
  );
  const [convenioNome, setConvenioNome] = useState(initialData?.convenioNome || 'Unimed');
  const [convenioCarteira, setConvenioCarteira] = useState(initialData?.convenioCarteira || '');

  // --- 6. Contato e Comunicação ---
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '');
  const [email, setEmail] = useState(initialData?.email || '');

  // Feedback, Erros e Notificação
  const [tipoPreview, setTipoPreview] = useState<TipoNotificacaoLims>('LAUDO_LIBERADO');
  const [submitting, setSubmitting] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [sucesso, setSucesso] = useState(false);

  // Idade calculada em tempo real com Space Grotesk
  const idadeCalculada = useMemo(() => {
    return calcularIdade(dataNascimento);
  }, [dataNascimento]);

  // Nome prioritário de acolhimento
  const nomeExibicao = useMemo(() => {
    return extrairNomeTratamento({ nomeCivil, nomeSocial });
  }, [nomeCivil, nomeSocial]);

  // Saudação calculada
  const saudacaoInclusiva = useMemo(() => {
    return extrairSaudacaoInclusiva(pronomes);
  }, [pronomes]);

  // Mensagem de WhatsApp gerada dinamicamente pelo Helper
  const previewMensagem = useMemo(() => {
    return gerarNotificacaoInclusiva(
      {
        nomeCivil: nomeCivil || 'Paciente',
        nomeSocial: nomeSocial || null,
        pronomes,
        whatsapp: whatsapp || '+55 (11) 98765-4321',
        identidadeGenero
      },
      tipoPreview,
      tipoPreview === 'LAUDO_LIBERADO'
        ? {
            codigoProtocolo: 'ATD-2026-0842',
            examesDisponiveis: ['Hemograma Completo', 'Glicemia de Jejum', 'TSH Ultra']
          }
        : {
            codigoProtocolo: 'ATD-2026-0842',
            nomeExame: 'Coagulograma (Citrato)',
            instrucoesJejumHoras: 4,
            horarioLimiteColeta: '11h30'
          }
    );
  }, [nomeCivil, nomeSocial, pronomes, whatsapp, identidadeGenero, tipoPreview]);

  // Busca simples de CEP via ViaCEP para UX refinada Apple
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEPInput(e.target.value);
    setCep(formatted);
    const raw = formatted.replace(/\D/g, '');
    if (raw.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setLogradouro(data.logradouro);
          if (data.bairro) setBairro(data.bairro);
          if (data.localidade) setCidade(data.localidade);
          if (data.uf) setEstado(data.uf);
        }
      } catch {
        // Fallback silencioso mantendo entrada manual disponível
      }
    }
  };

  // Validação estrita dos campos conforme RDC 786/2023
  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!nomeCivil.trim()) {
      novosErros.nomeCivil = 'O Nome Completo Civil (documento oficial) é obrigatório.';
    }

    if (!nomeMae.trim()) {
      novosErros.nomeMae = 'O Nome da Mãe é obrigatório para rastreabilidade e prevenção de homônimos.';
    }

    if (!dataNascimento) {
      novosErros.dataNascimento = 'A Data de Nascimento é indispensável para calibração dos laudos.';
    }

    const rawWhatsapp = whatsapp.replace(/\D/g, '');
    if (!rawWhatsapp || rawWhatsapp.length < 10) {
      novosErros.whatsapp = 'Informe um WhatsApp válido com DDD para envio de laudos.';
    }

    if (tipoFaturamento === 'convenio') {
      if (!convenioNome) {
        novosErros.convenioNome = 'Selecione a operadora do convênio.';
      }
      if (!convenioCarteira.trim()) {
        novosErros.convenioCarteira = 'Informe o número da carteirinha do plano.';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Submissão do Cadastro
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setSubmitting(true);

    const novoPaciente: Patient = {
      id: initialData?.id || `pac_${Date.now()}`,
      nomeCivil: nomeCivil.trim(),
      nomeSocial: nomeSocial.trim() || undefined,
      pronomes,
      identidadeGenero,
      cpf: cpf.trim() || undefined,
      rg: rg.trim() || undefined,
      orgaoEmissor: orgaoEmissor.trim() || undefined,
      nomeMae: nomeMae.trim(),
      nomePai: nomePai.trim() || undefined,
      cep: cep.trim() || undefined,
      logradouro: logradouro.trim() || undefined,
      numero: numero.trim() || undefined,
      complemento: complemento.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cidade: cidade.trim() || undefined,
      estado: estado || 'SP',
      zonaRural,
      sexoBiologico,
      dataNascimento,
      tipoFaturamento,
      convenioNome: tipoFaturamento === 'convenio' ? convenioNome : undefined,
      convenioCarteira: tipoFaturamento === 'convenio' ? convenioCarteira.trim() : undefined,
      whatsapp: whatsapp.trim(),
      email: email.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Campos de retrocompatibilidade
      nomeCompleto: nomeSocial.trim() || nomeCivil.trim(),
      telefoneWhatsapp: whatsapp.trim()
    };

    // Persistência local no ecossistema LIMS
    savePacienteStorage({
      id: novoPaciente.id,
      nomeCompleto: novoPaciente.nomeCompleto || novoPaciente.nomeSocial || novoPaciente.nomeCivil,
      nomeCivil: novoPaciente.nomeCivil,
      nomeSocial: novoPaciente.nomeSocial,
      pronomes: novoPaciente.pronomes,
      identidadeGenero: novoPaciente.identidadeGenero,
      cpf: novoPaciente.cpf || '000.000.000-00',
      rg: novoPaciente.rg,
      orgaoEmissor: novoPaciente.orgaoEmissor,
      nomeMae: novoPaciente.nomeMae,
      nomePai: novoPaciente.nomePai,
      cep: novoPaciente.cep,
      logradouro: novoPaciente.logradouro,
      numero: novoPaciente.numero,
      complemento: novoPaciente.complemento,
      bairro: novoPaciente.bairro,
      cidade: novoPaciente.cidade,
      estado: novoPaciente.estado,
      zonaRural: novoPaciente.zonaRural,
      dataNascimento: novoPaciente.dataNascimento,
      sexoBiologico: (novoPaciente.sexoBiologico.toUpperCase() as SexoBiologico) || 'FEMININO',
      telefoneWhatsapp: novoPaciente.whatsapp,
      whatsapp: novoPaciente.whatsapp,
      email: novoPaciente.email || '',
      tipoFaturamento: novoPaciente.tipoFaturamento,
      convenioNome: novoPaciente.convenioNome,
      convenioCarteira: novoPaciente.convenioCarteira,
      dataCadastro: 'Agora'
    });

    setTimeout(() => {
      setSubmitting(false);
      setSucesso(true);
      if (onSuccess) {
        onSuccess(novoPaciente);
      }
    }, 600);
  };

  return (
    // Recuo no container max-w-6xl garantindo que o formulário inicie perfeitamente abaixo do banner amarelo de Demonstração
    <div className={`w-full max-w-6xl mx-auto space-y-8 font-sans ${className !== undefined ? className : 'pt-16'}`}>
      
      {/* =========================================================
          CABEÇALHO COM ESTÉTICA APPLE HIG: MINIMALISMO & RESPIRO
          ========================================================= */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                NotusLab Humanizado & Inclusivo
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Rastreabilidade RDC 786/2023
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-['Outfit']">
              Cadastro de Paciente
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Segregação inteligente entre acolhimento social, documentação para homônimos, logística domiciliar, parâmetros clínicos e faturamento.
            </p>
          </div>

          {/* Status Dinâmico de Identificação na Recepção */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm">
              {nomeExibicao.slice(0, 2).toUpperCase() || 'NL'}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Chamada no Totem/Painel:</div>
              <div className="text-sm font-semibold text-slate-800">
                {nomeExibicao || 'Aguardando preenchimento...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {sucesso && (
        <div className="p-4 rounded-3xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 flex items-center justify-between animate-fadeIn transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Paciente cadastrado(a) com sucesso no NotusLab LIMS!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Rastreabilidade de homônimos registrada, dados de coleta sincronizados e nome social configurado para os painéis.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSucesso(false)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline ml-4 cursor-pointer"
          >
            Dispensar
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* =========================================================
            CARD: ACOLHIMENTO & IDENTIDADE SOCIAL
            ========================================================= */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 ease-out">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-['Outfit']">
                Acolhimento & Identidade Social
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Respeito à individualidade do paciente conforme normativas de direitos humanos e acolhimento em saúde.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nome Social */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  Nome Social
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700">
                    Prioritário
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Exibido na recepção</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Maya, Alex, Beatriz (opcional)"
                value={nomeSocial}
                onChange={(e) => setNomeSocial(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* Pronomes */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Pronomes de Tratamento <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Saudação: <strong className="text-violet-700 font-semibold">{saudacaoInclusiva}</strong>
                </span>
              </label>
              <select
                value={pronomes}
                onChange={(e) => setPronomes(e.target.value as Pronomes)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm transition-all duration-300 outline-none cursor-pointer"
              >
                {PRONOMES_OPCOES.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao} {opcao === 'Ela/Dela' ? '(Prezada)' : opcao === 'Ele/Dele' ? '(Prezado)' : '(Olá)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Identidade de Gênero */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Identidade de Gênero
              </label>
              <select
                value={identidadeGenero}
                onChange={(e) => setIdentidadeGenero(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm transition-all duration-300 outline-none cursor-pointer"
              >
                {IDENTIDADES_GENERO.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info-Text Apple Style */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 flex items-start gap-3">
            <div className="p-1 rounded-xl bg-violet-100 text-violet-700 mt-0.5 flex-shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-900">Respeito e Privacidade no NotusLab:</span> O{' '}
              <strong className="text-violet-900">Nome Social</strong> é garantido por lei e será o único nome visualizado
              nos totens, monitores da recepção, chamadas por voz na coleta e nas notificações humanizadas. O Nome Civil permanecerá
              protegido para fins fiscais e faturamento.
            </div>
          </div>
        </section>

        {/* =========================================================
            CARD 1: DOCUMENTAÇÃO CIVIL E FILIAÇÃO
            (RASTREABILIDADE CLÍNICA E DESEMPATE DE HOMÔNIMOS)
            ========================================================= */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 ease-out">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <UserSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-['Outfit']">
                Documentação Civil e Filiação
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dados legais e critérios de desempate para homônimos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome Completo (Nome Civil) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Nome Completo (Nome Civil) <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Documento oficial</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: MARIA APARECIDA DA SILVA"
                value={nomeCivil}
                onChange={(e) => setNomeCivil(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl bg-gray-50 border ${
                  erros.nomeCivil ? 'border-rose-400 bg-rose-50/20' : 'border-transparent'
                } focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none`}
              />
              {erros.nomeCivil && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {erros.nomeCivil}
                </p>
              )}
            </div>

            {/* CPF (com formatação) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>CPF (com formatação)</span>
                <span className="text-[10px] text-slate-400 font-normal">Identificador único</span>
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPFInput(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 font-numeric tracking-tight text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* RG */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                RG
              </label>
              <input
                type="text"
                placeholder="00.000.000-0"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 font-numeric tracking-tight text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* Órgão Emissor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Órgão Emissor
              </label>
              <input
                type="text"
                placeholder="SSP/SP"
                value={orgaoEmissor}
                onChange={(e) => setOrgaoEmissor(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* Nome da Mãe (Obrigatório para rastreabilidade) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Nome da Mãe <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  Rastreabilidade & Homônimos
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="Nome completo da mãe"
                value={nomeMae}
                onChange={(e) => setNomeMae(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl bg-gray-50 border ${
                  erros.nomeMae ? 'border-rose-400 bg-rose-50/20' : 'border-transparent'
                } focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none`}
              />
              {erros.nomeMae && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {erros.nomeMae}
                </p>
              )}
            </div>

            {/* Nome do Pai (Opcional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Nome do Pai</span>
                <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
              </label>
              <input
                type="text"
                placeholder="Nome completo do pai (se houver)"
                value={nomePai}
                onChange={(e) => setNomePai(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            CARD 2: ENDEREÇO COMPLETO E LOGÍSTICA
            (COLETAS DOMICILIARES E ROTAS PRÉ-ANALÍTICAS)
            ========================================================= */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 ease-out">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-['Outfit']">
                Endereço e Logística de Coleta
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Localização para atendimento domiciliar e rotas logísticas pré-analíticas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* CEP */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>CEP</span>
                <span className="text-[10px] text-slate-400 font-normal">Autobusca</span>
              </label>
              <input
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={handleCepChange}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 font-numeric tracking-tight text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* Logradouro */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Logradouro
              </label>
              <input
                type="text"
                placeholder="Rua, Avenida, Estrada..."
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* Número */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Número
              </label>
              <input
                type="text"
                placeholder="123 ou S/N"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 font-numeric tracking-tight text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* Complemento */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Complemento
              </label>
              <input
                type="text"
                placeholder="Apto 42, Bloco B..."
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* Bairro */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Bairro
              </label>
              <input
                type="text"
                placeholder="Bairro ou Distrito"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* Cidade */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Cidade
              </label>
              <input
                type="text"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none"
              />
            </div>

            {/* Estado (UF) */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Estado (UF)
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm transition-all duration-300 outline-none cursor-pointer"
              >
                {ESTADOS_BRASIL.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* REQUISITO ESPECIAL DE UX: TOGGLE/CHECKBOX ESTILO APPLE */}
          <div 
            onClick={() => setZonaRural(!zonaRural)}
            className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50/80 border border-emerald-100/80 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-200">
                <Trees className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block group-hover:text-emerald-950 transition-colors">
                  Reside em Zona Rural / Interior
                </span>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Sinaliza necessidade de logística especial para cálculo de rotas de coleta domiciliar.
                </p>
              </div>
            </div>

            {/* Apple Switch Toggle com feedback fluido */}
            <button
              type="button"
              role="switch"
              aria-checked={zonaRural}
              onClick={(e) => {
                e.stopPropagation();
                setZonaRural(!zonaRural);
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                zonaRural ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  zonaRural ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* =========================================================
            CARD: PARÂMETROS CLÍNICOS (DADOS TÉCNICOS PARA LAUDOS)
            ========================================================= */}
        <section className="bg-gradient-to-br from-amber-50/40 via-white/90 to-slate-50/70 backdrop-blur-md rounded-3xl border-2 border-amber-200/60 p-6 md:p-8 shadow-xl shadow-amber-900/5 hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-300 ease-out relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit']">
                    Parâmetros Clínicos
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900 border border-amber-300/60">
                    Dados Técnicos Restritos
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isolamento técnico para parametrização algorítmica de laudos laboratoriais.
                </p>
              </div>
            </div>

            {idadeCalculada && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-amber-200/80 shadow-xs self-start sm:self-auto">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-xs text-slate-500">Idade Calculada:</span>
                <span className="text-xs font-bold text-amber-900 font-numeric tracking-tight">
                  {idadeCalculada}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sexo Biológico */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Sexo Biológico (Referencial Clínico) <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-amber-800 font-medium">Calibração LIMS</span>
              </label>

              {/* Segmented Control no estilo Apple */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-200/50 border border-slate-200">
                {(['Feminino', 'Masculino', 'Intersexo'] as SexoBiologicoClinico[]).map((opcao) => {
                  const ativo = sexoBiologico === opcao;
                  return (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => setSexoBiologico(opcao)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ease-out flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                        ativo
                          ? 'bg-white text-slate-900 shadow-md shadow-black/5 border border-slate-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                      }`}
                    >
                      {opcao}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data de Nascimento com Space Grotesk */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Data de Nascimento <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Cálculo de faixas etárias</span>
              </label>
              <input
                type="date"
                required
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-2xl bg-white border ${
                  erros.dataNascimento ? 'border-rose-400 bg-rose-50/20' : 'border-amber-200/80'
                } text-slate-900 font-numeric tracking-tight text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-300`}
              />
              {erros.dataNascimento && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {erros.dataNascimento}
                </p>
              )}
            </div>
          </div>

          {/* Justificativa Técnica / RDC 786 */}
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/50 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] leading-relaxed text-amber-900">
              <strong>Nota Técnica Laboratorial:</strong> O sexo biológico e a idade cronológica são empregados
              <strong> exclusivamente</strong> pelo motor de laudos para selecionar os intervalos de referência biológicos
              (ex: hemoglobina, ferritina, creatinina e painéis hormonais), conforme preconizado pela Sociedade Brasileira
              de Patologia Clínica/Medicina Laboratorial (SBPC/ML) e pela RDC 786/2023.
            </p>
          </div>
        </section>

        {/* =========================================================
            CARD: FATURAMENTO & COBERTURA (PARTICULAR VS CONVÊNIO)
            ========================================================= */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 ease-out">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit']">
                Faturamento & Cobertura
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Definição do modelo de custeio e integração com faturamento TUSS.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Toggle Button estilo Apple Segmented Control */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Modalidade de Atendimento
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setTipoFaturamento('particular')}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center gap-2 active:scale-[0.98] ${
                    tipoFaturamento === 'particular'
                      ? 'bg-white text-slate-900 shadow-md shadow-black/5 border border-slate-200/70'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Particular
                </button>
                <button
                  type="button"
                  onClick={() => setTipoFaturamento('convenio')}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center gap-2 active:scale-[0.98] ${
                    tipoFaturamento === 'convenio'
                      ? 'bg-white text-emerald-700 shadow-md shadow-black/5 border border-slate-200/70'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Convênio de Saúde
                </button>
              </div>
            </div>

            {/* Campos Condicionais de Convênio */}
            {tipoFaturamento === 'convenio' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-emerald-50/30 border border-emerald-100 transition-all duration-300 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Operadora do Convênio <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={convenioNome}
                    onChange={(e) => setConvenioNome(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm transition-all duration-300 outline-none cursor-pointer"
                  >
                    {CONVENIOS_BRASIL.map((conv) => (
                      <option key={conv} value={conv}>
                        {conv}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Número da Carteirinha <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">Identificador do Beneficiário</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 0023.9482.0192-00"
                    value={convenioCarteira}
                    onChange={(e) => setConvenioCarteira(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl bg-gray-50 border ${
                      erros.convenioCarteira ? 'border-rose-400 bg-rose-50/20' : 'border-transparent'
                    } focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 font-numeric tracking-tight text-sm transition-all duration-300 outline-none`}
                  />
                  {erros.convenioCarteira && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {erros.convenioCarteira}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Atendimento na modalidade <strong>Particular</strong>: Tabela de preços diretos do NotusLab com emissão de nota fiscal
                  eletrônica vinculada ao CPF do paciente.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            CARD: CANAIS DE CONTATO & SIMULADOR DE MENSAGERIA INCLUSIVA
            ========================================================= */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 ease-out">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit']">
                Canais de Contato & Notificação Automatizada
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Envio prioritário de laudos, convocações e recoletas humanizadas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>WhatsApp do Paciente <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Padrão E.164</span>
              </label>
              <input
                type="text"
                required
                placeholder="+55 (11) 98765-4321"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatPhoneInput(e.target.value))}
                className={`w-full px-4 py-3 rounded-2xl bg-gray-50 border ${
                  erros.whatsapp ? 'border-rose-400 bg-rose-50/20' : 'border-transparent'
                } focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 font-numeric tracking-tight text-sm transition-all duration-300 outline-none`}
              />
              {erros.whatsapp && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {erros.whatsapp}
                </p>
              )}
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>E-mail para Laudo Criptografado</span>
                <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
              </label>
              <input
                type="email"
                placeholder="paciente@exemplo.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300 outline-none"
              />
            </div>
          </div>

          {/* SIMULADOR WHATSAPP APPLE HIG */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Simulador de Comunicação Inclusiva (WhatsApp NotusLab)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTipoPreview('LAUDO_LIBERADO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                    tipoPreview === 'LAUDO_LIBERADO'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Laudo Pronto
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPreview('SOLICITACAO_RECOLETA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                    tipoPreview === 'SOLICITACAO_RECOLETA'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Recoleta Técnica
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPreview('CONFIRMACAO_CADASTRO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                    tipoPreview === 'CONFIRMACAO_CADASTRO'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Boas-Vindas
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 rounded-3xl bg-slate-900 text-slate-100 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Destinatário: <strong className="text-white">{previewMensagem.destinatario.nomeParaContato}</strong></span>
                  <span className="font-numeric tracking-tight text-slate-400">({previewMensagem.destinatario.telefoneWhatsapp})</span>
                </div>
                <span className="text-[11px] text-slate-500 font-numeric tracking-tight">Criptografia Ponta a Ponta</span>
              </div>
              <div className="max-w-xl bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-line font-sans shadow-md">
                {previewMensagem.mensagemFormatada}
              </div>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>O motor priorizou automaticamente o <strong>Nome Social</strong> ({previewMensagem.destinatario.nomeParaContato}) e a saudação <strong>{saudacaoInclusiva}</strong>.</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            BARRA DE AÇÕES INFERIOR (APPLE HIG FOOTER)
            ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 pb-8">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200/80 text-sm font-semibold text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-800 hover:to-indigo-800 text-white text-sm font-semibold shadow-xl shadow-violet-700/20 hover:shadow-2xl hover:shadow-violet-700/30 transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gravando no LIMS...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Concluir Cadastro Inclusivo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationForm;
