#!/bin/bash

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

# Add changes to git.
cd gh-pages
pwd
git add -A

# Commit changes.
msg="rebuilding site `date`"
if [ $# -eq 1 ]
  then msg="$1"
fi
git commit -m "$msg"

# Push source and build repos.
git remote -v
git branch
git push origin +gh-pages
