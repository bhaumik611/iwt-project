#!/bin/zsh

# Kill any existing processes on ports 8001 and 3000
echo "Stopping any existing servers..."
lsof -ti:8001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start the backend server
echo "Starting backend server on http://localhost:8001"
cd "$(dirname "$0")/backend" && php -S localhost:8001 &

# Start the frontend server
echo "Starting frontend server on http://localhost:3000"
cd "$(dirname "$0")/frontend" && python3 -m http.server 3000 &

echo "\nServers are running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8001"
echo "\nPress Ctrl+C to stop both servers"

# Wait for Ctrl+C and then cleanup
trap 'kill $(jobs -p) 2>/dev/null' EXIT
wait