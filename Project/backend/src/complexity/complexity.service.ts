import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ComplexityService {
    constructor(
        private prisma: PrismaService
    ) { }

    async getComplexities() {
        return await this.prisma.taskComplexity.findMany();
    }
}
