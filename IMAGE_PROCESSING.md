# PanelVerse — Image Processing Guide

## Scripts Available
| Script | Purpose |
|--------|---------|
| `fix_images.sh` | Compress + split tall images for a Desktop folder |
| `rename_images.py` | Rename images sequentially (001.webp, 002.webp...) |
| `update_chapters.py` | Update index.md with chapter/page counts |

---

## Method 1 — From Original Source (Recommended ✅)
Use this when you have the original untouched source folder on Desktop.
Preserves correct image order guaranteed.

### Step 1 — Clear existing images (if reprocessing)
```bash
rm -rf ~/Desktop/panelverse/public/images/<series-slug>/*
```

### Step 2 — Process from source in one command
Replace `~/Desktop/SL` with your source folder and `solo-leveling` with your series slug.

```bash
python3 -c "
import os, subprocess, re, random, shutil

src_base = os.path.expanduser('~/Desktop/SERIESABBREV')
dst_base = os.path.expanduser('~/Desktop/panelverse/public/images/series-slug')

# Your 2 cover images — update paths before running
covers = [
    os.path.expanduser('~/Desktop/cover_a.webp'),
    os.path.expanduser('~/Desktop/cover_b.webp'),
]

for folder in sorted(os.listdir(src_base)):
    src_dir = os.path.join(src_base, folder)
    if not os.path.isdir(src_dir): continue
    match = re.search(r'[0-9]+', folder)
    if not match: continue
    num = int(match.group())
    dst_dir = os.path.join(dst_base, f'ch{num:03d}')
    os.makedirs(dst_dir, exist_ok=True)

    for img in sorted(os.listdir(src_dir)):
        src = os.path.join(src_dir, img)
        if not os.path.isfile(src): continue
        ext = img.lower().split('.')[-1]
        if ext not in ['jpg','jpeg','png','webp']: continue
        result = subprocess.run(['magick','identify','-format','%h', src], capture_output=True, text=True)
        try: height = int(result.stdout.strip())
        except: continue
        base_name = os.path.splitext(img)[0]
        if height > 2000:
            subprocess.run(['magick', src, '-crop', 'x1200', '+repage', '-quality', '75', f'{dst_dir}/{base_name}_%03d.webp'])
        else:
            subprocess.run(['cwebp','-q','75','-m','6', src,'-o', f'{dst_dir}/{base_name}.webp','-quiet'])

    # Rename sequentially starting from 001
    imgs = sorted([f for f in os.listdir(dst_dir) if f.lower().endswith('.webp')])
    for i, img in enumerate(imgs, 1):
        os.rename(os.path.join(dst_dir, img), os.path.join(dst_dir, f'temp_{i:03d}.webp'))
    for i in range(1, len(imgs)+1):
        os.rename(os.path.join(dst_dir, f'temp_{i:03d}.webp'), os.path.join(dst_dir, f'{i:03d}.webp'))

    # Randomly pick one of the 2 covers and add as 000.webp
    cover = random.choice(covers)
    shutil.copy2(cover, os.path.join(dst_dir, '000.webp'))

    print(f'✓ ch{num:03d} — {len(imgs)} pages + cover: {os.path.basename(cover)}')

print('All done!')
"
```

### Step 3 — Update index.md
```bash
cd ~/Desktop/panelverse
python3 update_chapters.py solo-leveling
```

### Step 4 — Deploy
```bash
git add . && git commit -m "add solo-leveling chapters" && git push
```

---

## Method 2 — Process Desktop Folder First
Use this when you want to process images before moving to project.

```bash
# Step 1 - compress + split + recompress big chapters
./fix_images.sh SoloLeveling

# Step 2 - rename sequentially
python3 rename_images.py SoloLeveling

# Step 3 - move to project
mv ~/Desktop/SoloLeveling ~/Desktop/panelverse/public/images/solo-leveling

# Step 4 - update index.md
python3 update_chapters.py solo-leveling
```

---

## Image Requirements
- Format: `.webp` (jpg/png auto-converted)
- Naming: `001.webp`, `002.webp`... (3-digit)
- Chapter folders: `ch000`, `ch001`, `ch002`... (3-digit)
- Tall images (>2000px height): auto-split into 1200px chunks
- Big chapters (>5MB): recompressed at quality 60
- Junk files (.xml, .txt, .nfo): auto-removed

## Notes
- Source folder is **never modified** — always reads only
- Chapter 0 is supported (`ch000`)
- Always run `update_chapters.py` after adding/changing images
- Restart dev server after changes: `npm run dev`
