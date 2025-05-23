const fs = require('fs/promises');
const path = require('path');

async function collectPostFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await collectPostFiles(fullPath)));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            files.push(fullPath);
        }
    }

    return files;
}

async function main() {
    const postsDir = path.join(__dirname, 'data', 'blog');
    const categoriesFile = path.join(__dirname, 'data', 'categories.json');

    // 1) Gather all post file paths
    const postFiles = await collectPostFiles(postsDir);

    // 2) Build a map of categorySlug → { name, slug, image }
    const categoryMap = new Map();

    for (const filePath of postFiles) {
        const raw = await fs.readFile(filePath, 'utf-8');
        const post = JSON.parse(raw);

        const { category, categorySlug, coverImage } = post;
        if (!categorySlug) continue; // skip malformed

        if (!categoryMap.has(categorySlug)) {
            categoryMap.set(categorySlug, {
                name: category,
                slug: categorySlug,
                image: coverImage || null,
            });
        }
    }

    // 3) Convert to array and write out
    const categories = Array.from(categoryMap.values());

    await fs.writeFile(
        categoriesFile,
        JSON.stringify(categories, null, 1),
        'utf-8'
    );

    console.log(
        `✓ Updated categories.json with ${categories.length} categories`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
