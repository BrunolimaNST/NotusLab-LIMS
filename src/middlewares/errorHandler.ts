import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Erros Operacionais Conhecidos da Aplicação (AppError)
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      data: null,
      error: {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details ?? null,
      },
    });
    return;
  }

  // 2. Erros de Validação Zod
  if (error instanceof ZodError) {
    res.status(422).json({
      success: false,
      data: null,
      error: {
        message: 'Falha de validação nos dados fornecidos.',
        statusCode: 422,
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
    });
    return;
  }

  // 3. Erro Genérico Inesperado (500)
  console.error('[ERRO_INTERNO_NAO_TRATADO]:', error);

  res.status(500).json({
    success: false,
    data: null,
    error: {
      message: 'Ocorreu um erro interno no servidor do NotusLab LIMS.',
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? error.stack : null,
    },
  });
};
