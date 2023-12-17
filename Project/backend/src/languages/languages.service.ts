import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LanguagesService {
    constructor(
        private prisma: PrismaService
    ) { }

    async getLanguages() {
        return await this.prisma.language.findMany();
    }
}
