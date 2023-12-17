import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskCardDto } from './dto/task-card.dto';
import { CheckService } from 'src/check/check.service';
import { TaskComplexities } from './enum/task-complexities.enum';
import { S3Service } from 'src/s3/s3.service';
import { SortTaskDto } from './dto/task-sort.dto';
import { Prisma } from '@prisma/client';
import { EnumTaskSort } from './enum/task-sort.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { TaskLanguages } from './enum/task-languages.enum';

@Injectable()
export class TaskService {
    private readonly basePath = 'public/unit_tests';

    constructor(
        private prisma: PrismaService,
        private check: CheckService,
        private s3: S3Service,
        private paginationService: PaginationService
    ) { }

    async checkTask(userId: string, taskId: string, code: string, languageId: string) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                complexity: true
            }
        });

        const taskLanguage = await this.prisma.taskLanguage.findUnique({
            where: {
                taskId_languageId: {
                    taskId: task.id,
                    languageId
                }
            },
            include: {
                language: true
            }
        })

        let result: string;
        if (taskLanguage.language.name === 'python') {
            result = await this.check.checkPythonTask(taskLanguage.unitTestsPath, code);
        } else if (taskLanguage.language.name === 'go') {
            result = await this.check.checkGoTask(taskLanguage.unitTestsPath, code);
        } else if (taskLanguage.language.name === 'rust') {
            result = await this.check.checkRustTask(taskLanguage.unitTestsPath, code);
        } else if (taskLanguage.language.name === 'cpp') {
            result = await this.check.checkCppTask(taskLanguage.unitTestsPath, code);
        } else {
            throw new BadRequestException('Language not supported');
        }

        if (result !== '') {
            throw new BadRequestException(result);
        }

        const isAlreadySolved = await this.prisma.taskSolution.findFirst({
            where: {
                AND: [
                    { taskId },
                    { authorId: userId }
                ]
            }
        });

        if (isAlreadySolved) {
            await this.prisma.taskSolution.update({
                where: { id: isAlreadySolved.id },
                data: {
                    code,
                    createdAt: new Date(),
                    likeCount: 0,
                    language: taskLanguage.language.name
                }
            });
            return true;
        }

        await this.prisma.task.update({
            where: { id: taskId },
            data: {
                soledTimes: {
                    increment: 1
                }
            }
        })

        await this.prisma.taskSolution.create({
            data: {
                code,
                authorId: userId,
                taskId,
                language: taskLanguage.language.name
            }
        });

        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        const evaluatedScore = await this.evaluateScore(user.score, task.complexity.name);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                score: {
                    increment: evaluatedScore
                },
                solvedTaskCount: {
                    increment: 1
                }
            }
        });

        return true;
    }

    private async evaluateScore(score: number, complexity: string) {
        let userRank: number;
        if (score < 50) {
            userRank = 1;
        } else if (score < 150) {
            userRank = 2;
        } else if (score < 500) {
            userRank = 3;
        } else if (score < 2000) {
            userRank = 4;
        } else {
            userRank = 5;
        }

        let complexityScore: number;
        if (complexity === TaskComplexities.CODE_CADET) {
            complexityScore = 7;
        } else if (complexity === TaskComplexities.SCRIPT_KIDDIE) {
            complexityScore = 16;
        } else if (complexity === TaskComplexities.DEBUGGING_MAESTRO) {
            complexityScore = 39;
        } else if (complexity === TaskComplexities.BYTE_BOFFIN) {
            complexityScore = 120;
        } else {
            complexityScore = 330;
        }

        return Math.ceil(complexityScore - (complexityScore * (userRank * 0.1)));
    }

    async getTasks(isAccepted: boolean, dto: SortTaskDto = {}) {
        const { sort, searchTerm, complexity, language } = dto;
        const prismaSort: Prisma.TaskOrderByWithRelationInput[] = [];
        if (sort === EnumTaskSort.LEAST_SOLVED) {
            prismaSort.push({ soledTimes: 'asc' });
        } else if (sort === EnumTaskSort.MOST_SOLVED) {
            prismaSort.push({ soledTimes: 'desc' });
        } else if (sort === EnumTaskSort.NEWEST) {
            prismaSort.push({ createdAt: 'desc' });
        } else if (sort === EnumTaskSort.OLDEST) {
            prismaSort.push({ createdAt: 'asc' });
        } else if (sort === EnumTaskSort.MOST_POPULAR) {
            prismaSort.push({ viewsCount: 'desc' });
        } else if (sort === EnumTaskSort.LEAST_POPULAR) {
            prismaSort.push({ viewsCount: 'asc' });
        }

        const prismaWhere: Prisma.TaskWhereInput = searchTerm ? {
            OR: [
                { title: { contains: searchTerm } },
                { description: { contains: searchTerm } },
            ]
        } : {};

        const prismaComplexity: Prisma.TaskWhereInput = complexity && complexity !== TaskComplexities.ALL ? {
            complexity: {
                name: complexity
            }
        } : {};

        const prismaLanguage: Prisma.TaskWhereInput = language && language !== TaskLanguages.ALL ? {
            languages: {
                some: {
                    language: {
                        name: language
                    }
                }
            }
        } : {};

        const { perPage, skip } = this.paginationService.getPagination(dto);

        const tasks = await this.prisma.task.findMany({
            where: {
                isAccepted,
                ...prismaWhere,
                ...prismaComplexity,
                ...prismaLanguage
            },
            include: {
                complexity: true,
                languages: {
                    include: {
                        language: true
                    }
                }
            },
            orderBy: prismaSort,
            skip,
            take: perPage
        });

        const length = await this.prisma.task.count({
            where: {
                isAccepted,
                ...prismaWhere,
                ...prismaComplexity,
                ...prismaLanguage
            }
        });

        return {
            tasks: tasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                taskComplexity: task.complexity.name,
                languages: task.languages.map(taskLanguage => taskLanguage.language.name),
                createdAt: task.createdAt,
                solvedTimes: task.soledTimes
            })),
            length
        }
    }

    async getTaskById(id: string) {
        const taskInfo = await this.prisma.task.findUnique({
            where: { id },
            include: {
                languages: {
                    include: {
                        language: true
                    }
                },
                complexity: true,
                author: true
            }
        });

        await this.prisma.task.update({
            where: { id },
            data: {
                viewsCount: {
                    increment: 1
                }
            }
        });

        return {
            id: taskInfo.id,
            title: taskInfo.title,
            description: taskInfo.description,
            authorId: taskInfo.authorId,
            authorUsername: taskInfo.author.username,
            complexity: taskInfo.complexity.name,
            createdAt: taskInfo.createdAt,
            solvedTimes: taskInfo.soledTimes,
            languages: taskInfo.languages.map(taskLanguage => ({
                id: taskLanguage.language.id,
                name: taskLanguage.language.name,
                codeSnippet: taskLanguage.codeSnippet
            }))
        }
    }

    async createTask(authorId: string, dto: CreateTaskDto) {
        const createdTask = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                authorId,
                taskComplexityId: dto.taskComplexityId,
                languages: {
                    create: await Promise.all(dto.languages.map(async (id) => {
                        const language = await this.prisma.language.findUnique({
                            where: { id }
                        });
                        const unitTestCode = dto.unitTestCode[id];
                        const codeSnippet = dto.codeSnippet[id];

                        const unitTestsPath = await this.saveUnitTest(unitTestCode, language.name);

                        return {
                            languageId: id,
                            unitTestsPath,
                            codeSnippet,
                        };
                    })),
                },
            },
            include: {
                complexity: true,
                languages: {
                    include: {
                        language: true,
                    },
                },
            },
        });

        return {
            id: createdTask.id,
            title: createdTask.title,
            description: createdTask.description,
            taskComplexity: createdTask.complexity.name,
            createdAt: createdTask.createdAt,
            solvedTimes: createdTask.soledTimes,
            languages: createdTask.languages.map((taskLanguage) => taskLanguage.language.name),
        };
    }

    async acceptTask(id: string) {
        return await this.prisma.task.update({
            where: { id },
            data: { isAccepted: true }
        });
    }

    async rejectTask(id: string) {
        const task = await this.prisma.task.delete({
            where: { id },
            include: {
                languages: true
            }
        });

        await Promise.all(task.languages.map(async language => {
            await this.s3.deleteUnitTest(language.unitTestsPath);
        }));

        return task;
    }

    async createTaskComplexity(name: string) {
        return await this.prisma.taskComplexity.create({
            data: {
                name
            }
        });
    }

    // async getTaskSolutions(taskId: string, page: number, perPage: number = 10) {
    //     const skip = (+page - 1) * perPage;
    //     const solutions = await this.prisma.taskSolution.findMany({
    //         where: { taskId },
    //         include: {
    //             author: true,
    //             task: true
    //         },
    //         orderBy: [
    //             {
    //                 createdAt: 'desc'
    //             },
    //             {
    //                 likeCount: 'desc'
    //             }
    //         ],
    //         skip,
    //         take: perPage
    //     });

    //     const length = await this.prisma.taskSolution.count({
    //         where: { taskId }
    //     });

    //     return {
    //         solutions: solutions.map(solution => ({
    //             id: solution.id,
    //             code: solution.code,
    //             likeCount: solution.likeCount,
    //             createdAt: solution.createdAt,
    //             taskTitle: solution.task.title,
    //             taskId: solution.taskId,
    //             language: solution.language,
    //             authorId: solution.authorId,
    //             authorUsername: solution.author.username,
    //         })),
    //         length
    //     }
    // }

    async getTaskSolutions(taskId: string, page: number, language: string, perPage: number = 3) {
        const skip = (+page - 1) * perPage;

        const allSolutions = await this.prisma.taskSolution.findMany({
            where: { taskId, language },
            include: {
                author: true,
                task: true
            },
            orderBy: [
                {
                    createdAt: 'desc'
                },
                {
                    likeCount: 'desc'
                }
            ]
        });

        const uniqueCodes = new Set<string>();

        const uniqueSolutions = allSolutions.filter(solution => {
            if (!uniqueCodes.has(solution.code)) {
                uniqueCodes.add(solution.code);
                return true;
            }
            return false;
        });

        const length = uniqueSolutions.length;

        const uniqueSolutionsWithPagination = uniqueSolutions.slice(skip, skip + perPage);

        return {
            solutions: uniqueSolutionsWithPagination.map(solution => ({
                id: solution.id,
                code: solution.code,
                likeCount: solution.likeCount,
                createdAt: solution.createdAt,
                taskTitle: solution.task.title,
                taskId: solution.taskId,
                language: solution.language,
                authorId: solution.authorId,
                authorUsername: solution.author.username,
            })),
            length
        };
    }

    async getUnitTest(taskId: string, languageId: string) {
        const taskLanguage = await this.prisma.taskLanguage.findUnique({
            where: {
                taskId_languageId: {
                    taskId,
                    languageId
                }
            }
        });

        const unitTest = await this.s3.getUnitTest(taskLanguage.unitTestsPath);

        return unitTest.transformToString();
    }

    private async saveUnitTest(code: string, language: string) {
        const extention = this.getExtention(language);
        if (!extention) {
            throw new BadRequestException('Language not supported');
        }

        const id = uuid();
        const url = `${this.basePath}/${id}${extention}`;

        await this.s3.createUnitTest(url, code);
        // await fs.writeFile(url, code);

        return url;
    }

    private getExtention(language: string) {
        if (language === 'go') {
            return '.go';
        } else if (language === 'python') {
            return '.py';
        } else if (language === 'rust') {
            return '.rs';
        } else if (language === 'cpp') {
            return '.cpp';
        } else {
            return null;
        }
    }
}
