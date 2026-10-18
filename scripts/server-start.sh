#!/bin/bash
# Container start command (see nixpacks.toml).
cd /app

# Turn /app into a git checkout of the deployed commit so control panel edits
# can be committed and pushed to origin/live (app/Listeners/GitSync.php).
if [ -n "$GIT_SYNC_TOKEN" ] && [ -n "$SOURCE_COMMIT" ] && [ ! -d .git ]; then
  git init -q
  git symbolic-ref HEAD refs/heads/live
  git remote add origin https://github.com/willcalderbank/distorted-logic-website.git
  git config user.name "Distorted Logic CMS"
  git config user.email "cms@distortedlogic.co.uk"
  if git fetch -q origin live && git reset -q --mixed "$SOURCE_COMMIT"; then
    git branch -q --set-upstream-to=origin/live
  else
    echo "Git sync disabled: could not fetch origin/live at $SOURCE_COMMIT" >&2
    rm -rf .git
  fi
fi

# php-fpm runs as nobody and must be able to write content and git.
chmod +x scripts/git-askpass.sh
chown nobody /app
chown -R nobody content public/assets resources users storage bootstrap/cache
[ -d .git ] && chown -R nobody .git

# Nixpacks emits a duplicate `location /` when both IS_LARAVEL and this are set.
unset NIXPACKS_PHP_FALLBACK_PATH
node /assets/scripts/prestart.mjs /assets/nginx.template.conf /nginx.conf
php-fpm -y /assets/php-fpm.conf &
exec nginx -c /nginx.conf
