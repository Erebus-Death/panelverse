"""
PanelVerse — Chapter Update Checker
Checks MangaDex, Asura Scans, King of Shojo, and Flame Comics
for new chapters across all your series.

Usage:
    python3 check_updates.py

Requirements:
    pip3 install requests beautifulsoup4
"""

import os
import re
import json
import time
import requests
from bs4 import BeautifulSoup

CONTENT_DIR = os.path.expanduser("~/Desktop/panelverse/content/series")

# ─────────────────────────────────────────────
# CONFIG — Add your series here
# For each series, add the URLs where it's available
# Leave a source as None if the series isn't on that site
# ─────────────────────────────────────────────
SERIES_MAP = {
    "solo-leveling": {
        "mangadex": "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0",
        "asura": None,
        "kingofshojo": None,
        "flamecomics": None,
    },
    "nano-machine": {
        "mangadex": "a3617a4d-af3a-4d56-8e87-b6d87a46b8c4",
        "asura": None,
        "kingofshojo": None,
        "flamecomics": None,
    },
    "return-of-mount-hua-sect": {
        "mangadex": "a96676e5-8ae2-425e-b549-7f15dd34a6d8",
        "asura": None,
        "kingofshojo": None,
        "flamecomics": None,
    },
    "i-was-more-overpowered-than-hero": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/PUT-SLUG-HERE",
        "kingofshojo": None,
        "flamecomics": None,
    },
    "devourer-please-act-like-final-boss": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/PUT-SLUG-HERE",
        "kingofshojo": None,
        "flamecomics": None,
    },
    "myst-might-mayhem": {
        "mangadex": None,
        "asura": None,
        "kingofshojo": "https://kingofshojo.com/manga/PUT-SLUG-HERE",
        "flamecomics": None,
    },
    "reaper-of-the-moon": {
        "mangadex": None,
        "asura": None,
        "kingofshojo": None,
        "flamecomics": "https://flamecomics.xyz/series/PUT-SLUG-HERE",
    },
    "sss-class-sucide-hunter": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/PUT-SLUG-HERE",
        "kingofshojo": None,
        "flamecomics": None,
    },
    "the-extras-academy-survival-guide": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/PUT-SLUG-HERE",
        "kingofshojo": None,
        "flamecomics": None,
    },
    "the-greatest-estate-developer": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/PUT-SLUG-HERE",
        "kingofshojo": None,
        "flamecomics": None,
    },
    "the-novels-extra": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/PUT-SLUG-HERE",
        "kingofshojo": None,
        "flamecomics": None,
    },
    "return-of-the-disaster-class-hero": {
        "mangadex": None,
        "asura": None,
        "kingofshojo": "https://kingofshojo.com/manga/PUT-SLUG-HERE",
        "flamecomics": None,
    },
    "the-academy-sashimi-sword-master": {
        "mangadex": None,
        "asura": None,
        "kingofshojo": None,
        "flamecomics": "https://flamecomics.xyz/series/PUT-SLUG-HERE",
    },
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
}

# ─────────────────────────────────────────────
# Get latest local chapter from index.md
# ─────────────────────────────────────────────
def get_local_latest(slug):
    index_path = os.path.join(CONTENT_DIR, slug, "index.md")
    if not os.path.exists(index_path):
        return None
    with open(index_path) as f:
        content = f.read()
    nums = re.findall(r'^\s+num:\s*(\d+)', content, re.MULTILINE)
    return max(int(n) for n in nums) if nums else 0

# ─────────────────────────────────────────────
# MangaDex API
# ─────────────────────────────────────────────
def check_mangadex(manga_id):
    try:
        url = f"https://api.mangadex.org/manga/{manga_id}/feed"
        params = {
            "translatedLanguage[]": "en",
            "order[chapter]": "desc",
            "limit": 1,
        }
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
        data = res.json()
        if not data.get("data"):
            return None
        ch = data["data"][0]["attributes"]["chapter"]
        return int(float(ch)) if ch else None
    except:
        return None

# ─────────────────────────────────────────────
# Asura Scans scraper
# ─────────────────────────────────────────────
def check_asura(url):
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        # Asura lists chapters — grab the first one (latest)
        chapters = soup.select("div.eph-num a, li.wp-manga-chapter a")
        if not chapters:
            # fallback: find any text that looks like "Chapter X"
            text = soup.get_text()
            nums = re.findall(r'[Cc]hapter\s+(\d+)', text)
            return max(int(n) for n in nums) if nums else None
        text = chapters[0].get_text()
        match = re.search(r'(\d+)', text)
        return int(match.group(1)) if match else None
    except:
        return None

