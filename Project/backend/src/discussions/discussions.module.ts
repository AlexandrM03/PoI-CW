import { Module } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { DiscussionsController } from './discussions.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
    controllers: [DiscussionsController],
    providers: [DiscussionsService, PrismaService],
})
export class DiscussionsModule { }
