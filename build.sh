#!/bin/bash

echo -e "\033[0;32mBuild...\033[0m"
npm run build

rm -rf gh-pages
git worktree prune
git branch -D gh-pages
git worktree add -B gh-pages gh-pages empty
cp -RT public gh-pages
