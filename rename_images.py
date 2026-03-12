import os, sys

if len(sys.argv) < 2:
    print("Usage: python3 rename_images.py <series-slug>")
    print("Example: python3 rename_images.py solo-leveling")
    sys.exit(1)

slug = sys.argv[1]
base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images", slug)

if not os.path.exists(base):
    print(f"❌ Folder not found: {base}")
    sys.exit(1)

for chdir in sorted(os.listdir(base)):
    full = os.path.join(base, chdir)
    if not os.path.isdir(full): continue

    # Only webp files, sorted
    imgs = sorted([f for f in os.listdir(full) if f.lower().endswith('.webp')])
    if not imgs: continue

    # Use temp names first to avoid conflicts
    for i, img in enumerate(imgs, 1):
        os.rename(os.path.join(full, img), os.path.join(full, f'temp_{i:03d}.webp'))
    for i in range(1, len(imgs)+1):
        os.rename(os.path.join(full, f'temp_{i:03d}.webp'), os.path.join(full, f'{i:03d}.webp'))

    print(f'✓ {chdir} — {len(imgs)} pages')

print('✅ All renamed!')