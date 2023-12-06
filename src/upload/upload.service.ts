import { Injectable, NotFoundException } from '@nestjs/common';
import { FileDTO } from './upload.dto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UploadService {
  private s3: S3Client;

  constructor(private readonly userService: UserService) {
    this.s3 = new S3Client({
      region: process.env.REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.ACCESS_SECRET_KEY,
      },
    });
  }

  async upload(userId: string, file: FileDTO): Promise<string> {
    const BUCKET = process.env.BUCKET;
    const folder = 'avatars';
    const region = process.env.REGION;
    const uuid = uuidv4();

    const filename = `${uuid}-${file.originalname}`;

    const params = {
      Bucket: BUCKET,
      Key: `${folder}/${filename}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3.send(new PutObjectCommand(params));

      await this.userService.updateUserAvatar(userId, filename);

      return `https://${BUCKET}.s3.${region}.amazonaws.com/${folder}/${filename}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async getAvatar(userId: string) {
    const filename = await this.userService.getUserAvatarFilename(userId);
    console.log(filename, 'filename');
    if (!filename) {
      throw new Error('Avatar not found');
    }

    try {
      const avatarUrl = `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/avatars/${filename}`;
      return avatarUrl;
    } catch (error) {
      console.error('Error getting user avatar:', error);
      throw new NotFoundException('User avatar not found');
    }
  }
}
