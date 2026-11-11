import express, { Application, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import { env } from './infrastructure/config/env';
import { apiRouter } from './interface/routers';
import { errorMiddleware } from './interface/middlewares/errorMiddleware';

export const app: Application = express();

const rawOrigins = [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];
const allowedOrigins = rawOrigins
  .flatMap((o) => (o ? o.split(',') : []))
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : undefined;
    if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origen CORS no permitido: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', apiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
  });
});

app.use(errorMiddleware);

export default app;
