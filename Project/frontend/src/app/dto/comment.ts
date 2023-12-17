import { User } from './user';

export interface Comment {
    id: string;
    text: string;
    authorId: string;
    taskId: string;
    reportedCount: number;
    createdAt: string;
    author: User;
}