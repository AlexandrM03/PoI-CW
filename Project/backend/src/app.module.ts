import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { AvatarModule } from './avatar/avatar.module';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { CheckModule } from './check/check.module';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';
import { ConfigModule } from '@nestjs/config';
import { CommentModule } from './comment/comment.module';
import { PaginationService } from './pagination/pagination.service';
import { PaginationModule } from './pagination/pagination.module';
import { ComplexityModule } from './complexity/complexity.module';
import { LanguagesModule } from './languages/languages.module';
import { DiscussionModule } from './discussion/discussion.module';
import { DiscussionsModule } from './discussions/discussions.module';

@Module({
    imports: [AuthModule, AvatarModule, UserModule, TaskModule, CheckModule, S3Module, ConfigModule.forRoot(), CommentModule, PaginationModule, ComplexityModule, LanguagesModule, DiscussionModule, DiscussionsModule],
    controllers: [],
    providers: [PrismaService, S3Service, PaginationService],
})
export class AppModule { }
