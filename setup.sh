#!/bin/bash

# Expense Manager Setup Script
echo "🚀 Setting up Expense Manager Development Environment"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js from https://nodejs.org/"
    echo "   Recommended version: 18.x or higher"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please ensure npm is installed with Node.js"
    exit 1
fi

echo "✅ npm found: $(npm --version)"

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🗄️ Setting up database..."
cd ../backend
npx prisma generate
npx prisma db push

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"

cd ..