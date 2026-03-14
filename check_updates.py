"""
PanelVerse — Chapter Update Checker
Checks MangaDex, Asura Scans, King of Shojo, Flame Comics, and Vortex Scans
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
# CONFIG — All your series with actual URLs
# ─────────────────────────────────────────────
SERIES_MAP = {
    "legend-of-the-northern-blade": {
        "mangadex": None,
        "asura": None,
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": "https://vortexscans.org/series/the-legend-of-the-northern-blade-fqe4tt3q",
    },
    "i-was-more-overpowered-than-the-hero": {
    "mangadex": None,
    "asura": None,
    "kingofshojo": "https://kingofshojo.com/manga/i-was-more-overpowered-than-the-hero-so-i-hid-my-power/",
    "flamecomics": None,
    "vortex": None,
},
    "nano-machine": {
        "mangadex": "a3617a4d-af3a-4d56-8e87-b6d87a46b8c4",  # Keeping MangaDex as backup
        "asura": "https://asuracomic.net/series/nano-machine-98f69633",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "the-extras-academy-survival-guide": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/the-extras-academy-survival-guide-a443ab69",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "the-academys-sashimi-sword-master": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/the-academys-sashimi-sword-master-c2f69b37",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "return-of-the-disaster-class-hero": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/return-of-the-disaster-class-hero-0b8c088b",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "myst-might-mayhem": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/myst-might-mayhem-a22d25e1",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "omniscient-readers-viewpoint": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/omniscient-readers-viewpoint-738a9f43",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "reaper-of-the-drifting-moon": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/reaper-of-the-drifting-moon-24527359",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "the-novels-extra-remake": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/the-novels-extra-remake-01b94459",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "mr-devourer-please-act-like-a-final-boss": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/mr-devourer-please-act-like-a-final-boss-5e5efd0d",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "return-of-the-mount-hua-sect": {
        "mangadex": "a96676e5-8ae2-425e-b549-7f15dd34a6d8",  # Keeping MangaDex as backup
        "asura": "https://asuracomic.net/series/return-of-the-mount-hua-sect-5ed1ce70",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "solo-leveling": {
        "mangadex": "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0",  # Keeping MangaDex as backup
        "asura": "https://asuracomic.net/series/solo-leveling-3454908e",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "sss-class-suicide-hunter": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/sss-class-suicide-hunter-cb0d4822",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    "the-greatest-estate-developer": {
        "mangadex": None,
        "asura": "https://asuracomic.net/series/the-greatest-estate-developer-5997215b",
        "kingofshojo": None,
        "flamecomics": None,
        "vortex": None,
    },
    # Thunder Scans series - currently commented out due to 403 error
    # "i-was-more-overpowered-than-the-hero": {
    #     "mangadex": None,
    #     "asura": None,
    #     "kingofshojo": None,
    #     "flamecomics": None,
    #     "thunder": "https://en-thunderscans.com/comics/i-was-more-overpowered-than-the-hero-so-i-held-my-power/",
    # },
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
# NEW: Vortex Scans scraper
# ─────────────────────────────────────────────
def check_vortex(url):
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        
        # Try different possible selectors for Vortex Scans
        chapters = soup.select("li.chapter-item a, ul.chapter-list a, .chapter-link, a[href*='/chapter/']")
        
        if not chapters:
            # Fallback: look for chapter numbers in text
            text = soup.get_text()
            nums = re.findall(r'[Cc]hapter\s+(\d+)', text)
            return max(int(n) for n in nums) if nums else None
            
        # Get the first (latest) chapter
        text = chapters[0].get_text()
        match = re.search(r'(\d+)', text)
        return int(match.group(1)) if match else None
    except Exception as e:
        print(f"Vortex error: {e}")
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

    # Check each source in priority order (you can change this)
    if sources.get("mangadex"):
        r = check_mangadex(sources["mangadex"])
        if r and (remote is None or r > remote):
            remote = r
            source_used = "MangaDex"
        time.sleep(0.3)

    if sources.get("asura") and sources["asura"]:
        r = check_asura(sources["asura"])
        if r and (remote is None or r > remote):
            remote = r
            source_used = "Asura"
        time.sleep(0.5)

    if sources.get("vortex") and sources["vortex"]:
        r = check_vortex(sources["vortex"])
        if r and (remote is None or r > remote):
            remote = r
            source_used = "Vortex"
        time.sleep(0.5)

    if sources.get("kingofshojo") and sources["kingofshojo"]:
        r = check_kingofshojo(sources["kingofshojo"])
        if r and (remote is None or r > remote):
            remote = r
            source_used = "KingOfShojo"
        time.sleep(0.5)

    if sources.get("flamecomics") and sources["flamecomics"]:
        r = check_flamecomics(sources["flamecomics"])
        if r and (remote is None or r > remote):
            remote = r
            source_used = "FlameComics"
        time.sleep(0.5)

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
        has_valid_source = False
        for source, url in sources.items():
            if url and isinstance(url, str) and url.startswith("http"):
                has_valid_source = True
                break
        
        if not has_valid_source:
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