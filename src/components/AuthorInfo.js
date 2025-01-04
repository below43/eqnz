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

        if (author.avatar) {
            container.appendChild(this.createAvatar(author.avatar));
        }

        container.appendChild(this.createNameElement(author));
        
        return container;
    }

    static validateAuthor(author) {
        return author && (author.displayName || author.handle);
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