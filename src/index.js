import { PostAPI } from './api/postApi.js';
import { PostRenderer } from './components/PostRenderer.js';
import { CONFIG } from './config/config.js';

class App
{
	constructor()
	{
		this.state = {
			isLoading: false,
			previousPosts: [],
			error: null
		};

		this.init();
	}

	async init()
	{
		document.addEventListener('DOMContentLoaded', () => this.fetchAndUpdatePosts());
		await this.fetchAndUpdatePosts();
		setInterval(() => this.fetchAndUpdatePosts(), CONFIG.INTERVALS.FETCH);
	}

	async fetchAndUpdatePosts()
	{
		if (this.state.isLoading) return;

		try
		{
			this.setLoading(true);
			const posts = await PostAPI.fetchPosts();
			this.updatePosts(posts);
		} 
		catch (error)
		{
			this.handleError(error);
		} 
		finally
		{
			``
			setTimeout(() =>
			{
				this.setLoading(false);
			}, CONFIG.INTERVALS.LOADING);
		}
	}

	setLoading(isLoading)
	{
		this.state.isLoading = isLoading;
		const loadingElement = document.getElementById('loading');
		if (loadingElement)
		{
			loadingElement.style.display = isLoading ? 'block' : 'none';
		}
	}

	updatePosts(posts)
	{
		if (JSON.stringify(posts) === JSON.stringify(this.state.previousPosts)) return;

		this.state.previousPosts = posts;
		const container = document.getElementById('bluesky-posts');
		if (container)
		{
			container.innerHTML = '';
			posts.forEach(post =>
			{
				container.appendChild(PostRenderer.renderPost(post));
			});
		}
	}

	handleError(error)
	{
		console.error('Error:', error);
		this.state.error = error;
		const container = document.getElementById('bluesky-posts');
		if (container)
		{
			container.innerHTML = `<div class="error">Failed to load posts: ${error.message}</div>`;
		}
	}
}

new App();