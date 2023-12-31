import {
  Controller,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDTO } from './upload.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Patch(':userId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: FileDTO,
  ) {
    console.log(file.buffer);
    return await this.uploadService.upload(userId, file);
  }

  @Get('avatar/:userId')
  async getUserAvatar(@Param('userId') userId: string) {
    const blobUrl = await this.uploadService.getAvatar(userId);

    return { avatarUrl: blobUrl };
  }
}
