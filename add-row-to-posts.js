// add-row-to-posts.js

const fs = require('fs/promises');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'data', 'blog');

/**
 * Recursively collects all .json file paths under the given directory.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function collectPostFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await collectPostFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            files.push(fullPath);
        }
    }

    return files;
}

async function main() {
    const postFiles = await collectPostFiles(POSTS_DIR);

    for (const filePath of postFiles) {
        const raw = await fs.readFile(filePath, 'utf-8');
        const post = JSON.parse(raw);

        // Duplicate "id" into a new "row" property
        post.row = post.id;

        // Write back with 2-space indentation
        await fs.writeFile(filePath, JSON.stringify(post, null, 2), 'utf-8');
        console.log(`✓ Updated row in ${path.relative(__dirname, filePath)}`);
    }

    console.log(`\nProcessed ${postFiles.length} post file(s).`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
