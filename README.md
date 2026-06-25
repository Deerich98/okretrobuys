# okretrobuys.com

Static site for **Oklahoma Retro Buys**, hosted free on **GitHub Pages**, DNS on **Cloudflare**.
The home + contact pages are a faithful copy of the original WordPress/Elementor site (migrated
2026-06-25 off the retired AWS Lightsail box). `/privacy/` is the Meta App Review privacy URL.

- `index.html`, `contact-us/` — original site design
- `wp-content/`, `wp-includes/` — theme, Elementor, images, core assets
- `privacy/`, `terms/` — hand-built legal pages (Meta-ready privacy)
- `CNAME` binds okretrobuys.com · `.nojekyll` serves files as-is

Note: the contact form is static (no WordPress backend) — wire to a form service before relying on it.
