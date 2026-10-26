/**
 * NotusLab LIMS - Definições Globais de Tipos e Interfaces
 * Arquivo: src/types/index.ts
 */

// ==========================================
// 1. DOMÍNIO DE AUTENTICAÇÃO E PERFIS (RBAC)
// ==========================================

export type UserRole = 'RECEPCAO' | 'LABORATORIO' | 'ADMIN';

export interface UserAccount {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  perfilPrincipal: UserRole;
  perfisPermitidos: UserRole[];
  avatarUrl?: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
  cargo: string;
  avatarUrl?: string;
  perfisPermitidos?: UserRole[];
}

// ==========================================
// 2. DOMÍNIO DE PACIENTES
// ==========================================

export type SexoBiologico = 'MASCULINO' | 'FEMININO' | 'INDETERMINADO' | 'INTERSEXO';
export type SexoBiologicoClinico = 'Feminino' | 'Masculino' | 'Intersexo';

export type Pronomes = 'Ele/Dele' | 'Ela/Dela' | 'Elu/Delu' | 'Não informar';

export type TipoFaturamento = 'particular' | 'convenio';

export interface Patient {
  id: string;
  nomeCivil: string;
  nomeSocial?: string;
  pronomes: Pronomes | string;
  identidadeGenero: string;
  cpf?: string;

  // Documentação e Filiação (Critérios de Homônimos e Rastreabilidade)
  rg?: string;
  orgaoEmissor?: string;
  nomeMae?: string;
  nomePai?: string;

  // Endereço e Logística de Coleta
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  zonaRural?: boolean;

  sexoBiologico: SexoBiologicoClinico | string;
  dataNascimento: string;
  tipoFaturamento: TipoFaturamento;
  convenioNome?: string;
  convenioCarteira?: string;
  whatsapp: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  nomeCompleto?: string;
  telefoneWhatsapp?: string;
}

export interface Paciente {
  id: string;
  nomeCompleto: string;
  nomeCivil?: string;
  nomeSocial?: string;
  pronomes?: Pronomes | string;
  identidadeGenero?: string;
  cpf: string;

  // Documentação e Filiação (Critérios de Homônimos e Rastreabilidade)
  rg?: string;
  orgaoEmissor?: string;
  nomeMae?: string;
  nomePai?: string;

  // Endereço e Logística de Coleta
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  zonaRural?: boolean;

  dataNascimento: string;
  sexoBiologico: SexoBiologico | SexoBiologicoClinico;
  telefoneWhatsapp: string;
  whatsapp?: string;
  email: string;
  tipoFaturamento?: TipoFaturamento;
  convenioNome?: string;
  convenioCarteira?: string;
  dataCadastro?: string;
}

export interface PacienteForm {
  nomeCompleto: string;
  nomeCivil?: string;
  nomeSocial?: string;
  pronomes?: Pronomes | string;
  identidadeGenero?: string;
  cpf: string;

  // Documentação e Filiação
  rg?: string;
  orgaoEmissor?: string;
  nomeMae?: string;
  nomePai?: string;

  // Endereço e Logística
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  zonaRural?: boolean;

  dataNascimento: string;
  sexoBiologico: SexoBiologico | SexoBiologicoClinico;
  telefoneWhatsapp: string;
  whatsapp?: string;
  email: string;
  tipoFaturamento?: TipoFaturamento;
  convenioNome?: string;
  convenioCarteira?: string;
}

// ==========================================
// 3. DOMÍNIO DE TUBOS & NORMA CLSI H3-A6
// ==========================================

export interface TuboColeta {
  id: string;
  codigo: string;
  descricao: string;
  corTampaHex: string;
  aditivoAnticoagulante: string;
  ordemCLSI: number;
}

export interface ExameAgrupadoTubo {
  id: string;
  mnemonico: string;
  nome: string;
}

export interface TuboCalculado {
  tuboColetaId: string;
  codigo: string;
  descricao: string;
  corTampaHex: string;
  aditivoAnticoagulante: string;
  volumeMinimoMl: number;
  ordemCLSI: number;
  instrucoesHomogeneizacao: string;
  examesContidos: ExameAgrupadoTubo[];
}

export interface ResultadoCalculoTubos {
  totalExamesSolicitados: number;
  totalTubosNecessarios: number;
  maiorTempoJejumHoras: number;
  ordemTiragemRecomendadaCLSI: TuboCalculado[];
  valorTotalEstimado: number;
}

// ==========================================
// 4. DOMÍNIO DE EXAMES & CATÁLOGO
// ==========================================

export interface LaboratorioApoio {
  nomeFantasia: string;
  slaPadraoDiasUteis: number;
}

export interface Exame {
  id: string;
  mnemonico: string;
  nome: string;
  setorLaboratorial: string;
  tempoJejumHoras: number;
  orientacoesPreparo: string | null;
  precoBaseReais: number;
  tuboColetaId: string;
  codigoTUSS?: string | null;
  prazoDiasUteis?: number;
  requerApoioExterno?: boolean;
  tuboColeta?: TuboColeta;
  laboratorioApoio?: LaboratorioApoio | null;

