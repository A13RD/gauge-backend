import dotenv from 'dotenv';
import path from 'path';

// Carga inicial desde el directorio de trabajo actual
dotenv.config();

// Fallback robusto al archivo .env situado en la raíz del backend
const backendEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: backendEnvPath });

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`[Config Error] Variable de entorno requerida no encontrada: ${key}`);
  }
  return value.trim();
}

const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseSecret || supabaseSecret.trim() === '') {
  throw new Error(
    '[Config Error] Se requiere SUPABASE_SECRET_KEY en las variables de entorno'
  );
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  JWT_SECRET: getRequiredEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SUPABASE_URL: getRequiredEnv('SUPABASE_URL'),
  SUPABASE_SECRET_KEY: supabaseSecret.trim(),
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'game-covers',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
