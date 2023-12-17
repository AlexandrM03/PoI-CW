import { Comment } from './comment';
import { User } from './user';

export interface Report {
    id: string;
    text: string;
    commentId: string;
    authorId: string;
    createdAt: Date;
    comment: Comment;
    author: User;
}