const fs = require('fs/promises');
const path = require('path');

async function migrate() {
    const BLOG_DIR = path.join(__dirname, 'data', 'blog');
    const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });

    for (const entry of entries) {
        // look only for flat date folders named like YYYYMMDD
        if (!entry.isDirectory() || !/^\d{8}$/.test(entry.name)) continue;

        const dateFolder = entry.name;                // e.g. "20250105"
        const year = dateFolder.slice(0, 4);          // "2025"
        const month = dateFolder.slice(4, 6);         // "01"
        const day = dateFolder.slice(6, 8);           // "05"

        const oldDir = path.join(BLOG_DIR, dateFolder);
        const newDir = path.join(BLOG_DIR, year, month, day);

        // 1) create nested target dir
        await fs.mkdir(newDir, { recursive: true });
        console.log(`→ Created ${path.relative(process.cwd(), newDir)}`);

        // 2) move each JSON file
        const files = await fs.readdir(oldDir);
        for (const file of files) {
            if (!file.endsWith('.json')) continue;
            const oldPath = path.join(oldDir, file);
            const newPath = path.join(newDir, file);
            await fs.rename(oldPath, newPath);
            console.log(`✓ Moved ${file} → ${path.relative(process.cwd(), newPath)}`);
        }

        // 3) remove the now-empty old folder
        await fs.rm(oldDir, { recursive: true, force: true });
        console.log(`✓ Deleted old folder ${path.relative(process.cwd(), oldDir)}`);
    }

    console.log('🎉 Migration complete!');
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
