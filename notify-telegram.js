require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const NEW_POSTS_FILE = path.join(__dirname, 'data', 'new-posts.json');
const POSTS_DIR = path.join(__dirname, 'data', 'blog');
const COVER_IMAGE = `${process.env.NEXT_PUBLIC_BASE_PATH}/placeholder.svg?height=400&width=800`;

function collectPostFiles(dir) {
    let results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(collectPostFiles(full));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            results.push(full);
        }
    }
    return results;
}

async function sendNotifications() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId   = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) {
        console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        process.exit(1);
    }

    const slugs = JSON.parse(fs.readFileSync(NEW_POSTS_FILE, 'utf-8'));
    if (slugs.length === 0) {
        console.log('No new posts to notify.');
        return;
    }

    const allFiles = collectPostFiles(POSTS_DIR);
    const botUrl = `https://api.telegram.org/bot${botToken}`;

    for (const slug of slugs) {
        const filePath = allFiles.find(f => path.basename(f) === `${slug}.json`);
        if (!filePath) {
            console.warn(`Could not find JSON for slug ${slug}`);
            continue;
        }

        const post = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const { coverImage: image, content } = post;
        const product = content.find(c => c.type === 'product');
        const productName = product?.product?.title || 'Produto Especial';
        const price = product?.product?.price || 0;

        try {
            const botUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
            const blogUrl = `https://drsv.com.br/posts/${slug}`;
            const msg = `🆕 Post 🤑`;
            const caption = `${msg}\n${productName}\n${price > 0 ? `<b>R$${price}</b>\n` : ''}\n${blogUrl}`;

            if (image && image !== COVER_IMAGE) {
                await axios.post(`${botUrl}/sendPhoto`, {
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    photo: image,
                    caption,
                    parse_mode: 'HTML',
                });
            } else {
                await axios.post(`${botUrl}/sendMessage`, {
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    text: caption,
                    parse_mode: 'HTML',
                });
            }
            console.log('✓ Telegram notification sent');
        } catch (telegramError) {
            console.error('Telegram error:', telegramError.message);
        }
    }

    // clear out new-posts.json
    fs.writeFileSync(NEW_POSTS_FILE, JSON.stringify([], null, 2));
    console.log('✓ Cleared data/new-posts.json');
}

sendNotifications();
