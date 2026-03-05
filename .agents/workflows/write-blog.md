---
description: Write a blog article from outline and publish it to the PROTECH website
---

# Write & Publish Blog Article

Use this workflow when the user provides a blog article outline or topic.

## Steps

1. **Receive outline/topic from user**
   - Confirm the topic, target audience, and desired tone
   - Ask for category: `news`, `service`, or `case`

2. **Write the Markdown article**
   - Create a new `.md` file in `blog/posts/` with proper frontmatter:
     ```yaml
     ---
     title: "記事タイトル"
     date: "YYYY-MM-DD"  # Use today's date
     category: "service"   # news | service | case
     description: "SEO用の説明文（120文字以内）"
     image: "https://images.unsplash.com/..."  # Find relevant Unsplash image
     ---
     ```
   - Write the full article in Japanese
   - Use proper headings (##, ###), bold text, and clear paragraphs
   - Include a call-to-action linking to `/contact` at the end
   - Aim for 800-1500 words

3. **Find a hero image**
   - Search Unsplash for a relevant, high-quality image
   - Use the `?w=1600` parameter for proper resolution

// turbo
4. **Build the blog**
   ```bash
   cd /Users/charles/Downloads/自己/PROTECH/protech-website-main && npm run build
   ```

// turbo
5. **Ping Google for indexing**
   ```bash
   cd /Users/charles/Downloads/自己/PROTECH/protech-website-main && npm run ping-google
   ```

6. **Verify the article**
   - Open the generated HTML in browser
   - Check rendering, images, navigation
   - Confirm the article appears on both `blog.html` and `news.html`

7. **Deploy** (if using Vercel)
   - Changes will auto-deploy on `git push`
   - Run: `cd /Users/charles/Downloads/自己/PROTECH/protech-website-main && git add -A && git commit -m "blog: [article title]" && git push`
