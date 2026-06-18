#!/bin/bash
# Compress and rename blog images for japan-summer-spots-2026
DIR="/Users/charles/Documents/protech/frontend/assets/images"

declare -A RENAME_MAP
RENAME_MAP["沖縄・慶良間諸島（ケラマブルー）.jpeg"]="blog-summer-kerama.jpg"
RENAME_MAP["京都・伏見稲荷大社（千本鳥居）.jpeg"]="blog-summer-fushimi-inari.jpg"
RENAME_MAP["北海道・富良野ラベンダー畑.jpeg"]="blog-summer-furano-lavender.jpg"
RENAME_MAP["東京・隅田川花火大会.jpeg"]="blog-summer-sumida-hanabi.jpg"
RENAME_MAP["長野・上高地（日本アルプス）.jpeg"]="blog-summer-kamikochi.jpg"
RENAME_MAP["広島・宮島（厳島神社の大鳥居）.jpeg"]="blog-summer-miyajima.jpg"
RENAME_MAP["青森・ねぶた祭.jpeg"]="blog-summer-nebuta.jpg"
RENAME_MAP["石川・金沢ひがし茶屋街.jpeg"]="blog-summer-kanazawa.jpg"
RENAME_MAP["鹿児島・屋久島（苓の森＆縄文杉）.jpeg"]="blog-summer-yakushima.jpg"
RENAME_MAP["大阪・道頓堀＆天神祭.jpeg"]="blog-summer-osaka-dotonbori.jpg"
RENAME_MAP["山梨・河口湖（富士山×ラベンダー）.jpeg"]="blog-summer-kawaguchiko.jpg"
RENAME_MAP["高知・仁淤川（仁淤ブルー）.jpeg"]="blog-summer-niyodo.jpg"
RENAME_MAP["長崎・ハウステンボス（向日葵花畑）.jpeg"]="blog-summer-huis-ten-bosch.jpg"
RENAME_MAP["岐阜・白川郷（合掌造り集落）.jpeg"]="blog-summer-shirakawago.jpg"
RENAME_MAP["北海道・小樽運河.jpeg"]="blog-summer-otaru.jpg"

echo "=== Compressing and renaming blog images ==="
for jp_name in "${!RENAME_MAP[@]}"; do
    en_name="${RENAME_MAP[$jp_name]}"
    src="$DIR/$jp_name"
    dst="$DIR/$en_name"
    
    if [ -f "$src" ]; then
        # Copy to new name
        cp "$src" "$dst"
        # Resize to max 1600px width, maintaining aspect ratio
        sips --resampleWidth 1600 "$dst" > /dev/null 2>&1
        # Convert to JPEG with reduced quality (sips uses a scale of 0-100 but we use low for compression)
        sips -s format jpeg -s formatOptions 75 "$dst" > /dev/null 2>&1
        
        orig_size=$(stat -f%z "$src")
        new_size=$(stat -f%z "$dst")
        echo "✅ $jp_name → $en_name  ($(( orig_size / 1024 ))KB → $(( new_size / 1024 ))KB)"
    else
        echo "❌ NOT FOUND: $jp_name"
    fi
done

echo ""
echo "=== Done! ==="
echo "Total compressed images:"
ls -lh "$DIR"/blog-summer-*.jpg | awk '{print $5, $9}' | sed "s|$DIR/||"
