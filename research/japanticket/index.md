# JapanTicket.com Design Research

## Color Palette

- Primary: `#182e5c` (dark navy blue — used for headers, overlays, gradient base)
- Secondary: `#26bfa7` (teal/green — primary CTA button background)
- Accent: `#d85b94` (pink/magenta — highlight accent, tags)
- Gold: `#d2b36d` / `#ba9c6e` (secondary CTA buttons, decorative elements)
- Background: `#ffffff` / `#f7f7f5` (off-white) / `#f3f3f1` (light gray sections)
- Text: `#3e3a39` (dark charcoal — body text) / `#545454` (secondary text)
- Dark overlay: `rgba(24,46,92,.8)` (navy overlay on hero images)
- Gradient: `linear-gradient(60deg, rgba(24,46,92,1) 0%, rgba(49,69,110,1) 100%)`
- Slate blue: `#5e6d8d` (supporting UI elements)
- Beige: `#e8d9b6` (warm background sections)

## Typography

- Headings: `'Montserrat', sans-serif` (Latin/numbers) + `'Noto Sans JP', sans-serif` (Japanese)
- Body: `'Noto Sans JP', sans-serif`
- Font sizes used:
  - Hero display: large (likely 36–48px)
  - Section headings (H2): medium-large (likely 24–32px)
  - Card titles: medium (likely 18–22px)
  - Body text: standard (likely 15–16px)
  - Metadata/tags: small (likely 12–13px)
  - Date stamps: `YYYY.MM.DD` format, small weight

## Layout Patterns

### Homepage

Top to bottom section order:

1. **Fixed header** — logo left, primary nav center/right, language toggle + contact CTA right
2. **Hero section** — full-width banner with dark navy overlay, large Japanese tagline ("訪日集客をワンストップで！インバウンド対策の新常識"), dual CTA buttons (primary teal + secondary outlined), phone number + business hours below
3. **News/updates carousel** — horizontal scrolling cards with date, category tag, thumbnail, headline
4. **Client logos grid** — social proof section, logos on white/light background, consistent spacing
5. **Three service cards** — equal-width columns, image top, heading, description, "詳しく見る" link
6. **Contact/CTA section** — full-width band, consultation booking + resource request buttons
7. **Footer** — multi-column (4 columns), mirrors main nav, social icons (Facebook, X/Twitter, LinkedIn), copyright, group company links

### Case Study Listing Page

- Horizontal category filter tabs at top: すべて / 飲食 / 体験 / 入場施設 / 小売 / 百貨店 / 自治体・DMO / その他
- Grid layout: 2–3 cards per row
- Each card contains:
  - Thumbnail image (top, consistent aspect ratio ~3:2)
  - Service category tag
  - Outcome label (e.g., "予約整備", "情報発信", "ノーショー対策")
  - Headline describing business outcome
  - Company name, industry, company size bracket (1–10 / 11–30 / 31–50 / 101+ stores)
- 40+ case studies displayed in continuous scroll (no pagination)
- CTA band at bottom: online consultation + resource request

### Case Study Individual Page

Linear single-column narrative flow:

1. Hero image (full-width, client branding)
2. Client info box: company name, industry, size, services used
3. Q&A sections: 導入の背景 (background) → 活用方法 (implementation) → 感想 (impressions/results)
4. Qualitative results highlighted in body text (e.g., "フォロワー数が15倍・エンゲージメント数は30倍")
5. Company profile box at bottom (logo, description, URL)
6. Related case study cards (thumbnail grid, 3–4 cards)
7. Contact CTA band

### Column/Blog Listing Page

- Single-column list layout (not grid)
- Each article card: thumbnail left (landscape ~16:9) + text right
- Text shows: date (YYYY.MM.DD), category tags, title (bold, linked), 1–2 sentence excerpt
- Category sidebar filter: すべてを表示 (59) / インバウンド集客コラム (41) / 市場別トレンド (15) / 訪日ニュース Pickup (3)
- Reverse chronological order
- Pagination at bottom

### Article/Column Individual Page

- Single-column full-width layout (no sidebar)
- Hero: large full-width WebP image, then title below, then date + category tags
- Breadcrumb: ジャパチケ ホーム > 訪日トレンド > インバウンド集客コラム > [Article]
- Anchor-linked table of contents ("目次") near top
- Body: H2/H3 hierarchy, short paragraphs, bullet points, emoji markers for visual breaks
- Inline "おすすめ記事" (recommended article) cards embedded after major sections — thumbnail + title + brief description
- Data presented inline in text + formatted tables + country-specific charts (monthly visitor trend graphs, WebP)
- Data sources cited at bottom (JNTO links)
- No author byline — attributed to organization
- Social sharing: footer links only (Facebook, X, LinkedIn)
- Sticky header with phone number accessible throughout

