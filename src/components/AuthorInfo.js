export class AuthorInfo {
    static create(author) {
        if (!this.validateAuthor(author)) {
            console.error('Invalid author data:', author);
            return document.createElement('div');
        }

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.marginBottom = '10px';

        const profileLink = this.createProfileLink(author);
        
        if (author.avatar) {
            profileLink.appendChild(this.createAvatar(author.avatar));
        }
        
        profileLink.appendChild(this.createNameElement(author));
        container.appendChild(profileLink);
        
        return container;
    }

    static validateAuthor(author) {
        return author && (author.displayName || author.handle);
    }

    static createProfileLink(author) {
        const link = document.createElement('a');
        link.href = `https://bsky.app/profile/${author.handle}`;
        link.target = '_blank';
        link.rel = 'nofollow';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
		if (author.displayName) {
			link.title = author.displayName;
		}
        return link;
    }

    static createAvatar(avatarUrl) {
        const avatar = document.createElement('img');
        avatar.src = avatarUrl;
        avatar.className = 'avatar';
        return avatar;
    }

    static createNameElement(author) {
        const name = document.createElement('span');
        name.textContent = author.displayName || author.handle;
        name.style.fontWeight = 'bold';
        return name;
    }
}