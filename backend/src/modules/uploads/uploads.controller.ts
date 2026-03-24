import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const uploadDir = join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Controller('uploads')
export class UploadsController {
  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _req: any,
          _file: any,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          cb(null, uploadDir);
        },
        filename: (
          _req: any,
          file: any,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (
        _req: any,
        file: any,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        const allowedTypes = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
        if (!allowedTypes.test(extname(file.originalname))) {
          return cb(
            new BadRequestException('Hanya file gambar yang diperbolehkan'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    return {
      url: `/api/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
    };
  }
}