## Navigation Structure

### Primary Nav
- インバウンド予約販売 (Inbound ticket sales)
- インバウンドプロモーション (Inbound promotion)
- インバウンド富裕層観光 (Inbound affluent tourism)
- 導入事例 (Case studies)
- ニュース (News)
- 訪日トレンド (Visit Japan trends)

### Secondary Nav (header right)
- Language toggle (Japanese / English)
- 資料請求 (Document request)
- お問合せ (Contact)
- Phone: 03-6912-2775

### Footer Nav
- Full mirror of primary nav with nested sub-items per service
- Legal links (privacy policy, terms)
- Group company links (subsidiaries)
- Social: Facebook, X/Twitter, LinkedIn
- Copyright

## CTA Patterns

### Button Styles
- **Primary CTA**: pill shape (`border-radius: 100px`), teal background (`#26bfa7`), white text, padding `12px 30px 14px`, solid 3px border matching background
- **Secondary CTA**: pill shape (`border-radius: 60px`), gold background (`#ba9c6e`) or outlined white (`border: solid 1px #fff`), padding `8px 20px 11px`
- **Text link CTA**: "詳しく見る →" style inline links on service cards

### CTA Types Used
- "資料請求する" (Request materials) — primary conversion
- "お問合せ・ご相談はこちら" (Contact/consultation) — primary conversion
- "オンライン相談を予約する" (Book online consultation) — mid-funnel
- "詳しく見る" (Learn more) — content discovery
- Phone number displayed prominently in header + article body

### CTA Placement Strategy
- Hero: dual buttons immediately visible
- Mid-page: CTA band after service cards
- Articles: early placement after intro, mid-article between sections, end-of-article cluster
- Case studies: bottom cluster + inline throughout Q&A
- Footer: always-present contact options

## Image Types & Visual Style

### Image Categories Used
1. **Hero banners** — full-width, dark navy overlay, Japanese text overlaid; desktop + mobile versions (WebP)
2. **In-store photography** — restaurant interiors, counter shots, storefronts; realistic photography style
3. **Exhibition/venue photos** — for cultural/admission facility case studies
4. **Social media interface screenshots** — showing RED (Xiaohongshu) account pages, post grids, engagement metrics
5. **Data charts/graphs** — monthly visitor trend line charts by country, clean minimal style
6. **Company logos** — client logos in social proof grid and case study pages
7. **Article thumbnails** — landscape WebP, consistent aspect ratio across listing pages
8. **Booking interface screenshots** — showing the actual product UI

### Visual Style
- Photography-first (no flat illustrations)
- Dark overlays on hero images to ensure text legibility
- Charts are clean and minimal (likely custom SVG or image-based)
- Consistent WebP format throughout for performance
- No decorative illustrations or icon sets visible
- Brand imagery leans corporate/professional, not playful

## Key Design Elements to Reference

1. **Pill-shaped CTAs** — `border-radius: 100px` gives a modern, friendly feel without being casual
2. **Category filter tabs** — horizontal scrollable tabs for case study filtering; clean, no dropdowns
3. **Q&A case study format** — structured as interview (Q: background → Q: implementation → Q: impressions) rather than traditional case study layout; feels authentic
4. **Inline recommended articles** — "おすすめ記事" blocks embedded mid-article after relevant sections, not just at the bottom; keeps users engaged
5. **Client metadata cards** — company name + industry + size bracket + service tags on case study cards; scannable at a glance
6. **Anchor-linked TOC** — "目次" near article top with jump links; essential for long-form content
7. **Dark navy + teal color pairing** — `#182e5c` + `#26bfa7` creates a trustworthy, modern B2B feel
8. **Noto Sans JP + Montserrat pairing** — standard for Japanese B2B sites; Montserrat handles numbers/Latin elegantly
9. **YYYY.MM.DD date format** — consistent across all content types
10. **Multi-column footer with full nav mirror** — comprehensive footer aids SEO and navigation redundancy
11. **Phone number in sticky header** — reduces friction for phone-preferred B2B leads
12. **Outcome-first card headlines** — case study cards lead with the business result, not the company name
13. **No sidebar on articles** — all related content integrated inline; cleaner reading experience on mobile
14. **Social proof logo grid** — client logos section between hero and services; builds trust early
