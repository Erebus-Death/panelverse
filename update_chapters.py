import os, re, datetime, sys

if len(sys.argv) < 2:
    print("Usage: python3 update_chapters.py <series-slug>")
    print("Example: python3 update_chapters.py solo-leveling")
    sys.exit(1)

slug = sys.argv[1]
project = os.path.dirname(os.path.abspath(__file__))

images_path = f"{project}/public/images/{slug}"
index_path = f"{project}/content/series/{slug}/index.md"

if not os.path.exists(images_path):
    print(f"❌ No images folder found at {images_path}")
    sys.exit(1)

# Scan chapter folders
chapters = []
for folder in sorted(os.listdir(images_path)):
    if not folder.startswith("ch"):
        continue
    num = int(folder.replace("ch", ""))
    pages = len([f for f in os.listdir(f"{images_path}/{folder}")
                 if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))])
    if pages == 0:
        print(f"⚠️  Skipping ch{num:03d} — empty folder")
        continue
    chapters.append((num, pages))

now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

# Build chapters block
chapters_block = "chapters:\n"
for num, pages in chapters:
    chapters_block += f"  - num: {num}\n"
    chapters_block += f"    date: \"{now}\"\n"
    chapters_block += f"    pages: {pages}\n"
chapters_block += "---"

# Read existing index.md
with open(index_path, "r") as f:
    content = f.read()

# Replace existing chapters block or append
if "chapters:" in content:
    content = re.sub(r"chapters:[\s\S]*", chapters_block, content)
else:
    content = content.rstrip("\n").rstrip("---").rstrip("\n") + "\n" + chapters_block

with open(index_path, "w") as f:
    f.write(content)

print(f"✓ Updated {slug}/index.md with {len(chapters)} chapters!")
for num, pages in chapters:
    print(f"  ch{num:03d} — {pages} pages")