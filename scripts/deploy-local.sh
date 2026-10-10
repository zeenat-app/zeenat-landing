#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ssh_host="${SSH_HOST:-130.61.129.49}"
ssh_user="${SSH_USER:-ubuntu}"
ssh_key="${SSH_KEY:?SSH_KEY must point to the Oracle private key}"
deploy_root="${DEPLOY_DIR:-/var/www/zeenat-landing}"
release_id="${RELEASE_ID:-$(date -u +%Y%m%d%H%M%S)-$(git -C "${repository_root}" rev-parse --short HEAD 2>/dev/null || echo local)}"
archive_path="$(mktemp -t zeenat-landing.XXXXXX.tar.gz)"

cleanup() { rm -f "${archive_path}"; }
trap cleanup EXIT

cd "${repository_root}"
npm run build
npm run check
COPYFILE_DISABLE=1 tar -czf "${archive_path}" -C dist .

[[ "${deploy_root}" =~ ^/[a-zA-Z0-9/_-]+$ ]] || { echo "Invalid DEPLOY_DIR" >&2; exit 1; }
[[ "${release_id}" =~ ^[a-zA-Z0-9._-]+$ ]] || { echo "Invalid RELEASE_ID" >&2; exit 1; }
ssh_options=(-o BatchMode=yes -o ConnectTimeout=10 -i "${ssh_key}")
ssh "${ssh_options[@]}" "${ssh_user}@${ssh_host}" \
  "mkdir -p '${deploy_root}/incoming' '${deploy_root}/releases'"
scp "${ssh_options[@]}" "${repository_root}/deploy/remote-deploy.sh" \
  "${ssh_user}@${ssh_host}:${deploy_root}/remote-deploy.sh.new"
ssh "${ssh_options[@]}" "${ssh_user}@${ssh_host}" \
  "chmod 755 '${deploy_root}/remote-deploy.sh.new' && mv '${deploy_root}/remote-deploy.sh.new' '${deploy_root}/remote-deploy.sh'"
scp "${ssh_options[@]}" "${archive_path}" \
  "${ssh_user}@${ssh_host}:${deploy_root}/incoming/${release_id}.tar.gz"
ssh "${ssh_options[@]}" "${ssh_user}@${ssh_host}" \
  "DEPLOY_ROOT='${deploy_root}' bash '${deploy_root}/remote-deploy.sh' '${release_id}'"
