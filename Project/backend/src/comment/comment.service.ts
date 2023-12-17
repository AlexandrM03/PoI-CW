import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CommentService {
    constructor(
        private prisma: PrismaService
    ) { }

    async createComment(authorId: string, taskId: string, text: string) {
        const comment = await this.prisma.comment.create({
            data: {
                authorId,
                taskId,
                text
            }
        });

        return await this.prisma.comment.findUnique({
            where: {
                id: comment.id
            },
            include: {
                author: true
            }
        });
    }

    async getCommentsByTaskId(taskId: string) {
        return await this.prisma.comment.findMany({
            where: {
                taskId
            },
            include: {
                author: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async reportComment(authorId: string, commentId: string, text: string) {
        return await this.prisma.commentReport.create({
            data: {
                authorId,
                commentId,
                text
            }
        });
    }

    async deleteComment(id: string) {
        const commentReport = await this.prisma.commentReport.findUnique({
            where: {
                id
            }
        });

        await this.prisma.commentReport.delete({
            where: {
                id
            }
        });

        return await this.prisma.comment.delete({
            where: {
                id: commentReport.commentId
            }
        });
    }

    async getCommentReports() {
        return await this.prisma.commentReport.findMany({
            include: {
                comment: {
                    include: {
                        author: true
                    }
                },
                author: true
            }
        });
    }

    async deleteCommentReport(id: string) {
        return await this.prisma.commentReport.delete({
            where: {
                id
            }
        });
    }
}
