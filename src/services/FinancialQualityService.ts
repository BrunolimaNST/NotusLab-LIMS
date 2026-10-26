import prisma from '../prisma';
import { AppError } from '../errors/AppError';
import { MotivoRejeicaoAmostra } from '@prisma/client';

// =============================================================
// INTERFACES E DTOS DO MÓDULO 5 (QUALIDADE, ESTOQUE E CUSTOS)
// =============================================================

export interface DetalhePerdaMotivoDTO {
  motivo: MotivoRejeicaoAmostra;
  quantidade: number;
  perdaTotal: number;
  perdaTotalFormatada: string;
  percentualDoTotal: number;
}

export interface OcorrenciaComPerdaDTO {
  id: string;
  codigoBarrasAmostra: string;
  protocoloAtendimento: string;
  pacienteNome: string;
  motivo: MotivoRejeicaoAmostra;
  custoDesperdicio: number;
  custoDesperdicioFormatado: string;
  descricaoDetalhada: string | null;
  dataHoraRegistro: Date;
  tuboDescricao?: string;
  examesAfetados: string[];
}

export interface ResultadoPerdaRecoletaDTO {
  periodo: {
    mes: number;
    ano: number;
    dataInicio: string;
    dataFim: string;
    nomeMesReferencia: string;
  };
  metricasFinanceiras: {
    totalPerdaFinanceira: number;
    totalPerdaFormatada: string;
    totalRecoletasRegistradas: number;
    totalRecoletasComCusto: number;
    custoMedioPorRecoleta: number;
    custoMedioFormatado: string;
  };
  analisePorMotivo: DetalhePerdaMotivoDTO[];
  ocorrenciasDetalhadas: OcorrenciaComPerdaDTO[];
}

export interface AlertaReagenteEstoqueDTO {
  id: string;
  nome: string;
  lote: string;
  dataValidade: string;
  diasAteVencer: number;
  quantidadeAtual: number;
  quantidadeMinima: number;
  custoUnitario: number;
  custoUnitarioFormatado: string;
  valorTotalEstoque: number;
  valorTotalEstoqueFormatado: string;
  statusCritico: {
    isEstoqueBaixo: boolean;
    isValidadeCritica: boolean;
    isVencido: boolean;
    nivelCriticidade: 'CRITICO' | 'ALERTA';
  };
  motivosAlerta: string[];
}

export interface ResumoAlertasEstoqueDTO {
  dataConsulta: string;
  resumo: {
    totalAlertas: number;
    totalEstoqueAbaixoMinimo: number;
    totalValidadeCritica: number;
    totalVencidos: number;
    valorFinanceiroEmRisco: number;
    valorFinanceiroEmRiscoFormatado: string;
  };
  reagentesComAlerta: AlertaReagenteEstoqueDTO[];
}

export interface CreateReagenteEstoqueDTO {
  nome: string;
  lote: string;
  dataValidade: Date | string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  custoUnitario: number;
}

export interface CreateConsumoReagenteDTO {
  exameId: string;
  reagenteEstoqueId: string;
  quantidadeConsumida: number;
  itemAtendimentoId?: string;
}

export interface CreateRegistroQualidadeDTO {
  tituloPop: string;
  descricaoFalha: string;
  acaoCorretiva: string;
  responsavelId: string;
  dataRegistro?: Date | string;
}

