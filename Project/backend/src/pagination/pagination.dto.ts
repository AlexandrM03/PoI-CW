import { IsOptional, IsString } from 'class-validator';

export class PaginationDto {
    @IsString()
    @IsOptional()
    page?: string;

    @IsString()
    @IsOptional()
    perPage?: string;
}