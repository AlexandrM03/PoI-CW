import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { EnumTaskSort } from '../enum/task-sort.dto';
import { TaskComplexities } from '../enum/task-complexities.enum';
import { TaskLanguages } from '../enum/task-languages.enum';

export class SortTaskDto extends PaginationDto {
    @IsEnum(EnumTaskSort)
    @IsOptional()
    sort?: EnumTaskSort;

    @IsString()
    @IsOptional()
    searchTerm?: string;

    @IsEnum(TaskComplexities)
    @IsOptional()
    complexity?: TaskComplexities;

    @IsEnum(TaskLanguages)
    @IsOptional()
    language?: TaskLanguages;
}