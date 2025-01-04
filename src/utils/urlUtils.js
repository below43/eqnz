export const urlUtils = {
    convertAtProtocolUrl(atUri) {
        return atUri
            .replace('at://', 'https://bsky.app/profile/')
            .replace('app.bsky.feed.post', 'post');
    },

    createPostUrl(handle, postId) {
        return `https://bsky.app/profile/${handle}/post/${postId}`;
    }
};