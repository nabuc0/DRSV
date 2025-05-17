require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const { generateTitle, generateIntro, generateOutro } = require('./titleTemplates');
const { searchAmazonProducts } = require('./amazon');

const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTilSLlYMS5aELEBqSRi1JSnt0TXnw6Wo1nokBjJSs75179h8dGrZxIrwqooeabwVaz1qfcGsPr2lYv/pub?gid=0&single=true&output=csv';
const OUT_DIR = path.join(__dirname, 'data', 'blog');
const COVER_IMAGE = `${process.env.NEXT_PUBLIC_BASE_PATH}/placeholder.svg?height=400&width=800`;

function getDeepestContextFreeName(node) {
    let current = node;
    while (current?.Ancestor) {
        current = current.Ancestor;
    }

    return current?.ContextFreeName || null;
}

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });

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

        // Handle deletion if marked
        if (delFlag.trim().toLowerCase() === 'yes') {
            // Find and delete any existing file with this ID
            const files = fs.readdirSync(OUT_DIR);
            const fileToDelete = files.find(f => f.endsWith(`-${idx + 1}.json`));
            
            if (fileToDelete) {
                const filePath = path.join(OUT_DIR, fileToDelete);
                fs.unlinkSync(filePath);
                console.log(`✓ Deleted ${fileToDelete} (marked for deletion in CSV)`);
            } else {
                console.log(`→ No file found for ID ${idx + 1} to delete`);
            }

            continue;
        }

        // 3) build row ID
        const id = String(idx + 1);

        // NEW: if any file in OUT_DIR ends with `-<id>.json`, skip
        const already = fs
            .readdirSync(OUT_DIR)
            .some(f => f.endsWith(`-${id}.json`));
        if (already) {
            console.log(`→ Skipping row ${id} (already generated)`);
            continue;
        }

        // 4) fetch Amazon data (with 1 s throttle)
        let items;
        try {
            await new Promise(r => setTimeout(r, 1500));
            const result = await searchAmazonProducts(query.trim());
            await new Promise(r => setTimeout(r, 1500));
            items = result?.SearchResult?.Items || [];
        } catch (err) {
            console.error(`Error searching Amazon for "${query}":`, err);
            continue;
        }

        if (!items.length) {
            console.log(`→ No Amazon results for "${query}", skipping.`);
            continue;
        }

        // 5) extract product info
        const first = items[0];
        const productName = first.ItemInfo?.Title?.DisplayValue || query.trim();
        const productLink = first.DetailPageURL || '';
        const productAsin = first.ASIN || '';
        const eans = first.ItemInfo?.ExternalIds?.EANs?.DisplayValues || [];
        const productBarcode = eans.length ? eans[0] : '';
        const browseNodes = first.BrowseNodeInfo?.BrowseNodes || [];
        const features = first.ItemInfo?.Features?.DisplayValues || [];
        const description = features.length ? features.join(', ') : '';
        const listing = first.Offers?.Listings?.[0];
        const price = listing?.Price?.Amount || 0;
        const image =
            first.Images?.Primary?.Large?.URL ||
            first.Images?.Primary?.Medium?.URL ||
            COVER_IMAGE;

        // Handle category as object with name and slug
        const categoryName = getDeepestContextFreeName(browseNodes[0] || {});
        const categorySlug = slugify(categoryName, { lower: true, strict: true }).slice(0, 20);
        const categoriesFile = path.join(__dirname, 'data', 'categories.json');
        const categoriesData = fs.readFileSync(categoriesFile, 'utf-8');
        
        // Handle potential migration from old format (array of strings) to new format (array of objects)
        let categories = JSON.parse(categoriesData);

        // Check if category already exists
        const categoryExists = categories.some(cat => cat.name === categoryName);
        
        if (!categoryExists) {
            categories.push({
                name: categoryName,
                slug: categorySlug,
                image: image || COVER_IMAGE,
            });

            fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2), 'utf-8');
            console.log(`✓ Added new category: ${categoryName} (slug: ${categorySlug})`);
        } else {
            console.log(`→ Category "${categoryName}" already exists.`);
        }

        // 6) generate title & slug
        const title = forcedTitle || generateTitle(productName);
        const baseSlug = slugify(title, { lower: true, strict: true });
        const slug = `${baseSlug.slice(0, 20)}-${id}`.replaceAll('--', '-');

        // 7) format date
        let publishedAt;
        if (dateStr?.trim()) {
            const [day, month, year] = dateStr.trim().split('/');
            publishedAt = new Date(
                Date.UTC(+year, +month - 1, +day)
            ).toISOString();
        } else {
            publishedAt = new Date().toISOString();
        }

        // 8) assemble & write
        const blogObj = {
            id,
            title,
            slug,
            excerpt: title,
            category: categoryName,
            categorySlug: categorySlug,
            coverImage: image || COVER_IMAGE,
            publishedAt,
            productLink,
            productAsin,
            productBarcode,
            content: [
                { type: 'text', content: `<p>${generateIntro()}</p>` },
                {
                    type: 'product',
                    product: { title: productName, description, price, image, affiliateLink: productLink },
                },
                { type: 'text', content: `<p>${generateOutro()}</p>` },
            ],
        };

        // Send a message to Telegram about the new post
        if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            try {
                const telegramBaseUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
                // TODO: how to add the link to the blog title text?
                const telegramMessagePtBr = `🆕 Novo post de blog criado: [${title}](https://drsv.com.br/posts/${slug})`;
                
                // Send the product image first
                if (image && image !== COVER_IMAGE) {
                    await axios.post(`${telegramBaseUrl}/sendPhoto`, {
                        chat_id: process.env.TELEGRAM_CHAT_ID,
                        photo: image,
                        caption: `${telegramMessagePtBr}\n\nProduto: ${productName}`,
                        parse_mode: 'HTML'
                    });
                    
                    console.log('✓ Telegram photo and notification sent');
                } else {
                    // Fallback to text message if no image or just placeholder
                    await axios.post(`${telegramBaseUrl}/sendMessage`, {
                        chat_id: process.env.TELEGRAM_CHAT_ID,
                        text: telegramMessagePtBr,
                        parse_mode: 'HTML'
                    });
                    
                    console.log('✓ Telegram text notification sent (no image)');
                }
            } catch (telegramError) {
                console.error('Falha ao enviar notificação para o Telegram:', telegramError.message);
            }
        } else {
            console.log('ℹ️ Notificação do Telegram ignorada (token ou chat ID ausente)');
        }

        const outPath = path.join(OUT_DIR, `${slug}.json`);
        fs.writeFileSync(outPath, JSON.stringify(blogObj, null, 2), 'utf-8');
        console.log(`✓ Wrote ${slug}.json`);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
