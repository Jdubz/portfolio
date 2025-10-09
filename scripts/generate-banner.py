#!/usr/bin/env python3
"""
Generate social media banner image
Creates a 1200x630 branded banner for og:image / twitter:image
"""

from PIL import Image, ImageDraw, ImageFont
import os

def generate_banner():
    # Dimensions
    width = 1200
    height = 630

    # Create image with dark background
    img = Image.new('RGB', (width, height), color='#0f172a')
    draw = ImageDraw.Draw(img)

    # Try to use a nice font, fall back to default
    try:
        font_name = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 72)
        font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 36)
        font_subtitle = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 24)
        font_logo = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 160)
    except:
        # Fallback to default font
        font_name = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()
        font_logo = ImageFont.load_default()

    # Draw gradient overlay (simplified - using rectangles with alpha)
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    # Add some gradient effect with semi-transparent rectangles
    overlay_draw.rectangle([(0, 0), (400, 630)], fill=(102, 126, 234, 25))
    overlay_draw.rectangle([(400, 0), (800, 630)], fill=(14, 165, 233, 38))
    overlay_draw.rectangle([(800, 0), (1200, 630)], fill=(244, 114, 182, 25))

    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(img)

    # Draw JW logo
    draw.text((160, 240), 'JW', font=font_logo, fill='#0ea5e9')

    # Draw text content
    draw.text((450, 240), 'Josh Wentworth', font=font_name, fill='#ffffff')
    draw.text((450, 340), 'Multidisciplinary Engineer', font=font_title, fill='#94a3b8')
    draw.text((450, 400), 'Software × Hardware × Fabrication', font=font_subtitle, fill='#0ea5e9')

    # Add subtle accents
    overlay2 = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay2_draw = ImageDraw.Draw(overlay2)
    overlay2_draw.ellipse([(1040, 470), (1160, 590)], fill=(102, 126, 234, 13))
    overlay2_draw.ellipse([(60, 40), (140, 120)], fill=(14, 165, 233, 13))

    img = Image.alpha_composite(img.convert('RGBA'), overlay2).convert('RGB')

    # Save
    output_path = 'web/static/banner.jpg'
    img.save(output_path, 'JPEG', quality=95, optimize=True)
    print(f'✓ Generated banner: {output_path}')
    print(f'  Size: {width}x{height}')

if __name__ == '__main__':
    os.chdir('/home/jdubz/Development/portfolio')
    generate_banner()
