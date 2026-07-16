#!/usr/bin/env node
/**
 * build-blog.mjs — the OKRB blog generator (2026-07-16, CEO night run #8 follow-up).
 *
 * okretrobuys.com is a hand-built static site on GitHub Pages, so the blog is generated:
 * markdown in, pages out, committed, and live on the founder's next push.
 *
 *   blog/_posts/<slug>.md   (front matter: title / date YYYY-MM-DD / description / [slug])
 *     └─ node tools/build-blog.mjs
 *          → blog/<slug>/index.html   (one page per post, site shell + article styling)
 *          → blog/index.html          (the index — cards, newest first)
 *
 * The weekly marketing loop (flip-press-hq tools/marketing-loop) authors OKRB articles as
 * markdown; its OKRB "publish" step is: drop the .md into blog/_posts/, run this, commit.
 * Zero dependencies — the markdown subset matches what the loop writes (## / ### headings,
 * "- " lists, **bold**, [text](url), --- rules, paragraphs).
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = join(ROOT, "blog", "_posts");
const SITE = "https://okretrobuys.com";

/* ── tiny markdown subset → html ── */
const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s.,!?;:)]|$)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

function mdToHtml(md) {
  const out = [];
  let list = null;
  const closeList = () => {
    if (list) { out.push("</ul>"); list = null; }
  };
  for (const block of md.split(/\n{2,}/)) {
    const lines = block.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim() !== "");
    if (!lines.length) continue;
    if (lines.every((l) => l.trim().startsWith("- "))) {
      out.push("<ul>");
      for (const l of lines) out.push(`<li>${inline(l.trim().slice(2))}</li>`);
      out.push("</ul>");
      continue;
    }
    closeList();
    const text = lines.join(" ");
    if (text.startsWith("### ")) out.push(`<h3>${inline(text.slice(4))}</h3>`);
    else if (text.startsWith("## ")) out.push(`<h2>${inline(text.slice(3))}</h2>`);
    else if (/^-{3,}$/.test(text.trim())) out.push("<hr>");
    else out.push(`<p>${inline(text)}</p>`);
  }
  closeList();
  return out.join("\n");
}

/* ── front matter ── */
function parsePost(file) {
  const raw = readFileSync(join(POSTS_DIR, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const k of ["title", "date", "description"]) {
    if (!meta[k]) throw new Error(`${file}: front matter needs ${k}`);
  }
  meta.slug = meta.slug || basename(file, ".md");
  return { ...meta, body: m[2].trim() };
}

const prettyDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC", year: "numeric", month: "long", day: "numeric",
  });

/* ── the shared site shell (mirrors index.html's header/footer) ── */
const header = (depth) => `
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">
      <img src="/wp-content/uploads/2024/01/IMG_2219-modified.png" alt="Oklahoma Retro Buys logo" width="40" height="40">
      <span>Oklahoma Retro Buys</span>
    </a>
    <nav class="site-nav" aria-label="Main">
      <a href="/#buy">What We Buy</a>
      <a href="/#how">How It Works</a>
      <a href="/blog/"${depth === "index" ? ' aria-current="page"' : ""}>Blog</a>
      <a href="/contact-us/">Contact</a>
    </nav>
    <a class="btn btn-msgr btn-sm header-cta" href="https://m.me/okcretrobuys">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.15.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.98-.87c.17-.08.36-.09.53-.04.91.25 1.88.38 2.91.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm6 7.46-2.94 4.67c-.47.74-1.47.93-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.67c.47-.74 1.47-.93 2.17-.4l2.34 1.75c.21.16.51.16.72 0l3.16-2.4c.42-.32.97.18.69.63z"/></svg>
      Message Us
    </a>
  </div>
</header>`;

