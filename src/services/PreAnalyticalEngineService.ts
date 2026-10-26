import prisma from '../prisma';
import { AppError } from '../errors/AppError';
import { TuboColeta } from '@prisma/client';

export interface ExameAgrupadoDTO {
  id: string;
  mnemonico: string;
  nome: string;
  setorLaboratorial: string;
  tempoJejumHoras: number;
  orientacoesPreparo: string | null;
  precoBaseReais: number;
  requerApoioExterno: boolean;
}

export interface TuboCalculadoDTO {
  tubo: {
    id: string;
    codigo: string;
    descricao: string;
    corTampaHex: string;
    aditivoAnticoagulante: string;
    volumeMinimoMl: number;
    ordemCLSI: number;
    instrucoesHomogeneizacao: string;
  };
  exames: ExameAgrupadoDTO[];
  volumeRecomendadoMl: number;
}

export interface ResultadoPreAnaliticoDTO {
  totalTubosNecessarios: number;
  tubosOrdenadosCLSI: TuboCalculadoDTO[];
  orientacoesPreparoGerais: string[];
  tempoJejumMaximoHoras: number;
}

export class PreAnalyticalEngineService {
  /**
   * Calcula a lista exata e ordenada de tubos de coleta necessários para um conjunto de exames,
   * agrupando exames compatíveis no mesmo tubo e aplicando a ordem internacional CLSI H3-A6.
   *
   * @param examesIds Lista de IDs dos exames solicitados no atendimento/orçamento
   * @returns Tubos consolidados e ordenados com seus respectivos exames
   */
  public async calculateTubes(examesIds: string[]): Promise<ResultadoPreAnaliticoDTO> {
    if (!examesIds || !Array.isArray(examesIds) || examesIds.length === 0) {
      throw new AppError('A lista de identificadores de exames não pode estar vazia.', 400);
    }

    // 1. Elimina IDs duplicados enviados na requisição
    const uniqueExamesIds = Array.from(new Set(examesIds));

    // 2. Busca exames e seus respectivos tubos associados no banco
    const exames = await prisma.exame.findMany({
      where: {
        id: { in: uniqueExamesIds },
      },
      include: {
        tuboColeta: true,
      },
    });

    // 3. Validação: verifica se todos os exames foram encontrados
    if (exames.length !== uniqueExamesIds.length) {
      const examesEncontradosIds = new Set(exames.map((e) => e.id));
      const examesNaoEncontrados = uniqueExamesIds.filter((id) => !examesEncontradosIds.has(id));

      throw new AppError(
        `Os seguintes exames não foram encontrados no catálogo: ${examesNaoEncontrados.join(', ')}`,
        404
      );
    }

    // 4. Agrupa os exames por tuboColetaId (elimina tubos duplicados)
    const agrupamentoPorTubo = new Map<
      string,
      {
        tubo: TuboColeta;
        exames: ExameAgrupadoDTO[];
      }
    >();

    const orientacoesSet = new Set<string>();
    let tempoJejumMaximoHoras = 0;

    for (const exame of exames) {
      const tubo = exame.tuboColeta;

      if (!tubo) {
        throw new AppError(
          `O exame ${exame.mnemonico || exame.nome} não possui tubo de coleta configurado no sistema.`,
          422
        );
      }

      if (!tubo.ativo) {
        throw new AppError(
          `O tubo ${tubo.codigo} associado ao exame ${exame.mnemonico || exame.nome} está inativo no sistema.`,
          422
        );
      }

      if (exame.tempoJejumHoras > tempoJejumMaximoHoras) {
        tempoJejumMaximoHoras = exame.tempoJejumHoras;
      }

      if (exame.orientacoesPreparo) {
        orientacoesSet.add(exame.orientacoesPreparo);
      }

      const exameFormatado: ExameAgrupadoDTO = {
        id: exame.id,
        mnemonico: exame.mnemonico || exame.codigo || 'S/M',
        nome: exame.nome,
        setorLaboratorial: exame.setorLaboratorial || 'Geral',
        tempoJejumHoras: exame.tempoJejumHoras,
        orientacoesPreparo: exame.orientacoesPreparo,
        precoBaseReais: Number(exame.precoBaseReais || exame.preco || 0),
        requerApoioExterno: exame.requerApoioExterno,
      };

      if (!agrupamentoPorTubo.has(tubo.id)) {
        agrupamentoPorTubo.set(tubo.id, {
          tubo,
          exames: [exameFormatado],
        });
      } else {
        agrupamentoPorTubo.get(tubo.id)!.exames.push(exameFormatado);
      }
    }

    // 5. Converte o mapa em lista e ordena rigorosamente pela regra CLSI H3-A6 (ordemCLSI crescente)
    const tubosCalculados: TuboCalculadoDTO[] = Array.from(agrupamentoPorTubo.values()).map(
      ({ tubo, exames: examesAgrupados }) => ({
        tubo: {
          id: tubo.id,
          codigo: tubo.codigo,
          descricao: tubo.descricao,
          corTampaHex: tubo.corTampaHex,
          aditivoAnticoagulante: tubo.aditivoAnticoagulante,
          volumeMinimoMl: Number(tubo.volumeMinimoMl),
          ordemCLSI: tubo.ordemCLSI,
          instrucoesHomogeneizacao: tubo.instrucoesHomogeneizacao,
        },
        exames: examesAgrupados,
        volumeRecomendadoMl: Number(tubo.volumeMinimoMl),
      })
    );

    // Ordenação estrita pelo padrão internacional CLSI (ordemCLSI: 1 Azul, 2 Amarelo, 3 Verde, 4 Roxo, 5 Cinza)
    tubosCalculados.sort((a, b) => a.tubo.ordemCLSI - b.tubo.ordemCLSI);

    return {
      totalTubosNecessarios: tubosCalculados.length,
      tubosOrdenadosCLSI: tubosCalculados,
      orientacoesPreparoGerais: Array.from(orientacoesSet),
      tempoJejumMaximoHoras,
    };
  }
}

export default new PreAnalyticalEngineService();
