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