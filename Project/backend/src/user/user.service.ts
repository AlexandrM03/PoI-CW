import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserInfoDto } from './dto/user-info.dto';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService
    ) { }

    async getUserInfo(username: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                username
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateUserInfo(id: string, dto: UserInfoDto) {
        return await this.prisma.user.update({
            where: {
                id
            },
            data: {
                ...dto
            }
        })
    }

    async updateUserAvatar(id: string, avatarId: string) {
        return await this.prisma.user.update({
            where: {
                id
            },
            data: {
                avatarId
            }
        })
    }

    async getCurrentUserInfo(id: string) {
        return await this.prisma.user.findUnique({
            where: {
                id
            },
            select: {
                username: true,
                avatarId: true
            }
        })
    }

    async getUserSolutions(username: string, page: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                username
            }
        });

        const solutions = await this.prisma.taskSolution.findMany({
            where: {
                authorId: user.id
            },
            include: {
                task: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * 3,
            take: 3
        });

        const length = await this.prisma.taskSolution.count({
            where: {
                authorId: user.id
            }
        });

        return {
            solutions: solutions.map(s => {
                return {
                    id: s.id,
                    code: s.code,
                    likeCount: s.likeCount,
                    createdAt: s.createdAt,
                    taskTitle: s.task.title,
                    taskId: s.task.id,
                    language: s.language
                }
            }),
            length
        }
    }

    async getUsers(username: string = '', page: number = 1) {
        const users = await this.prisma.user.findMany({
            where: {
                username: {
                    contains: username,
                    mode: 'insensitive'
                },
                activationCode: null
            },
            orderBy: {
                score: 'desc'
            },
            select: {
                username: true,
                name: true,
                surname: true,
                company: true,
                about: true,
                isReadyToWork: true,
                score: true,
                avatarId: true,
                solvedTaskCount: true
            },
            skip: (page - 1) * 10,
            take: 10
        });

        const usersWithRank = await Promise.all(users.map(async u => {
            const rank = await this.prisma.user.count({
                where: {
                    score: {
                        gte: u.score
                    }
                }
            });

            return {
                ...u,
                rank
            };
        }));

        const length = await this.prisma.user.count({
            where: {
                username: {
                    contains: username,
                    mode: 'insensitive'
                },
                activationCode: null
            }
        });

        return {
            usersWithRank,
            length
        }
    }

    async getLeaders() {
        return await this.prisma.user.findMany({
            where: {
                activationCode: null
            },
            orderBy: {
                score: 'desc'
            },
            select: {
                username: true,
                name: true,
                surname: true,
                company: true,
                isReadyToWork: true,
                score: true,
                solvedTaskCount: true,
                avatarId: true
            },
            take: 10
        })
    }
}