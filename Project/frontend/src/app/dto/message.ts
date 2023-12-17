export interface Message {
    text: string;
    createdAt: Date;
    author: {
        username: string;
        avatarId: string;
        avatar?: string;
    }
}