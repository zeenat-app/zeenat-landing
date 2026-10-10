#!/usr/bin/env bash
set -euo pipefail

release_id="${1:?release id is required}"
deploy_root="${DEPLOY_ROOT:-/var/www/zeenat-landing}"
archive_path="${deploy_root}/incoming/${release_id}.tar.gz"
release_path="${deploy_root}/releases/${release_id}"

if [[ ! "${release_id}" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  echo "Invalid release id" >&2
  exit 1
fi
if [[ ! -f "${archive_path}" ]]; then
  echo "Release archive not found: ${archive_path}" >&2
  exit 1
fi

if [[ -e "${release_path}" ]]; then
  echo "Release already exists; use a unique release id" >&2
  exit 1
fi
mkdir -p "${release_path}"
tar -xzf "${archive_path}" -C "${release_path}"
rm -f "${archive_path}"
if [[ ! -f "${release_path}/index.html" ]]; then
  echo "Release does not contain index.html" >&2
  exit 1
fi

ln -sfn "${release_path}" "${deploy_root}/current.next"
mv -Tf "${deploy_root}/current.next" "${deploy_root}/current"

find "${deploy_root}/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -nr \
  | tail -n +6 \
  | cut -d' ' -f2- \
  | xargs -r rm -rf

echo "Published frontend ${release_id}"
