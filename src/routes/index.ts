import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import PreAnalyticalEngineService from '../services/PreAnalyticalEngineService';
import SampleRecollectionService from '../services/SampleRecollectionService';
import { MotivoRejeicaoAmostra } from '@prisma/client';
import prisma from '../prisma';
import qualityRoutes from './quality.routes';

const router = Router();

// =============================================================
// MÓDULO 5: GESTÃO DE QUALIDADE, ESTOQUE E CUSTOS OPERACIONAIS
// =============================================================
router.use('/quality', qualityRoutes);

// =============================================================
// HEALTH CHECK
// =============================================================
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'UP',
      system: 'NotusLab LIMS',
      client: 'Cinese Análises Clínicas',
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
});

// =============================================================
// REGRA 1: MOTOR PRÉ-ANALÍTICO (CÁLCULO E AGRUPAMENTO DE TUBOS)
// =============================================================
const calculateTubesSchema = z.object({
  examesIds: z.array(z.string().uuid('Cada ID de exame deve ser um UUID válido')).min(1, 'Envie ao menos um ID de exame.'),
});

router.post('/pre-analytical/calculate-tubes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { examesIds } = calculateTubesSchema.parse(req.body);
    const resultado = await PreAnalyticalEngineService.calculateTubes(examesIds);

    res.json({
      success: true,
      data: resultado,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================
// REGRA 2: RECOLETA DE AMOSTRAS E ALERTA WHATSAPP
// =============================================================
const registerRecollectionSchema = z.object({
  motivo: z.nativeEnum(MotivoRejeicaoAmostra, {
    errorMap: () => ({
      message: `Motivo inválido. Opções válidas: ${Object.values(MotivoRejeicaoAmostra).join(', ')}`,
    }),
  }),
  descricaoDetalhada: z.string().optional(),
  custoDesperdicio: z.number().nonnegative('O custo de desperdício deve ser positivo ou zero.').optional(),
});

router.post('/samples/:id/recollection', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { motivo, descricaoDetalhada, custoDesperdicio } = registerRecollectionSchema.parse(req.body);

    const resultado = await SampleRecollectionService.registerRecollection(
      id,
      motivo,
      descricaoDetalhada,
      custoDesperdicio
    );

    res.status(201).json({
      success: true,
      data: resultado,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================
// CONSULTAS AUXILIARES (EXAMES E TUBOS)
// =============================================================
router.get('/exams', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const exames = await prisma.exame.findMany({
      include: {
        tuboColeta: true,
        laboratorioApoio: true,
      },
      orderBy: { nome: 'asc' },
    });

    res.json({
      success: true,
      data: exames,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tubes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tubos = await prisma.tuboColeta.findMany({
      orderBy: { ordemCLSI: 'asc' },
    });

    res.json({
      success: true,
      data: tubos,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
