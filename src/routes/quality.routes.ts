import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import FinancialQualityService from '../services/FinancialQualityService';
import prisma from '../prisma';

const router = Router();

// =============================================================
// ESQUEMAS DE VALIDAÇÃO ZOD
// =============================================================

const recollectionLossQuerySchema = z.object({
  mes: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (val >= 1 && val <= 12), {
      message: 'O mês deve ser um número inteiro entre 1 e 12.',
    }),
  ano: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (val >= 2000 && val <= 2100), {
      message: 'O ano deve ser um ano válido entre 2000 e 2100.',
    }),
});

const createReagentSchema = z.object({
  nome: z.string().min(2, 'Nome do reagente é obrigatório.'),
  lote: z.string().min(1, 'Número do lote é obrigatório.'),
  dataValidade: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data de validade deve ser uma data válida (ISO 8601 ou YYYY-MM-DD).',
  }),
  quantidadeAtual: z.number().nonnegative('Quantidade atual deve ser maior ou igual a zero.'),
  quantidadeMinima: z.number().nonnegative('Quantidade mínima deve ser maior ou igual a zero.'),
  custoUnitario: z.number().positive('Custo unitário deve ser maior que zero.'),
});

const createQualityRecordSchema = z.object({
  tituloPop: z.string().min(3, 'O título do POP deve ter pelo menos 3 caracteres.'),
  descricaoFalha: z.string().min(5, 'A descrição da falha deve ser detalhada.'),
  acaoCorretiva: z.string().min(5, 'A ação corretiva deve ser informada.'),
  responsavelId: z.string().min(1, 'O identificador do responsável é obrigatório.'),
  dataRegistro: z.string().optional(),
});

// =============================================================
// ENDPOINT 1: PERDAS FINANCEIRAS POR RECOLETAS DE AMOSTRAS
// GET /api/v1/quality/costs?mes=10&ano=2026
// =============================================================
router.get('/costs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mes, ano } = recollectionLossQuerySchema.parse(req.query);

    const relatorioPerdas = await FinancialQualityService.calculateRecollectionLoss(mes, ano);

    res.json({
      success: true,
      data: relatorioPerdas,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================
// ENDPOINT 2: AUDITORIA E ALERTAS DE ESTOQUE BAIXO / VENCIMENTO
// GET /api/v1/quality/stock-alerts
// =============================================================
router.get('/stock-alerts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const alertas = await FinancialQualityService.checkLowStockAlerts();

    res.json({
      success: true,
      data: alertas,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================
// ENDPOINTS COMPLEMENTARES: GESTÃO DE REAGENTES E POP
// =============================================================

// Listar todos os reagentes em estoque
router.get('/reagents', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reagentes = await prisma.reagenteEstoque.findMany({
      orderBy: { nome: 'asc' },
    });

    res.json({
      success: true,
      data: reagentes,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// Cadastrar novo reagente no estoque
router.post('/reagents', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dados = createReagentSchema.parse(req.body);
    const novoReagente = await FinancialQualityService.createReagenteEstoque(dados);

    res.status(201).json({
      success: true,
      data: novoReagente,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// Registrar ocorrência / Não conformidade POP (Qualidade)
router.post('/records', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dados = createQualityRecordSchema.parse(req.body);
    const novoRegistro = await FinancialQualityService.createQualityRecord(dados);

    res.status(201).json({
      success: true,
      data: novoRegistro,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// Listar histórico de registros de qualidade POP
router.get('/records', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const registros = await prisma.registroQualidade.findMany({
      orderBy: { dataRegistro: 'desc' },
    });

    res.json({
      success: true,
      data: registros,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
