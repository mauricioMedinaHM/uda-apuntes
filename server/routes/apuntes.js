import express from 'express';
import dotenv from 'dotenv';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Cargar variables de entorno
dotenv.config();

// Extraer variables y hacer logging seguro (sin mostrar valores)
const {
  R2_ENDPOINT,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL
} = process.env;

console.log(`[R2] R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID ? '[CARGADO]' : '[FALTA]'}`);
console.log(`[R2] R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY ? '[CARGADO]' : '[FALTA]'}`);
console.log(`[R2] R2_ENDPOINT: ${R2_ENDPOINT ? '[CARGADO]' : '[FALTA]'}`);
console.log(`[R2] R2_BUCKET_NAME: ${R2_BUCKET_NAME ? '[CARGADO]' : '[FALTA]'}`);

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('R2 credentials missing: R2_ACCESS_KEY_ID or R2_SECRET_ACCESS_KEY no están definidos');
  throw new Error('R2 credentials missing: define R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY en el entorno del backend');
}

const router = express.Router();

// Configurar el cliente R2
const S3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// URL pública del bucket R2
const PUBLIC_BASE_URL = R2_PUBLIC_URL || '';

/**
 * Obtener MIME type basado en la extensión del archivo
 */
function getMimeType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// GET /api/apuntes
router.get('/', async (req, res) => {
  try {
    // Obtener el prefix de la query string (para filtrar por carpeta)
    const prefix = req.query.prefix || 'apuntes/';
    
    // Asegurar que siempre empiece con 'apuntes/' y termine con '/' si es carpeta
    const normalizedPrefix = prefix.startsWith('apuntes/') 
      ? prefix 
      : `apuntes/${prefix}`;
    
    // Pedimos la lista de archivos al bucket con el prefix
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: normalizedPrefix,
      Delimiter: '/', // Esto ayuda a separar carpetas de archivos
    });

    const data = await S3.send(command);

    // Procesar carpetas (CommonPrefixes) y archivos (Contents)
    const carpetas = (data.CommonPrefixes || []).map((prefix) => {
      const nombreCarpeta = prefix.Prefix.replace(normalizedPrefix, '').replace(/\/$/, '');
      return {
        id: prefix.Prefix,
        nombre: nombreCarpeta,
        tipo: 'carpeta',
        mimeType: 'application/vnd.cloudflare.folder',
        path: prefix.Prefix,
        isFolder: true,
      };
    });

    // Procesar archivos (solo los que están directamente en esta carpeta, no en subcarpetas)
    const archivos = (data.Contents || [])
      .filter((file) => {
        // Excluir si es una "carpeta" (termina en /) o está en una subcarpeta
        const relativePath = file.Key.replace(normalizedPrefix, '');
        return !file.Key.endsWith('/') && !relativePath.includes('/');
      })
      .map((file) => {
        const nombreArchivo = file.Key.split('/').pop();
        const mimeType = getMimeType(nombreArchivo);
        const urlPublica = PUBLIC_BASE_URL 
          ? `${PUBLIC_BASE_URL}/${file.Key}` 
          : `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${file.Key}`;
        
        return {
          id: file.Key,
          nombre: nombreArchivo,
          tipo: 'archivo',
          mimeType: mimeType,
          tamaño: file.Size,
          ultimaModificacion: file.LastModified,
          path: file.Key,
          url: urlPublica,
          isFolder: false,
        };
      });

    // Combinar carpetas y archivos, ordenar (carpetas primero)
    const resultado = [...carpetas, ...archivos].sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.nombre.localeCompare(b.nombre);
    });

    return res.status(200).json({
      archivos: resultado,
      prefix: normalizedPrefix,
      total: resultado.length,
    });

  } catch (error) {
    console.error('Error en /api/apuntes:', error);
    return res.status(500).json({ 
      error: "Error al obtener apuntes",
      message: error.message 
    });
  }
});

export default router;
