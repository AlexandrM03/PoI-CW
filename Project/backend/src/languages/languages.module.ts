import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
    controllers: [LanguagesController],
    providers: [LanguagesService, PrismaService],
})
export class LanguagesModule { }
