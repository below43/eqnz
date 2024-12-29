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
		fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23eqnz&limit=25&sort=top')
			.then(response => response.json())
			.then(data => {
				const posts = data.posts;
				if (JSON.stringify(posts) !== JSON.stringify(previousPosts)) {
					previousPosts = posts;
					blueskyPostsContainer.innerHTML = ''; // Clear existing posts

					posts.forEach(post => {
						const postCard = document.createElement('div');
						postCard.className = 'post-card';
						postCard.style.border = '1px solid #ddd';
						postCard.style.padding = '10px';
						postCard.style.margin = '10px 0';

						const postContent = document.createElement('p');
						postContent.textContent = post.record.text;
						postCard.appendChild(postContent);

						const authorInfo = document.createElement('div');
						authorInfo.style.display = 'flex';
						authorInfo.style.alignItems = 'center';
						authorInfo.style.marginBottom = '10px';

						if (post.author.avatar) {
							const authorAvatar = document.createElement('img');
							authorAvatar.src = post.author.avatar;
							authorAvatar.style.width = '40px';
							authorAvatar.style.height = '40px';
							authorAvatar.style.borderRadius = '50%';
							authorAvatar.style.marginRight = '10px';
							authorInfo.appendChild(authorAvatar);
						}

						const authorName = document.createElement('span');
						authorName.textContent = post.author.displayName || post.author.handle;
						authorName.style.fontWeight = 'bold';
						authorInfo.appendChild(authorName);

						postCard.insertBefore(authorInfo, postCard.firstChild);
						postCard.appendChild(document.createElement('br'));    

						if (post.embed?.images[0]) {
							const postImage = document.createElement('img');
							postImage.src = post.embed.images[0].thumb;
							postImage.style.maxWidth = '100%';
							postImage.style.maxHeight = '250px';
							postCard.appendChild(postImage);
							postCard.appendChild(document.createElement('br'));    
						}

						postCard.appendChild(document.createElement('br'));    
						const postDate = document.createElement('p');
						const postDateTime = new Date(post.record.createdAt).toLocaleString();
						postDate.textContent = postDateTime;
						postDate.style.fontSize = '12px';
						postDate.style.color = '#555';
						postCard.appendChild(postDate);

						const postLink = document.createElement('a');
						const postId = post.uri.split('/').pop();
						postLink.href = `https://bsky.app/profile/${post.author.handle}/post/${postId}`;
						postLink.textContent = 'View on Bluesky';
						postLink.rel = 'nofollow';
						postLink.target = '_blank';
						postCard.appendChild(postLink);

						blueskyPostsContainer.appendChild(postCard);
					});

					//loading div can now be hidden
					document.getElementById('loading').style.display = 'none';
				}
			})
			.catch(error => console.error('Error fetching Bluesky posts:', error));
	};

	fetchAndUpdatePosts();
	setInterval(fetchAndUpdatePosts, 30000); // Fetch and update every 30 seconds
});
