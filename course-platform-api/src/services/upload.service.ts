// Temporary simplified upload service without multer
// For now, we'll handle file uploads via URL input
// In production, you can implement multer for file uploads

import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directories exist
const ensureUploadDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/videos',
    'uploads/resources',
    'uploads/thumbnails'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureUploadDirectories();

export class UploadService {
  static async handleFileUpload(req: Request) {
    // For now, accept file URLs instead of actual file uploads
    const { fileUrl, fileName, fileType, fileSize } = req.body;

    if (!fileUrl || !fileName || !fileType) {
      throw new Error('fileUrl, fileName, and fileType are required');
    }

    const fileInfo = {
      originalName: fileName,
      filename: `${uuidv4()}${path.extname(fileName)}`,
      url: fileUrl,
      mimetype: this.getMimeType(fileType),
      size: fileSize || 0,
      sizeMB: fileSize ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Unknown',
      type: this.getFileType(fileType),
      uploadedAt: new Date()
    };

    return [fileInfo];
  }

  static getMimeType(fileType: string): string {
    const mimeTypes: Record<string, string> = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'webm': 'video/webm',
      'mkv': 'video/x-matroska',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };

    return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
  }

  static getFileType(fileNameOrType: string): string {
    const ext = path.extname(fileNameOrType).toLowerCase();
    
    if (['.mp4', '.mov', '.avi', '.webm', '.mkv'].includes(ext)) {
      return 'video';
    }
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      return 'image';
    }
    
    if (['.pdf'].includes(ext)) {
      return 'pdf';
    }
    
    if (['.doc', '.docx'].includes(ext)) {
      return 'document';
    }
    
    if (['.ppt', '.pptx'].includes(ext)) {
      return 'presentation';
    }
    
    return 'other';
  }

  static validateVideoUrl(url: string): { valid: boolean; error?: string } {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  static validateFileSize(fileSize?: number, maxSize: number = 500 * 1024 * 1024): { valid: boolean; error?: string } {
    if (!fileSize) return { valid: true };
    
    if (fileSize > maxSize) {
      return { valid: false, error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` };
    }
    
    return { valid: true };
  }
}

// Create a mock multer for TypeScript compatibility
export const upload = {
  array: () => (req: Request, res: any, next: any) => next(),
  single: () => (req: Request, res: any, next: any) => next()
};
