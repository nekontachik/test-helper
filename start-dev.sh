#!/bin/bash

# Kill any process using port 3000
echo "Checking for processes using port 3000..."
PID=$(lsof -ti:3000)
if [ -n "$PID" ]; then
  echo "Killing process $PID that is using port 3000"
  kill -9 $PID
else
  echo "No process is using port 3000"
fi

# Start the Next.js development server
echo "Starting Next.js development server..."
npm run dev 