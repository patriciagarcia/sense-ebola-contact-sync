#!/usr/bin/env bash
set -e

now="$(date -u "+%Y%m%d%H%M%S")"
user="travisci"
repo="sense-ebola-contact-sync"
root="/home/$user/$repo"

info() { echo "$0: $1"; }
error() { info "$1"; exit 1; }
deploy() { info "Deploying $1 build"; }
skip() { error "${1}. Skipping deployment."; }

notify() {
  if [[ $1 == 0 ]]; then
    email="build+ok@flowdock.com";
    subject="${TRAVIS_REPO_SLUG} $2 deployment succeeded"
  else
    email="build+fail@flowdock.com";
    subject="${TRAVIS_REPO_SLUG} $2 deployment failed"
  fi

  data='{"source": "Travis","from_name":"CI","from_address": "'${email}'","subject": "'${subject}'","content": "'${subject}'"}'
  curl -H "Content-Type: application/json" \
    -d "${data}" \
    https://api.flowdock.com/v1/messages/team_inbox/${FLOWDOCK_API} > /dev/null
}

[[ "$TRAVIS_REPO_SLUG" == "$CANONICAL_REPO" ]] || {
  skip "$TRAVIS_REPO_SLUG does not match ${CANONICAL_REPO}. It's probably a fork"
}

[[ "$TRAVIS_PULL_REQUEST" == "false" ]] || {
  skip "This build was triggered by a pull request"
}

if [[ "$TRAVIS_BRANCH" == "master" ]]; then
  type="stage"
  host="stage.ebola.eocng.org"
  fingerprint="stage.ebola.eocng.org ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDLxpf06QPpeexqoWQmfG/kF1MDqN28vcHPjXo2zPEsHLpf3rSWTzcABlqO9qo9LFhwS3o0U7x8vMyA00WV8p7kn4CzZLT+nIHxWTSvvuQ7wZ7aNPYTfdKzleVJSSgF6GRn7vejktuv/mKukb+YXYggypAshrXbkzqsJMKCGOEm88o4rVLm7VclJNAj6GJvanyj14WAEcXf/F2sdZNivhD0+kxDxZGOgUCqAi43g6pTUiQbOeRZ2tZw7lvDNGsslcwlhS01agAzCbaB7rBHzbN6vh72E8tw2b1xRM1t07c2ZiD36eBzZjN1xaJfZn+RaRZvZKhiUVYVsxoPedbRJhH9"
elif [[ "$TRAVIS_BRANCH" == "develop" ]]; then
  type="dev"
  host="dev.ebola.eocng.org"
  fingerprint="dev.ebola.eocng.org ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC/thj0R6686ZhLgL5WZTLOIXb3PeD20kh1bGR4DpnOjsm2msc41NQqnbuddB1laB27pLfa6/tKQVvbpfpftsaZFQypiOlniFVrI3+Ah4DN9oko2lpY7IvZG4thA9v2mYS4Ouk9thOwgLziENqmIzHiauNFV4J54i5S2f+pW+d1tv0kWYaaTwbOK8rHxUzS7ndQRzDWKfdKnkOe9tahle0c2Y2K8JdCJN8TKhIr/zE7msD7jWz9PArSHS66lDgI9pYwU7/izkGpfGhwQkgenbbNIvXvMpA/p6tgUuL1HlewkhwqL7EPRSurBGaGLUfXZLq3jVdJwb6VGJVlHvs/oYi9"
elif [[ "$TRAVIS_TAG" ]]; then
  type="prod"
  host="ebola.eocng.org"
  fingerprint="ebola.eocng.org ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDLxpf06QPpeexqoWQmfG/kF1MDqN28vcHPjXo2zPEsHLpf3rSWTzcABlqO9qo9LFhwS3o0U7x8vMyA00WV8p7kn4CzZLT+nIHxWTSvvuQ7wZ7aNPYTfdKzleVJSSgF6GRn7vejktuv/mKukb+YXYggypAshrXbkzqsJMKCGOEm88o4rVLm7VclJNAj6GJvanyj14WAEcXf/F2sdZNivhD0+kxDxZGOgUCqAi43g6pTUiQbOeRZ2tZw7lvDNGsslcwlhS01agAzCbaB7rBHzbN6vh72E8tw2b1xRM1t07c2ZiD36eBzZjN1xaJfZn+RaRZvZKhiUVYVsxoPedbRJhH9"
else
  skip "Unsupported branch $TRAVIS_BRANCH and/or untagged commit"
fi

deploy "$type"
echo "$fingerprint" >> ~/.ssh/known_hosts

if [[ "$type" == "prod" ]]; then
  ssh $user@$host scripts/deploy.sh "$repo" "$TRAVIS_TAG"
else
  rsync -avz -e ssh dist/ $user@$host:$root/$now/ && {
    ssh $user@$host ln -fsn "$root/$now" "$root/latest"
  }
fi

notify $? "$type"
