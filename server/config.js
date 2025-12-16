// Este archivo debe ser importado PRIMERO en server.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env.local
const result = dotenv.config({ path: join(__dirname, '.env.local') });

if (result.error) {
    console.error('❌ Error al cargar .env.local:', result.error.message);
    process.exit(1);
}

console.log('✅ Variables de entorno cargadas desde .env.local');

// Exportar las variables para que estén disponibles
export const config = {
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    PORT: process.env.PORT || 3001,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3003',
    NODE_ENV: process.env.NODE_ENV || 'development'
};
