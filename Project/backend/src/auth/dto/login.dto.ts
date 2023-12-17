import { IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @MinLength(3, {
        message: 'Email or username is too short'
    })
    identifier: string;

    @IsString()
    @MinLength(8, {
        message: 'Password is too short'
    })
    password: string;
}