import app from './app';
import prisma from './prisma';

const PORT = Number(process.env.PORT) || 3333;

const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log('🧪 NotusLab LIMS - Backend Iniciado com Sucesso!');
  console.log('🏥 Laboratório: Cinese Análises Clínicas');
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log('====================================================');
});

// Encerramento Gracioso (Graceful Shutdown)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Recebido sinal ${signal}. Encerrando NotusLab LIMS graciosamente...`);

  server.close(async () => {
    console.log('🔒 Servidor HTTP encerrado.');
    await prisma.$disconnect();
    console.log('🔌 Conexão com o banco PostgreSQL encerrada.');
    process.exit(0);
  });

  // Força encerramento se travar por mais de 10s
  setTimeout(() => {
    console.error('⚠️ Encerramento forçado devido ao timeout de 10 segundos.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
