import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { Roles, RolesGuard } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enum/role.enum';
import { SortTaskDto } from './dto/task-sort.dto';

@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post('complexity')
    async createTaskComplexity(@Body('name') name: string) {
        return await this.taskService.createTaskComplexity(name);
    }

    @Get('accepted')
    async getAcceptedTasks(@Query() dto: SortTaskDto) {
        return await this.taskService.getTasks(true, dto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Put('accept/:id')
    async acceptTask(@Param('id') taskId: string) {
        return await this.taskService.acceptTask(taskId);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    async rejectTask(@Param('id') taskId: string) {
        return await this.taskService.rejectTask(taskId);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Get('not-accepted')
    async getNotAcceptedTasks(@Query() dto: SortTaskDto) {
        return await this.taskService.getTasks(false, dto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Get(':id/unit-test')
    async getTaskUnitTest(@Param('id') id: string, @Query('languageId') languageId: string) {
        return await this.taskService.getUnitTest(id, languageId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getTaskById(@Param('id') id: string) {
        return await this.taskService.getTaskById(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('check/:id')
    async checkTask(@Param('id') taskId: string, @CurrentUser('id') userId: string,
        @Body('code') code: string, @Body('languageId') languageId: string) {
        return await this.taskService.checkTask(userId, taskId, code, languageId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async createTask(@CurrentUser('id') id: string, @Body() dto: CreateTaskDto) {
        return await this.taskService.createTask(id, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':taskId/solutions')
    async getTaskSolutions(@Param('taskId') taskId: string, @Query('page') page: number, @Query('language') language: string) {
        return await this.taskService.getTaskSolutions(taskId, page, language);
    }
}
