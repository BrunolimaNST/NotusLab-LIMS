import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import qualityRoutes from './routes/quality.routes';
import { errorHandler } from './middlewares/errorHandler';

// Carrega variáveis de ambiente (.env)
dotenv.config();

const app: Application = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Rotas da API prefixadas com /api/v1
app.use('/api/v1', routes);
app.use('/api/v1/quality', qualityRoutes);

// Rota raiz para identificação do serviço
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      sistema: 'NotusLab LIMS',
      cliente: 'Cinese Análises Clínicas',
      versao: '1.0.0',
      documentacao: '/api/v1/health',
    },
    error: null,
  });
});

// Tratamento de rotas inexistentes (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      message: 'Endpoint não encontrado no servidor NotusLab LIMS.',
      statusCode: 404,
    },
  });
});

// Middleware Global de Tratamento de Erros (Captura AppError, ZodError e 500)
app.use(errorHandler);

export default app;
