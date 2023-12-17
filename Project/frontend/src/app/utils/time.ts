export function timeAgo(timestamp: string) {
    const currentDate = new Date();
    const commentDate = new Date(timestamp);
    const seconds: number = Math.floor((currentDate.getTime() - commentDate.getTime()) / 1000);

    let interval: number = Math.floor(seconds / 31536000);

    if (interval >= 1) {
        return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
    }
    return Math.floor(seconds) + ' second' + (Math.floor(seconds) === 1 ? '' : 's') + ' ago';
}