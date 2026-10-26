/**
 * ============================================================================
 * NOTUSLAB LIMS - HELPER DE NOTIFICAÇÃO INCLUSIVA (FRONTEND & PREVIEWS)
 * ============================================================================
 */

export type PronomesPaciente =
  | 'Ele/Dele'
  | 'Ela/Dela'
  | 'Elu/Delu'
  | 'Não informar'
  | string;

export interface DadosPacienteNotificacao {
  nomeCivil: string;
  nomeSocial?: string | null;
  pronomes: PronomesPaciente;
  whatsapp: string;
  identidadeGenero?: string | null;
}

export type TipoNotificacaoLims =
  | 'LAUDO_LIBERADO'
  | 'SOLICITACAO_RECOLETA'
  | 'CONFIRMACAO_CADASTRO'
  | 'LEMBRETE_JEJUM';

export interface ParametrosLaudoLiberado {
  codigoProtocolo: string;
  linkAcesso?: string;
  examesDisponiveis?: string[];
  responsavelTecnico?: string;
}

export interface ParametrosRecoleta {
  codigoProtocolo: string;
  nomeExame: string;
  motivoHumanizado?: string;
  instrucoesJejumHoras?: number;
  horarioLimiteColeta?: string;
  unidadeAtendimento?: string;
}

export interface PayloadNotificacaoWhatsApp {
  destinatario: {
    nomeParaContato: string;
    telefoneWhatsapp: string;
    nomeCivilReferencia?: string;
  };
  tipo: TipoNotificacaoLims;
  mensagemFormatada: string;
  dataGeracao: string;
}

export function extrairNomeTratamento(paciente: Pick<DadosPacienteNotificacao, 'nomeSocial' | 'nomeCivil'>): string {
  if (paciente.nomeSocial && paciente.nomeSocial.trim().length > 0) {
    return paciente.nomeSocial.trim();
  }
  return paciente.nomeCivil.trim();
}

export function extrairSaudacaoInclusiva(pronomes: string | null | undefined): string {
  if (!pronomes) return 'Olá';
  const pronomesLimpo = pronomes.toLowerCase().trim();

  if (pronomesLimpo.includes('ela') || pronomesLimpo.includes('dela')) {
    return 'Prezada';
  }
  if (pronomesLimpo.includes('ele') || pronomesLimpo.includes('dele')) {
    return 'Prezado';
  }
  return 'Olá';
}

export function formatarCabecalhoAcolhimento(paciente: DadosPacienteNotificacao): string {
  const saudacao = extrairSaudacaoInclusiva(paciente.pronomes);
  const nome = extrairNomeTratamento(paciente);
  return `${saudacao} ${nome},`;
}

export function gerarMensagemLaudoLiberado(
  paciente: DadosPacienteNotificacao,
  params: ParametrosLaudoLiberado
): string {
  const cabecalho = formatarCabecalhoAcolhimento(paciente);
  const link = params.linkAcesso || `https://notuslab.com.br/resultados?protocolo=${params.codigoProtocolo}`;
  const listaExames = params.examesDisponiveis && params.examesDisponiveis.length > 0
    ? `\n📄 *Exames:* ${params.examesDisponiveis.join(', ')}`
    : '';

  return [
    `🔬 *NotusLab LIMS • Resultados Prontos*`,
    ``,
    cabecalho,
    ``,
    `Temos a satisfação de informar que os laudos dos seus exames laboratoriais vinculados ao protocolo *${params.codigoProtocolo}* foram tecnicamente liberados e assinados pela nossa equipe diagnóstica.${listaExames}`,
    ``,
    `📲 Você pode acessar e baixar o documento oficial com segurança através do link abaixo:`,
    `${link}`,
    ``,
    `Seu bem-estar e precisão diagnóstica são nossa prioridade. Em caso de dúvidas, nossa equipe de recepção está à disposição por este mesmo canal.`,
    ``,
    `_NotusLab Diagnósticos Clínicos_`
  ].join('\n');
}

