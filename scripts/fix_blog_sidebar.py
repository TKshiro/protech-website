#!/usr/bin/env python3
"""
Standardize all blog article pages:
- Remove 関連記事 block from sidebar
- Insert 関連記事 section before 最新の記事 at the bottom
- Sidebar keeps only: 編集者, 目次, 無料相談受付中
"""

import os
import re
from pathlib import Path

BLOG_DIR = Path(__file__).parent.parent / "frontend" / "blog"

def extract_related_articles_block(html: str):
    """Extract the 関連記事 div block from the sidebar."""
    # Match the div containing 関連記事 heading
    pattern = re.compile(
        r'(\s*<!-- Related articles -->\s*)?'
        r'(<div[^>]*>\s*<h3[^>]*>\s*関連記事\s*</h3>.*?</div>\s*</div>)',
        re.DOTALL
    )
    m = pattern.search(html)
    if m:
        return m.group(0), m.start(), m.end()
    return None, -1, -1


def build_related_section(related_inner_html: str) -> str:
    """Wrap the extracted related articles content into a bottom section."""
    return f"""
    <!-- Related Articles -->
    <div class="max-w-6xl mx-auto px-6 md:px-8 py-12 border-t border-gray-100">
        <h3 class="text-2xl font-bold text-tech-blue mb-8 text-center">関連記事</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
{related_inner_html}
        </div>
    </div>
"""


def related_links_to_cards(related_block_html: str) -> str:
    """Convert sidebar-style related article links to card grid items."""
    # Extract each <a> link with image and text
    link_pattern = re.compile(
        r'<a\s+href="([^"]+)"[^>]*class="[^"]*flex[^"]*group[^"]*"[^>]*>\s*'
        r'<img\s+src="([^"]+)"[^>]*>\s*'
        r'<p[^>]*>(.*?)</p>\s*</a>',
        re.DOTALL
    )
    cards = []
    for m in link_pattern.finditer(related_block_html):
        href = m.group(1)
        img_src = m.group(2)
        title = m.group(3).strip()
        # Check for onerror attribute in original img tag
        onerror_match = re.search(r'onerror="([^"]+)"', m.group(0))
        onerror_attr = f' onerror="{onerror_match.group(1)}"' if onerror_match else ''
        card = f'''            <a href="{href}" class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-50">
                <div class="h-40 bg-slate-100 overflow-hidden"><img src="{img_src}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"{onerror_attr}></div>
                <div class="p-6"><h4 class="font-bold text-sm text-tech-blue group-hover:text-coral transition leading-snug">{title}</h4></div>
            </a>'''
        cards.append(card)
    return "\n".join(cards)


def process_file(filepath: Path) -> bool:
    html = filepath.read_text(encoding="utf-8")
    original = html

    # --- 1. Find and extract the 関連記事 block from sidebar ---
    # Pattern: optional comment + div with 関連記事 h3 heading
    # The block ends at </div></div> — we need to be careful about nesting
    # Use a more targeted approach: find the comment or the div start, then count braces

    # Find start of related block (comment or div)
    rel_comment = re.search(r'\s*<!-- Related articles -->', html)
    rel_div_start = re.search(
        r'<div[^>]*class="[^"]*(?:bg-white border border-gray-100|bg-white border)[^"]*"[^>]*>\s*<h3[^>]*>\s*関連記事',
        html
    )

    if not rel_div_start:
        # Try without specific class
        rel_div_start = re.search(
            r'<div[^>]*>\s*<h3[^>]*>\s*関連記事\s*</h3>',
            html
        )

    if not rel_div_start:
        print(f"  SKIP (no 関連記事 found): {filepath.name}")
        return False

    # Determine block start (include comment if present and adjacent)
    block_start = rel_div_start.start()
    if rel_comment and rel_comment.end() <= rel_div_start.start() and rel_div_start.start() - rel_comment.start() < 60:
        block_start = rel_comment.start()

    # Count div nesting from rel_div_start to find matching close
    search_from = rel_div_start.start()
    depth = 0
    i = search_from
    block_end = -1
    while i < len(html):
        open_m = re.search(r'<div', html[i:])
        close_m = re.search(r'</div>', html[i:])
        if not close_m:
            break
        if open_m and open_m.start() < close_m.start():
            depth += 1
            i += open_m.start() + 4
        else:
            depth -= 1
            i += close_m.start() + 6
            if depth == 0:
                block_end = i
                break

    if block_end == -1:
        print(f"  SKIP (could not find end of 関連記事 block): {filepath.name}")
        return False

    related_block_html = html[rel_div_start.start():block_end]

    # --- 2. Convert sidebar links to card format ---
    cards_html = related_links_to_cards(related_block_html)

    if not cards_html.strip():
        print(f"  SKIP (could not parse related article links): {filepath.name}")
        return False

    # --- 3. Remove the related block from sidebar (including leading whitespace/comment) ---
    # Remove from block_start to block_end, preserving surrounding newlines cleanly
    before = html[:block_start].rstrip()
    after = html[block_end:].lstrip('\n')
    # Keep one blank line between remaining sidebar items
    html = before + "\n\n" + after

    # --- 4. Insert 関連記事 section before 最新の記事 ---
    latest_marker = re.search(r'\s*<!-- Latest Articles at Bottom -->', html)
    if not latest_marker:
        # Fallback: find the 最新の記事 heading
        latest_marker = re.search(r'\s*<div[^>]*>\s*<h3[^>]*>最新の記事</h3>', html)

    if not latest_marker:
        print(f"  WARN (no 最新の記事 section found, appending before footer): {filepath.name}")
        insert_pos = html.rfind('<footer')
    else:
        insert_pos = latest_marker.start()

    related_section = build_related_section(cards_html)
    html = html[:insert_pos] + related_section + html[insert_pos:]

    if html == original:
        print(f"  UNCHANGED: {filepath.name}")
        return False

    filepath.write_text(html, encoding="utf-8")
    print(f"  OK: {filepath.name}")
    return True


def main():
    files = sorted(BLOG_DIR.glob("*.html"))
    changed = 0
    for f in files:
        if process_file(f):
            changed += 1
    print(f"\nDone. {changed}/{len(files)} files updated.")


if __name__ == "__main__":
    main()
