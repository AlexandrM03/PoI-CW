import { IsString, MinLength, IsArray, IsObject, ValidateNested, MaxLength } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @MinLength(3, { message: 'Title is too short' })
    @MaxLength(70, { message: 'Title is too long' })
    title: string;

    @IsString()
    @MinLength(3, { message: 'Description is too short' })
    @MaxLength(1000, { message: 'Description is too long' })
    description: string;

    @IsString()
    taskComplexityId: string;

    @IsArray()
    @IsString({ each: true })
    languages: string[];

    @IsObject()
    unitTestCode: Record<string, string>;

    @IsObject()
    codeSnippet: Record<string, string>;
}