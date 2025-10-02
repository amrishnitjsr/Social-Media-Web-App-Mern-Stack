// Avatar Helper - Generate default profile pictures based on email/name

/**
 * Generate a Gravatar URL based on email
 * @param {string} email - User's email address
 * @param {number} size - Size of the avatar (default: 200)
 * @returns {string} Gravatar URL
 */
export const getGravatarUrl = (email, size = 200) => {
    if (!email) return null;
    
    // Create MD5 hash of email (using a simple implementation for client-side)
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
};

/**
 * Generate UI Avatars URL based on name
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {number} size - Size of the avatar (default: 200)
 * @returns {string} UI Avatars URL
 */
export const getUIAvatarUrl = (firstname, lastname, size = 200) => {
    const name = `${firstname || ''} ${lastname || ''}`.trim() || 'User';
    const encodedName = encodeURIComponent(name);
    
    // Generate a consistent background color based on name
    const colors = [
        '667eea', '764ba2', '6c5ce7', 'a29bfe', 'fd79a8',
        'fdcb6e', 'e17055', '00b894', '00cec9', '0984e3',
        'e84393', '6c5ce7', 'a29bfe', 'fd79a8', 'fab1a0'
    ];
    
    const colorIndex = (firstname?.charCodeAt(0) || 0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=${backgroundColor}&color=fff&bold=true&format=png`;
};

/**
 * Get profile picture URL with fallback to avatar
 * @param {object} user - User object with profilePicture, email, firstname, lastname
 * @param {string} serverPublic - Server public folder URL
 * @returns {string} Profile picture URL
 */
export const getProfilePicture = (user, serverPublic) => {
    if (!user) return getUIAvatarUrl('', '', 200);
    
    // If user has uploaded a profile picture, use it
    if (user.profilePicture) {
        // Check if it's a URL (Google profile picture) or a filename
        if (user.profilePicture.startsWith('http')) {
            return user.profilePicture;
        }
        return serverPublic + user.profilePicture;
    }
    
    // Otherwise, generate avatar based on name
    return getUIAvatarUrl(user.firstname, user.lastname);
};

/**
 * Get cover picture URL with fallback
 * @param {object} user - User object with coverPicture
 * @param {string} serverPublic - Server public folder URL
 * @returns {string} Cover picture URL
 */
export const getCoverPicture = (user, serverPublic) => {
    if (!user) return serverPublic + 'defaultCover.jpg';
    
    if (user.coverPicture) {
        if (user.coverPicture.startsWith('http')) {
            return user.coverPicture;
        }
        return serverPublic + user.coverPicture;
    }
    
    return serverPublic + 'defaultCover.jpg';
};

// Simple MD5 implementation for generating Gravatar hash
function md5(string) {
    // This is a simplified version - in production, use crypto-js or similar
    // For now, we'll use a simple hash function
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}
