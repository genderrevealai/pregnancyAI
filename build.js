// Build script: fetches blog content from Supabase at build time and writes
// a fully static site to dist/. Production runtime never touches the database.
//
// Connects via direct Postgres using the `blog_reader` role, which has
// SELECT-only access to blog_posts and blog_categories — nothing else.

import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const { Client } = pg;

const ROOT = process.cwd();
const OUT = path.join(ROOT, "dist");

const env = (name, fallback) => {
  const v = process.env[name];
  if (v === undefined || v === "") {
    if (fallback !== undefined) return fallback;
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
};

const DB = {
  host: env("SUPABASE_DB_HOST"),
  port: parseInt(env("SUPABASE_DB_PORT", "5432"), 10),
  database: env("SUPABASE_DB_NAME", "postgres"),
  user: env("SUPABASE_DB_USER"),
  password: env("SUPABASE_DB_PASSWORD"),
  ssl: { rejectUnauthorized: false },
};

const STATIC_TOP_FILES = [
  "index.html",
  "ai-midwife.html",
  "contact.html",
  "faqs.html",
  "tools.html",
];

const STATIC_DIRS = ["css", "js", "images", "legal", "tools"];

async function main() {
  const client = new Client(DB);
  await client.connect();

  const { rows: categories } = await client.query(
    "SELECT id, name FROM blog_categories ORDER BY name ASC"
  );

  const { rows: posts } = await client.query(`
    SELECT id, title, excerpt, content, featured_image_url, category,
           read_time_minutes, published_at, week, is_featured
    FROM blog_posts
    WHERE is_published = true
    ORDER BY
      COALESCE(is_featured, false) DESC,
      published_at DESC NULLS LAST
  `);

  await client.end();

  console.log(`Fetched ${categories.length} categories, ${posts.length} published posts`);

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const slugSet = new Set();
  const enriched = posts.map((p) => {
    let slug = slugify(p.title);
    if (slugSet.has(slug)) slug = `${slug}-${String(p.id).slice(0, 6)}`;
    slugSet.add(slug);
    return {
      ...p,
      slug,
      categoryName: p.category != null ? categoryById[p.category] || null : null,
    };
  });

  // Build dist/ from scratch
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(OUT, "blog"), { recursive: true });

  for (const f of STATIC_TOP_FILES) {
    fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
  }
  for (const d of STATIC_DIRS) {
    fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
  }

  const listingTpl = fs.readFileSync(path.join(ROOT, "blog.html"), "utf-8");
  fs.writeFileSync(
    path.join(OUT, "blog.html"),
    renderListing(listingTpl, enriched, categories)
  );

  const postTpl = fs.readFileSync(path.join(ROOT, "_blog-post-template.html"), "utf-8");
  for (const post of enriched) {
    fs.writeFileSync(
      path.join(OUT, "blog", `${post.slug}.html`),
      renderPost(postTpl, post)
    );
  }

  console.log(`Build complete → dist/  (${enriched.length} post pages)`);
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s) {
  return escapeHtml(s);
}

function metaLine(post) {
  const parts = [];
  if (post.week != null) parts.push(`Week ${post.week}`);
  if (post.categoryName) parts.push(escapeHtml(post.categoryName));
  if (parts.length === 0) parts.push("Pregnancy AI");
  return parts.join(" &middot; ");
}

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderListing(template, posts, categories) {
  const chips = [
    `      <button class="category-chip is-active" data-category="all" type="button">All posts</button>`,
    ...categories.map(
      (c) =>
        `      <button class="category-chip" data-category="${c.id}" type="button">${escapeHtml(c.name)}</button>`
    ),
  ].join("\n");

  const cards = posts.map(renderCard).join("\n");

  const fallback =
    posts.length === 0
      ? `      <p class="blog-empty">No posts published yet — check back soon.</p>`
      : "";

  return template
    .replace(
      /<!-- BUILD:CATEGORIES_START -->[\s\S]*?<!-- BUILD:CATEGORIES_END -->/,
      `<!-- BUILD:CATEGORIES_START -->\n${chips}\n      <!-- BUILD:CATEGORIES_END -->`
    )
    .replace(
      /<!-- BUILD:POSTS_START -->[\s\S]*?<!-- BUILD:POSTS_END -->/,
      `<!-- BUILD:POSTS_START -->\n${cards}\n${fallback}\n      <!-- BUILD:POSTS_END -->`
    );
}

function renderCard(post) {
  const featuredCls = post.is_featured ? " is-featured" : "";
  const dataCat = post.category != null ? post.category : "none";
  const dataWeek = post.week != null ? post.week : "";
  const href = `blog/${post.slug}.html`;

  const image = post.featured_image_url
    ? `<img src="${escapeAttr(post.featured_image_url)}" alt="${escapeAttr(post.title)}" loading="lazy" />`
    : `<span>[ ${escapeHtml(post.title)} ]</span>`;

  return `      <article class="blog-card${featuredCls}" data-category="${dataCat}" data-week="${dataWeek}">
        <a class="blog-card-link" href="${href}" aria-label="${escapeAttr(post.title)}"></a>
        <div class="blog-card-image">${image}</div>
        <div class="blog-card-body">
          <span class="blog-card-meta">${metaLine(post)}</span>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt || "")}</p>
          <span class="read-more">Read article &rarr;</span>
        </div>
      </article>`;
}

function renderPost(template, post) {
  const heroImage = post.featured_image_url
    ? `<img src="${escapeAttr(post.featured_image_url)}" alt="${escapeAttr(post.title)}" class="post-hero-image" />`
    : "";

  const readTime = post.read_time_minutes
    ? `${post.read_time_minutes} min read`
    : "";

  const date = formatDate(post.published_at);
  const metaParts = [];
  if (post.week != null) metaParts.push(`Week ${post.week}`);
  if (post.categoryName) metaParts.push(escapeHtml(post.categoryName));
  if (date) metaParts.push(escapeHtml(date));
  if (readTime) metaParts.push(escapeHtml(readTime));
  const meta = metaParts.join(" &middot; ");

  return template
    .replace(/{{TITLE}}/g, escapeHtml(post.title))
    .replace(/{{TITLE_ATTR}}/g, escapeAttr(post.title))
    .replace(/{{EXCERPT}}/g, escapeHtml(post.excerpt || ""))
    .replace(/{{EXCERPT_ATTR}}/g, escapeAttr(post.excerpt || ""))
    .replace(/{{META}}/g, meta)
    .replace(/{{HERO_IMAGE}}/g, heroImage)
    .replace(/{{OG_IMAGE}}/g, escapeAttr(post.featured_image_url || ""))
    .replace(/{{CONTENT}}/g, post.content || "");
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
