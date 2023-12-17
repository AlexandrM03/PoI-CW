import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuid } from 'uuid';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class AvatarService {
    private readonly basePath = 'public/avatars';

    constructor(
        private prisma: PrismaService,
        private s3: S3Service
    ) { }

    async saveImage(file: Express.Multer.File) {
        try {
            const id = uuid();

            const key = `${this.basePath}/${id}.webp`;

            await this.s3.createImage(key, file.buffer);

            const avatar = await this.prisma.avatar.create({
                data: {
                    id,
                    url: key
                }
            });

            return avatar.id;
        } catch (err) {
            throw new BadRequestException("Please, provide a valid image");
        }
    }

    async getImage(id: string) {
        const avatar = await this.prisma.avatar.findUnique({
            where: { id }
        });

        if (!avatar) {
            throw new NotFoundException('Avatar not found');
        }

        return await this.s3.getImageUrl(avatar.url);
    }
}
