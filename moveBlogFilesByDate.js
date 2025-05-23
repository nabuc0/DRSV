const fs = require('fs');
const path = require('path');

// Directories
const BLOG_DIR = path.join(__dirname, 'data', 'blog');

(async () => {
    try {
        const files = await fs.promises.readdir(BLOG_DIR);

        for (const file of files) {
            const filePath = path.join(BLOG_DIR, file);

            // Skip if it's not a .json file
            if (!file.endsWith('.json')) continue;

            const content = await fs.promises.readFile(filePath, 'utf-8');
            const json = JSON.parse(content);

            if (!json.publishedAt) {
                console.warn(`Skipping ${file}: missing publishedAt`);
                continue;
            }

            const date = new Date(json.publishedAt);
            const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '');

            const targetDir = path.join(BLOG_DIR, formattedDate);
            const targetPath = path.join(targetDir, file);

            // Create target directory if it doesn't exist
            await fs.promises.mkdir(targetDir, { recursive: true });

            // Move file
            await fs.promises.rename(filePath, targetPath);
            console.log(`Moved ${file} → ${path.relative(__dirname, targetPath)}`);
        }

        console.log('✅ All files moved.');
    } catch (err) {
        console.error('❌ Error:', err);
    }
})();
