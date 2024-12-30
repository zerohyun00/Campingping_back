import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: this.configService.get('AWS_REGION'),
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<string> {
    const key = `profiles/${userId}-${Date.now()}-${file.originalname}`;

    // S3 업로드 명령 생성
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    // S3에 명령 실행
    await this.s3.send(command);

    // 업로드된 파일의 URL 반환
    return `https://${this.bucket}.s3.${this.configService.get(
      'AWS_REGION',
    )}.amazonaws.com/${key}`;
  }
}
