"""
Safe frontend upgrade script.

Applies low-risk fixes across HTML pages:
  1. Add loading="lazy" to <img> tags that don't have it (skip first <img> as LCP).
  2. Add decoding="async" to <img> tags missing it.
  3. Add rel="noopener noreferrer" to <a target="_blank"> missing rel.
  4. Add defer to GA gtag.js script if missing.
  5. Add aria-label / aria-expanded to mobile hamburger button.

Run: python scripts/safe_frontend_upgrade.py [--dry-run] [file1 file2 ...]
"""
import argparse
import re
import sys
from pathlib import Path


IMG_RE = re.compile(r"<img\b([^>]*?)/?>", re.IGNORECASE)
A_RE = re.compile(r'<a\b([^>]*?)>', re.IGNORECASE)
GA_RE = re.compile(
    r'<script\s+async\s+src="https://www\.googletagmanager\.com/gtag/js[^"]*"\s*></script>',
    re.IGNORECASE,
)
HAMBURGER_RE = re.compile(
    r'<button\s+id="menu-btn"([^>]*?)>',
    re.IGNORECASE,
)


def has_attr(tag_inner: str, attr: str) -> bool:
    return re.search(rf'\b{attr}\s*=', tag_inner, re.IGNORECASE) is not None


def fix_imgs(html: str) -> tuple[str, dict]:
    stats = {"lazy_added": 0, "decoding_added": 0, "alt_missing": 0}
    matches = list(IMG_RE.finditer(html))
    if not matches:
        return html, stats

    first_img_pos = matches[0].start()
    out_parts = []
    last = 0
    for i, m in enumerate(matches):
        out_parts.append(html[last:m.start()])
        inner = m.group(1)
        is_first = (m.start() == first_img_pos)
        new_inner = inner

        # Treat as LCP candidate if explicitly fetchpriority=high OR is the first <img>
        is_lcp = is_first or has_attr(inner, "fetchpriority")

        if not has_attr(new_inner, "loading") and not is_lcp:
            new_inner = new_inner.rstrip() + ' loading="lazy"'
            stats["lazy_added"] += 1

        if not has_attr(new_inner, "decoding"):
            new_inner = new_inner.rstrip() + ' decoding="async"'
            stats["decoding_added"] += 1

        if not has_attr(new_inner, "alt"):
            stats["alt_missing"] += 1

        # Preserve trailing self-close style
        original = m.group(0)
        self_close = original.rstrip().endswith("/>")
        if self_close:
            out_parts.append(f"<img{new_inner.rstrip()} />")
        else:
            out_parts.append(f"<img{new_inner}>")
        last = m.end()
    out_parts.append(html[last:])
    return "".join(out_parts), stats


def fix_external_links(html: str) -> tuple[str, dict]:
    stats = {"rel_added": 0}
    out_parts = []
    last = 0
    for m in A_RE.finditer(html):
        out_parts.append(html[last:m.start()])
        inner = m.group(1)
        new_inner = inner
        if has_attr(inner, "target"):
            target_match = re.search(r'target\s*=\s*"([^"]*)"', inner, re.IGNORECASE)
            if target_match and target_match.group(1) == "_blank":
                if not has_attr(inner, "rel"):
                    new_inner = new_inner.rstrip() + ' rel="noopener noreferrer"'
                    stats["rel_added"] += 1
        out_parts.append(f"<a{new_inner}>")
        last = m.end()
    out_parts.append(html[last:])
    return "".join(out_parts), stats


def fix_ga_defer(html: str) -> tuple[str, dict]:
    stats = {"ga_defer_added": 0}

    def repl(m):
        tag = m.group(0)
        if " defer" in tag.lower():
            return tag
        stats["ga_defer_added"] += 1
        return tag.replace("<script async ", "<script async defer ")

    return GA_RE.sub(repl, html), stats


def fix_hamburger_aria(html: str) -> tuple[str, dict]:
    stats = {"aria_added": 0}

    def repl(m):
        attrs = m.group(1)
        new_attrs = attrs
        added = False
        if not has_attr(attrs, "aria-label"):
            new_attrs = new_attrs.rstrip() + ' aria-label="メニュー"'
            added = True
        if not has_attr(attrs, "aria-expanded"):
            new_attrs = new_attrs.rstrip() + ' aria-expanded="false"'
            added = True
        if not has_attr(attrs, "aria-controls"):
            new_attrs = new_attrs.rstrip() + ' aria-controls="mobile-menu"'
            added = True
        if added:
            stats["aria_added"] += 1
        return f'<button id="menu-btn"{new_attrs}>'

    return HAMBURGER_RE.sub(repl, html), stats


def process(path: Path) -> dict:
    original = path.read_text(encoding="utf-8")
    html = original
    total = {}
    for fn in (fix_imgs, fix_external_links, fix_ga_defer, fix_hamburger_aria):
        html, stats = fn(html)
        total.update(stats)
    return {"changed": html != original, "html": html, "stats": total, "original": original}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if args.files:
        files = [Path(f) for f in args.files]
    else:
        root = Path("frontend")
        files = [p for p in root.glob("*.html") if p.name not in {"blog-post.html"}]

    grand_total = {"lazy_added": 0, "decoding_added": 0, "alt_missing": 0,
                   "rel_added": 0, "ga_defer_added": 0, "aria_added": 0}

    for path in sorted(files):
        result = process(path)
        marker = "[CHANGE]" if result["changed"] else "[skip]  "
        s = result["stats"]
        print(f"{marker} {path}: lazy+{s['lazy_added']} decode+{s['decoding_added']} "
              f"rel+{s['rel_added']} ga+{s['ga_defer_added']} aria+{s['aria_added']} "
              f"(alt-missing: {s['alt_missing']})")
        for k in grand_total:
            grand_total[k] += s.get(k, 0)
        if result["changed"] and not args.dry_run:
            path.write_text(result["html"], encoding="utf-8")

    print()
    print("Totals:", grand_total)
    if args.dry_run:
        print("(dry-run, no files written)")


if __name__ == "__main__":
    main()
