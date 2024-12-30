//github copilot generated code

window.onload = function() {
	var shake = function() {
		var body = document.getElementsByTagName('body')[0];
		body.classList.add('shake');

		var rand = Math.round(Math.random() * (1000)) + 5000;
		setTimeout(function() {
			body.classList.remove('shake');
		}, rand);
	}
	var shakeInterval = function() {
		var rand = Math.round(Math.random() * (1000)) + 3000;
		setTimeout(function() {
			shake();
			shakeInterval();
		}, rand);
	}
	// shakeInterval();
}
document.addEventListener('DOMContentLoaded', function() {
	const blueskyPostsContainer = document.getElementById('bluesky-posts');
	let previousPosts = [];

	const fetchAndUpdatePosts = () => {

		document.getElementById('loading').style.display = 'block'; 

		fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23eqnz&limit=24&sort=top')
			.then(response => response.json())
			.then(data => {
				const posts = data.posts;
				if (JSON.stringify(posts) !== JSON.stringify(previousPosts)) {
					previousPosts = posts;
					blueskyPostsContainer.innerHTML = ''; // Clear existing posts

					posts.forEach(post => {
						const postCard = document.createElement('div');
						postCard.className = 'post-card';
						const postCardBody = document.createElement('div');
						postCardBody.className = 'post-card-body';

						const authorInfo = document.createElement('div');
						authorInfo.style.display = 'flex';
						authorInfo.style.alignItems = 'center';
						authorInfo.style.marginBottom = '10px';

						if (post.author.avatar) {
							const authorAvatar = document.createElement('img');
							authorAvatar.src = post.author.avatar;
							authorAvatar.className = 'avatar';
							authorInfo.appendChild(authorAvatar);
						}

						const authorName = document.createElement('span');
						authorName.textContent = post.author.displayName || post.author.handle;
						authorName.style.fontWeight = 'bold';
						authorInfo.appendChild(authorName);

						postCardBody.appendChild(authorInfo);

						const postContent = document.createElement('p');
						postContent.textContent = post.record.text;
						postCardBody.appendChild(postContent);

						postCardBody.appendChild(document.createElement('br'));    

						if (post.embed && post.embed.images && post.embed.images.length > 0) {
							const postImage = document.createElement('img');
							postImage.src = post.embed.images[0].thumb;
							postImage.className = 'embed-image';
							postCardBody.appendChild(postImage);
							postCardBody.appendChild(document.createElement('br'));    
						}

						postCard.appendChild(postCardBody);

						const footer = document.createElement('div');
						footer.className = 'footer';

						const postDate = document.createElement('p');
						const postDateTime = new Date(post.record.createdAt).toLocaleString();
						postDate.textContent = postDateTime;
						postDate.className = 'post-date';
						footer.appendChild(postDate);

						const postLink = document.createElement('a');
						const postId = post.uri.split('/').pop();
						postLink.href = `https://bsky.app/profile/${post.author.handle}/post/${postId}`;
						postLink.textContent = 'View on Bluesky';
						postLink.rel = 'nofollow';
						postLink.target = '_blank';

						const postLinkContainer = document.createElement('p');
						postLinkContainer.appendChild(postLink);
						footer.appendChild(postLinkContainer);

						postCard.appendChild(document.createElement('br'));    
						postCard.appendChild(footer);

						blueskyPostsContainer.appendChild(postCard);
					});

				}
			})
			.catch(error => console.error('Error fetching Bluesky posts:', error))
			.finally(() => {
				setTimeout(() => {
					document.getElementById('loading').style.display = 'none'; 
				}, 2000);
			});
	};

	fetchAndUpdatePosts();
	setInterval(fetchAndUpdatePosts, 30000); // Fetch and update every 30 seconds
});
