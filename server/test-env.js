import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📂 Directorio actual:', __dirname);
console.log('📄 Intentando cargar .env.local desde:', join(__dirname, '.env.local'));

const result = dotenv.config({ path: '.env.local' });

if (result.error) {
    console.error('❌ Error al cargar .env.local:', result.error.message);
} else {
    console.log('✅ Archivo .env.local cargado exitosamente');
    console.log('📋 Variables cargadas:', Object.keys(result.parsed || {}));
}

console.log('\n🔍 Variables de entorno R2:');
console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? '✅ DEFINIDA' : '❌ NO DEFINIDA');
console.log('R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? '✅ DEFINIDA' : '❌ NO DEFINIDA');
console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT ? '✅ DEFINIDA' : '❌ NO DEFINIDA');
console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME ? '✅ DEFINIDA' : '❌ NO DEFINIDA');
console.log('R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID ? '✅ DEFINIDA' : '❌ NO DEFINIDA');
