import { IsString, MaxLength, MinLength } from 'class-validator';

export class DiscussionDto {
    @IsString()
    @MinLength(3, {
        message: 'Topic must be at least 3 characters long'
    })
    @MaxLength(20, {
        message: 'Topic must be at most 20 characters long'
    })
    topic: string;
}