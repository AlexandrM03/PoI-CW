export interface User {
    id: string;
    email: string;
    username: string;
    name: string;
    surname: string;
    company: string | null;
    about: string | null;
    isReadyToWork: boolean;
    solvedTaskCount: number;
    score: number;
    avatarId: string;
    roleId: string;
    activationCode: string | null;
    password: string;
    createdAt: string;
    avatar?: string | null;
    rank?: number
}