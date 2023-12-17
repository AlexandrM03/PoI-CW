export interface Solution {
    id: string;
    code: string;
    likeCount: number;
    createdAt: Date;
    taskTitle: string;
    taskId: string;
    language: string;
    authorId?: string;
    authorUsername?: string;
}