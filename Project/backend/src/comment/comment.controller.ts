import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enum/role.enum';

@Controller('comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post(':taskId')
    async createComment(@CurrentUser('id') authorId: string, @Param('taskId') taskId: string, @Body('text') text: string) {
        return await this.commentService.createComment(authorId, taskId, text);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Get('reports')
    async getCommentReports() {
        return await this.commentService.getCommentReports();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':taskId')
    async getCommentsByTaskId(@Param('taskId') taskId: string) {
        return await this.commentService.getCommentsByTaskId(taskId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':commentId/report')
    async reportComment(@CurrentUser('id') authorId: string, @Param('commentId') commentId: string, @Body('text') text: string) {
        return await this.commentService.reportComment(authorId, commentId, text);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id/report')
    async deleteCommentReport(@Param('id') id: string) {
        return await this.commentService.deleteCommentReport(id);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    async deleteComment(@Param('id') id: string) {
        return await this.commentService.deleteComment(id);
    }
}
