for dir in Chapter\ */; do
  [ -d "$dir" ] || continue
  num=$(echo "$dir" | grep -oE '[0-9]+' | head -1)
  mv "$dir" "$(printf 'ch%03d' $num)"
done