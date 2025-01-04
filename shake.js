//github copilot generated code

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
	// shakeInterval();
}
document.addEventListener('DOMContentLoaded', function ()
{
	const blueskyPostsContainer = document.getElementById('bluesky-posts');
	let previousPosts = [];

	const fetchAndUpdatePosts = () =>
	{

		document.getElementById('loading').style.display = 'block';

		fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23eqnz&limit=25&sort=latest')
			.then(response => response.json())
			.then(data =>
			{
				let posts = data.posts;
				if (JSON.stringify(posts) !== JSON.stringify(previousPosts))
				{
					previousPosts = posts;
					blueskyPostsContainer.innerHTML = ''; // Clear existing posts

					//filter out replies
					// posts = posts.filter(post => !post.record.reply);

					// let count = 0;
					posts.forEach(post =>
					{
						// console.log(++count, post.record.text.substring(0, 50));
						const postCard = document.createElement('div');
						postCard.className = 'post-card';
						const postCardBody = document.createElement('div');
						postCardBody.className = 'post-card-body';

						const authorInfo = document.createElement('div');
						authorInfo.style.display = 'flex';
						authorInfo.style.alignItems = 'center';
						authorInfo.style.marginBottom = '10px';

						if (post.author.avatar)
						{
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

						let postText = post.record.text;

						// Check for link and tag facets and inject links if they exist
						postText = processFacets(post, postText);

						const postContent = document.createElement('p');
						postContent.innerHTML = postText;
						postCardBody.appendChild(postContent);

						// Add reply link if post is a reply
						if (post.record.reply)
						{
							const replyLink = document.createElement('a');
							const parentUri = post.record.reply.parent.uri;
							// Convert AT Protocol URI to bsky.app URL
							const webUrl = parentUri.replace('at://', 'https://bsky.app/profile/').replace('app.bsky.feed.post', 'post');							
							replyLink.href = webUrl;
							replyLink.target = '_blank';
							replyLink.rel = 'nofollow';
							replyLink.textContent = 'View conversation';
							replyLink.style.color = '#999';
							replyLink.style.textDecoration = 'none';
							
							const replyContainer = document.createElement('p');
							replyContainer.appendChild(replyLink);
							postCardBody.appendChild(replyContainer);
						}

						if (post.embed && post.embed.images && post.embed.images.length > 0)
						{
							const postImage = document.createElement('img');
							postImage.src = post.embed.images[0].thumb;
							postImage.className = 'embed-image';
							postCardBody.appendChild(document.createElement('br'));
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
			.finally(() =>
			{
				setTimeout(() =>
				{
					document.getElementById('loading').style.display = 'none';
				}, 2000);
			});
	};

	fetchAndUpdatePosts();
	setInterval(fetchAndUpdatePosts, 30000); // Fetch and update every 30 seconds
});


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

function byteToCharIndex(text, byteIndex)
{
	// Input validation
	if (!text || typeof text !== 'string')
	{
		console.warn('Invalid text input:', text);
		return 0;
	}
	if (typeof byteIndex !== 'number' || byteIndex < 0)
	{
		console.warn('Invalid byte index:', byteIndex);
		return 0;
	}
	if (byteIndex === 0) return 0;

	const encoder = new TextEncoder();
	let byteCount = 0;
	let charIndex = 0;

	try
	{
		while (byteCount < byteIndex && charIndex < text.length)
		{
			const char = text[charIndex];
			const charBytes = encoder.encode(char).length;
			byteCount += charBytes;
			charIndex++;
		}
		return charIndex;
	} catch (error)
	{
		console.error('Error processing text:', error);
		return 0;
	}
}

function processFacets(post, postText)
{
	if (!post?.record?.facets)
	{
		return postText;
	}

	// Debug logging
	// console.log('Original text:', postText);
	// console.log('Facets:', post.record.facets);

	const replacements = post.record.facets
		.filter(facet => facet.features && facet.index)
		.flatMap(facet =>
		{
			const start = byteToCharIndex(postText, facet.index.byteStart);
			const end = byteToCharIndex(postText, facet.index.byteEnd);

			// Validation
			if (start === undefined || end === undefined || start > end || end > postText.length)
			{
				console.warn('Invalid indices:', { start, end, text: postText });
				return [];
			}

			const linkText = postText.substring(start, end);
			// console.log('Processing facet:', { start, end, linkText, originalBytes: facet.index });

			return facet.features
				.map(feature =>
				{
					const linkInfo = generateLink(feature, linkText);
					if (!linkInfo) return null;

					return {
						start,
						end,
						replacement: `<a href="${linkInfo.href}" target="_blank" rel="nofollow">${linkInfo.text}</a>`
					};
				})
				.filter(Boolean);
		});

	const result = replacements
		.sort((a, b) => b.start - a.start)
		.reduce((text, { start, end, replacement }) =>
		{
			// console.log('Applying replacement:', { start, end, replacement });
			return text.slice(0, start) + replacement + text.slice(end);
		}, postText);

	// console.log('Final text:', result);
	return result;
}