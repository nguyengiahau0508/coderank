import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface LocalFileInfo {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  url: string;
}

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    this.baseUrl = '/api/files';
    this.ensureUploadDir();
  }

  /**
   * Ensure the upload directory exists
   */
  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * Ensure a subdirectory exists inside the upload directory
   */
  private ensureSubDir(subDir: string): string {
    const fullPath = path.join(this.uploadDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
  }

  /**
   * Upload a file to local storage
   * @param file - Multer file object
   * @param subDir - Optional subdirectory (e.g., 'assignments', 'submissions')
   * @returns File info including generated fileId and URL
   */
  async uploadFile(file: Express.Multer.File, subDir = 'general'): Promise<LocalFileInfo> {
    const dir = this.ensureSubDir(subDir);
    const ext = path.extname(file.originalname);
    const fileId = uuidv4();
    const storedName = `${fileId}${ext}`;
    const filePath = path.join(dir, storedName);

    try {
      fs.writeFileSync(filePath, file.buffer);
      this.logger.log(`File uploaded: ${storedName} (${file.size} bytes)`);

      return {
        fileId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: `${subDir}/${storedName}`,
        url: `${this.baseUrl}/${subDir}/${storedName}`,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new Error('Could not save file to local storage');
    }
  }

  /**
   * Delete a file from local storage
   * @param filePath - Relative path of the file (e.g., 'assignments/uuid.pdf')
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`File deleted: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
    }
  }

  /**
   * Get the absolute path to a file
   * @param filePath - Relative path of the file
   */
  getAbsolutePath(filePath: string): string {
    return path.join(this.uploadDir, filePath);
  }

  /**
   * Check if a file exists
   * @param filePath - Relative path of the file
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(path.join(this.uploadDir, filePath));
  }
}
