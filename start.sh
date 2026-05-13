#!/bin/bash

cd server
npm run dev &
SERVER_PID=$!

cd ../client
npm run dev &
CLIENT_PID=$!

echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"

wait