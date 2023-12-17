import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

@Injectable()
export class S3Service {
    private readonly client: S3Client;
    private readonly bucket: string;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.client = new S3Client({
            region: configService.get('S3_REGION'),
            credentials: {
                accessKeyId: configService.get('S3_ACCESS_KEY_ID'),
                secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY')
            },
            endpoint: configService.get('S3_ENDPOINT'),
            forcePathStyle: true,
            apiVersion: 'latest'
        });
        this.bucket = configService.get('S3_BUCKET');
    }

    async getUnitTest(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key
        });
        const response = await this.client.send(command);
        return response.Body;
    }

    async createUnitTest(key: string, code: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: code,
            ContentType: 'text/plain'
        });
        await this.client.send(command);
    }

    async deleteUnitTest(key: string) {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key
        });
        await this.client.send(command);
    }

    async createImage(key: string, body: Buffer) {
        const resizedWebpImage = await sharp(body)
            .resize(300, 300)
            .toFormat('webp')
            .toBuffer();

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: resizedWebpImage,
            ContentType: 'image/webp'
        });
        await this.client.send(command);
    }

    async getImageUrl(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key
        });
        return await getSignedUrl(this.client, command, { expiresIn: 3600 });
    }
}
