import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { requireAuth, clerkClient } from '@clerk/express';
import config from '../config.js';

const { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET_NAME, R2_PUBLIC_URL } = config;

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common academic file types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten PDFs, documentos, hojas de cálculo, presentaciones e imágenes.'));
        }
    }
});

// Initialize S3 client for R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

/**
 * POST /api/upload
 * Upload a file to R2 with user metadata
 */
router.post('/', requireAuth(), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        }

        const { folder } = req.body;
        if (!folder) {
            return res.status(400).json({ error: 'Se requiere la carpeta de destino' });
        }

        const userId = req.auth.userId;
        const userName = req.auth.sessionClaims?.name || req.auth.sessionClaims?.email || 'Usuario';

        // Generate file key (path in R2)
        const timestamp = Date.now();
        const sanitizedFileName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const fileKey = `${folder}${timestamp}_${sanitizedFileName}`;

        console.log(`📤 Uploading file: ${fileKey} by user: ${userName} (${userId})`);

        // Upload to R2
        const uploadCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            Metadata: {
                'owner-id': userId,
                'owner-name': userName,
                'created-at': new Date().toISOString(),
                'original-name': req.file.originalname,
            },
        });

        await s3Client.send(uploadCommand);

        const fileUrl = `${R2_PUBLIC_URL}/${fileKey}`;

        console.log(`✅ File uploaded successfully: ${fileKey}`);

        res.json({
            success: true,
            file: {
                key: fileKey,
                url: fileUrl,
                name: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
                owner: {
                    id: userId,
                    name: userName,
                },
            },
        });
    } catch (error) {
        console.error('❌ Error uploading file:', error);
        res.status(500).json({ error: 'Error al subir el archivo', details: error.message });
    }
});

/**
 * DELETE /api/upload/:fileKey
 * Delete a file (owner or admin only)
 */
router.delete('/:fileKey(*)', requireAuth(), async (req, res) => {
    try {
        const fileKey = req.params.fileKey;
        const userId = req.auth.userId;

        console.log(`🗑️  Delete request for: ${fileKey} by user: ${userId}`);

        // Get user from Clerk to check admin role
        const user = await clerkClient.users.getUser(userId);
        const isAdmin = user.publicMetadata?.role === 'admin';

        // Check file ownership
        const headCommand = new HeadObjectCommand({
            Bucket: config.R2_BUCKET_NAME,
            Key: fileKey,
        });

        const headResult = await s3Client.send(headCommand);
        const fileOwnerId = headResult.Metadata['owner-id'];

        // Allow deletion if user is admin OR file owner
        if (!isAdmin && fileOwnerId !== userId) {
            console.log(`❌ Unauthorized delete attempt: user ${userId} tried to delete file owned by ${fileOwnerId}`);
            return res.status(403).json({ error: 'No tienes permisos para eliminar este archivo' });
        }

        // Log admin deletions for security audit
        if (isAdmin && fileOwnerId !== userId) {
            console.log(`🔑 ADMIN DELETE: User ${userId} (admin) deleted file owned by ${fileOwnerId}`);
        }

        // Delete from R2
        const deleteCommand = new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
        });

        await s3Client.send(deleteCommand);

        console.log(`✅ File deleted successfully: ${fileKey}`);

        res.json({ success: true, message: 'Archivo eliminado correctamente' });
    } catch (error) {
        console.error('❌ Error deleting file:', error);
        if (error.name === 'NotFound') {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        res.status(500).json({ error: 'Error al eliminar el archivo', details: error.message });
    }
});

/**
 * GET /api/upload/check-owner/:fileKey
 * Check if current user owns the file
 */
router.get('/check-owner/:fileKey(*)', requireAuth(), async (req, res) => {
    try {
        const fileKey = req.params.fileKey;
        const userId = req.auth.userId;

        const headCommand = new HeadObjectCommand({
            Bucket: config.R2_BUCKET_NAME,
            Key: fileKey,
        });

        const headResult = await s3Client.send(headCommand);
        const fileOwnerId = headResult.Metadata['owner-id'];

        res.json({
            isOwner: fileOwnerId === userId,
            ownerId: fileOwnerId,
            ownerName: headResult.Metadata['owner-name'],
        });
    } catch (error) {
        console.error('Error checking file ownership:', error);
        if (error.name === 'NotFound') {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        res.status(500).json({ error: 'Error al verificar propiedad del archivo' });
    }
});

export default router;
