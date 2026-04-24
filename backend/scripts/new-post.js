#!/usr/bin/env node

/**
 * PROTECH - Create New Blog Post
 * 
 * Interactive script to scaffold a new blog post .md file.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const POSTS_DIR = path.resolve(__dirname, '..', 'blog', 'posts');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

async function main() {
    console.log('\n📝 PROTECH - 新規ブログ記事作成\n');

    const title = await ask('タイトル: ');
    const suggestedSlug = slugify(title) || `post-${Date.now()}`;
    const slug = (await ask(`ファイル名 (${suggestedSlug}): `)) || suggestedSlug;
    const category = (await ask('カテゴリ (news/service/case) [news]: ')) || 'news';
    const description = await ask('説明文 (SEO用): ');
    const image = await ask('画像URL (任意): ');

    const today = new Date().toISOString().split('T')[0];

    const content = `---
title: "${title}"
date: "${today}"
category: "${category}"
description: "${description}"
image: "${image}"
---

ここに本文を書いてください。

## 見出し

段落テキスト...
`;

    fs.mkdirSync(POSTS_DIR, { recursive: true });
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    fs.writeFileSync(filePath, content, 'utf-8');

    console.log(`\n✅ 記事ファイルを作成しました: blog/posts/${slug}.md`);
    console.log('   → 記事を編集した後、npm run build を実行してください\n');

    rl.close();
}

main().catch(err => {
    console.error('Error:', err.message);
    rl.close();
    process.exit(1);
});