export class FinancialQualityService {
  /**
   * Formata números para a moeda Real Brasileiro (R$).
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Retorna o nome por extenso do mês brasileiro (1 = Janeiro, etc.)
   */
  private getMonthName(mes: number): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1] || `Mês ${mes}`;
  }

  /**
   * REGRA DE NEGÓCIO 1: CÁLCULO DE PERDAS FINANCEIRAS POR RECOLETAS
   *
   * Varre e totaliza o campo custoDesperdicio de todas as recoletas registradas
   * no mês solicitado (ou no mês corrente se omitido). Permite ao gestor laboratorial
   * auditar o impacto financeiro de insumos e tubos descartados por falhas pré-analíticas
   * (hemólise, coagulação, volume insuficiente, etc.).
   *
   * @param mes Mês de referência (1 a 12). Padrão: mês corrente.
   * @param ano Ano de referência (ex: 2026). Padrão: ano corrente.
   */
  public async calculateRecollectionLoss(
    mes?: number,
    ano?: number
  ): Promise<ResultadoPerdaRecoletaDTO> {
    const agora = new Date();
    const mesRef = mes ? Number(mes) : agora.getMonth() + 1;
    const anoRef = ano ? Number(ano) : agora.getFullYear();

    if (mesRef < 1 || mesRef > 12) {
      throw new AppError('O mês informado deve ser um número inteiro entre 1 e 12.', 400);
    }

    if (anoRef < 2000 || anoRef > 2100) {
      throw new AppError('O ano informado deve ser um ano válido (entre 2000 e 2100).', 400);
    }

    // Define o intervalo exato do primeiro ao último milissegundo do mês
    const dataInicio = new Date(Date.UTC(anoRef, mesRef - 1, 1, 0, 0, 0, 0));
    const dataFim = new Date(Date.UTC(anoRef, mesRef, 0, 23, 59, 59, 999));

    // Busca todas as ocorrências de recoleta registradas no período
    const ocorrencias = await prisma.ocorrenciaAmostra.findMany({
      where: {
        dataHoraRegistro: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      include: {
        amostra: {
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
        },
      },
      orderBy: {
        dataHoraRegistro: 'desc',
      },
    });

    let totalPerdaFinanceira = 0;
    let totalRecoletasComCusto = 0;

    const perdasPorMotivoMap: Record<
      string,
      { motivo: MotivoRejeicaoAmostra; quantidade: number; perdaTotal: number }
    > = {};

    // Inicializa todos os motivos cadastrados no enum
    for (const motivo of Object.values(MotivoRejeicaoAmostra)) {
      perdasPorMotivoMap[motivo] = {
        motivo,
        quantidade: 0,
        perdaTotal: 0,
      };
    }

    const ocorrenciasDetalhadas: OcorrenciaComPerdaDTO[] = [];

    for (const oc of ocorrencias) {
      const custoNum = oc.custoDesperdicio ? Number(oc.custoDesperdicio) : 0;
      totalPerdaFinanceira += custoNum;

      if (custoNum > 0) {
        totalRecoletasComCusto++;
      }

      // Agrupa no motivo correspondente
      if (perdasPorMotivoMap[oc.motivo]) {
        perdasPorMotivoMap[oc.motivo].quantidade++;
        perdasPorMotivoMap[oc.motivo].perdaTotal += custoNum;
      }

      const pacienteNome = oc.amostra?.atendimento?.paciente?.nomeCompleto || 'Paciente não identificado';
      const protocoloAtendimento = oc.amostra?.atendimento?.codigoProtocolo || 'N/A';
      const codigoBarrasAmostra = oc.amostra?.codigoBarras || 'N/A';
      const tuboDescricao = oc.amostra?.tuboColeta?.descricao;
      const examesAfetados = oc.amostra?.itens?.map((i) => i.exame.nome) || [];

      ocorrenciasDetalhadas.push({
        id: oc.id,
        codigoBarrasAmostra,
        protocoloAtendimento,
        pacienteNome,
        motivo: oc.motivo,
        custoDesperdicio: custoNum,
        custoDesperdicioFormatado: this.formatCurrency(custoNum),
        descricaoDetalhada: oc.descricaoDetalhada,
        dataHoraRegistro: oc.dataHoraRegistro,
        tuboDescricao,
        examesAfetados,
      });
    }

    const totalRecoletas = ocorrencias.length;
    const custoMedioPorRecoleta = totalRecoletas > 0 ? totalPerdaFinanceira / totalRecoletas : 0;

    // Converte o agrupamento para lista ordenada pelo maior custo financeiro
    const analisePorMotivo: DetalhePerdaMotivoDTO[] = Object.values(perdasPorMotivoMap)
      .filter((item) => item.quantidade > 0)
      .map((item) => ({
        motivo: item.motivo,
        quantidade: item.quantidade,
        perdaTotal: item.perdaTotal,
        perdaTotalFormatada: this.formatCurrency(item.perdaTotal),
        percentualDoTotal:
          totalPerdaFinanceira > 0
            ? Number(((item.perdaTotal / totalPerdaFinanceira) * 100).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.perdaTotal - a.perdaTotal);

    return {
      periodo: {
        mes: mesRef,
        ano: anoRef,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        nomeMesReferencia: `${this.getMonthName(mesRef)}/${anoRef}`,
      },
      metricasFinanceiras: {
        totalPerdaFinanceira: Number(totalPerdaFinanceira.toFixed(2)),
        totalPerdaFormatada: this.formatCurrency(totalPerdaFinanceira),
        totalRecoletasRegistradas: totalRecoletas,
        totalRecoletasComCusto,
        custoMedioPorRecoleta: Number(custoMedioPorRecoleta.toFixed(2)),
        custoMedioFormatado: this.formatCurrency(custoMedioPorRecoleta),
      },
      analisePorMotivo,
      ocorrenciasDetalhadas,
    };
  }

  /**
   * REGRA DE NEGÓCIO 2: AUDITORIA E ALERTAS DE ESTOQUE CRÍTICO / VENCIMENTO
   *
   * Varre a tabela ReagenteEstoque e filtra todos os reagentes onde:
   * 1. quantidadeAtual <= quantidadeMinima (Estoque abaixo ou igual ao ponto de reposição)
   * 2. dataValidade a menos de 30 dias de expirar (ou reagentes já vencidos)
   *
   * @returns Relatório de risco para o gestor de suprimentos e qualidade
   */
  public async checkLowStockAlerts(): Promise<ResumoAlertasEstoqueDTO> {
    const agora = new Date();
    // Limite de 30 dias a contar de hoje
    const limiteTrintaDiasMs = 30 * 24 * 60 * 60 * 1000;

    const reagentes = await prisma.reagenteEstoque.findMany({
      orderBy: {
        dataValidade: 'asc',
      },
    });

    const reagentesComAlerta: AlertaReagenteEstoqueDTO[] = [];
    let totalEstoqueAbaixoMinimo = 0;
    let totalValidadeCritica = 0;
    let totalVencidos = 0;
    let valorFinanceiroEmRisco = 0;

    for (const reagente of reagentes) {
      const quantidadeAtual = Number(reagente.quantidadeAtual);
      const quantidadeMinima = Number(reagente.quantidadeMinima);
      const custoUnitario = Number(reagente.custoUnitario);
      const valorTotalEstoque = quantidadeAtual * custoUnitario;

      const dataValidade = new Date(reagente.dataValidade);
      const diffMs = dataValidade.getTime() - agora.getTime();
      const diasAteVencer = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const isVencido = diasAteVencer < 0;
      const isValidadeCritica = diasAteVencer <= 30;
      const isEstoqueBaixo = quantidadeAtual <= quantidadeMinima;

      // Dispara se alguma das duas regras principais de negócio for atendida
      if (isEstoqueBaixo || isValidadeCritica) {
        const motivosAlerta: string[] = [];

        if (isVencido) {
          totalVencidos++;
          motivosAlerta.push(
            `REAGENTE VENCIDO há ${Math.abs(diasAteVencer)} dia(s)! Lote deve ser segregado imediatamente para descarte.`
          );
        } else if (isValidadeCritica) {
          totalValidadeCritica++;
          motivosAlerta.push(
            `Validade crítica: expira em ${diasAteVencer} dia(s) (limite de atenção: 30 dias).`
          );
        }

        if (isEstoqueBaixo) {
          totalEstoqueAbaixoMinimo++;
          if (quantidadeAtual <= 0) {
            motivosAlerta.push(
              `ESTOQUE ZERADO! Ponto de segurança mínima: ${quantidadeMinima} un.`
            );
          } else {
            motivosAlerta.push(
              `Estoque baixo: quantidade atual (${quantidadeAtual}) atingiu ou superou o ponto de reposição (${quantidadeMinima}).`
            );
          }
        }

        const nivelCriticidade =
          isVencido || quantidadeAtual <= 0 || (isEstoqueBaixo && isValidadeCritica)
            ? 'CRITICO'
            : 'ALERTA';

        valorFinanceiroEmRisco += valorTotalEstoque;

        reagentesComAlerta.push({
          id: reagente.id,
          nome: reagente.nome,
          lote: reagente.lote,
          dataValidade: reagente.dataValidade.toISOString().split('T')[0],
          diasAteVencer,
          quantidadeAtual,
          quantidadeMinima,
          custoUnitario,
          custoUnitarioFormatado: this.formatCurrency(custoUnitario),
          valorTotalEstoque: Number(valorTotalEstoque.toFixed(2)),
          valorTotalEstoqueFormatado: this.formatCurrency(valorTotalEstoque),
          statusCritico: {
            isEstoqueBaixo,
            isValidadeCritica,
            isVencido,
            nivelCriticidade,
          },
          motivosAlerta,
        });
      }
    }

    // Ordena priorizando itens críticos e menores dias até o vencimento
    reagentesComAlerta.sort((a, b) => {
      if (a.statusCritico.nivelCriticidade === 'CRITICO' && b.statusCritico.nivelCriticidade !== 'CRITICO') return -1;
      if (b.statusCritico.nivelCriticidade === 'CRITICO' && a.statusCritico.nivelCriticidade !== 'CRITICO') return 1;
      return a.diasAteVencer - b.diasAteVencer;
    });

    return {
      dataConsulta: agora.toISOString(),
      resumo: {
        totalAlertas: reagentesComAlerta.length,
        totalEstoqueAbaixoMinimo,
        totalValidadeCritica,
        totalVencidos,
        valorFinanceiroEmRisco: Number(valorFinanceiroEmRisco.toFixed(2)),
        valorFinanceiroEmRiscoFormatado: this.formatCurrency(valorFinanceiroEmRisco),
      },
      reagentesComAlerta,
    };
  }

  /**
   * Cadastro de novos reagentes no estoque.
   */
  public async createReagenteEstoque(data: CreateReagenteEstoqueDTO) {
    if (!data.nome || !data.lote) {
      throw new AppError('Nome do reagente e número de lote são obrigatórios.', 400);
    }

    return prisma.reagenteEstoque.create({
      data: {
        nome: data.nome,
        lote: data.lote,
        dataValidade: new Date(data.dataValidade),
        quantidadeAtual: data.quantidadeAtual,
        quantidadeMinima: data.quantidadeMinima,
        custoUnitario: data.custoUnitario,
      },
    });
  }

  /**
   * Registro de consumo de reagente por exame ou atendimento.
   */
  public async recordReagentConsumption(data: CreateConsumoReagenteDTO) {
    return prisma.$transaction(async (tx) => {
      const reagente = await tx.reagenteEstoque.findUnique({
        where: { id: data.reagenteEstoqueId },
      });

      if (!reagente) {
        throw new AppError('Reagente de estoque não localizado.', 404);
      }

      if (Number(reagente.quantidadeAtual) < data.quantidadeConsumida) {
        throw new AppError(
          `Saldo insuficiente no estoque para o reagente '${reagente.nome}'. Disponível: ${reagente.quantidadeAtual}, Requerido: ${data.quantidadeConsumida}`,
          400
        );
      }

      // Registra o consumo
      const consumo = await tx.consumoReagente.create({
        data: {
          exameId: data.exameId,
          reagenteEstoqueId: data.reagenteEstoqueId,
          quantidadeConsumida: data.quantidadeConsumida,
          itemAtendimentoId: data.itemAtendimentoId,
        },
      });

      // Baixa no estoque
      await tx.reagenteEstoque.update({
        where: { id: data.reagenteEstoqueId },
        data: {
          quantidadeAtual: {
            decrement: data.quantidadeConsumida,
          },
        },
      });

      return consumo;
    });
  }

  /**
   * Registro de não conformidade ou ação corretiva no POP (Qualidade).
   */
  public async createQualityRecord(data: CreateRegistroQualidadeDTO) {
    if (!data.tituloPop || !data.descricaoFalha || !data.acaoCorretiva || !data.responsavelId) {
      throw new AppError(
        'Todos os campos do registro de qualidade são obrigatórios (tituloPop, descricaoFalha, acaoCorretiva, responsavelId).',
        400
      );
    }

    return prisma.registroQualidade.create({
      data: {
        tituloPop: data.tituloPop,
        descricaoFalha: data.descricaoFalha,
        acaoCorretiva: data.acaoCorretiva,
        responsavelId: data.responsavelId,
        dataRegistro: data.dataRegistro ? new Date(data.dataRegistro) : new Date(),
      },
    });
  }
}

export default new FinancialQualityService();
