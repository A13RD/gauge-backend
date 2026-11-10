import { app } from './app';
import { env } from './infrastructure/config/env';
import { prisma } from './infrastructure/db/prisma';

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[GAUGE Backend] Servidor ejecutándose en el puerto ${env.PORT} (${env.NODE_ENV})`);
  // eslint-disable-next-line no-console
  console.log(`[GAUGE Backend] Endpoint de salud: http://localhost:${env.PORT}/api/health`);
});

const gracefulShutdown = async (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`[GAUGE Backend] Señal ${signal} recibida. Cerrando conexiones...`);
  server.close(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('[GAUGE Backend] Servidor y base de datos desconectados limpiamente.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default server;
