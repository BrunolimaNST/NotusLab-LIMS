import prisma from '../prisma';
import { AppError } from '../errors/AppError';
import { MotivoRejeicaoAmostra, StatusAmostra, StatusAtendimento } from '@prisma/client';

export interface ResultadoRegistroRecoletaDTO {
  amostraInvalidada: {
    id: string;
    codigoBarras: string;
    status: StatusAmostra;
  };
  novaAmostra: {
    id: string;
    codigoBarras: string;
    status: StatusAmostra;
    isRecoleta: boolean;
    amostraOriginalId: string | null;
  };
  ocorrencia: {
    id: string;
    motivo: MotivoRejeicaoAmostra;
    textoNotificacaoWhatsApp: string;
    dataHoraRegistro: Date;
    custoDesperdicio?: number | null;
  };
  pacienteDestinatario: {
    nome: string;
    telefoneWhatsapp: string;
  };
}

export class SampleRecollectionService {
  /**
   * Registra a recusa técnica de uma amostra com problema pré-analítico (coagulação, hemólise, volume),
   * invalida a amostra atual, gera uma nova amostra para recoleta e cria a ocorrência com
   * o texto automatizado para envio via WhatsApp ao paciente do Cinese Análises Clínicas
   * e o cálculo financeiro do custo do desperdício de insumos.
   *
   * Toda a operação é executada atomicamente via transação no Prisma.
   *
   * @param amostraId ID da amostra que apresentou problema
   * @param motivo Motivo técnico da rejeição (MotivoRejeicaoAmostra)
   * @param descricaoDetalhada Observações adicionais do biomédico/triador (opcional)
   * @param custoDesperdicio Valor monetário estimado da perda (tubos, reagentes, tempo) (opcional)
   */
  public async registerRecollection(
    amostraId: string,
    motivo: MotivoRejeicaoAmostra,
    descricaoDetalhada?: string,
    custoDesperdicio?: number
  ): Promise<ResultadoRegistroRecoletaDTO> {
    if (!amostraId) {
      throw new AppError('O identificador da amostra é obrigatório.', 400);
    }

    if (!motivo || !Object.values(MotivoRejeicaoAmostra).includes(motivo)) {
      throw new AppError(
        `Motivo de rejeição inválido. Valores aceitos: ${Object.values(MotivoRejeicaoAmostra).join(', ')}`,
        400
      );
    }

    // 1. Busca a amostra existente com todo o contexto do atendimento, exames e paciente
    const amostraExistente = await prisma.amostra.findUnique({
      where: { id: amostraId },
      include: {
        tuboColeta: true,
        atendimento: {
          include: {
            paciente: true,
          },
        },
        itens: {
          include: {
            exame: true,
          },
        },
      },
    });

    if (!amostraExistente) {
      throw new AppError(`Amostra com ID '${amostraId}' não foi encontrada no sistema.`, 404);
    }

    // 2. Valida se a amostra já não foi invalidada
    if (amostraExistente.status === StatusAmostra.INVALIDADA_RECOLETA) {
      throw new AppError(
        `A amostra ${amostraExistente.codigoBarras} já se encontra no status INVALIDADA_RECOLETA.`,
        409
      );
    }

    const { atendimento, tuboColeta, itens } = amostraExistente;
    const { paciente } = atendimento;

    // 3. Monta o nome amigável do motivo técnico
    const motivosDescricao: Record<MotivoRejeicaoAmostra, string> = {
      HEMOLISE: 'hemólise da amostra (interferência que impede a análise precisa)',
      COAGULACAO: 'presença de microcoágulo no sangue coletado',
      VOLUME_INSUFICIENTE: 'volume de amostra insuficiente para a realização dos testes',
      LIPEMIA_ACENTUADA: 'presença de lipemia acentuada que interfere nas reações ópticas',
      TUBO_INADEQUADO: 'incompatibilidade técnica do recipiente/anticoagulante de coleta',
      IDENTIFICACAO_ILEGIVEL: 'etiqueta ou identificação física ilegível no tubo',
      MATERIAL_EXTRAVIADO: 'inconformidade no transporte ou manuseio da amostra',
    };

    const motivoFormatado = motivosDescricao[motivo] ?? motivo;

    // Lista os nomes dos exames afetados para exibir na notificação
    const nomesExames = itens.map((item) => item.exame.nome).join(', ') || 'exames solicitados';

    // 4. Gera a mensagem humanizada e profissional para o WhatsApp do paciente
    const textoWhatsApp = [
      `Olá, *${paciente.nomeCompleto}*! Tudo bem?`,
      `Aqui é da equipe do laboratório *Cinese Análises Clínicas*.`,
      ``,
      `Identificamos que, para assegurar a total precisão e segurança dos seus resultados para o(s) exame(s): *${nomesExames}*, será necessário realizar uma nova coleta de rotina.`,
      ``,
      `📋 *Protocolo de Atendimento:* ${atendimento.codigoProtocolo}`,
      `🧪 *Motivo técnico identificado:* ${motivoFormatado}.`,
      `📍 *Local:* Cinese Análises Clínicas`,
      ``,
      `Pedimos a gentileza de comparecer à nossa unidade em seu melhor horário. Nossos profissionais já estão cientes e priorizarão o seu atendimento.`,
      `Se tiver qualquer dúvida, basta responder diretamente a esta mensagem. Agradecemos pela compreensão!`,
    ].join('\n');

    // 5. Executa a transação atômica no banco de dados (ACID)
    const resultadoTransacao = await prisma.$transaction(async (tx) => {
      // 5.1 Atualiza a amostra atual para INVALIDADA_RECOLETA
      const amostraAtualizada = await tx.amostra.update({
        where: { id: amostraId },
        data: {
          status: StatusAmostra.INVALIDADA_RECOLETA,
        },
      });

      // 5.2 Gera um novo código de barras rastreável para a amostra substituta
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const novoCodigoBarras = `AMO-REC-${timestamp}-${randomSuffix}`;

      // 5.3 Cria a nova amostra no status PENDENTE_COLETA com vínculo de parentesco
      const novaAmostraCriada = await tx.amostra.create({
        data: {
          codigoBarras: novoCodigoBarras,
          atendimentoId: atendimento.id,
          tuboColetaId: tuboColeta.id,
          status: StatusAmostra.PENDENTE_COLETA,
          isRecoleta: true,
          amostraOriginalId: amostraExistente.id,
        },
      });

      // 5.4 Reassocia os itens do atendimento para a nova amostra gerada
      if (itens.length > 0) {
        await tx.itemAtendimento.updateMany({
          where: {
            amostraId: amostraExistente.id,
          },
          data: {
            amostraId: novaAmostraCriada.id,
            laudoLiberado: false,
            resultado: null,
          },
        });
      }

      // 5.5 Atualiza o status do atendimento para AGUARDANDO_COLETA
      await tx.atendimento.update({
        where: { id: atendimento.id },
        data: {
          status: StatusAtendimento.AGUARDANDO_COLETA,
        },
      });

      // 5.6 Registra a ocorrência com o texto da notificação do WhatsApp e o custo de desperdício
      const ocorrenciaCriada = await tx.ocorrenciaAmostra.create({
        data: {
          amostraId: amostraExistente.id,
          motivo,
          descricaoDetalhada: descricaoDetalhada ?? `Invalidação automática disparada pela triagem. Motivo: ${motivo}`,
          textoNotificacaoWhatsApp: textoWhatsApp,
          custoDesperdicio: custoDesperdicio !== undefined ? custoDesperdicio : null,
        },
      });

      return {
        amostraAtualizada,
        novaAmostraCriada,
        ocorrenciaCriada,
      };
    });

    return {
      amostraInvalidada: {
        id: resultadoTransacao.amostraAtualizada.id,
        codigoBarras: resultadoTransacao.amostraAtualizada.codigoBarras,
        status: resultadoTransacao.amostraAtualizada.status,
      },
      novaAmostra: {
        id: resultadoTransacao.novaAmostraCriada.id,
        codigoBarras: resultadoTransacao.novaAmostraCriada.codigoBarras,
        status: resultadoTransacao.novaAmostraCriada.status,
        isRecoleta: resultadoTransacao.novaAmostraCriada.isRecoleta,
        amostraOriginalId: resultadoTransacao.novaAmostraCriada.amostraOriginalId,
      },
      ocorrencia: {
        id: resultadoTransacao.ocorrenciaCriada.id,
        motivo: resultadoTransacao.ocorrenciaCriada.motivo,
        textoNotificacaoWhatsApp: resultadoTransacao.ocorrenciaCriada.textoNotificacaoWhatsApp,
        dataHoraRegistro: resultadoTransacao.ocorrenciaCriada.dataHoraRegistro,
        custoDesperdicio: resultadoTransacao.ocorrenciaCriada.custoDesperdicio
          ? Number(resultadoTransacao.ocorrenciaCriada.custoDesperdicio)
          : null,
      },
      pacienteDestinatario: {
        nome: paciente.nomeCompleto,
        telefoneWhatsapp: paciente.telefoneWhatsapp,
      },
    };
  }
}

export default new SampleRecollectionService();
