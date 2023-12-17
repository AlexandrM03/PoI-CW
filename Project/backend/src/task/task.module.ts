import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaService } from 'src/prisma.service';
import { CheckService } from 'src/check/check.service';
import { S3Module } from 'src/s3/s3.module';
import { PaginationService } from 'src/pagination/pagination.service';

@Module({
    controllers: [TaskController],
    providers: [TaskService, PrismaService, CheckService, PaginationService],
    imports: [S3Module]
})
export class TaskModule { }
