#!/usr/bin/env python3
"""
PROTECH Inbound AI - Phase 1: Automated Data Collector
Monitors JTA (mlit.go.jp) and JNTO (jnto.go.jp) for latest inbound tourism statistics.
Environment: macOS, Python 3.11+
"""

import os
import json
import time
import hashlib
import logging
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional
from urllib.parse import urljoin, urlparse

# Optional: pip install playwright fitz (PyMuPDF)
try:
    from playwright.sync_api import sync_playwright
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False

try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False

# ── Config ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent / "data" / "inbound-ai"
PDF_DIR = BASE_DIR / "pdfs"
OUTPUT_DIR = BASE_DIR / "extracted"
HISTORY_FILE = BASE_DIR / "history.json"
LOG_FILE = BASE_DIR / "collector.log"

KEYWORDS = ["統計", "訪日外客数", "消費動向", "訪日外客", "旅行消費額"]

SOURCES = [
    {
        "name": "JTA (観光庁)",
        "url": "https://www.mlit.go.jp/kankocho/siryou/toukei/index.html",
        "base": "https://www.mlit.go.jp",
    },
    {
        "name": "JNTO",
        "url": "https://www.jnto.go.jp/statistics/data/visitors-statistics/",
        "base": "https://www.jnto.go.jp",
    },
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept-Language": "ja,en;q=0.9",
}

# LLM endpoint (optional – set via env var)
LLM_API_URL = os.getenv("PROTECH_LLM_URL", "")
LLM_API_KEY = os.getenv("PROTECH_LLM_KEY", "")

# ── Logging ───────────────────────────────────────────────────────────────────
BASE_DIR.mkdir(parents=True, exist_ok=True)
PDF_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("inbound-collector")


# ── History management ────────────────────────────────────────────────────────
def load_history() -> dict:
    if HISTORY_FILE.exists():
        try:
            return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            log.warning("history.json corrupted, resetting.")
    return {"downloaded": []}


def save_history(history: dict):
    HISTORY_FILE.write_text(json.dumps(history, ensure_ascii=False, indent=2), encoding="utf-8")


def already_downloaded(url: str, history: dict) -> bool:
    return url in history["downloaded"]


def mark_downloaded(url: str, history: dict):
    history["downloaded"].append(url)
    save_history(history)


# ── PDF link discovery ────────────────────────────────────────────────────────
def fetch_pdf_links_requests(source: dict) -> list[str]:
    """Fetch PDF links using requests + basic HTML parsing."""
    links = []
    try:
        resp = requests.get(source["url"], headers=HEADERS, timeout=20)
        resp.raise_for_status()
        from html.parser import HTMLParser

        class LinkParser(HTMLParser):
            def __init__(self):
                super().__init__()
                self.pdf_links = []

            def handle_starttag(self, tag, attrs):
                if tag == "a":
                    attrs_dict = dict(attrs)
                    href = attrs_dict.get("href", "")
                    text = ""
                    if href.lower().endswith(".pdf"):
                        full_url = urljoin(source["base"], href)
                        self.pdf_links.append(full_url)

        parser = LinkParser()
        parser.feed(resp.text)

        # Filter by keyword relevance in URL
        for link in parser.pdf_links:
            for kw in ["toukei", "visitor", "inbound", "消費", "外客"]:
                if kw in link.lower():
                    links.append(link)
                    break
            else:
                links.append(link)  # include all PDFs from stat pages

        log.info(f"[{source['name']}] Found {len(links)} PDF links via requests.")
    except Exception as e:
        log.error(f"[{source['name']}] requests fetch failed: {e}")
    return links


def fetch_pdf_links_playwright(source: dict) -> list[str]:
    """Fetch PDF links using Playwright for JS-rendered pages."""
    links = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(source["url"], wait_until="networkidle", timeout=30000)
            anchors = page.query_selector_all("a[href$='.pdf']")
            for a in anchors:
                href = a.get_attribute("href") or ""
                full_url = urljoin(source["base"], href)
                links.append(full_url)
            browser.close()
        log.info(f"[{source['name']}] Found {len(links)} PDF links via Playwright.")
    except Exception as e:
        log.error(f"[{source['name']}] Playwright fetch failed: {e}")
    return links


