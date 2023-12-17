import { Controller, Get, UseGuards, Param, Put, Body, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { UserInfoDto } from './dto/user-info.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('search')
    async getUsers(@Query('username') username: string, @Query('page') page: number) {
        return await this.userService.getUsers(username, page);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('info')
    async getCurrentUserInfo(@CurrentUser('id') id: string) {
        return await this.userService.getCurrentUserInfo(id);
    }

    @Get('leaderboard')
    async getLeaders() {
        return await this.userService.getLeaders();
    }

    @Get(':username')
    async getUserInfo(@Param('username') username: string) {
        return await this.userService.getUserInfo(username);
    }

    @Get(':username/solutions')
    async getUserSolutions(@Param('username') username: string, @Query('page') page: number) {
        return await this.userService.getUserSolutions(username, page);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put()
    async updateUserInfo(@CurrentUser('id') id: string, @Body() dto: UserInfoDto) {
        return await this.userService.updateUserInfo(id, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('avatar')
    async updateUserAvatar(@CurrentUser('id') id: string, @Body('avatarId') avatarId: string) {
        return await this.userService.updateUserAvatar(id, avatarId);
    }
}
