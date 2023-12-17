import { Module } from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { DiscussionGateway } from './discussion.gateway';
import { PrismaService } from 'src/prisma.service';

@Module({
    providers: [DiscussionGateway, DiscussionService, PrismaService],
})
export class DiscussionModule { }
