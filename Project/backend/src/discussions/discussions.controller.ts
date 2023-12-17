import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enum/role.enum';
import { DiscussionDto } from './dto/discussion.dto';

@Controller('discussions')
export class DiscussionsController {
    constructor(private readonly discussionsService: DiscussionsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAll() {
        return await this.discussionsService.getAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async create(@Body() dto: DiscussionDto) {
        return await this.discussionsService.create(dto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    async deleteDiscussion(@Param('id') id: string) {
        return await this.discussionsService.delete(id);
    }
}