# ─────────────────────────────────────────────
# King of Shojo scraper
# ─────────────────────────────────────────────
def check_kingofshojo(url):
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        chapters = soup.select("li.wp-manga-chapter a, .chapter-link, ul.row-content-chapter a")
        if not chapters:
            text = soup.get_text()
            nums = re.findall(r'[Cc]hapter\s+(\d+)', text)
            return max(int(n) for n in nums) if nums else None
        text = chapters[0].get_text()
        match = re.search(r'(\d+)', text)
        return int(match.group(1)) if match else None
    except:
        return None

# ─────────────────────────────────────────────
# Flame Comics scraper
# ─────────────────────────────────────────────
def check_flamecomics(url):
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        chapters = soup.select("a.chapter, .chapter-item a, ul.chapter-list a")
        if not chapters:
            text = soup.get_text()
            nums = re.findall(r'[Cc]hapter\s+(\d+)', text)
            return max(int(n) for n in nums) if nums else None
        text = chapters[0].get_text()
        match = re.search(r'(\d+)', text)
        return int(match.group(1)) if match else None
    except:
        return None

# ─────────────────────────────────────────────
# Check a single series across all sources
# ─────────────────────────────────────────────
def check_series(slug, sources):
    local = get_local_latest(slug)
    if local is None:
        return None, "index.md not found"

    remote = None
    source_used = None

    if sources.get("mangadex"):
        r = check_mangadex(sources["mangadex"])
        if r and (remote is None or r > remote):
            remote = r
            source_used = "MangaDex"
        time.sleep(0.3)  # be polite to MangaDex API

    if sources.get("asura") and "PUT-SLUG-HERE" not in sources["asura"]:
        r = check_asura(sources["asura"])
        if r and (remote is None or r > remote):
            remote = r
            source_used = "Asura"

    if sources.get("kingofshojo") and "PUT-SLUG-HERE" not in sources["kingofshojo"]:
        r = check_kingofshojo(sources["kingofshojo"])
        if r and (remote is None or r > remote):
            remote = r
            source_used = "KingOfShojo"

    if sources.get("flamecomics") and "PUT-SLUG-HERE" not in sources["flamecomics"]:
        r = check_flamecomics(sources["flamecomics"])
        if r and (remote is None or r > remote):
            remote = r
            source_used = "FlameComics"

    return local, remote, source_used

# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────
def main():
    print("\n🔍 PanelVerse — Chapter Update Checker")
    print("=" * 50)

    updates = []
    skipped = []
    errors = []

    for slug, sources in SERIES_MAP.items():
        # Skip if no sources configured
        all_none = all(v is None or "PUT-SLUG-HERE" in str(v) for v in sources.values())
        if all_none:
            skipped.append(slug)
            print(f"  ⏭  {slug} — no sources configured")
            continue

        result = check_series(slug, sources)

        if result[0] is None:
            errors.append(slug)
            print(f"  ❌ {slug} — {result[1]}")
            continue

        local, remote, source_used = result

        if remote is None:
            print(f"  ⚠️  {slug} — could not fetch remote ({source_used or 'all sources failed'})")
            continue

        if remote > local:
            diff = remote - local
            updates.append((slug, local, remote, source_used))
            print(f"  🆕 {slug}")
            print(f"     Your site: Ch.{local}  →  Available: Ch.{remote}  (+{diff} chapters)  [{source_used}]")
        else:
            print(f"  ✅ {slug} — up to date (Ch.{local}) [{source_used}]")

    # Summary
    print("\n" + "=" * 50)
    if updates:
        print(f"🆕 {len(updates)} series need updating:\n")
        for slug, local, remote, source in updates:
            print(f"   • {slug}: Ch.{local} → Ch.{remote} [{source}]")
    else:
        print("✅ All series are up to date!")

    if skipped:
        print(f"\n⏭  {len(skipped)} series skipped (no sources configured)")
    if errors:
        print(f"❌ {len(errors)} errors: {', '.join(errors)}")

    print()

if __name__ == "__main__":
    main()