def get_pdf_links(source: dict) -> list[str]:
    if HAS_PLAYWRIGHT:
        links = fetch_pdf_links_playwright(source)
        if links:
            return links
    return fetch_pdf_links_requests(source)


# ── PDF download ──────────────────────────────────────────────────────────────
def download_pdf(url: str) -> Optional[Path]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        resp.raise_for_status()
        fname = hashlib.md5(url.encode()).hexdigest()[:12] + "_" + Path(urlparse(url).path).name
        fpath = PDF_DIR / fname
        with open(fpath, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)
        log.info(f"Downloaded: {url} -> {fpath.name}")
        return fpath
    except Exception as e:
        log.error(f"Download failed [{url}]: {e}")
        return None


# ── PDF text extraction ───────────────────────────────────────────────────────
def extract_text(pdf_path: Path) -> str:
    if not HAS_FITZ:
        log.warning("PyMuPDF not installed. Run: pip install pymupdf")
        return ""
    try:
        text_parts = []
        doc = fitz.open(str(pdf_path))
        for page_num, page in enumerate(doc):
            text = page.get_text("text")
            if any(kw in text for kw in KEYWORDS):
                text_parts.append(f"--- Page {page_num + 1} ---\n{text}")
        doc.close()
        result = "\n".join(text_parts)
        log.info(f"Extracted {len(result)} chars from {pdf_path.name}")
        return result
    except Exception as e:
        log.error(f"Text extraction failed [{pdf_path}]: {e}")
        return ""


def save_extracted(text: str, source_url: str, source_name: str):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    slug = hashlib.md5(source_url.encode()).hexdigest()[:8]
    out_file = OUTPUT_DIR / f"{ts}_{slug}.txt"
    out_file.write_text(
        f"Source: {source_url}\nSite: {source_name}\nExtracted: {datetime.now().isoformat()}\n\n{text}",
        encoding="utf-8",
    )
    log.info(f"Saved text: {out_file}")
    return out_file


# ── LLM forwarding ────────────────────────────────────────────────────────────
def send_to_llm(text: str, source_url: str):
    if not LLM_API_URL or not LLM_API_KEY:
        log.info("LLM endpoint not configured. Skipping API call.")
        return
    try:
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "あなたは日本のインバウンド市場を専門とする上級アナリストです。"
                        "以下の統計データを分析し、日本語でビジネス向け速報レポートを作成してください。"
                    ),
                },
                {"role": "user", "content": f"データソース: {source_url}\n\n{text[:8000]}"},
            ],
        }
        resp = requests.post(
            LLM_API_URL,
            headers={"Authorization": f"Bearer {LLM_API_KEY}", "Content-Type": "application/json"},
            json=payload,
            timeout=60,
        )
        resp.raise_for_status()
        result = resp.json()
        log.info("LLM response received.")
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        (OUTPUT_DIR / f"{ts}_llm_report.json").write_text(
            json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    except Exception as e:
        log.error(f"LLM API call failed: {e}")


# ── Main ──────────────────────────────────────────────────────────────────────
def run():
    log.info("=" * 60)
    log.info("PROTECH Inbound AI Collector starting...")
    history = load_history()
    new_count = 0

    for source in SOURCES:
        log.info(f"Processing: {source['name']} ({source['url']})")
        pdf_links = get_pdf_links(source)

        for url in pdf_links:
            if already_downloaded(url, history):
                log.debug(f"Skip (already done): {url}")
                continue

            pdf_path = download_pdf(url)
            if pdf_path is None:
                continue

            text = extract_text(pdf_path)
            if text.strip():
                out = save_extracted(text, url, source["name"])
                send_to_llm(text, url)
                new_count += 1

            mark_downloaded(url, history)
            time.sleep(2)  # polite delay

    log.info(f"Done. {new_count} new documents processed.")
    log.info("=" * 60)


if __name__ == "__main__":
    run()
