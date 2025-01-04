const textEncoder = new TextEncoder();

export const textUtils = {
    byteToCharIndex(text, byteIndex) {
        if (!text?.length || typeof text !== 'string') return 0;
        if (typeof byteIndex !== 'number' || byteIndex < 0) return 0;
        if (byteIndex === 0) return 0;

        try {
            let byteCount = 0;
            let charIndex = 0;

            while (byteCount < byteIndex && charIndex < text.length) {
                byteCount += textEncoder.encode(text[charIndex++]).length;
            }
            return charIndex;
        } catch (error) {
            console.error('Error converting bytes to chars:', error);
            return 0;
        }
    },

    generateLink(feature, linkText) {
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
    },

    createLinkReplacement(start, end, linkInfo, text) {
        if (!linkInfo || start === undefined || end === undefined || 
            start > end || end > text.length) {
            return null;
        }

        return {
            start,
            end,
            replacement: `<a href="${linkInfo.href}" target="_blank" rel="nofollow">${linkInfo.text}</a>`
        };
    },

    processFacets(post, postText) {
        if (!post?.record?.facets?.length) return postText;
    
        const replacements = post.record.facets
            .filter(facet => facet.features?.length && facet.index)
            .flatMap(facet => {
                const start = this.byteToCharIndex(postText, facet.index.byteStart);
                const end = this.byteToCharIndex(postText, facet.index.byteEnd);
                const linkText = postText.substring(start, end);
    
                return facet.features
                    .map(feature => this.createLinkReplacement(
                        start, 
                        end, 
                        this.generateLink(feature, linkText), 
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
};