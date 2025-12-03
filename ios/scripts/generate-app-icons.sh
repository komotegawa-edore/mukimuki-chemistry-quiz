#!/bin/bash

# Roopy iOS App Icon Generator (macOS sips版)
# 使用方法: ./generate-app-icons.sh [source-image.png]
#
# macOS標準のsipsコマンドを使用してアイコンを生成

SOURCE_IMAGE="${1:-../../public/Roopy-icon.png}"
OUTPUT_DIR="../Roopy/Assets.xcassets/AppIcon.appiconset"
TEMP_DIR="/tmp/roopy-icons"

echo "Generating iOS app icons from: $SOURCE_IMAGE"
echo "Output directory: $OUTPUT_DIR"

# 出力ディレクトリの確認
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "Error: Output directory does not exist: $OUTPUT_DIR"
    exit 1
fi

# 元画像の確認
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image not found: $SOURCE_IMAGE"
    echo "Please provide a 1024x1024 PNG image as argument"
    exit 1
fi

# 一時ディレクトリ作成
mkdir -p "$TEMP_DIR"

# 各サイズを生成する関数
generate_icon() {
    local size=$1
    local filename=$2

    cp "$SOURCE_IMAGE" "$TEMP_DIR/temp.png"
    sips -z $size $size "$TEMP_DIR/temp.png" --out "$OUTPUT_DIR/$filename" > /dev/null 2>&1
    echo "Generated ${size}x${size}: $filename"
}

# 必要なサイズのアイコンを生成
generate_icon 20 "icon-20.png"
generate_icon 40 "icon-20@2x.png"
generate_icon 60 "icon-20@3x.png"
generate_icon 40 "icon-20@2x-ipad.png"
generate_icon 29 "icon-29.png"
generate_icon 58 "icon-29@2x.png"
generate_icon 87 "icon-29@3x.png"
generate_icon 58 "icon-29@2x-ipad.png"
generate_icon 40 "icon-40.png"
generate_icon 80 "icon-40@2x.png"
generate_icon 120 "icon-40@3x.png"
generate_icon 80 "icon-40@2x-ipad.png"
generate_icon 120 "icon-60@2x.png"
generate_icon 180 "icon-60@3x.png"
generate_icon 76 "icon-76.png"
generate_icon 152 "icon-76@2x.png"
generate_icon 167 "icon-83.5@2x.png"
generate_icon 1024 "icon-1024.png"

# 一時ファイル削除
rm -rf "$TEMP_DIR"

echo ""
echo "✅ App icons generated successfully!"
echo "   Location: $OUTPUT_DIR"
