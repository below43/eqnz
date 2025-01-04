import { CONFIG } from '../config/config.js';

export class PostAPI {
    static async fetchPosts() {
        const params = new URLSearchParams({
            q: `#${CONFIG.QUERY.HASHTAG}`,
            limit: CONFIG.QUERY.LIMIT,
            sort: CONFIG.QUERY.SORT
        });

        const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.SEARCH_POSTS}?${params}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (!data?.posts) throw new Error('Invalid response format');
        
        return data.posts;
    }
}