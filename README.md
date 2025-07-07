# Telegram Mini Web App Integration

This project integrates a React-based Telegram Mini Web App frontend with the existing Python Telegram bot backend, enabling web access to all AI features.

## 🏗️ Architecture

### Frontend (React + Vite + Tailwind CSS v4)
- **Location**: `d:\test_demo\MiniWebApp\`
- **Framework**: React 18 with React Router v7
- **Styling**: Tailwind CSS v4 with mobile-first design
- **SDK**: Telegram Web Apps SDK integration
- **Authentication**: Telegram WebApp InitData validation

### Backend (Python + FastAPI)
- **Location**: `d:\test_demo\src\api\routes\webapp.py`
- **Framework**: FastAPI with async support
- **Authentication**: HMAC-SHA256 validation of Telegram WebApp data
- **Integration**: Direct access to existing bot services

## 🚀 Features Implemented

### ✅ Fully Integrated Features
1. **General Chat** (`/chat`) - AI conversation with context
2. **Code Assistant** (`/code`) - Code analysis, review, explanation, debugging
3. **Voice Transcription** (`/voice`) - Audio file to text conversion
4. **Image Analysis** (`/image/analyze`) - AI-powered image understanding
5. **Image Generation** (`/image/generate`) - AI image creation
6. **Document Analysis** (`/document/analyze`) - PDF/document processing
7. **Document Generation** (`/document/generate`) - AI document creation
8. **PDF Analysis** (`/pdf/analyze`) - Specialized PDF processing

### 🛡️ Security Features
- Telegram WebApp InitData validation
- HMAC-SHA256 signature verification
- Replay attack prevention (24-hour window)
- Bot token-based secret key generation

## 📁 Project Structure

```
d:\test_demo\
├── MiniWebApp\                  # React frontend
│   ├── app\
│   │   ├── routes\             # Page components
│   │   │   ├── dashboard.tsx   # Main dashboard
│   │   │   ├── chat.tsx        # Chat interface
│   │   │   ├── code.tsx        # Code assistant
│   │   │   ├── voice.tsx       # Voice transcription
│   │   │   ├── image.tsx       # Image generation/analysis
│   │   │   ├── document.tsx    # Document generation
│   │   │   └── pdf.tsx         # PDF analysis
│   │   ├── lib\
│   │   │   └── api.ts          # API client with authentication
│   │   └── root.tsx            # App root component
│   ├── vite.config.ts          # Vite configuration with proxy
│   └── package.json
└── src\
    ├── api\
    │   ├── routes\
    │   │   └── webapp.py       # FastAPI routes for Mini App
    │   └── app_factory.py      # FastAPI app configuration
    └── bot\                    # Existing bot infrastructure
```

## 🚀 Quick Start

### Prerequisites
1. **Backend**: Python environment with all dependencies installed
2. **Frontend**: Node.js 18+ and npm
3. **Telegram Bot**: Valid bot token and webhook configured

### 1. Start the Backend
```powershell
cd d:\test_demo
# Activate your Python environment
.venv\Scripts\Activate.ps1

# Install dependencies if needed
pip install -r requirements.txt

# Start the FastAPI server
python app.py
```
The backend will be available at `http://localhost:8000`

### 2. Start the Frontend
```powershell
cd d:\test_demo\MiniWebApp

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will be available at `http://localhost:5173`

### 3. Quick Development Start
```powershell
cd d:\test_demo\MiniWebApp
.\start-dev.ps1
```

## 🔗 API Endpoints

### Authentication
- `POST /api/webapp/auth/validate` - Validate Telegram WebApp authentication

### Features
- `POST /api/webapp/chat` - General AI chat
- `POST /api/webapp/code` - Code analysis and assistance
- `POST /api/webapp/voice/transcribe` - Voice to text conversion
- `POST /api/webapp/image/analyze` - Image analysis
- `POST /api/webapp/image/generate` - Image generation
- `POST /api/webapp/document/analyze` - Document analysis
- `POST /api/webapp/document/generate` - Document generation
- `POST /api/webapp/pdf/analyze` - PDF-specific analysis
- `GET /api/webapp/health` - Health check

## 🔐 Authentication Flow

1. **Telegram WebApp** provides `initData` containing user info and signature
2. **Frontend** sends `Authorization: tma <initData>` header
3. **Backend** validates HMAC-SHA256 signature using bot token
4. **Backend** checks timestamp to prevent replay attacks
5. **API calls** proceed with validated user context

## 📱 Telegram WebApp Integration

### Bot Setup
```javascript
// In your Telegram bot, create a web app button
const webAppButton = {
  text: "🤖 Open AI Assistant",
  web_app: {
    url: "https://your-domain.com"  // Your deployed frontend URL
  }
};
```

### WebApp Manifest
The app includes proper Telegram WebApp configuration:
- Responsive design for mobile devices
- Telegram theme integration
- haptic feedback support
- Proper viewport configuration

## 🛠️ Development

### Frontend Development
```powershell
cd d:\test_demo\MiniWebApp

# Type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
The webapp routes are automatically included in the main FastAPI app via `app_factory.py`.

## 🚀 Deployment

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `build/client` folder to your web server
3. Configure your web server to serve `index.html` for all routes

### Backend Deployment
The webapp routes are part of the main application and deploy with it.

### Environment Variables
Ensure these are set for production:
- `TELEGRAM_BOT_TOKEN` - Your bot token
- `WEBHOOK_URL` - Your webhook URL (optional, for webhook mode)

## 🔧 Configuration

### API Client Configuration
The API client automatically:
- Extracts Telegram WebApp initData
- Adds proper authentication headers
- Handles errors and retries
- Supports both form data and JSON requests

### Proxy Configuration
The Vite dev server proxies `/api/*` requests to `http://localhost:8000` for seamless development.

## 📋 Testing

### Manual Testing
1. Start both backend and frontend servers
2. Open `http://localhost:5173` in a browser
3. Test each feature page
4. Check browser console for any errors

### Integration Testing
For production testing, deploy to a public URL and test within Telegram:
1. Add the web app URL to your Telegram bot
2. Open the bot in Telegram
3. Click the web app button
4. Test all features within the Telegram context

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors**
- Ensure bot token is correct
- Check that initData is being passed correctly
- Verify timestamp is recent (< 24 hours)

**API Connection Issues**
- Verify backend is running on port 8000
- Check proxy configuration in `vite.config.ts`
- Ensure CORS is properly configured

**File Upload Issues**
- Check file size limits
- Verify file type validation
- Ensure proper form data encoding

## 📊 Performance Optimizations

- **Frontend**: Code splitting, lazy loading, optimized bundles
- **Backend**: Async operations, connection pooling, memory optimization
- **Authentication**: Cached validation to reduce overhead
- **File Handling**: Temporary file cleanup, memory-efficient processing

## 🔮 Future Enhancements

- Real-time updates via WebSockets
- Payment integration for premium features
- Multi-language support
- Advanced file format support
- Push notifications
- Offline capability

## 📝 API Documentation

Interactive API documentation is available at `http://localhost:8000/docs` when running the backend server.

---

The integration is now complete and ready for production deployment! 🎉
