import React from 'react';
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  FilmIcon, 
  MusicalNoteIcon, 
  CodeBracketIcon,
  DocumentIcon,
  ArchiveBoxIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
  FolderIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const FileIcon = ({ mimeType, fileName, isFolder, size = "w-8 h-8" }) => {
  if (isFolder) {
    return <FolderIcon className={`${size} text-blue-500`} />;
  }

  const getIconByMimeType = (mimeType, fileName) => {
    // Folder
    if (mimeType === 'application/vnd.google-apps.folder' || 
        mimeType === 'application/vnd.cloudflare.folder') {
      return <FolderIcon className={`${size} text-blue-500`} />;
    }

    // Documents
    if (mimeType?.includes('text/') || 
        mimeType?.includes('application/msword') ||
        mimeType?.includes('application/vnd.openxmlformats-officedocument.wordprocessingml') ||
        fileName?.match(/\.(doc|docx|txt|rtf)$/i)) {
      return <DocumentTextIcon className={`${size} text-blue-600`} />;
    }

    // PDF
    if (mimeType?.includes('application/pdf') || fileName?.match(/\.pdf$/i)) {
      return <DocumentArrowDownIcon className={`${size} text-red-500`} />;
    }

    // Presentations
    if (mimeType?.includes('application/vnd.ms-powerpoint') ||
        mimeType?.includes('application/vnd.openxmlformats-officedocument.presentationml') ||
        mimeType?.includes('application/vnd.google-apps.presentation') ||
        fileName?.match(/\.(ppt|pptx|key)$/i)) {
      return <PresentationChartLineIcon className={`${size} text-orange-500`} />;
    }

    // Spreadsheets
    if (mimeType?.includes('application/vnd.ms-excel') ||
        mimeType?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml') ||
        mimeType?.includes('application/vnd.google-apps.spreadsheet') ||
        fileName?.match(/\.(xls|xlsx|csv|numbers)$/i)) {
      return <TableCellsIcon className={`${size} text-green-600`} />;
    }

    // Images
    if (mimeType?.includes('image/') || 
        fileName?.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp|ico)$/i)) {
      return <PhotoIcon className={`${size} text-purple-500`} />;
    }

    // Videos
    if (mimeType?.includes('video/') || 
        fileName?.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
      return <FilmIcon className={`${size} text-pink-500`} />;
    }

    // Audio
    if (mimeType?.includes('audio/') || 
        fileName?.match(/\.(mp3|wav|flac|aac|ogg|wma)$/i)) {
      return <MusicalNoteIcon className={`${size} text-indigo-500`} />;
    }

    // Code files
    if (mimeType?.includes('text/') ||
        fileName?.match(/\.(js|jsx|ts|tsx|html|css|scss|sass|less|json|xml|yml|yaml|py|java|cpp|c|php|rb|go|rs|swift)$/i)) {
      return <CodeBracketIcon className={`${size} text-yellow-600`} />;
    }

    // Archives
    if (mimeType?.includes('application/zip') ||
        mimeType?.includes('application/x-rar') ||
        mimeType?.includes('application/x-tar') ||
        fileName?.match(/\.(zip|rar|7z|tar|gz|bz2)$/i)) {
      return <ArchiveBoxIcon className={`${size} text-gray-600`} />;
    }

    // Default
    return <DocumentIcon className={`${size} text-gray-500`} />;
  };

  return (
    <div className="flex items-center justify-center">
      {getIconByMimeType(mimeType, fileName)}
    </div>
  );
};

export default FileIcon;