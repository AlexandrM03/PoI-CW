export class TaskCardDto {
    id: string;
    title: string;
    description: string;
    taskComplexity: string;
    languages: string[];
    createdAt: Date;
    solvedTimes: number;
}