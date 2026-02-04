# App Icons

Generate PNG icons from the SVG for PWA support:

## Required sizes:
- icon-16.png (16x16) - favicon
- icon-32.png (32x32) - favicon
- icon-192.png (192x192) - Android/PWA
- icon-512.png (512x512) - Android/PWA splash
- feed-96.png (96x96) - shortcut icon
- sleep-96.png (96x96) - shortcut icon

## Quick generation:
You can use any of these tools:
1. https://realfavicongenerator.net
2. https://www.pwabuilder.com/imageGenerator
3. Figma/Sketch export

## From command line (requires ImageMagick):
```bash
convert icon.svg -resize 16x16 icon-16.png
convert icon.svg -resize 32x32 icon-32.png
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
```
