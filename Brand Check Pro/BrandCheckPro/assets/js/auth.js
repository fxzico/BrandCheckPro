/**
 * BrandCheck Pro - Google Authentication Module
 * Standalone client-side utility for handling Google Identity Services JWT credentials
 */

/**
 * Lightweight, dependency-free Base64/JWT decoder
 * @param {string} token - The raw JWT credential string from Google
 * @returns {object|null} Parsed profile claims or null if invalid
 */
function decodeJWT(token) {
    try {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("BrandCheck Auth: Failed to decode JWT credential:", e);
        return null;
    }
}

/**
 * Retrieves the cached authenticated user object from localStorage
 * @returns {object|null} User profile object or null
 */
function getAuthUser() {
    try {
        const userStr = localStorage.getItem('BC_AUTH_USER');
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error("BrandCheck Auth: Failed to retrieve user from localStorage:", e);
        return null;
    }
}

/**
 * Purges the auth state from localStorage and dispatches a logout event
 */
function signOutUser() {
    try {
        localStorage.removeItem('BC_AUTH_USER');
        window.dispatchEvent(new CustomEvent('gauth:logout'));
    } catch (e) {
        console.error("BrandCheck Auth: Failed to sign out user:", e);
    }
}

/**
 * Global callback function for Google Identity Services
 * @param {object} response - The credential response object from Google
 */
window.handleGoogleAuthCallback = function(response) {
    try {
        if (response && response.credential) {
            const user = decodeJWT(response.credential);
            if (user) {
                localStorage.setItem('BC_AUTH_USER', JSON.stringify(user));
                window.dispatchEvent(new CustomEvent('gauth:login', { detail: user }));
            } else {
                console.error("BrandCheck Auth: Decoded user payload is empty.");
            }
        } else {
            console.error("BrandCheck Auth: Invalid response object from Google.");
        }
    } catch (e) {
        console.error("BrandCheck Auth: Error in Google auth callback handler:", e);
    }
};
