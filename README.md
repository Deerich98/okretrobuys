# okretrobuys.com — static site (free hosting, no AWS)

Rebuilt as a static site so it runs **free on GitHub Pages** instead of WordPress-on-EC2.

Pages: `/` (home) · `/contact-us/` · `/privacy/` · `/terms/`. Shared `style.css`. `CNAME` binds the
custom domain. `.nojekyll` tells Pages to serve the files as-is.

## Host it on GitHub Pages (free)
1. Create a new **public** repo on GitHub (e.g. `okretrobuys`).
2. Upload everything in this folder (drag-and-drop in the GitHub web UI, or `git push`). Keep the
   folder structure (`contact-us/index.html`, `privacy/index.html`, `terms/index.html`).
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch →** branch `main`,
   folder `/ (root)` → **Save**.
4. Under **Custom domain**, enter `okretrobuys.com` → Save (the included `CNAME` already sets this).
5. You'll get a working `https://<username>.github.io/okretrobuys/` URL right away; the custom domain
   goes live once DNS is repointed (next section). Tick **Enforce HTTPS** once it's available.

## Repoint the domain in Route 53 (one AWS login — NO payment of the compute bill)
The domain is registered with Amazon and paid through Jan 2027; only the old EC2 server is suspended.
1. Sign in to the **AWS console** → **Route 53 → Hosted zones → okretrobuys.com**.
2. Edit the **A record** for the root (`okretrobuys.com`): remove the old EC2 IP and set these four
   GitHub Pages IPs:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Add/keep a **CNAME** for `www` → `<username>.github.io`.
4. Save. DNS propagates in minutes to a few hours; GitHub auto-issues a free HTTPS certificate.

## If you can't get into the AWS console at all
Skip Route 53 and just use the `https://<username>.github.io/okretrobuys/privacy/` URL for the Meta
App Review for now — it's a valid public privacy-policy URL. Fix the custom domain later.

## To make the contact form deliver email (optional, free)
Create a form at https://formspree.io, then replace `YOUR_FORM_ID` in `contact-us/index.html`. Until
then the text / Facebook / email contact options work fine.
