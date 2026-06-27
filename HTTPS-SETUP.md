# HTTPS for okretrobuys.com — runbook & findings

> Diagnosed live 2026-06-26. The site is **GitHub Pages + Cloudflare DNS**. HTTPS here is
> **GitHub's own Let's Encrypt cert** (free, auto-renewing) — Cloudflare is DNS only, not a proxy.

## Findings (state as of 2026-06-26)

| Check | Result | Verdict |
|---|---|---|
| Apex `okretrobuys.com` A records | `185.199.108–111.153` (the 4 GitHub Pages IPs) | ✅ correct |
| `www` CNAME | `deerich98.github.io` → GitHub Pages IPs | ✅ correct |
| `CNAME` file in repo | `okretrobuys.com` | ✅ correct |
| Cloudflare proxy mode | **DNS-only (grey cloud)** — `dig` returns GitHub IPs, not Cloudflare's | ✅ correct (required) |
| Nameservers | `lilith` / `gabriel.ns.cloudflare.com` | ✅ Cloudflare is DNS host |
| Cert served at `https://okretrobuys.com` | `CN=*.github.io` (generic GitHub cert) | ❌ **not yet issued for our domain** |

**Conclusion:** DNS is fully correct and has been long enough to verify. The *only* missing piece is
that GitHub has not yet provisioned the Let's Encrypt certificate **bound to `okretrobuys.com`** — it's
still serving the generic `*.github.io` cert, so a browser hitting the apex sees a name mismatch and
HTTPS fails. This is a one-step finish in the GitHub repo settings, not a DNS problem.

## Finish steps (GitHub web UI — founder)

1. **github.com/Deerich98/okretrobuys → Settings → Pages.**
2. Confirm **Custom domain** = `okretrobuys.com` with a green **"DNS check successful."**
3. Read the **TLS certificate** line:
   - *Provisioning / in progress* → **wait.** GitHub issues it automatically once DNS verifies;
     usually minutes, up to 24h. Just let it run on its own clock.
   - *Stuck >24h or `errored`* → **do NOT blind-toggle the custom domain in the UI** (see below). The
     recovery that actually worked is a **cname-only API PUT** that re-asserts the domain without wiping
     state:
     ```bash
     gh api -X PUT repos/Deerich98/okretrobuys/pages -f cname=okretrobuys.com
     ```
     then wait for a fresh build. (This also clears a bad `https_enforced=true`-with-no-cert state.)
4. When the cert state reads **`approved`**, the **"Enforce HTTPS"** checkbox un-greys → **tick it.**
   Done. **Do not** enable Enforce HTTPS before the cert is approved.

## Do NOT

- **Do not blind remove/re-add the custom domain to "nudge" the cert.** An automated CNAME remove/re-add
  on 2026-06-25 left Pages `errored` (`cname:null`) and 404'd the live site for a stretch; it also flipped
  on `https_enforced` with no cert. If it's genuinely stuck, use the cname-only API PUT in step 3 instead.
- **Do not flip the Cloudflare records to the orange cloud (proxy)** while provisioning. That hides the
  GitHub IPs behind Cloudflare's, which either blocks GitHub's cert issuance or causes an HTTPS redirect
  loop. Keep apex + `www` **DNS-only (grey cloud)**.
- If you ever *do* want Cloudflare's proxy/CDN later, that's a deliberate switch: turn the proxy on AND
  set Cloudflare SSL/TLS mode to **Full** (never Flexible) so Cloudflare→GitHub stays HTTPS. Until then,
  grey cloud + GitHub's own cert is the simplest reliable setup.

## Verify (after the cert provisions)

```bash
echo | openssl s_client -servername okretrobuys.com -connect okretrobuys.com:443 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
# subject should read CN=okretrobuys.com (NOT *.github.io)
curl -sI https://okretrobuys.com | head -1          # expect HTTP/2 200
curl -sI https://okretrobuys.com/privacy/ | head -1 # Meta App Review URL must be clean HTTPS
```
