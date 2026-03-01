#!/bin/bash
set -e

echo "=== Installing server dependencies ==="
npm install

echo "=== Installing client dependencies ==="
cd client
npm install --include=dev

echo "=== Building client ==="
./node_modules/.bin/vite build

echo "=== Build complete ==="
