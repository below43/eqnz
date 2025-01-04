import { AuthorInfo } from './AuthorInfo.js';
import { PostContent } from './PostContent.js';
import { urlUtils } from '../utils/urlUtils.js';

export class PostRenderer {
    static renderPost(post) {
        if (!this.validatePost(post)) {
            console.error('Invalid post data:', post);
            return document.createElement('div');
        }

        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        
		const postMain = document.createElement('div');
		postMain.className = 'post-main';

		postMain.appendChild(AuthorInfo.create(post.author));
		postMain.appendChild(PostContent.create(post));

		postCard.appendChild(postMain);
        postCard.appendChild(this.createPostFooter(post));
        
        return postCard;
    }

    static validatePost(post) {
        return post?.author && post?.record;
    }

    static createPostFooter(post) {
        const footer = document.createElement('div');
        footer.className = 'footer';

        footer.appendChild(this.createDateElement(post));
        footer.appendChild(this.createPostLink(post));

        return footer;
    }

    static createDateElement(post) {
        const date = document.createElement('p');
        date.textContent = new Date(post.record.createdAt).toLocaleString();
        date.className = 'post-date';
        return date;
    }

    static createPostLink(post) {
        const postId = post.uri.split('/').pop();
        const url = urlUtils.createPostUrl(post.author.handle, postId);
        return this.createLinkElement(url, 'View on Bluesky', 'main-post-link');
    }

    static createLinkElement(href, text, className = '') {
        const container = document.createElement('p');
        container.className = className;
        
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'nofollow';
        link.textContent = ` ${text}`;
        
        container.appendChild(link);
        return container;
    }
}