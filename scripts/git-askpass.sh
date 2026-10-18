#!/bin/sh
# Supplies GIT_SYNC_TOKEN to git over HTTPS without putting it in a URL.
case "$1" in
  Username*) echo x-access-token ;;
  *) echo "$GIT_SYNC_TOKEN" ;;
esac
