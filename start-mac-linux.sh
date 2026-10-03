#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env
 echo "Installing dependencies..."
npm run install:all
 echo "Starting LocalExpress..."
npm run dev
