import { urlUtils } from '../utils/urlUtils.js';
import { textUtils } from '../utils/textUtils.js';

export class PostContent {
    static create(post) {
        if (!this.validatePost(post)) {
            console.error('Invalid post data:', post);
            return document.createElement('div');
        }

        const container = document.createElement('div');
        container.appendChild(this.createTextContent(post));
        
        const conversationLink = this.createConversationPostLink(post);
        if (conversationLink) container.appendChild(conversationLink);

        const embeddedLink = this.createEmbeddedPostLink(post);
        if (embeddedLink) container.appendChild(embeddedLink);

        const image = this.createPostImage(post);
        if (image) container.appendChild(image);

        return container;
    }

    static validatePost(post) {
        return post?.record?.text != null;
    }

    static createTextContent(post) {
        const text = textUtils.processFacets(post, post.record.text);
        const content = document.createElement('p');
        content.innerHTML = text;
        return content;
    }

    static createPostImage(post) {
        if (!post?.embed?.images?.length) {
            return null;
        }

        const postImage = document.createElement('img');
        postImage.src = post.embed.images[0].thumb;
        postImage.className = 'embed-image';

        const container = document.createElement('div');
        container.appendChild(document.createElement('br'));
        container.appendChild(postImage);

        return container;
    }

    static createConversationPostLink(post) {
        if (!post?.record?.reply?.parent?.uri) {
            return null;
        }

        const parentUri = post.record.reply.parent.uri;
        const webUrl = urlUtils.convertAtProtocolUrl(parentUri);

        return this.createLinkElement(webUrl, 'View conversation', 'post-link');
    }

    static createEmbeddedPostLink(post) {
        if (!post.embed || post.embed.$type !== 'app.bsky.embed.record#view') {
            return null;
        }

        const record = post.embed.record;
        if (!record?.uri) return null;

        const webUrl = urlUtils.convertAtProtocolUrl(record.uri);
        return this.createLinkElement(webUrl, 'View quoted post', 'post-link');
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