#!/usr/bin/env python3
"""
Generate branded social media banner (1200x630)
Matches actual site design: logo, fonts, floating icons, gradient background
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import random

def draw_icon(draw, x, y, size, icon_type, color, opacity):
    """Draw simplified tech icons matching site design"""
    alpha = int(opacity * 255)
    color_with_alpha = (*color, alpha)

    # Scale factor for icon details
    s = size / 64

    if icon_type == 'chip':  # Microchip
        # Outer rect
        draw.rectangle([(x + 16*s, y + 16*s), (x + 48*s, y + 48*s)],
                      outline=color_with_alpha, width=max(1, int(2*s)))
        # Inner rect
        draw.rectangle([(x + 24*s, y + 24*s), (x + 40*s, y + 40*s)],
                      outline=color_with_alpha, width=max(1, int(2*s)))
        # Pins (simplified)
        for i in [20, 28, 36, 44]:
            draw.line([(x + i*s, y + 12*s), (x + i*s, y + 16*s)], fill=color_with_alpha, width=max(1, int(2*s)))
            draw.line([(x + i*s, y + 48*s), (x + i*s, y + 52*s)], fill=color_with_alpha, width=max(1, int(2*s)))

    elif icon_type == 'terminal':  # Terminal/code
        # Window
        draw.rectangle([(x + 8*s, y + 12*s), (x + 56*s, y + 52*s)],
                      outline=color_with_alpha, width=max(1, int(2*s)))
        # Prompt arrow
        points = [(x + 18*s, y + 26*s), (x + 24*s, y + 30*s), (x + 18*s, y + 34*s)]
        draw.line(points, fill=color_with_alpha, width=max(1, int(2*s)), joint='curve')
        # Cursor line
        draw.line([(x + 32*s, y + 34*s), (x + 40*s, y + 34*s)], fill=color_with_alpha, width=max(1, int(2*s)))

    elif icon_type == 'wave':  # Oscilloscope/signal
        # Window
        draw.rectangle([(x + 8*s, y + 12*s), (x + 56*s, y + 52*s)],
                      outline=color_with_alpha, width=max(1, int(2*s)))
        # Wave (simplified sine wave)
        points = []
        for i in range(16, 49, 4):
            wave_y = 32 + 8 * (1 if (i // 8) % 2 else -1)
            points.append((x + i*s, y + wave_y*s))
        if len(points) > 1:
            draw.line(points, fill=color_with_alpha, width=max(1, int(2*s)), joint='curve')

    elif icon_type == 'resistor':  # Electronics resistor
        # Body
        draw.rectangle([(x + 16*s, y + 28*s), (x + 48*s, y + 36*s)],
                      outline=color_with_alpha, width=max(1, int(2*s)))
        # Bands
        for offset in [20, 26, 32, 38]:
            draw.line([(x + offset*s, y + 28*s), (x + offset*s, y + 36*s)],
                     fill=color_with_alpha, width=max(1, int(s)))
        # Leads
        draw.line([(x + 8*s, y + 32*s), (x + 16*s, y + 32*s)], fill=color_with_alpha, width=max(1, int(2*s)))
        draw.line([(x + 48*s, y + 32*s), (x + 56*s, y + 32*s)], fill=color_with_alpha, width=max(1, int(2*s)))

def generate_banner():
    width = 1200
    height = 630

    # Dark slate background matching site
    img = Image.new('RGBA', (width, height), (15, 23, 42, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    # Gradient overlay (purple to cyan to pink)
    gradient = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(gradient, 'RGBA')

    # Create vertical gradient bands
    for i in range(width):
        # Purple (left) -> Cyan (middle) -> Pink (right)
        ratio = i / width
        if ratio < 0.5:
            # Purple to Cyan
            t = ratio * 2
            r = int(102 + (14 - 102) * t)
            g = int(126 + (165 - 126) * t)
            b = int(234 + (233 - 234) * t)
        else:
            # Cyan to Pink
            t = (ratio - 0.5) * 2
            r = int(14 + (244 - 14) * t)
            g = int(165 + (114 - 165) * t)
            b = int(233 + (182 - 233) * t)

        alpha = int(25 + 10 * abs(ratio - 0.5) * 2)  # More opaque in center
        grad_draw.line([(i, 0), (i, height)], fill=(r, g, b, alpha))

    img = Image.alpha_composite(img, gradient)

    # Add floating tech icons (matching site style)
    icon_types = ['chip', 'terminal', 'wave', 'resistor']
    icon_positions = [
        # Scattered background icons
        (80, 80, 48, 'chip', (102, 126, 234), 0.08),
        (180, 450, 32, 'terminal', (14, 165, 233), 0.12),
        (950, 120, 56, 'wave', (244, 114, 182), 0.10),
        (1050, 500, 40, 'resistor', (102, 126, 234), 0.09),
        (280, 150, 24, 'chip', (14, 165, 233), 0.15),
        (920, 380, 36, 'terminal', (244, 114, 182), 0.11),
        (120, 520, 28, 'wave', (102, 126, 234), 0.13),
        (1100, 250, 32, 'chip', (14, 165, 233), 0.10),
    ]

    for x, y, size, icon, color, opacity in icon_positions:
        draw_icon(draw, x, y, size, icon, color, opacity)

    # Load and place logo
    try:
        logo = Image.open('docs/brand/Logo.png').convert('RGBA')
        # Resize logo to much larger size (keep aspect ratio)
        logo_height = 340
        aspect = logo.width / logo.height
        logo_width = int(logo_height * aspect)
        logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)

        # Position logo on left side - centered vertically
        logo_x = 40
        logo_y = (height - logo_height) // 2

        # Add bright glow behind logo for visibility on dark background
        glow = logo.copy()
        glow = glow.filter(ImageFilter.GaussianBlur(radius=30))
        # Paste glow multiple times for stronger effect
        img.paste(glow, (logo_x, logo_y), glow)
        img.paste(glow, (logo_x, logo_y), glow)
        img.paste(glow, (logo_x, logo_y), glow)

        # Paste actual logo on top
        img.paste(logo, (logo_x, logo_y), logo)
    except Exception as e:
        print(f"Warning: Could not load logo: {e}")
        # Fallback: draw simple JW text
        try:
            font_logo = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 140)
            draw.text((100, 250), 'JW', font=font_logo, fill=(14, 165, 233, 255))
        except:
            pass

    # Text content on right side
    text_x = 480

    # Try to load proper fonts (Poppins for heading, Inter for body)
    try:
        # These might not be available locally, so we'll use DejaVu as fallback
        font_name = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 60)
        font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 30)
        font_subtitle = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 21)
    except:
        font_name = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()

    # Redraw on RGBA image
    draw = ImageDraw.Draw(img, 'RGBA')

    # Name (white, bold)
    draw.text((text_x, 230), 'Josh Wentworth', font=font_name, fill=(255, 255, 255, 255))

    # Title (muted gray)
    draw.text((text_x, 315), 'Multidisciplinary Engineer', font=font_title, fill=(148, 163, 184, 255))

    # Specialties (brand cyan)
    draw.text((text_x, 375), 'Software × Hardware × Fabrication', font=font_subtitle, fill=(14, 165, 233, 255))

    # Convert to RGB for JPEG
    img_rgb = Image.new('RGB', (width, height), (15, 23, 42))
    img_rgb.paste(img, (0, 0), img)

    # Save
    output_path = 'web/static/banner.jpg'
    img_rgb.save(output_path, 'JPEG', quality=95, optimize=True)
    print(f'✓ Generated banner: {output_path}')
    print(f'  Size: {width}x{height}')
    print(f'  Features: Logo, gradient overlay, floating tech icons')

if __name__ == '__main__':
    os.chdir('/home/jdubz/Development/portfolio')
    generate_banner()
