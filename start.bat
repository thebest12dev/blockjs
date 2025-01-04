@echo off
start npx webpack -w
start npx http-server
start cd server && call blockjs --server