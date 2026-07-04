# okretrobuys.com

Static site for **Oklahoma Retro Buys**, hosted free on **GitHub Pages**, DNS on **Cloudflare**.
`/privacy/` is the Meta App Review privacy URL — do not move or rename it.

**2026-07-03 redesign:** the home + contact pages were rebuilt with a modern, mobile-first design
(`assets/site.css`). All original images/icons were kept and are still served from `wp-content/`.
The pre-redesign site (the faithful WordPress/Elementor copy migrated 2026-06-25 off AWS) is
preserved in full — see "Reverting the redesign" below.

- `index.html`, `contact-us/` — 2026 redesign (hand-written HTML, no WordPress)
- `assets/site.css` — the one stylesheet for the redesigned pages
- `wp-content/`, `wp-includes/` — original theme + images (still used by the new pages, privacy & terms)
- `privacy/`, `terms/` — hand-built legal pages, untouched by the redesign (Meta-ready privacy)
- `CNAME` binds okretrobuys.com · `.nojekyll` serves files as-is
- `HTTPS-SETUP.md` — cert runbook (HTTPS resolved 2026-06-27)

## Reverting the redesign (the safety net)

The complete old site is frozen at git tag **`legacy-2020-design`** (and branch `legacy-site`).
To roll the whole site back exactly as it was:

```bash
./restore-legacy-site.sh   # restores old pages, removes assets/, commits
git push                   # founder pushes; GitHub Pages redeploys in ~1 min
```

Or by hand: `git checkout legacy-2020-design -- . && rm -rf assets && git add -A && git commit`.
Nothing was deleted from `wp-content/`, so the revert is byte-identical to the pre-redesign site.

## Contact

Contact is **Facebook Messenger first** (m.me/okcretrobuys — the business page, so sellers see
reviews/history) plus `sell@okretrobuys.com`. The old WordPress contact form and the
"text us" phone number were removed on purpose (2026-07-03, founder's call).
