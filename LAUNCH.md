# Launch Zeenat at zeenat.app

Run local commands from `/Users/ahmed/zeenat/zeenat-landing`. Server commands below run as your existing `ubuntu` user on Oracle. Use your actual private-key path; never commit the key.

## 1. Review the page

```bash
nvm use
npm ci
npm run dev
```

Open http://127.0.0.1:4321. Review desktop and mobile, section links, screenshot gallery and FAQ. In `site.config.json`, add actual store URLs when available. Otherwise keep them blank; both store labels remain “Coming soon”. Brand copy can be edited in `src/index.html`.

Add approved public privacy-policy and terms pages before using this domain for those app-store URLs. No legal text has been invented for this marketing page.

## 2. Create the remote repository

Create an empty GitHub repository named `zeenat-landing` in your usual account or organisation. Do not add a README/license/gitignore on GitHub; these local files already exist. This folder is prepared as its own repository with a `main` branch. Review and make the initial commit:

```bash
git status
git add .
git commit -m "Set up Zeenat landing page and Oracle deployment"
git remote add origin git@github.com:YOUR_ACCOUNT/zeenat-landing.git
git push -u origin main
```

Use your own repository URL. If you have not configured Git's name/email, configure your real identity before committing. `dist/` is ignored; CircleCI builds it.

## 3. DNS at Namecheap

Your supplied screenshot shows `A @ → 130.61.129.49`; retain that record if this is still your Oracle public IP. Preserve the existing admin/api/api-dev/io records.

Add `CNAME www → zeenat.app` with automatic TTL. Remove any conflicting `www` parking/redirect record. The site redirects `www` to the root domain. Do not add an AAAA record unless the server is also configured for the corresponding IPv6 address.

```bash
dig +short zeenat.app A
dig +short www.zeenat.app
```

Both names must resolve to the intended server before issuing the certificate. `.app` domains require HTTPS in browsers.

## 4. Prepare the server directory

Connect locally:

```bash
ssh -i /absolute/path/to/oracle.key ubuntu@130.61.129.49
```

On the server:

```bash
sudo mkdir -p /var/www/zeenat-landing/incoming /var/www/zeenat-landing/releases
sudo chown -R ubuntu:ubuntu /var/www/zeenat-landing
```

Check whether an existing Nginx site already owns `zeenat.app` or `www.zeenat.app`:

```bash
sudo nginx -T 2>&1 | rg 'server_name|zeenat.app'
```

If `rg` is not installed, use `grep -E 'server_name|zeenat.app'`. Back up the matching configuration before changing it. Replace only an existing root/www block; keep admin and API blocks. Do not enable a second block with the same names.

## 5. Upload the first release

Back on your Mac, with the preview stopped:

```bash
SSH_KEY="/absolute/path/to/oracle.key" npm run deploy:prod
scp -i /absolute/path/to/oracle.key deploy/nginx-landing.conf ubuntu@130.61.129.49:/tmp/nginx-landing.conf
```

The deploy command builds and checks the page, uploads the archive, and switches the site directory. It does not install Nginx configuration or issue certificates.

On the server, after resolving any existing root/www block:

```bash
sudo cp /tmp/nginx-landing.conf /etc/nginx/sites-available/zeenat-landing
sudo ln -s /etc/nginx/sites-available/zeenat-landing /etc/nginx/sites-enabled/zeenat-landing
sudo nginx -t
sudo systemctl reload nginx
curl -I -H 'Host: zeenat.app' http://127.0.0.1/
```

If the symlink already exists, leave it in place. Require `nginx -t` to succeed before reloading. Ports 80 and 443 must be allowed by the Oracle security list/network security group and the server firewall, as for the admin site. The supplied file is an HTTP bootstrap configuration; do not overwrite the TLS configuration with it after Certbot runs.

## 6. Enable HTTPS

Use the server's existing Certbot installation, as used for the admin domain. If it is missing, follow [Certbot's installation instructions](https://certbot.eff.org/instructions) for the installed Ubuntu version and Nginx.

```bash
sudo certbot --nginx -d zeenat.app -d www.zeenat.app
sudo nginx -t
sudo systemctl reload nginx
sudo certbot renew --dry-run
```

Select HTTP-to-HTTPS redirection when prompted. The certificate must cover both hostnames. The Nginx `www` block then redirects to canonical `https://zeenat.app`. Certbot needs the HTTP site reachable on port 80 for validation; see [Certbot's Nginx guidance](https://certbot.eff.org/instructions?os=ubuntufocal&ws=nginx).

Verify locally:

```bash
curl -I https://zeenat.app/
curl -I https://www.zeenat.app/
curl -I http://zeenat.app/
curl -I https://zeenat.app/does-not-exist
curl --fail https://zeenat.app/robots.txt
curl --fail https://zeenat.app/sitemap.xml
```

Expect 200 for the homepage, redirects to the HTTPS root hostname for aliases, and 404 for the missing page. Review the live page on your phone as well.

## 7. Connect CircleCI

After the first manual launch, connect the GitHub repository to CircleCI, using the checked-in `.circleci/config.yml`. Add the SSH private key under Project Settings → SSH Keys for hostname `130.61.129.49`, following the admin project's existing arrangement.

Set these project environment variables:

```text
SSH_HOST=130.61.129.49
SSH_USER=ubuntu
DEPLOY_DIR=/var/www/zeenat-landing
SSH_KNOWN_HOSTS=<verified known_hosts line for 130.61.129.49>
```

Get the host fingerprint via your trusted server access and compare it with your local known_hosts entry. On the server:

```bash
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

On your Mac, for a previously verified connection:

```bash
ssh-keygen -F 130.61.129.49
```

Copy the actual matching host-key line (not its comment) into `SSH_KNOWN_HOSTS`; multiple verified lines may be separated by newlines. This avoids trusting an unverified `ssh-keyscan` result during CI.

Push to `main` or rerun the first pipeline. Other branches build and check; only `main` publishes. CI verifies HTTPS after deployment, so configure the certificate before enabling automated deployment. Releases have unique commit/build IDs and the newest five are retained.

## 8. Search discovery

Create a Google Search Console Domain property for `zeenat.app`. Add Google's supplied TXT record at Namecheap alongside the A/CNAME records. After verification, submit `https://zeenat.app/sitemap.xml` and inspect the homepage URL. Check the canonical URL and social sharing image. Google documents the [sitemap submission process](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). These foundations help crawling; they do not guarantee rankings or immediate indexing.

## Rollback

On the server, list retained releases and choose a known good one:

```bash
ls -lt /var/www/zeenat-landing/releases
```

Substitute its exact directory for `PREVIOUS_RELEASE`:

```bash
test -f /var/www/zeenat-landing/releases/PREVIOUS_RELEASE/index.html
ln -sfn /var/www/zeenat-landing/releases/PREVIOUS_RELEASE /var/www/zeenat-landing/current.next
mv -Tf /var/www/zeenat-landing/current.next /var/www/zeenat-landing/current
```

Do not run the switch unless the `test` succeeds. Nginx serves the selected files without a reload.
