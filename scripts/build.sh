#!/usr/bin/env bash
set -e

info() { echo "$0: $1"; }
error() { info "$1"; exit 1; }
build() { info "Peforming $1 build"; }
skip() { error "${1}. Skipping build."; }

[[ "$TRAVIS_REPO_SLUG" == "$CANONICAL_REPO" ]] || {
  skip "$TRAVIS_REPO_SLUG does not match ${CANONICAL_REPO}. It's probably a fork"
}

[[ "$TRAVIS_PULL_REQUEST" == "false" ]] || {
  skip "This build was triggered by a pull request"
}

[[ "$TRAVIS_TAG" ]] && skip "Tagged commit"

if [[ "$TRAVIS_BRANCH" == "master" ]]; then
  build "prod"
  grunt build:prod
elif [[ "$TRAVIS_BRANCH" == "develop" ]]; then
  build "dev"
  grunt build
else
  skip "Unsupported branch $TRAVIS_BRANCH"
fi
