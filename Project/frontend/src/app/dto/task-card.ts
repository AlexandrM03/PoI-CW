export interface TaskCard {
    id: string;
    title: string;
    description: string;
    taskComplexity: string;
    languages: string[];
    createdAt: Date;
    solvedTimes: number;
}