import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service';

export class UploadController {
  static async uploadFiles(req: Request, res: Response) {
    try {
      const { files } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const fileInfo = [];
      for (const file of files) {
        const result = await UploadService.handleFileUpload({
          ...req,
          body: file
        } as Request);
        fileInfo.push(...result);
      }

      return res.json({
        success: true,
        message: 'Files uploaded successfully',
        files: fileInfo,
        count: fileInfo.length
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async uploadVideo(req: Request, res: Response) {
    try {
      const { videoUrl, fileName = 'video.mp4', fileSize } = req.body;

      if (!videoUrl) {
        return res.status(400).json({ error: 'videoUrl is required' });
      }

      const validation = UploadService.validateVideoUrl(videoUrl);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const sizeValidation = UploadService.validateFileSize(fileSize, 500 * 1024 * 1024);
      if (!sizeValidation.valid) {
        return res.status(400).json({ error: sizeValidation.error });
      }

      const fileInfo = await UploadService.handleFileUpload({
        ...req,
        body: {
          fileUrl: videoUrl,
          fileName: fileName,
          fileType: path.extname(fileName).substring(1) || 'mp4',
          fileSize: fileSize
        }
      } as Request);

      return res.json({
        success: true,
        message: 'Video uploaded successfully',
        video: fileInfo[0]
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async uploadResource(req: Request, res: Response) {
    try {
      const { resourceUrl, fileName, fileSize } = req.body;

      if (!resourceUrl || !fileName) {
        return res.status(400).json({ error: 'resourceUrl and fileName are required' });
      }

      const sizeValidation = UploadService.validateFileSize(fileSize, 50 * 1024 * 1024);
      if (!sizeValidation.valid) {
        return res.status(400).json({ error: sizeValidation.error });
      }

      const fileInfo = await UploadService.handleFileUpload({
        ...req,
        body: {
          fileUrl: resourceUrl,
          fileName: fileName,
          fileType: path.extname(fileName).substring(1) || 'pdf',
          fileSize: fileSize
        }
      } as Request);

      return res.json({
        success: true,
        message: 'Resource uploaded successfully',
        resource: fileInfo[0]
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async uploadThumbnail(req: Request, res: Response) {
    try {
      const { thumbnailUrl, fileName = 'thumbnail.jpg' } = req.body;

      if (!thumbnailUrl) {
        return res.status(400).json({ error: 'thumbnailUrl is required' });
      }

      const fileInfo = await UploadService.handleFileUpload({
        ...req,
        body: {
          fileUrl: thumbnailUrl,
          fileName: fileName,
          fileType: path.extname(fileName).substring(1) || 'jpg'
        }
      } as Request);

      return res.json({
        success: true,
        message: 'Thumbnail uploaded successfully',
        thumbnail: fileInfo[0]
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

import path from 'path';
