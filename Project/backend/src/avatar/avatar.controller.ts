import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { AvatarService } from './avatar.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('avatar')
export class AvatarController {
    constructor(private readonly avatarService: AvatarService) { }

    @Get(':id')
    async getAvatar(@Param('id') id: string) {
        const url = await this.avatarService.getImage(id);
        return { url };
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File not found');
        }

        const id = await this.avatarService.saveImage(file);
        return { id };
    }
}
