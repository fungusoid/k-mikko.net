// Handle image loading errors
document.addEventListener('DOMContentLoaded', function() {
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        profileImage.addEventListener('error', function() {
            this.src = 'https://placehold.co/160x160/E2E8F0/4A5568?text=Mikko';
        });
    }
});
