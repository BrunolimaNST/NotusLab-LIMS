import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { logoCinesi, logoVitality } from '../assets';
import {
  FileText,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Sparkles,
  Search,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';

interface ResultadoExame {
  analito: string;
  resultado: string;
  unidade: string;
  referencia: string;
  metodo: string;
  flag?: 'NORMAL' | 'ELEVADO' | 'BAIXO' | 'CRITICO';
}

interface GrupoExame {
  titulo: string;
  setor: string;
  amostra: string;
  resultados: ResultadoExame[];
  observacoesTecnicas?: string;
}

interface DadosLaudo {
  protocolo: string;
  pacienteNome: string;
  cpf: string;
  idade: string;
  sexo: string;
  dataNascimento: string;
  medicoSolicitante: string;
  crm: string;
  dataColeta: string;
  dataLiberacao: string;
  hashAutenticidade: string;
  grupos: GrupoExame[];
}

// Bateria padrão de exames completos (Hemograma + Bioquímica + TSH)
const GRUPOS_PADRAO: GrupoExame[] = [
  {
    titulo: 'HEMOGRAMA COMPLETO',
    setor: 'Hematologia Automatizada',
    amostra: 'Sangue Total com EDTA K2/K3',
    observacoesTecnicas: 'Citometria de fluxo com fluorescência laser e impedância hidrodinâmica focada.',
    resultados: [
      { analito: 'Eritrócitos (Hemácias)', resultado: '4.85', unidade: 'milhões/mm³', referencia: '4.30 a 5.70', metodo: 'Impedância Elétrica', flag: 'NORMAL' },
      { analito: 'Hemoglobina', resultado: '14.6', unidade: 'g/dL', referencia: '13.5 a 17.5', metodo: 'Cianometa-SLS', flag: 'NORMAL' },
      { analito: 'Hematócrito', resultado: '43.8', unidade: '%', referencia: '39.0 a 50.0', metodo: 'Cálculo automatizado', flag: 'NORMAL' },
      { analito: 'VCM (Volume Corpuscular Médio)', resultado: '90.3', unidade: 'fL', referencia: '80.0 a 98.0', metodo: 'Cálculo automatizado', flag: 'NORMAL' },
      { analito: 'HCM', resultado: '30.1', unidade: 'pg', referencia: '27.0 a 32.0', metodo: 'Cálculo automatizado', flag: 'NORMAL' },
      { analito: 'Leucócitos Totais', resultado: '6.450', unidade: '/mm³', referencia: '4.000 a 11.000', metodo: 'Citometria Fluorescente', flag: 'NORMAL' },
      { analito: 'Segmentados (Neutrófilos)', resultado: '58.0 (3.741)', unidade: '% (/mm³)', referencia: '40.0 a 70.0%', metodo: 'Citometria Fluorescente', flag: 'NORMAL' },
      { analito: 'Linfócitos', resultado: '32.0 (2.064)', unidade: '% (/mm³)', referencia: '20.0 a 45.0%', metodo: 'Citometria Fluorescente', flag: 'NORMAL' },
      { analito: 'Plaquetas', resultado: '248.000', unidade: '/mm³', referencia: '150.000 a 450.000', metodo: 'Impedância Focada', flag: 'NORMAL' },
    ],
  },
  {
    titulo: 'BIOQUÍMICA SÉRICA & METABÓLICA',
    setor: 'Bioquímica Clínica',
    amostra: 'Soro (Tubo Seco c/ Gel Separador)',
    observacoesTecnicas: 'Amostra límpida, ausência de hemólise, lipemia ou icterícia na espectrofotometria.',
    resultados: [
      { analito: 'Glicose de Jejum', resultado: '89.0', unidade: 'mg/dL', referencia: '70.0 a 99.0', metodo: 'Hexoquinase UV', flag: 'NORMAL' },
      { analito: 'Creatinina Sérica', resultado: '0.92', unidade: 'mg/dL', referencia: '0.70 a 1.20', metodo: 'Jaffé Cinético Rastreado IDMS', flag: 'NORMAL' },
      { analito: 'Taxa de Filtração Glomerular (eGFR)', resultado: '> 90', unidade: 'mL/min/1.73m²', referencia: 'Superior a 60 mL/min', metodo: 'Equação CKD-EPI 2021', flag: 'NORMAL' },
      { analito: 'Colesterol Total', resultado: '184', unidade: 'mg/dL', referencia: 'Desejável < 190', metodo: 'Enzimático Colorimétrico Trinder', flag: 'NORMAL' },
      { analito: 'Colesterol HDL', resultado: '54', unidade: 'mg/dL', referencia: 'Desejável > 40', metodo: 'Homogêneo Direto sem precipitação', flag: 'NORMAL' },
      { analito: 'Colesterol LDL (Calculado)', resultado: '106', unidade: 'mg/dL', referencia: 'Desejável < 130', metodo: 'Fórmula Martin-Hopkins', flag: 'NORMAL' },
      { analito: 'Triglicerídeos', resultado: '120', unidade: 'mg/dL', referencia: 'Desejável < 150', metodo: 'GPO-PAP Enzimático', flag: 'NORMAL' },
      { analito: 'Potássio Sérico (K+)', resultado: '4.4', unidade: 'mEq/L', referencia: '3.5 a 5.1', metodo: 'Eletrodo Íon Seletivo Direto (ISE)', flag: 'NORMAL' },
    ],
  },
  {
    titulo: 'ENDOCRINOLOGIA & IMUNODIAGNÓSTICO',
    setor: 'Imunologia e Hormônios',
    amostra: 'Soro',
    observacoesTecnicas: 'Ensaio imunométrico de 3ª geração com calibração contra padrão OMS.',
    resultados: [
      { analito: 'TSH - Hormônio Tireoestimulante', resultado: '2.15', unidade: 'mcUI/mL', referencia: '0.40 a 4.30', metodo: 'Quimioluminescência Paramagnética', flag: 'NORMAL' },
    ],
  },
];

// Base mock de laudos específicos vinculados aos pacientes da bancada de coleta
const MOCK_LAUDOS: Record<string, DadosLaudo> = {
  'ATD-2026-0005': {
    protocolo: 'ATD-2026-0005',
    pacienteNome: 'Juliana Silveira Rocha',
    cpf: '341.582.901-89',
    idade: '34 anos',
    sexo: 'Feminino',
    dataNascimento: '22/08/1992',
    medicoSolicitante: 'Dra. Beatriz Siqueira',
    crm: 'CRM-SP 194.220',
    dataColeta: '03/10/2026 07:50',
    dataLiberacao: '03/10/2026 13:20',
    hashAutenticidade: 'e7a4b82d91f43c08b291d547893a20145698bcdae01478f09d83a17e456920cb',
    grupos: [
      {
        titulo: 'BIOQUÍMICA SÉRICA & PERFIL LIPÍDICO COMPLETO',
        setor: 'Bioquímica Clínica',
        amostra: 'Soro (Tubo Seco c/ Gel Separador)',
        observacoesTecnicas: 'Amostra processada em duplicata com controles de calibração validados pelo PNCQ.',
        resultados: [
          { analito: 'Colesterol Total', resultado: '172', unidade: 'mg/dL', referencia: 'Desejável < 190', metodo: 'Enzimático Colorimétrico', flag: 'NORMAL' },
          { analito: 'Colesterol HDL', resultado: '58', unidade: 'mg/dL', referencia: 'Desejável > 40', metodo: 'Homogêneo Direto', flag: 'NORMAL' },
          { analito: 'Colesterol Não-HDL', resultado: '114', unidade: 'mg/dL', referencia: 'Desejável < 130', metodo: 'Cálculo', flag: 'NORMAL' },
          { analito: 'Colesterol LDL (Direto)', resultado: '94', unidade: 'mg/dL', referencia: 'Desejável < 130', metodo: 'Fórmula Martin-Hopkins', flag: 'NORMAL' },
          { analito: 'Triglicerídeos', resultado: '100', unidade: 'mg/dL', referencia: 'Desejável < 150', metodo: 'GPO-PAP Enzimático', flag: 'NORMAL' },
          { analito: 'Glicemia de Jejum', resultado: '84.0', unidade: 'mg/dL', referencia: '70.0 a 99.0', metodo: 'Hexoquinase UV', flag: 'NORMAL' },
        ],
      },
      {
        titulo: 'ENDOCRINOLOGIA & MARCADORES METABÓLICOS',
        setor: 'Imunologia e Hormônios',
        amostra: 'Soro',
        observacoesTecnicas: 'Calibração rastreada pelo padrão internacional OMS.',
        resultados: [
          { analito: 'TSH - Hormônio Tireoestimulante', resultado: '1.84', unidade: 'mcUI/mL', referencia: '0.40 a 4.30', metodo: 'Quimioluminescência Paramagnética', flag: 'NORMAL' },
          { analito: '25-Hidroxivitamina D [25(OH)D]', resultado: '38.2', unidade: 'ng/mL', referencia: 'Desejável > 30.0', metodo: 'Quimioluminescência', flag: 'NORMAL' },
        ],
      },
    ],
  },
  'ATD-2026-0004': {
    protocolo: 'ATD-2026-0004',
    pacienteNome: 'Carlos Eduardo Mendes',
    cpf: '219.840.119-45',
    idade: '45 anos',
    sexo: 'Masculino',
    dataNascimento: '10/02/1981',
    medicoSolicitante: 'Dr. André Fagundes',
    crm: 'CRM-SP 173.882',
    dataColeta: '03/10/2026 09:40',
    dataLiberacao: '03/10/2026 14:10',
    hashAutenticidade: 'c8192a4f09d83a17e456920cb9a117ef84201d547893a20145698bcdae01478b',
    grupos: [
      {
        titulo: 'COAGULAÇÃO & HEMOSTASIA',
        setor: 'Hematologia e Hemostasia',
        amostra: 'Plasma Citratado (Citrato de Sódio 3,2%)',
        observacoesTecnicas: 'Plasma centrifugado a 2500g por 15 min. Ausência de microcoágulos ou hemólise.',
        resultados: [
          { analito: 'Tempo de Protrombina (TP)', resultado: '12.4', unidade: 'segundos', referencia: '11.0 a 14.5 s', metodo: 'Coagulométrico Foto-Óptico', flag: 'NORMAL' },
          { analito: 'Atividade de Protrombina', resultado: '92.0', unidade: '%', referencia: '70.0 a 100.0%', metodo: 'Cálculo automatizado', flag: 'NORMAL' },
          { analito: 'RNI (INR)', resultado: '1.04', unidade: 'índice', referencia: '0.80 a 1.20', metodo: 'Normalizado OMS (ISI 1.02)', flag: 'NORMAL' },
          { analito: 'Tempo de Tromboplastina Parcial Ativada (TTPA)', resultado: '29.8', unidade: 'segundos', referencia: '24.0 a 36.0 s', metodo: 'Coagulométrico c/ Sílica', flag: 'NORMAL' },
          { analito: 'Relação Paciente / Controle (TTPA)', resultado: '0.98', unidade: 'relação', referencia: '0.80 a 1.20', metodo: 'Cálculo automatizado', flag: 'NORMAL' },
          { analito: 'Fibrinogênio Plasmático', resultado: '285', unidade: 'mg/dL', referencia: '200 a 400 mg/dL', metodo: 'Clauss Modificado', flag: 'NORMAL' },
        ],
      },
    ],
  },
  'ATD-2026-0001': {
    protocolo: 'ATD-2026-0001',
    pacienteNome: 'João Silva',
    cpf: '452.193.884-12',
    idade: '28 anos',
    sexo: 'Masculino',
    dataNascimento: '05/11/1997',
    medicoSolicitante: 'Dr. Marcelo Pimentel',
    crm: 'CRM-SP 165.404',
    dataColeta: '03/10/2026 08:35',
    dataLiberacao: '03/10/2026 12:40',
    hashAutenticidade: '3a17e456920cb9a117ef84201d547893a20145698bcdae01478bc8192a4f09d8',
    grupos: [
      {
        titulo: 'HEMOGRAMA COMPLETO & CONTAGEM DE PLAQUETAS',
        setor: 'Hematologia Automatizada',
        amostra: 'Sangue Total com EDTA K2/K3',
        observacoesTecnicas: 'Citometria de fluxo com fluorescência laser e impedância hidrodinâmica focada.',
        resultados: [
          { analito: 'Eritrócitos (Hemácias)', resultado: '5.10', unidade: 'milhões/mm³', referencia: '4.30 a 5.70', metodo: 'Impedância Elétrica', flag: 'NORMAL' },
          { analito: 'Hemoglobina', resultado: '15.2', unidade: 'g/dL', referencia: '13.5 a 17.5', metodo: 'Cianometa-SLS', flag: 'NORMAL' },
          { analito: 'Hematócrito', resultado: '45.1', unidade: '%', referencia: '39.0 a 50.0', metodo: 'Cálculo automatizado', flag: 'NORMAL' },
          { analito: 'Leucócitos Totais', resultado: '7.200', unidade: '/mm³', referencia: '4.000 a 11.000', metodo: 'Citometria Fluorescente', flag: 'NORMAL' },
          { analito: 'Plaquetas', resultado: '265.000', unidade: '/mm³', referencia: '150.000 a 450.000', metodo: 'Impedância Focada', flag: 'NORMAL' },
        ],
      },
    ],
  },
};

// Sugestões de atendimento para cliques rápidos durante apresentação
const SUGESTOES_DEMO = [
  {
    protocolo: 'ATD-2026-0005',
    paciente: 'Juliana Silveira Rocha',
    exame: 'Perfil Lipídico Completo & Bioquímica',
    status: 'Liberada na Bancada',
  },
  {
    protocolo: 'ATD-2026-0004',
    paciente: 'Carlos Eduardo Mendes',
    exame: 'Coagulograma Completo (TP + TTPA)',
    status: 'Liberada na Bancada',
  },
  {
    protocolo: 'ATD-2026-0001',
    paciente: 'João Silva',
    exame: 'Hemograma Completo & Plaquetas',
    status: 'Liberada na Bancada',
  },
  {
    protocolo: 'ATD-2026-0042',
    paciente: 'Carlos Eduardo Meirelles',
    exame: 'Hemograma + Bioquímica + Hormônios',
    status: 'Painel Ambulatorial',
  },
];

export const LaudoPage: React.FC = () => {
  const { config, tenant } = useTheme();
  const location = useLocation();

  // Estados de busca e visualização dinâmica
  const [termoBusca, setTermoBusca] = useState('');
  const [isBuscando, setIsBuscando] = useState(false);
  const [laudoVisivel, setLaudoVisivel] = useState(false);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [dadosLaudo, setDadosLaudo] = useState<DadosLaudo | null>(null);
  const [copiadoHash, setCopiadoHash] = useState(false);

  const clientLogo = config.logoUrl || (tenant === 'CINESI' ? logoCinesi : logoVitality);

  // Localiza um laudo mock cadastrado ou gera dados dinâmicos autênticos para qualquer pesquisa
  const obterOuGerarLaudo = useCallback((termo: string, pacienteHint?: string): DadosLaudo => {
    const termoLimpo = termo.trim().toUpperCase();

    // 1. Verifica correspondência direta de protocolo
    if (MOCK_LAUDOS[termoLimpo]) {
      return MOCK_LAUDOS[termoLimpo];
    }

    // 2. Verifica correspondência por CPF ou nome do paciente
    for (const laudo of Object.values(MOCK_LAUDOS)) {
      if (
        laudo.cpf.replace(/\D/g, '').includes(termoLimpo.replace(/\D/g, '')) ||
        laudo.pacienteNome.toUpperCase().includes(termoLimpo)
      ) {
        return laudo;
      }
    }

    // 3. Geração dinâmica inteligente para qualquer outro termo/protocolo pesquisado
    const protocoloFormatado = termoLimpo.startsWith('ATD')
      ? termoLimpo
      : termoLimpo.length >= 4
        ? `ATD-2026-${termoLimpo}`
        : `NOTUS-${tenant}-2026-98124`;

    const nomePaciente = pacienteHint || (termo.length > 3 && !termo.includes('-') && !/\d/.test(termo)
      ? termo
      : 'Carlos Eduardo Meirelles');

    const cpfFormatado = termo.includes('.')
      ? termo
      : '123.***.***-00';

    return {
      protocolo: protocoloFormatado,
      pacienteNome: nomePaciente,
      cpf: cpfFormatado,
      idade: '42 anos',
      sexo: 'Masculino',
      dataNascimento: '14/05/1984',
      medicoSolicitante: 'Dr. Roberto Guimarães',
      crm: 'CRM-SP 182.901',
      dataColeta: '03/10/2026 07:45',
      dataLiberacao: '03/10/2026 13:20',
      hashAutenticidade: 'a9f8c47b31e5d26804bb71a938c129e6fd70281b392476ec5a1098dfc3821092',
      grupos: GRUPOS_PADRAO,
    };
  }, [tenant]);

  // Executa o fluxo de busca com simulação de loading de 1 segundo
  const executarPesquisa = useCallback((termo: string, pacienteHint?: string) => {
    if (!termo.trim()) {
      setErroBusca('Por favor, informe o protocolo de atendimento ou o CPF do paciente.');
      return;
    }

    setErroBusca(null);
    setIsBuscando(true);

    setTimeout(() => {
      const laudoEncontrado = obterOuGerarLaudo(termo, pacienteHint);
      setDadosLaudo(laudoEncontrado);
      setIsBuscando(false);
      setLaudoVisivel(true);
    }, 1000);
  }, [obterOuGerarLaudo]);

  // Disparo manual pelo botão ou tecla Enter
  const handleDispararPesquisa = () => {
    executarPesquisa(termoBusca);
  };

  // Botão para reiniciar o estado e voltar à tela limpa de pesquisa
  const handleVoltarPesquisa = () => {
    setLaudoVisivel(false);
    setIsBuscando(false);
    setTermoBusca('');
    setErroBusca(null);
    setDadosLaudo(null);

    // Limpa o estado da rota no navegador para evitar reabertura involuntária
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title);
    }
  };

  // Integração com navegação direta vinda de outras telas (ex: ColetaPage na bancada)
  useEffect(() => {
    const state = location.state as { protocolo?: string; pacienteNome?: string } | null;
    if (state?.protocolo) {
      setTermoBusca(state.protocolo);
      executarPesquisa(state.protocolo, state.pacienteNome);
    }
  }, [location.state, executarPesquisa]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiadoHash(true);
    setTimeout(() => setCopiadoHash(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">

      {/* ========================================================================= */}
      {/* ESTADO 1: TELA INICIAL DE PESQUISA E VALIDAÇÃO DE LAUDOS                  */}
      {/* ========================================================================= */}
      {!laudoVisivel && (
        <div className="max-w-2xl mx-auto py-6 sm:py-12 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 border-t-4 border-primary shadow-xl p-6 sm:p-10 space-y-6">

            {/* Cabeçalho do Card */}
            <div className="text-center space-y-2">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md mb-3"
                style={{ backgroundColor: config.cores.primary }}
              >
                <FileText className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
                Consulta e Emissão de Laudos
              </h1>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Informe o Protocolo de Atendimento ou o CPF do paciente para visualizar o documento oficial autenticado com certificação ICP-Brasil.
              </p>
            </div>

            {/* Formulário de Busca */}
            <div className="space-y-4 pt-2">
              <div>
                <label
                  htmlFor="input-protocolo"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Protocolo de Atendimento ou CPF
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    id="input-protocolo"
                    type="text"
                    value={termoBusca}
                    onChange={(e) => {
                      setTermoBusca(e.target.value);
                      if (erroBusca) setErroBusca(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleDispararPesquisa();
                    }}
                    placeholder="Ex: ATD-2026-0005 ou 123.456.789-00"
                    disabled={isBuscando}
                    className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all disabled:opacity-60"
                  />
                  {termoBusca && !isBuscando && (
                    <button
                      type="button"
                      onClick={() => setTermoBusca('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Limpar pesquisa"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {erroBusca && (
                  <p className="text-xs text-rose-600 font-semibold mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {erroBusca}
                  </p>
                )}
              </div>

              {/* Botão Primário com Estado de Loading */}
              <button
                type="button"
                onClick={handleDispararPesquisa}
                disabled={isBuscando || !termoBusca.trim()}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-primary hover:bg-secondary text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isBuscando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Localizando laudo na base de dados...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Pesquisar Laudo</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulação Visual de Carregamento (Loading de 1 segundo) */}
            {isBuscando && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5 animate-pulse">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: config.cores.primary }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Validando integridade criptográfica ICP-Brasil...</p>
                  <p className="text-slate-500 text-[11px]">Buscando dados analíticos e assinaturas de bancada.</p>
                </div>
              </div>
            )}

            {/* Atalhos Rápidos para Demonstração */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Atalhos Rápidos de Demonstração (Bancada de Coleta):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGESTOES_DEMO.map((sugestao, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTermoBusca(sugestao.protocolo);
                      executarPesquisa(sugestao.protocolo, sugestao.paciente);
                    }}
                    disabled={isBuscando}
                    className="flex flex-col items-start p-3 rounded-2xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50/80 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-numeric tracking-tight text-xs font-bold text-primary group-hover:text-secondary">
                        {sugestao.protocolo}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {sugestao.status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 mt-1 truncate w-full">
                      {sugestao.paciente}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate w-full">
                      {sugestao.exame}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rodapé de Segurança e Compliance */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ambiente Seguro • Certificação Digital ICP-Brasil A3 • Lei 13.709/2018 (LGPD)</span>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ESTADO 2: VISUALIZAÇÃO DO LAUDO AUTENTICADO (DOCUMENTO OFICIAL A4)       */}
      {/* ========================================================================= */}
      {laudoVisivel && dadosLaudo && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Barra Superior Discreta de Navegação e Reinício de Estado */}
          <div className="print:hidden flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleVoltarPesquisa}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Pesquisar outro laudo</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Laudo Protocolo #{dadosLaudo.protocolo} Autenticado
              </span>
            </div>
          </div>

          {/* Barra de Ações do Documento (Invisível na Impressão Oficial) */}
          <div className="print:hidden bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 border-t-4 border-primary shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                style={{ backgroundColor: config.cores.primary }}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <span>Laudo Diagnóstico Autenticado</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    Assinatura ICP-Brasil Válida
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  Protocolo eletrônico #{dadosLaudo.protocolo} • Visualização em padrão oficial PDF/A4
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Laudo (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => alert(`Link de download seguro gerado com sucesso:\nhttps://laudo.notuslab.com.br/download/${dadosLaudo.protocolo}`)}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
                title="Exportar PDF Oficial"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Baixar PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const primeiroNome = dadosLaudo.pacienteNome.split(' ')[0];
                  const url = `https://wa.me/5511987654321?text=${encodeURIComponent(
                    `Olá ${primeiroNome}! Seu laudo do laboratório ${config.nome} já está pronto e autenticado digitalmente. Acesse: https://laudo.notuslab.com.br/ver/${dadosLaudo.protocolo}`
                  )}`;
                  window.open(url, '_blank');
                }}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                title="Compartilhar via WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* ÁREA DA FOLHA A4 SIMULADA (DOCUMENTO OFICIAL) */}
          <div className="bg-slate-200/80 p-3 sm:p-8 rounded-3xl flex justify-center print:p-0 print:bg-white">

            <article className="w-full max-w-[850px] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-14 border border-slate-300 min-h-[1100px] flex flex-col justify-between relative print:shadow-none print:border-none print:p-0">

              {/* Marca d'água sutil de autenticidade no fundo */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.025] select-none">
                <span className="text-8xl font-black uppercase tracking-widest text-slate-950 -rotate-45 font-['Outfit']">
                  NOTUSLAB AUTÊNTICO
                </span>
              </div>

              <div>
                {/* CABEÇALHO OFICIAL DO LABORATÓRIO */}
                <header className="border-b-2 border-slate-900 pb-5 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    {/* Logo Oficial do Laboratório Logado Ampliada (2x) */}
                    <div className="flex items-center gap-4">
                      <img
                        src={clientLogo}
                        alt={config.nome}
                        className="h-28 sm:h-36 w-auto max-w-xs object-contain"
                      />
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit'] tracking-wide uppercase leading-tight">
                          {config.nome}
                        </h2>
                        <p className="text-xs text-slate-600 font-semibold">{config.subtitulo}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          CNPJ: {config.cnpj} • Unidade: {config.cidadeUnidade}
                        </p>
                      </div>
                    </div>

                    {/* Registro Técnico e Alvará */}
                    <div className="text-left sm:text-right text-[11px] text-slate-500 border-l sm:border-l-0 pl-3 sm:pl-0 border-slate-200">
                      <p className="font-bold text-slate-800">Responsável Técnico:</p>
                      <p>Dra. Camila Vasconcelos</p>
                      <p className="font-mono text-[10px] text-slate-600">CRBM-SP 14.892 • RQE 4401</p>
                      <p className="text-[10px] text-slate-400 mt-1">Alvará Sanitário: 2026/0914-SP</p>
                    </div>
                  </div>
                </header>

                {/* DADOS CADASTRAIS DO PACIENTE E PEDIDO */}
                <section className="bg-slate-50/90 border border-slate-300 rounded-xl p-4 sm:p-5 mb-8 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Nome do Paciente
                      </span>
                      <strong className="text-sm font-black text-slate-900 uppercase block">
                        {dadosLaudo.pacienteNome}
                      </strong>
                      <span className="text-[11px] text-slate-500 font-medium">CPF: {dadosLaudo.cpf}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Dados Biológicos
                      </span>
                      <p className="text-xs text-slate-800 font-semibold">
                        {dadosLaudo.idade} • {dadosLaudo.sexo}
                      </p>
                      <span className="text-[11px] text-slate-500">Nascimento: {dadosLaudo.dataNascimento}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Médico Solicitante
                      </span>
                      <p className="text-xs text-slate-800 font-semibold">
                        {dadosLaudo.medicoSolicitante}
                      </p>
                      <span className="text-[11px] text-slate-500">{dadosLaudo.crm}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Rastreabilidade / Datas
                      </span>
                      <p className="text-[11px] text-slate-800 font-semibold">
                        Coleta: <strong>{dadosLaudo.dataColeta}</strong>
                      </p>
                      <p className="text-[11px] text-slate-800 font-semibold">
                        Liberação: <strong>{dadosLaudo.dataLiberacao}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500 font-numeric">
                        Protocolo: <strong>{dadosLaudo.protocolo}</strong>
                      </p>
                    </div>
                  </div>
                </section>

                {/* TABELA DE RESULTADOS ANALÍTICOS */}
                <div className="space-y-8">
                  {dadosLaudo.grupos.map((grupo, gIdx) => (
                    <section key={gIdx} className="space-y-2">

                      {/* Título da Seção do Exame */}
                      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1.5 pt-2">
                        <h3 className="text-sm font-black text-slate-900 tracking-wide font-['Outfit'] uppercase">
                          {grupo.titulo}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                          <span>Setor: {grupo.setor}</span>
                          <span>•</span>
                          <span>Matriz: {grupo.amostra}</span>
                        </div>
                      </div>

                      {/* Tabela dos Analitos */}
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-[10px] text-slate-500 uppercase font-bold border-b border-slate-200">
                            <th className="py-2 pr-4 w-5/12">Analito / Determinação</th>
                            <th className="py-2 px-3 text-right w-2/12">Resultado</th>
                            <th className="py-2 px-2 text-center w-2/12">Unidade</th>
                            <th className="py-2 pl-4 w-3/12">Valores de Referência</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {grupo.resultados.map((res, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 pr-4">
                                <span className="font-bold text-slate-900 block">{res.analito}</span>
                                <span className="text-[10px] text-slate-400 block font-normal">Método: {res.metodo}</span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="font-black text-slate-950 text-sm font-numeric tracking-tight">
                                  {res.resultado}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-center text-slate-600 font-numeric tracking-tight text-[11px]">
                                {res.unidade}
                              </td>
                              <td className="py-2.5 pl-4 text-slate-600 text-[11px] leading-tight font-numeric tracking-tight">
                                {res.referencia}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Nota técnica ou observações */}
                      {grupo.observacoesTecnicas && (
                        <p className="text-[10px] text-slate-400 italic pt-1">
                          Nota técnica: {grupo.observacoesTecnicas}
                        </p>
                      )}
                    </section>
                  ))}
                </div>

              </div>

              {/* RODAPÉ DO LAUDO: ASSINATURA ELETRÔNICA, QR CODE E VALIDAÇÃO DE AUTENTICIDADE */}
              <footer className="mt-12 pt-6 border-t-2 border-slate-900 space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">

                  {/* QR Code de Autenticidade */}
                  <div className="sm:col-span-4 flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center shrink-0">
                      <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                        {/* Marcadores de Canto (Position Detection Patterns) */}
                        <rect x="5" y="5" width="28" height="28" fill="currentColor" rx="2" />
                        <rect x="9" y="9" width="20" height="20" fill="white" rx="1" />
                        <rect x="13" y="13" width="12" height="12" fill="currentColor" rx="1" />

                        <rect x="67" y="5" width="28" height="28" fill="currentColor" rx="2" />
                        <rect x="71" y="9" width="20" height="20" fill="white" rx="1" />
                        <rect x="75" y="13" width="12" height="12" fill="currentColor" rx="1" />

                        <rect x="5" y="67" width="28" height="28" fill="currentColor" rx="2" />
                        <rect x="9" y="71" width="20" height="20" fill="white" rx="1" />
                        <rect x="13" y="75" width="12" height="12" fill="currentColor" rx="1" />

                        {/* Matriz de Pontos do QR Code */}
                        <rect x="38" y="10" width="6" height="6" />
                        <rect x="48" y="18" width="6" height="6" />
                        <rect x="56" y="8" width="6" height="6" />
                        <rect x="10" y="38" width="6" height="6" />
                        <rect x="22" y="46" width="6" height="6" />
                        <rect x="38" y="38" width="10" height="10" />
                        <rect x="54" y="38" width="6" height="6" />
                        <rect x="70" y="46" width="8" height="6" />
                        <rect x="85" y="38" width="6" height="6" />
                        <rect x="38" y="54" width="8" height="8" />
                        <rect x="52" y="52" width="6" height="6" />
                        <rect x="64" y="60" width="6" height="6" />
                        <rect x="78" y="56" width="8" height="8" />
                        <rect x="38" y="72" width="6" height="6" />
                        <rect x="50" y="80" width="6" height="6" />
                        <rect x="62" y="70" width="6" height="6" />
                        <rect x="74" y="80" width="8" height="8" />
                        <rect x="86" y="72" width="6" height="6" />
                      </svg>
                    </div>

                    <div className="text-[10px] text-slate-600 leading-tight">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                        Validação Digital
                      </span>
                      Aponte a câmera para verificar a integridade deste laudo online.
                      <span className="block font-mono text-[9px] text-slate-400 mt-1 truncate">
                        {dadosLaudo.protocolo}
                      </span>
                    </div>
                  </div>

                  {/* Assinatura Eletrônica do Analista Clínico */}
                  <div className="sm:col-span-8 flex flex-col justify-end text-right">
                    <div className="inline-block self-end border-b border-slate-400 pb-1 w-64 text-center">
                      <p className="font-['Brush_Script_MT',cursive] text-lg text-slate-800 select-none">
                        Dr. Lucas Prado
                      </p>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs font-bold text-slate-900">Dr. Lucas Prado</p>
                      <p className="text-[11px] text-slate-600">Biomédico Analista de Bancada Clínica</p>
                      <p className="text-[10px] text-slate-500 font-mono">CRBM-SP 28.401 • Registro Nacional CFBM 1092</p>
                    </div>
                  </div>

                </div>

                {/* Linha de Certificação Criptográfica SHA-256 e Conformidade Legal */}
                <div className="bg-slate-100 p-2.5 rounded-lg flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-500 font-mono gap-2 border border-slate-200">
                  <div className="flex items-center gap-1.5 truncate max-w-full">
                    <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Hash SHA-256: {dadosLaudo.hashAutenticidade}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyHash(dadosLaudo.hashAutenticidade)}
                      className="text-primary hover:underline font-semibold cursor-pointer"
                    >
                      {copiadoHash ? '✓ Hash Copiado' : 'Copiar Hash'}
                    </button>
                    <span>ICP-Brasil Padrão A3</span>
                  </div>
                </div>

                {/* Aviso Regulatório */}
                <p className="text-[9px] text-slate-400 text-center leading-normal">
                  Os resultados laboratoriais devem ser interpretados exclusivamente pelo médico assistente em correlação com a clínica do paciente. Este laudo eletrônico é protegido pela Lei Geral de Proteção de Dados (Lei 13.709/2018) e possui validade jurídica conforme MP 2.200-2/2001.
                </p>

              </footer>

            </article>

          </div>

        </div>
      )}

    </div>
  );
};

export default LaudoPage;
