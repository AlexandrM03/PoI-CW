import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(3, {
        message: 'Username is too short'
    })
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8, {
        message: 'Password is too short'
    })
    password: string;
}