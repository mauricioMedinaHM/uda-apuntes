import express from 'express';

const router = express.Router();

// Initialize Google Drive API with service account or API key (lazy import to avoid blocking startup)
const initializeDrive = async () => {
  const { google } = await import('googleapis');
  return google.drive({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  });
};

// Validate folder ID to prevent unauthorized access
const isValidFolderId = (folderId) => {
  const allowedFolders = [
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
    // Add other allowed folder IDs here if needed
  ];
  
  // Allow navigation within the root folder tree
  return folderId && (allowedFolders.includes(folderId) || folderId.length > 10);
};

// GET /api/drive/files/:folderId
router.get('/files/:folderId?', async (req, res) => {
  try {
    const folderId = req.params.folderId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 50, 100); // Limit page size
    
    if (!isValidFolderId(folderId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this folder'
      });
    }

    const drive = await initializeDrive();

    const query = `'${folderId}' in parents and trashed=false`;
    
    const response = await drive.files.list({
      q: query,
      pageSize,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size, thumbnailLink)',
      orderBy: 'folder,name'
    });

    // Filter and sanitize response
    const files = response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      size: file.size,
      thumbnailLink: file.thumbnailLink,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder'
    }));

    res.json({
      files,
      nextPageToken: response.data.nextPageToken,
      totalCount: files.length
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    
    if (error.code === 403) {
      res.status(403).json({
        error: 'Access denied',
        message: 'Unable to access the requested folder. Please check permissions.'
      });
    } else if (error.code === 404) {
      res.status(404).json({
        error: 'Not found',
        message: 'The requested folder does not exist or is not accessible.'
      });
    } else {
      res.status(500).json({
        error: 'Server error',
        message: 'Unable to fetch files at this time'
      });
    }
  }
});

// GET /api/drive/search/:folderId
router.get('/search/:folderId', async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const searchTerm = req.query.q;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 50, 100);
    
    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({
        error: 'Invalid search',
        message: 'Search term must be at least 2 characters long'
      });
    }

    if (!isValidFolderId(folderId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to search in this folder'
      });
    }

    const drive = await initializeDrive();
    
    // Escape special characters in search term
    const escapedTerm = searchTerm.replace(/'/g, "\\'");
    const query = `'${folderId}' in parents and name contains '${escapedTerm}' and trashed=false`;

    const response = await drive.files.list({
      q: query,
      pageSize,
      fields: 'files(id, name, mimeType, modifiedTime, size, thumbnailLink)',
      orderBy: 'folder,name'
    });

    const files = response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      size: file.size,
      thumbnailLink: file.thumbnailLink,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder'
    }));

    res.json({
      files,
      searchTerm,
      totalCount: files.length
    });

  } catch (error) {
    console.error('Error searching files:', error);
    res.status(500).json({
      error: 'Search error',
      message: 'Unable to search files at this time'
    });
  }
});

// GET /api/drive/file/:fileId/metadata
router.get('/file/:fileId/metadata', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    if (!fileId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'File ID is required'
      });
    }

    const drive = await initializeDrive();
    
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, modifiedTime, description, thumbnailLink, webViewLink'
    });

    const file = {
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      size: response.data.size,
      modifiedTime: response.data.modifiedTime,
      description: response.data.description,
      thumbnailLink: response.data.thumbnailLink,
      webViewLink: response.data.webViewLink,
      isFolder: response.data.mimeType === 'application/vnd.google-apps.folder'
    };

    res.json(file);

  } catch (error) {
    console.error('Error fetching file metadata:', error);
    res.status(error.code || 500).json({
      error: 'File error',
      message: 'Unable to fetch file information'
    });
  }
});

export default router;