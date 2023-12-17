import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from 'src/s3/s3.module';

@Module({
    controllers: [AvatarController],
    providers: [AvatarService, PrismaService],
    imports: [S3Module]
})
export class AvatarModule { }
