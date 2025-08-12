@echo off
echo 🚀 Quick Deploy Script for Content AI Agent
echo.

echo 📦 Installing dependencies...
npm install

echo.
echo 🌐 Starting development server...
echo.
echo ✅ Your app will be available at: http://localhost:5000
echo ✅ Frontend will be at: http://localhost:3000
echo.
echo 💡 To make it public, use ngrok or similar service
echo 💡 Or deploy to Vercel/Railway for production
echo.
npm run dev