  // Propriedades padronizadas do LIMS / Orçamento da Recepção
  sigla?: string;
  setor?: string;
  tubo?: string;
  jejum?: string;
  prazoSLA?: string;
  preco?: number;
}

export interface ExameCatalogo extends Exame {
  codigoTUSS: string | null;
  prazoDiasUteis: number;
  requerApoioExterno: boolean;
}

export interface ExameLaboratorial extends Exame {
  id: string;
  nome: string;
  sigla: string;
  setor: string;
  tubo: string;
  jejum: string;
  prazoSLA: string;
  preco: number;
}

// ==========================================
// 5. DOMÍNIO DE TRIAGEM, BANCADA & MÁQUINA DE ESTADOS
// ==========================================

export type StatusAmostra =
  | 'AGUARDANDO'
  | 'EM_TRIAGEM'
  | 'ACEITA'
  | 'EM_PROCESSAMENTO'
  | 'CONCLUIDA'
  | 'REJEITADA'
  // Compatibilidade com backend existente
  | 'COLETADA'
  | 'RECEBIDA'
  | 'EM_ANALISE'
  | 'INVALIDADA_RECOLETA';

export interface AmostraTriagem {
  id: string;
  codigoBarras: string;
  protocoloAtendimento: string;
  pacienteNome: string;
  pacienteTelefone: string;
  pacienteEmail?: string;
  dataHoraColeta: string;
  status: StatusAmostra;
  exames: string[];
  tuboCodigo: string;
  tuboTipo?: string;
  tuboCorHex: string;
  motivoRejeicao?: string;
  descricaoRejeicao?: string;
  dataHoraStatus?: string;
}

export interface MotivoRejeicao {
  valor: string;
  rotulo: string;
  gravidade: 'ALTA' | 'MEDIA' | 'CRITICA';
  custoPadraoEstimado: number;
}

export interface AlertaPanico {
  id: string;
  pacienteNome: string;
  pacienteLeito: string;
  exameNome: string;
  resultado: string;
  unidade: string;
  valorReferencia: string;
  riscoClinico: string;
  horaLiberacao: string;
  medicoSolicitante: string;
}

export interface RegistroContatoMedico {
  id: string;
  alertaId: string;
  pacienteNome: string;
  exameNome: string;
  resultadoCritico: string;
  medicoContatado: string;
  crmMedico: string;
  telefoneContato: string;
  dataHoraContato: string;
  responsavelRegistro: string;
  condutaClinicaRegistrada: string;
}

// ==========================================
// 6. DOMÍNIO DE LOGÍSTICA B2B & CADEIA FRIA
// ==========================================

export type StatusSlaRemessa = 'NO_PRAZO' | 'ALERTA_PROXIMIDADE' | 'ATRASADO';
export type StatusLogistico = 'EM_TRANSITO' | 'RECEBIDO_APOIO' | 'EM_ANALISE_APOIO' | 'LAUDO_LIBERADO';

export interface RemessaB2B {
  id: string;
  codigoLote: string;
  laboratorioApoio: string;
  cnpjApoio: string;
  transportadora: string;
  quantidadeAmostras: number;
  dataHoraEnvio: string;
  previsaoRetornoSla: string;
  statusSla: StatusSlaRemessa;
  statusLogistico: StatusLogistico;
  tempoRestanteTexto: string;
  temperaturaEnvioGraus: number;
  temperaturaMinimaGraus: number;
  temperaturaMaximaGraus: number;
  codigoRastreioLogistica: string;
  examesPrincipais: string[];
  excursaoTermica?: boolean;
}

// ==========================================
// 7. DOMÍNIO DE GESTÃO DA QUALIDADE
// ==========================================

export interface OcorrenciaPreAnalitica {
  id: string;
  codigoBarrasAmostra: string;
  protocoloAtendimento: string;
  pacienteNome: string;
  motivo: string;
  custoDesperdicio: number;
  custoDesperdicioFormatado: string;
  descricaoDetalhada: string | null;
  tuboDescricao?: string;
  dataRegistro: string;
}

export interface AlertaControleAnalitico {
  id: string;
  equipamentoNome: string;
  setor: string;
  tipo: 'CALIBRACAO_PENDENTE' | 'CIQ_FORA_CONTROLE';
  parametro: string;
  severidade: 'ALERTA' | 'CRITICA';
  mensagem: string;
  regraViolada?: string; // ex: Westgard 1:3s
  tempoRestante?: string;
  statusAcao: 'PENDENTE' | 'EM_AJUSTE' | 'CONCLUIDO';
}

export interface ReagenteEstoque {
  id: string;
  nome: string;
  lote: string;
  setor: string;
  dataValidade: string;
  diasAteVencer: number;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidade: string;
  statusCriticidade: 'NORMAL' | 'ESTOQUE_BAIXO' | 'VALIDADE_CRITICA' | 'VENCIDO';
}

// ==========================================
// 8. RESPOSTAS PADRÃO DA API & ERROS
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