export function gerarMensagemSolicitacaoRecoleta(
  paciente: DadosPacienteNotificacao,
  params: ParametrosRecoleta
): string {
  const cabecalho = formatarCabecalhoAcolhimento(paciente);
  const unidade = params.unidadeAtendimento || 'nossa unidade NotusLab';
  const horario = params.horarioLimiteColeta || '11h';
  const jejumTexto = params.instrucoesJejumHoras && params.instrucoesJejumHoras > 0
    ? `Lembramos que para este procedimento é necessário jejum de *${params.instrucoesJejumHoras} horas*.`
    : 'Não é necessário jejum para esta coleta.';

  return [
    `🩺 *NotusLab LIMS • Informação Importante sobre seu Atendimento*`,
    ``,
    cabecalho,
    ``,
    `Como parte de nossos rigorosos protocolos de garantia de qualidade laboratorial (RDC 786/2023), identificamos a necessidade de realizar uma nova coleta de amostra para o exame de *${params.nomeExame}* (Protocolo: *${params.codigoProtocolo}*).`,
    ``,
    `Essa rotina é um procedimento padrão preventivo para assegurar a máxima exatidão e confiabilidade técnica dos seus resultados.`,
    ``,
    `📍 Por gentileza, compareça à ${unidade} no melhor dia para você, preferencialmente até às ${horario}.`,
    `ℹ️ ${jejumTexto}`,
    ``,
    `Não há qualquer custo adicional por este procedimento. Sua nova coleta terá atendimento prioritário no guichê.`,
    ``,
    `Estamos à sua inteira disposição para qualquer esclarecimento.`,
    ``,
    `_Atenciosamente,_`,
    `*Equipe de Atendimento NotusLab*`
  ].join('\n');
}

export function gerarMensagemBoasVindasCadastro(
  paciente: DadosPacienteNotificacao
): string {
  const cabecalho = formatarCabecalhoAcolhimento(paciente);
  const nomeExibicao = extrairNomeTratamento(paciente);

  return [
    `✨ *Bem-vindo(a) ao NotusLab LIMS*`,
    ``,
    cabecalho,
    ``,
    `Seu cadastro no NotusLab foi realizado com sucesso!`,
    `Registramos você em nosso sistema como *${nomeExibicao}*, garantindo que todo o seu atendimento ocorra com o respeito e acolhimento que você merece.`,
    ``,
    `Por este canal você receberá atualizações em tempo real sobre o andamento de suas amostras, preparos de exames e a liberação de seus laudos.`,
    ``,
    `Tenha um excelente dia!`,
    ``,
    `_NotusLab • Saúde, Ciência e Respeito_`
  ].join('\n');
}

export function gerarNotificacaoInclusiva(
  paciente: DadosPacienteNotificacao,
  tipo: TipoNotificacaoLims,
  params?: ParametrosLaudoLiberado | ParametrosRecoleta
): PayloadNotificacaoWhatsApp {
  let mensagemFormatada = '';

  switch (tipo) {
    case 'LAUDO_LIBERADO':
      mensagemFormatada = gerarMensagemLaudoLiberado(paciente, (params as ParametrosLaudoLiberado) || { codigoProtocolo: 'ATD-2026-0001' });
      break;
    case 'SOLICITACAO_RECOLETA':
      mensagemFormatada = gerarMensagemSolicitacaoRecoleta(paciente, (params as ParametrosRecoleta) || { codigoProtocolo: 'ATD-2026-0001', nomeExame: 'Hemograma Completo' });
      break;
    case 'CONFIRMACAO_CADASTRO':
    default:
      mensagemFormatada = gerarMensagemBoasVindasCadastro(paciente);
      break;
  }

  return {
    destinatario: {
      nomeParaContato: extrairNomeTratamento(paciente),
      telefoneWhatsapp: paciente.whatsapp,
      nomeCivilReferencia: paciente.nomeSocial ? paciente.nomeCivil : undefined
    },
    tipo,
    mensagemFormatada,
    dataGeracao: new Date().toISOString()
  };
}
