require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const { generateTitle, generateIntro, generateOutro } = require('./titleTemplates');
const { searchAmazonProducts } = require('./amazon');

const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTilSLlYMS5aELEBqSRi1JSnt0TXnw6Wo1nokBjJSs75179h8dGrZxIrwqooeabwVaz1qfcGsPr2lYv/pub?output=csv';
const OUT_DIR = path.join(__dirname, 'data', 'blog');
const NEW_POSTS_FILE = path.join(__dirname, 'data', 'new-posts.json');
const COVER_IMAGE = `${process.env.NEXT_PUBLIC_BASE_PATH}/placeholder.svg?height=400&width=800`;

function getDeepestContextFreeName(node) {
    let current = node;
    while (current?.Ancestor) {
        current = current.Ancestor;
    }

    return current?.ContextFreeName || null;
}

// Look for a file ending with `-<id>.json` in root or any first-level subdir
function findBlogFileById(id) {
    // root
    const rootMatch = fs
        .readdirSync(OUT_DIR)
        .find(f => f.endsWith(`-${id}.json`));
    if (rootMatch) return { dir: OUT_DIR, file: rootMatch };

    // subfolders
    const subdirs = fs
        .readdirSync(OUT_DIR)
        .filter(name => fs.statSync(path.join(OUT_DIR, name)).isDirectory());
    for (const sub of subdirs) {
        const files = fs.readdirSync(path.join(OUT_DIR, sub));
        const match = files.find(f => f.endsWith(`-${id}.json`));
        if (match) {
            return { dir: path.join(OUT_DIR, sub), file: match };
        }
    }
    return null;
}

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const newPosts = [];

    // 1) download CSV
    const res = await axios.get(CSV_URL);
    const lines = res.data.trim().split(/\r?\n/);
    const [, ...rows] = lines; // drop header

    for (let idx = 0; idx < rows.length; idx++) {
        const line = rows[idx];
        const [query, forcedTitle, delFlag, dateStr] = line.split(',');

        // 2) handle empty query or marked for deletion
        if (!query?.trim()) {
            continue;
        }

        const id = String(idx + 1);

        // handle deletion
        if (delFlag.trim().toLowerCase() === 'yes') {
            // Find and delete any existing file with this ID
            const found = findBlogFileById(id);
            if (found) {
                fs.unlinkSync(path.join(found.dir, found.file));
                console.log(`✓ Deleted ${found.file} (ID ${id})`);
            } else {
                console.log(`→ No file for ID ${id} to delete`);
            }
            continue;
        }

        // skip if already exists
        if (findBlogFileById(id)) {
            console.log(`→ Skipping row ${id} (already generated)`);
            continue;
        }

        // 3) fetch Amazon data (throttled)
        let items = [];
        try {
            await new Promise(r => setTimeout(r, 1500));
            const result = await searchAmazonProducts(query.trim());
            await new Promise(r => setTimeout(r, 1500));
            items = result?.SearchResult?.Items || [];
        } catch (err) {
            console.error(`Error searching Amazon for "${query}":`, err);
        }

        if (!items.length) {
            console.log(`→ No Amazon results for "${query}", skipping.`);
            continue;
        }

        // 4) extract product info
        const first = items[0];
        const productName = first.ItemInfo?.Title?.DisplayValue || query.trim();
        const productLink = first.DetailPageURL || '';
        const productAsin = first.ASIN || '';
        const eans = first.ItemInfo?.ExternalIds?.EANs?.DisplayValues || [];
        const productBarcode = eans[0] || '';
        const browseNodes = first.BrowseNodeInfo?.BrowseNodes || [];
        const features = first.ItemInfo?.Features?.DisplayValues || [];
        const description = features.join(', ');
        const listing = first.Offers?.Listings?.[0];
        const price = listing?.Price?.Amount || 0;
        const image =
            first.Images?.Primary?.Large?.URL ||
            first.Images?.Primary?.Medium?.URL ||
            COVER_IMAGE;

        // 5) ensure category is in data/categories.json
        const categoryName = getDeepestContextFreeName(browseNodes[0] || {}) || 'Uncategorized';
        const categorySlug = slugify(categoryName, { lower: true, strict: true }).slice(0, 20);
        const categoriesFile = path.join(__dirname, 'data', 'categories.json');
        const categoriesData = fs.readFileSync(categoriesFile, 'utf-8');
        let categories = JSON.parse(categoriesData);
        if (!categories.some(cat => cat.name === categoryName)) {
            categories.push({ name: categoryName, slug: categorySlug, image: image || COVER_IMAGE });
            fs.writeFileSync(categoriesFile, JSON.stringify(categories), 'utf-8');
            console.log(`✓ Added new category: ${categoryName}`);
        }

        // 6) title & slug
        const title = forcedTitle || generateTitle(productName);
        const baseSlug = slugify(title, { lower: true, strict: true });
        const slug = `${baseSlug.slice(0, 20)}-${id}`.replace(/--+/g, '-');

        // 7) parse date into YYYYMMDD
        let publishedAt;
        if (dateStr?.trim()) {
            const [day, month, year] = dateStr.trim().split('/');
            publishedAt = new Date(Date.UTC(+year, +month - 1, +day)).toISOString();
        } else {
            publishedAt = new Date().toISOString();
        }
        const dateFolder = publishedAt.slice(0, 10).replace(/-/g, '');

        // 8) assemble blog object
        const blogObj = {
            id,
            row: id,
            title,
            slug,
            excerpt: title,
            category: categoryName,
            categorySlug,
            coverImage: image,
            publishedAt,
            productLink,
            productAsin,
            productBarcode,
            content: [
                { type: 'text', content: `<p>${generateIntro()}</p>` },
                { type: 'product', product: { title: productName, description, price, image, affiliateLink: productLink } },
                { type: 'text', content: `<p>${generateOutro()}</p>` },
            ],
        };

        // write JSON
        const targetDir = path.join(OUT_DIR, dateFolder);
        fs.mkdirSync(targetDir, { recursive: true });
        const outPath = path.join(targetDir, `${slug}.json`);
        fs.writeFileSync(outPath, JSON.stringify(blogObj), 'utf-8');
        console.log(`✓ Wrote ${path.relative(__dirname, outPath)}`);

        // record slug for later notification
        newPosts.push(slug);
    }

    // Save all new slugs
    fs.writeFileSync(NEW_POSTS_FILE, JSON.stringify(newPosts));
    console.log(`✓ Saved ${newPosts.length} new post slug(s) to data/new-posts.json`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
