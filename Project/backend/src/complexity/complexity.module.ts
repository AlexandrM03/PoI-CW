import { Module } from '@nestjs/common';
import { ComplexityService } from './complexity.service';
import { ComplexityController } from './complexity.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
    controllers: [ComplexityController],
    providers: [ComplexityService, PrismaService],
})
export class ComplexityModule { }