const footer = `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <a class="brand" href="/">
        <img src="/wp-content/uploads/2024/01/IMG_2219-modified.png" alt="Oklahoma Retro Buys logo" width="40" height="40">
        <span>Oklahoma Retro Buys</span>
      </a>
      <nav class="footer-nav" aria-label="Footer">
        <a href="/">Home</a>
        <a href="/blog/">Blog</a>
        <a href="/contact-us/">Contact</a>
        <a href="/privacy/">Privacy Policy</a>
        <a href="/terms/">Terms</a>
        <a href="https://facebook.com/okcretrobuys">Facebook</a>
      </nav>
    </div>
    <p class="footer-legal">© 2026 Oklahoma Retro Buys — okretrobuys.com · We buy retro video games, consoles &amp; vintage toys across Oklahoma.</p>
  </div>
</footer>`;

const head = ({ title, description, canonical, jsonld }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/png" href="/wp-content/uploads/2024/01/IMG_2219-modified-150x150.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Oklahoma Retro Buys">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
${jsonld ? `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 1)}\n</script>` : ""}
</head>
<body>`;

const msgrCta = `
  <div class="post-cta">
    <h3>Got a closet like this one?</h3>
    <p>Games, consoles, action figures, whole bins — send a photo, get a real cash offer, and we pick up or meet anywhere in the OKC metro.</p>
    <a class="btn btn-msgr" href="https://m.me/okcretrobuys">Message Us on Facebook</a>
  </div>`;

/* ── build ── */
const posts = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map(parsePost)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

for (const p of posts) {
  const url = `${SITE}/blog/${p.slug}/`;
  const html = `${head({
    title: `${p.title} — Oklahoma Retro Buys`,
    description: p.description,
    canonical: url,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url,
      author: { "@type": "Organization", name: "Oklahoma Retro Buys" },
      publisher: { "@type": "Organization", name: "Oklahoma Retro Buys", url: SITE },
    },
  })}
${header("post")}

<main>
  <article class="section post">
    <div class="wrap post-wrap">
      <p class="kicker">OKRB Blog</p>
      <h1>${escapeHtml(p.title)}</h1>
      <p class="post-date">${prettyDate(p.date)}</p>
      ${mdToHtml(p.body)}
      ${msgrCta}
      <p class="post-back"><a href="/blog/">← All posts</a></p>
    </div>
  </article>
</main>
${footer}

</body>
</html>
`;
  mkdirSync(join(ROOT, "blog", p.slug), { recursive: true });
  writeFileSync(join(ROOT, "blog", p.slug, "index.html"), html);
  console.log(`✓ blog/${p.slug}/`);
}

const cards = posts
  .map(
    (p) => `      <a class="blog-card" href="/blog/${p.slug}/">
        <p class="blog-card-date">${prettyDate(p.date)}</p>
        <h2>${escapeHtml(p.title)}</h2>
        <p>${escapeHtml(p.description)}</p>
        <span class="blog-card-more">Read it →</span>
      </a>`
  )
  .join("\n");

const indexHtml = `${head({
  title: "The OKRB Blog — Oklahoma Retro Buys",
  description: "Retro finds, cash-out guides, and nostalgia from Oklahoma Retro Buys — what your old games and toys are worth, and the easiest way to turn them into cash.",
  canonical: `${SITE}/blog/`,
  jsonld: {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The OKRB Blog",
    url: `${SITE}/blog/`,
    publisher: { "@type": "Organization", name: "Oklahoma Retro Buys", url: SITE },
  },
})}
${header("index")}

<main>
  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <span class="kicker">The OKRB Blog</span>
        <h1>Retro finds, cash-out guides &amp; nostalgia.</h1>
        <p>What the stuff in your closet is actually worth — and the easiest way to turn it into cash.</p>
      </div>
      <div class="blog-grid">
${cards}
      </div>
    </div>
  </section>
</main>
${footer}

</body>
</html>
`;
writeFileSync(join(ROOT, "blog", "index.html"), indexHtml);
console.log(`✓ blog/index.html (${posts.length} posts)`);
