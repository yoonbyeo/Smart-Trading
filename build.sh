#!/bin/bash
set -e
echo "=== Installing server dependencies ==="
npm install

echo "=== Installing client dependencies ==="
cd client
npm install

echo "=== Building client ==="
./node_modules/.bin/vite build

echo "=== Build complete ==="
