# Telegram Mini Web App - Secure API Configuration

## Overview
This web app communicates with a separate backend server that handles the Telegram bot API. The backend and frontend are deployed separately with secure configuration management.

## 🔒 Security Features
- No hardcoded URLs or tokens in source code
- Environment-based configuration
- Development/production mode detection
- Secure logging (no sensitive data in production logs)
- CORS-enabled API requests
- Console log removal in production builds

## Configuration

### Environment Variables
Set the following environment variables in your deployment platform:

**Required for Production:**
- `VITE_BACKEND_URL`: Your backend server URL (e.g., `https://your-backend.com`)

**Optional:**
- `VITE_BACKEND_URL_DEV`: Custom development server URL (defaults to `http://localhost:8000`)

### Local Development Setup
1. Copy `.env.example` to `.env`
2. Set `VITE_BACKEND_URL` to your local backend URL if different from default
3. Start your backend server
4. Run `npm run dev`

### Production Deployment
1. **Never commit actual backend URLs to version control**
2. Set `VITE_BACKEND_URL` as an environment variable in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables  
   - Render: Environment → Environment Variables
   - Railway: Variables tab
3. Deploy the application

## Backend URL Configuration
The app automatically detects the environment and uses appropriate URLs:

- **Development**: Uses `VITE_BACKEND_URL` or defaults to `http://localhost:8000`
- **Production**: Uses `VITE_BACKEND_URL` (must be set) or falls back to relative paths

## User Authentication
The app supports multiple authentication modes:

1. **Production (Telegram WebApp)**: Uses actual Telegram WebApp init data
2. **Development**: Creates mock authentication with dynamic user ID extraction
3. **Fallback**: Uses a default development user

### Dynamic User ID Extraction
The app will try to extract the user ID from:
1. Telegram WebApp initDataUnsafe
2. URL parameters (`?user=...`)  
3. Hash parameters (`#user=...`)
4. Fallback to default development user

## API Endpoints
All API calls are made to `{BACKEND_URL}/api/webapp/`:
- `POST /auth/validate` - Validate authentication
- `POST /chat` - Send chat messages
- `GET /chat/history` - Get conversation history
- `DELETE /chat/history` - Clear conversation history
- `GET /models` - Get available AI models
- `POST /models/select` - Select AI model
- `POST /voice/transcribe` - Transcribe voice messages
- `GET /health` - Health check

## Troubleshooting

### 404 Errors on API Routes
If you see 404 errors like "No routes matched location '/api/webapp/models'":

1. **Check Environment Variables**: Ensure `VITE_BACKEND_URL` is set correctly
2. **Verify Backend**: Test the backend health endpoint directly
3. **Check Network**: Verify firewall/security settings allow the connection
4. **CORS Issues**: Ensure the backend has CORS enabled for your domain

### Network Errors
- Verify the backend server is running and accessible
- Check that the backend URL is reachable from your deployment
- Test the backend health endpoint: `GET {BACKEND_URL}/api/webapp/health`

### Authentication Issues
- **Development**: User ID will be extracted dynamically from Telegram launch parameters
- **Production**: Ensure proper Telegram WebApp launch flow
- Check browser console for authentication debugging info (development only)

## Security Best Practices

### Environment Variables
- Use different backend URLs for staging and production
- Never commit production URLs to version control
- Regularly rotate any tokens or keys in URLs
- Use HTTPS for all production backend URLs

### Deployment Security
- Enable HTTPS on both frontend and backend
- Configure proper CORS headers on backend
- Use environment variables in CI/CD pipelines
- Monitor for exposed secrets in logs

### Development Security
- Use separate development backend instances
- Don't use production data in development
- Keep development URLs local when possible

## Migration from Hardcoded URLs

If migrating from a version with hardcoded URLs:

1. Remove any hardcoded URLs from source code
2. Set `VITE_BACKEND_URL` in your deployment environment
3. Update your build/deployment scripts to use environment variables
4. Test thoroughly in staging before production deployment

## Example Deployment Configurations

### Vercel
```bash
# In Vercel dashboard or vercel.json
VITE_BACKEND_URL=https://your-backend.vercel.app
```

### Netlify
```bash
# In Netlify dashboard or netlify.toml
VITE_BACKEND_URL=https://your-backend.netlify.app
```

### Railway
```bash
# In Railway dashboard
VITE_BACKEND_URL=https://your-backend.railway.app
```

Remember to update the backend URL whenever your backend deployment changes!
