import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DiscussionDto } from './dto/discussion.dto';

@Injectable()
export class DiscussionsService {
    constructor(private prisma: PrismaService) { }

    async getAll() {
        return await this.prisma.discussion.findMany({
            select: {
                id: true,
                topic: true
            }
        });
    }

    async create(dto: DiscussionDto) {
        return await this.prisma.discussion.create({
            data: {
                topic: dto.topic
            }
        });
    }

    async delete(id: string) {
        return await this.prisma.discussion.delete({
            where: {
                id
            }
        });
    }
}
