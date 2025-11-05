#!/bin/bash

echo "🏥 PCC Agent Toolkit - Demo Options"
echo "=================================="
echo ""
echo "Choose how you want to run the demo:"
echo ""
echo "1. 🌐 Web UI (Interactive)    - npm run ui"
echo "2. 🖥️  CLI Example (Original)  - npm run dev"
echo "3. 🛠️  Server Only             - npm run server"
echo ""
echo "Recommended: Option 1 (Web UI) for interactive testing"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting Web UI..."
        echo "🌐 Open http://localhost:3000 in your browser"
        echo ""
        npm run ui
        ;;
    2)
        echo ""
        echo "🖥️ Running CLI example..."
        echo ""
        npm run dev
        ;;
    3)
        echo ""
        echo "🛠️ Starting server only..."
        echo "🌐 Open http://localhost:3000 in your browser"
        echo ""
        npm run server
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please run the script again and choose 1, 2, or 3."
        exit 1
        ;;
esac