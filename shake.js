window.onload = function ()
{
	var shake = function ()
	{
		var body = document.getElementsByTagName('body')[0];
		body.classList.add('shake');

		var rand = Math.round(Math.random() * (1000)) + 5000;
		setTimeout(function ()
		{
			body.classList.remove('shake');
		}, rand);
	}
	var shakeInterval = function ()
	{
		var rand = Math.round(Math.random() * (1000)) + 3000;
		setTimeout(function ()
		{
			shake();
			shakeInterval();
		}, rand);
	}
}

document.addEventListener('DOMContentLoaded', function ()
{
	fetchAndUpdatePosts();
	setInterval(fetchAndUpdatePosts, 30000); // Fetch and update every 30 seconds
});

let previousPosts = [];
function fetchAndUpdatePosts() {
    document.getElementById('loading').style.display = 'block';

    fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23eqnz&limit=25&sort=latest')
        .then(response => response.json())
        .then(data => {
            if (JSON.stringify(data.posts) !== JSON.stringify(previousPosts)) {
                previousPosts = data.posts;
                const container = document.getElementById('bluesky-posts');
                container.innerHTML = '';
                data.posts.forEach(post => {
                    container.appendChild(renderPost(post));
                });
            }
        })
        .catch(error => console.error('Error fetching Bluesky posts:', error))
        .finally(() => {
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 2000);
        });
}

/**
 * @typedef {Object} BlueskyPost
 * @property {Object} record
 * @property {Object} author
 * @property {Object} embed
 */

// URL utilities
const urlUtils = {
    convertAtProtocolUrl(atUri) {
        return atUri
            .replace('at://', 'https://bsky.app/profile/')
            .replace('app.bsky.feed.post', 'post');
    },

    createPostUrl(handle, postId) {
        return `https://bsky.app/profile/${handle}/post/${postId}`;
    }
};

/**
 * @param {BlueskyPost} post
 * @returns {HTMLElement}
 */
function renderPost(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    
    const postCardBody = createPostBody(post);
    const footer = createPostFooter(post);
    
    postCard.appendChild(postCardBody);
    postCard.appendChild(footer);
    
    return postCard;
}

function createPostBody(post) {
    const body = document.createElement('div');
    body.className = 'post-card-body';

    body.appendChild(createAuthorInfo(post.author));
    body.appendChild(createPostContent(post));
    
    if (post.embed?.images?.length > 0) {
        body.appendChild(createPostImage(post.embed.images[0]));
    }

    return body;
}

function createAuthorInfo(author) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.marginBottom = '10px';

    if (author.avatar) {
        const avatar = document.createElement('img');
        avatar.src = author.avatar;
        avatar.className = 'avatar';
        container.appendChild(avatar);
    }

    const name = document.createElement('span');
    name.textContent = author.displayName || author.handle;
    name.style.fontWeight = 'bold';
    container.appendChild(name);

    return container;
}

function createPostContent(post) {
    const container = document.createElement('div');
    
    const text = processFacets(post, post.record.text);
    const content = document.createElement('p');
    content.innerHTML = text;
    container.appendChild(content);

    const conversationLink = createConversationPostLink(post);
    if (conversationLink) container.appendChild(conversationLink);

    const embeddedLink = createEmbeddedPostLink(post);
    if (embeddedLink) container.appendChild(embeddedLink);

    return container;
}

function createPostFooter(post) {
    const footer = document.createElement('div');
    footer.className = 'footer';

    const date = document.createElement('p');
    date.textContent = new Date(post.record.createdAt).toLocaleString();
    date.className = 'post-date';
    footer.appendChild(date);

    const postId = post.uri.split('/').pop();
    const url = urlUtils.createPostUrl(post.author.handle, postId);
    const link = createLinkElement(url, 'View on Bluesky', 'main-post-link');
    footer.appendChild(link);

    return footer;
}

function generateLink(feature, linkText)
{
	const types = {
		'app.bsky.richtext.facet#link': () => ({
			href: feature.uri,
			text: linkText
		}),
		'app.bsky.richtext.facet#tag': () => ({
			href: `https://bsky.app/hashtag/${feature.tag}`,
			text: linkText
		})
	};

	return types[feature.$type]?.() || null;
}

function byteToCharIndex(text, byteIndex) {
    if (!text?.length || typeof text !== 'string') return 0;
    if (typeof byteIndex !== 'number' || byteIndex < 0) return 0;
    if (byteIndex === 0) return 0;

    try {
        const encoder = new TextEncoder();
        let byteCount = 0;
        let charIndex = 0;

        while (byteCount < byteIndex && charIndex < text.length) {
            byteCount += encoder.encode(text[charIndex++]).length;
        }
        return charIndex;
    } catch (error) {
        console.error('Error converting bytes to chars:', error);
        return 0;
    }
}

function createLinkReplacement(start, end, linkInfo, text) {
    if (!linkInfo || start === undefined || end === undefined || 
        start > end || end > text.length) {
        return null;
    }

    return {
        start,
        end,
        replacement: `<a href="${linkInfo.href}" target="_blank" rel="nofollow">${linkInfo.text}</a>`
    };
}

function processFacets(post, postText) {
    if (!post?.record?.facets?.length) return postText;

    const replacements = post.record.facets
        .filter(facet => facet.features?.length && facet.index)
        .flatMap(facet => {
            const start = byteToCharIndex(postText, facet.index.byteStart);
            const end = byteToCharIndex(postText, facet.index.byteEnd);
            const linkText = postText.substring(start, end);

            return facet.features
                .map(feature => createLinkReplacement(
                    start, 
                    end, 
                    generateLink(feature, linkText), 
                    postText
                ))
                .filter(Boolean);
        });

    return replacements
        .sort((a, b) => b.start - a.start)
        .reduce((text, { start, end, replacement }) => 
            text.slice(0, start) + replacement + text.slice(end), 
            postText
        );
}

function createLinkElement(href, text, className = '') {
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

function createConversationPostLink(post) {
    if (!post?.record?.reply?.parent?.uri) {
        return null;
    }

    const parentUri = post.record.reply.parent.uri;
    const webUrl = parentUri
        .replace('at://', 'https://bsky.app/profile/')
        .replace('app.bsky.feed.post', 'post');

    return createLinkElement(webUrl, 'View conversation', 'post-link');
}

function createEmbeddedPostLink(post) {
    if (!post.embed || post.embed.$type !== 'app.bsky.embed.record#view') {
        return null;
    }

    const record = post.embed.record;
    if (!record?.uri) return null;

    const webUrl = record.uri
        .replace('at://', 'https://bsky.app/profile/')
        .replace('app.bsky.feed.post', 'post');

    return createLinkElement(webUrl, 'View quoted post', 'post-link');
}