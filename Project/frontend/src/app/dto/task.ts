export interface Task {
    id: string;
    title: string;
    description: string;
    authorId: string;
    authorUsername: string;
    complexity: string;
    createdAt: string;
    solvedTimes: number;
    languages: {
        id: string;
        name: string;
        codeSnippet: string;
    }[];
}