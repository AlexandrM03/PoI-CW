import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UserInfoDto {
    @IsString()
    @IsOptional()
    @MaxLength(30, {
        message: 'Name is too long'
    })
    name?: string

    @IsString()
    @IsOptional()
    @MaxLength(30, {
        message: 'Surname is too long'
    })
    surname?: string

    @IsString()
    @IsOptional()
    @MaxLength(30, {
        message: 'Company is too long'
    })
    company?: string

    @IsString()
    @IsOptional()
    @MaxLength(200, {
        message: 'About is too long'
    })
    about?: string

    @IsBoolean()
    @IsOptional()
    isReadyToWork?: boolean
}