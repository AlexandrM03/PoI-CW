import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class DiscussionService {
    constructor(private prisma: PrismaService) { }

    async create(dto: MessageDto) {
        const newMessage = await this.prisma.message.create({
            data: {
                text: dto.text,
                authorId: dto.userId,
                discussionId: dto.discussionId
            }
        });

        return await this.prisma.message.findUnique({
            where: {
                id: newMessage.id
            },
            select: {
                text: true,
                createdAt: true,
                author: {
                    select: {
                        username: true,
                        avatarId: true
                    }
                }
            }
        });
    }

    async findAll(discussionId: string) {
        return await this.prisma.message.findMany({
            where: {
                discussionId
            },
            select: {
                text: true,
                createdAt: true,
                author: {
                    select: {
                        username: true,
                        avatarId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }
}