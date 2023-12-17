import { IsNumber, IsString, MinLength } from 'class-validator';

export class MessageDto {
    @IsString()
    @MinLength(3, {
        message: 'Message must be at least 3 characters long'
    })
    text: string;

    @IsString()
    userId: string;

    @IsNumber()
    discussionId: string;
}