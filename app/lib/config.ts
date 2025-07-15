// API configuration for different environments
// Secure configuration that doesn't expose sensitive URLs in code

export const API_CONFIG = {
    // API endpoint path
    API_PATH: '/api/webapp',
    
    // Request timeout in milliseconds
    REQUEST_TIMEOUT: 30000,
    
    // Default development URL
    DEFAULT_DEV_URL: 'http://localhost:8000',
} as const;

// Helper function to get the correct backend URL securely
export function getBackendUrl(): string {
    if (typeof window === 'undefined') {
        // Server-side rendering - try to get from process.env
        return process.env.VITE_BACKEND_URL || API_CONFIG.DEFAULT_DEV_URL;
    }

    // Debug logging for production troubleshooting
    console.log('🔧 Environment check:', {
        hostname: window.location.hostname,
        VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
        isDev: import.meta.env.DEV,
        mode: import.meta.env.MODE
    });

    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname.includes('127.0.0.1');

    if (isLocalhost) {
        // Development mode - use environment variable or default
        const devUrl = import.meta.env.VITE_BACKEND_URL || API_CONFIG.DEFAULT_DEV_URL;
        console.log('🔧 Using development URL:', devUrl);
        return devUrl;
    } else {
        // Production mode - get backend URL from environment
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        if (!backendUrl) {
            console.error('❌ Production backend URL not configured!');
            console.error('   Set VITE_BACKEND_URL environment variable');
            console.error('   Available env vars:', Object.keys(import.meta.env));
            return '';
        }

        console.log('🔧 Using production URL:', backendUrl);
        return backendUrl;
    }
}

// Helper to check if we're in development mode
export function isDevelopment(): boolean {
    return import.meta.env.DEV || 
                 (typeof window !== 'undefined' && 
                    (window.location.hostname === 'localhost' || 
                     window.location.hostname.includes('127.0.0.1')));
}

// Helper to get full API URL
export function getApiUrl(): string {
    const backendUrl = getBackendUrl();
    return backendUrl ? `${backendUrl}${API_CONFIG.API_PATH}` : API_CONFIG.API_PATH;
}

export default API_CONFIG;
