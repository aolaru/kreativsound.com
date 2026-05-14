from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "mockups"


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                "/System/Library/Fonts/Supplemental/Helvetica.ttc",
                "/Library/Fonts/Arial Bold.ttf",
            ]
        )
    else:
        candidates.extend(
            [
                "/System/Library/Fonts/Supplemental/Arial.ttf",
                "/System/Library/Fonts/Supplemental/Helvetica.ttc",
                "/Library/Fonts/Arial.ttf",
            ]
        )

    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)

    return ImageFont.load_default()


def rounded_box(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill, outline=None, width: int = 1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    width, height = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(height):
        t = y / max(height - 1, 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(width):
            px[x, y] = color
    return img


def add_blur_blob(base: Image.Image, xy: tuple[int, int], radius: int, color: tuple[int, int, int, int]):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x, y = xy
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
    layer = layer.filter(ImageFilter.GaussianBlur(radius=60))
    base.alpha_composite(layer)


def draw_text(draw: ImageDraw.ImageDraw, xy, text, font, fill):
    draw.text(xy, text, font=font, fill=fill)


def make_ui_mockup() -> Path:
    size = (1600, 1000)
    base = vertical_gradient(size, (18, 22, 31), (9, 12, 19)).convert("RGBA")
    add_blur_blob(base, (220, 220), 180, (234, 102, 64, 90))
    add_blur_blob(base, (1320, 220), 220, (67, 189, 174, 85))
    add_blur_blob(base, (1120, 860), 210, (255, 190, 92, 65))

    draw = ImageDraw.Draw(base)
    title_font = load_font(34, bold=True)
    h2_font = load_font(24, bold=True)
    body_font = load_font(20)
    small_font = load_font(16)
    badge_font = load_font(15, bold=True)

    rounded_box(draw, (50, 42, 1550, 958), 30, (14, 18, 27, 228), outline=(255, 255, 255, 32))
    rounded_box(draw, (78, 78, 362, 922), 24, (20, 25, 36, 225), outline=(255, 255, 255, 18))
    rounded_box(draw, (392, 78, 1086, 922), 24, (20, 25, 36, 205), outline=(255, 255, 255, 18))
    rounded_box(draw, (1116, 78, 1522, 922), 24, (20, 25, 36, 215), outline=(255, 255, 255, 18))

    draw_text(draw, (116, 116), "PRESETMUTATOR", title_font, (245, 247, 250))
    draw_text(draw, (118, 166), "Generate new synth presets from curated seeds", body_font, (155, 164, 179))

    nav_items = [
        ("Synths", True),
        ("Library", False),
        ("Generate", False),
        ("Exports", False),
        ("Adapter Status", False),
    ]
    y = 270
    for label, active in nav_items:
        if active:
            rounded_box(draw, (102, y - 10, 338, y + 34), 14, (236, 116, 72, 34), outline=(236, 116, 72, 110))
        draw_text(draw, (126, y), label, load_font(22, bold=active), (244, 246, 248) if active else (170, 179, 193))
        y += 74

    rounded_box(draw, (102, 744, 338, 896), 18, (27, 33, 47, 255), outline=(255, 255, 255, 18))
    draw_text(draw, (122, 772), "V1 Synths", badge_font, (255, 198, 126))
    draw.multiline_text((122, 806), "Vital\nSerum\nPigments", font=body_font, fill=(233, 236, 240), spacing=12)

    draw_text(draw, (520, 136), "Choose Synth", h2_font, (246, 247, 250))
    synth_cards = [
        ("Vital", "Reference adapter", (84, 186, 255)),
        ("Serum", "Planned", (255, 139, 90)),
        ("Pigments", "Planned", (116, 206, 153)),
    ]
    x = 430
    for name, status, accent in synth_cards:
        rounded_box(draw, (x, 186, x + 190, 306), 22, (25, 32, 45, 255), outline=accent + (150,))
        rounded_box(draw, (x + 18, 204, x + 70, 256), 16, accent + (255,), outline=None)
        draw_text(draw, (x + 90, 210), name, load_font(28, bold=True), (244, 246, 248))
        draw_text(draw, (x + 90, 248), status, small_font, (171, 180, 193))
        x += 212

    draw_text(draw, (430, 366), "Bundled Seed Presets", h2_font, (246, 247, 250))
    presets = [
        ("Glass Coast", "Pad", "Soft digital bloom"),
        ("Carbon Pluck", "Pluck", "Tight transient, bright tail"),
        ("Dust Choir", "Texture", "Noisy vocal shimmer"),
        ("Neon Root", "Bass", "Mono, punchy low-end"),
    ]
    y = 410
    for name, tag, desc in presets:
        rounded_box(draw, (430, y, 1048, y + 96), 20, (24, 30, 42, 255), outline=(255, 255, 255, 16))
        rounded_box(draw, (454, y + 24, 534, y + 58), 12, (54, 76, 101, 255))
        draw_text(draw, (476, y + 30), tag.upper(), badge_font, (155, 219, 255))
        draw_text(draw, (560, y + 22), name, load_font(25, bold=True), (243, 245, 247))
        draw_text(draw, (560, y + 56), desc, small_font, (165, 174, 188))
        y += 112

    draw_text(draw, (1148, 120), "Generation", h2_font, (246, 247, 250))
    controls = [
        ("Synth", "Vital"),
        ("Intensity", "Balanced"),
        ("Style", "Harmonic Drift"),
        ("Variants", "8"),
        ("Seed", "21477"),
    ]
    y = 172
    for label, value in controls:
        draw_text(draw, (1148, y), label, small_font, (162, 171, 185))
        rounded_box(draw, (1148, y + 26, 1490, y + 82), 16, (27, 33, 47, 255), outline=(255, 255, 255, 18))
        draw_text(draw, (1172, y + 43), value, body_font, (244, 246, 248))
        y += 102

    rounded_box(draw, (1148, 686, 1490, 754), 18, (238, 113, 74, 255), outline=None)
    draw_text(draw, (1246, 708), "Generate Variants", load_font(24, bold=True), (255, 247, 243))
    rounded_box(draw, (1148, 780, 1490, 890), 18, (27, 33, 47, 255), outline=(255, 255, 255, 18))
    draw_text(draw, (1172, 806), "Result Preview", badge_font, (255, 202, 135))
    draw_text(draw, (1172, 842), "8 files ready\nsemantic-first mutation\nsafe export as .vital", body_font, (232, 236, 241))

    path = OUTPUT / "presetmutator-ui-mockup.png"
    base.save(path)
    return path


def make_concept_sheet() -> Path:
    size = (1400, 1800)
    img = vertical_gradient(size, (248, 244, 238), (231, 226, 217)).convert("RGBA")
    add_blur_blob(img, (210, 250), 140, (236, 116, 72, 70))
    add_blur_blob(img, (1150, 310), 200, (65, 176, 168, 50))

    draw = ImageDraw.Draw(img)
    title_font = load_font(52, bold=True)
    h2_font = load_font(28, bold=True)
    body_font = load_font(22)
    small_font = load_font(18)

    draw_text(draw, (96, 92), "PRESETMUTATOR", title_font, (25, 27, 33))
    draw_text(draw, (98, 164), "Desktop app concept for generating synth presets from curated seed libraries", body_font, (82, 89, 98))

    rounded_box(draw, (86, 234, 1314, 738), 28, (250, 250, 250, 240), outline=(40, 45, 52, 20))
    draw_text(draw, (120, 270), "How It Works", h2_font, (26, 30, 36))
    steps = [
        ("1", "Choose synth", "Start with Vital, then Serum and Pigments."),
        ("2", "Pick seed presets", "Browse bundled original presets you provide."),
        ("3", "Set mutation profile", "Subtle, balanced, adventurous, or wild."),
        ("4", "Generate and export", "Write valid preset files without requiring the plugin."),
    ]
    x = 120
    for n, title, desc in steps:
        rounded_box(draw, (x, 334, x + 256, 644), 22, (243, 238, 232, 255), outline=(35, 41, 47, 18))
        rounded_box(draw, (x + 26, 360, x + 82, 416), 18, (236, 116, 72, 255))
        draw_text(draw, (x + 46, 372), n, load_font(24, bold=True), (255, 248, 243))
        draw_text(draw, (x + 26, 454), title, load_font(26, bold=True), (26, 30, 36))
        draw.multiline_text((x + 26, 500), desc, font=small_font, fill=(84, 90, 99), spacing=6)
        x += 294

    rounded_box(draw, (86, 784, 694, 1660), 28, (250, 250, 250, 240), outline=(40, 45, 52, 20))
    rounded_box(draw, (730, 784, 1314, 1660), 28, (250, 250, 250, 240), outline=(40, 45, 52, 20))

    draw_text(draw, (120, 826), "Core Product Shape", h2_font, (26, 30, 36))
    left_lines = [
        "Desktop app with a modern local UI",
        "Works without the target synth being installed",
        "Ships with curated seed presets",
        "One synth adapter per supported plugin",
        "Hybrid mutation biased toward semantic changes",
        "Exports individual preset files first",
    ]
    y = 886
    for line in left_lines:
        rounded_box(draw, (120, y + 6, 138, y + 24), 9, (236, 116, 72, 255))
        draw_text(draw, (158, y), line, body_font, (54, 59, 66))
        y += 92

    draw_text(draw, (764, 826), "Vital First", h2_font, (26, 30, 36))
    right_lines = [
        "Vital is the reference adapter for v1.",
        "Likely JSON-like .vital preset structure.",
        "Semantic-first mutation for safe parameter groups.",
        "Preserve unknown keys and protected metadata.",
        "Manual validation inside the real synth is possible.",
    ]
    y = 886
    for line in right_lines:
        rounded_box(draw, (764, y + 6, 782, y + 24), 9, (76, 178, 167, 255))
        draw_text(draw, (802, y), line, body_font, (54, 59, 66))
        y += 102

    footer = "Deliverables in this concept pass: UI mockup PNG plus one-page PDF overview."
    draw_text(draw, (96, 1712), footer, small_font, (95, 101, 110))

    png_path = OUTPUT / "presetmutator-concept-sheet.png"
    pdf_path = OUTPUT / "presetmutator-concept-sheet.pdf"
    rgb = img.convert("RGB")
    rgb.save(png_path)
    rgb.save(pdf_path, "PDF", resolution=150.0)
    return pdf_path


def make_ui_mockup_light_future() -> Path:
    size = (1600, 1000)
    base = vertical_gradient(size, (242, 249, 255), (228, 240, 248)).convert("RGBA")
    add_blur_blob(base, (190, 140), 170, (88, 227, 194, 95))
    add_blur_blob(base, (1300, 180), 180, (115, 150, 255, 90))
    add_blur_blob(base, (1080, 820), 220, (255, 148, 92, 75))

    draw = ImageDraw.Draw(base)
    title_font = load_font(34, bold=True)
    h1_font = load_font(30, bold=True)
    h2_font = load_font(22, bold=True)
    body_font = load_font(20)
    small_font = load_font(16)
    badge_font = load_font(14, bold=True)

    rounded_box(draw, (42, 34, 1558, 966), 36, (255, 255, 255, 164), outline=(255, 255, 255, 188), width=2)
    rounded_box(draw, (72, 72, 336, 928), 30, (250, 253, 255, 188), outline=(255, 255, 255, 205))
    rounded_box(draw, (362, 72, 1098, 928), 30, (252, 254, 255, 174), outline=(255, 255, 255, 205))
    rounded_box(draw, (1122, 72, 1528, 928), 30, (248, 252, 255, 184), outline=(255, 255, 255, 205))

    draw_text(draw, (108, 112), "PRESETMUTATOR", title_font, (16, 32, 56))
    draw_text(draw, (110, 162), "Preset generation for modern synth workflows", body_font, (92, 107, 124))

    rounded_box(draw, (98, 222, 306, 266), 18, (21, 136, 255, 255))
    draw_text(draw, (122, 232), "Generate", load_font(21, bold=True), (244, 250, 255))

    nav = ["Synths", "Seeds", "Style Engine", "Results", "Export"]
    y = 324
    for label in nav:
        rounded_box(draw, (96, y - 8, 312, y + 40), 18, (255, 255, 255, 116), outline=(214, 226, 237, 190))
        draw_text(draw, (122, y + 4), label, load_font(20, bold=True), (44, 64, 92))
        y += 74

    rounded_box(draw, (96, 728, 312, 892), 22, (20, 30, 48, 228))
    draw_text(draw, (120, 772), "V1 SYNTHS", badge_font, (120, 229, 211))
    draw.multiline_text((120, 804), "Vital\nSerum\nPigments", font=body_font, fill=(240, 246, 252), spacing=12)

    draw_text(draw, (540, 112), "Future Light Interface", h1_font, (20, 34, 54))
    draw_text(draw, (540, 154), "Synth-first workflow with curated seeds and guided mutation.", body_font, (94, 108, 124))

    draw_text(draw, (404, 226), "Synth Lane", h2_font, (36, 54, 79))
    cards = [
        ("Vital", "Active reference adapter", (0, 194, 163), (227, 255, 247)),
        ("Serum", "Queued for next adapter", (53, 126, 255), (233, 241, 255)),
        ("Pigments", "Queued for next adapter", (255, 122, 73), (255, 238, 230)),
    ]
    x = 404
    for title, subtitle, accent, fill in cards:
        rounded_box(draw, (x, 262, x + 216, 398), 28, fill + (255,), outline=accent + (160,), width=2)
        rounded_box(draw, (x + 24, 286, x + 78, 340), 18, accent + (255,))
        draw_text(draw, (x + 98, 286), title, load_font(28, bold=True), (24, 38, 60))
        draw_text(draw, (x + 98, 328), subtitle, small_font, (100, 113, 128))
        x += 232

    draw_text(draw, (404, 448), "Seed Constellation", h2_font, (36, 54, 79))
    seed_cards = [
        ("GLASS COAST", "Pad", "lush high shimmer"),
        ("CARBON PLUCK", "Pluck", "short hit, bright tail"),
        ("DUST CHOIR", "Texture", "breathy and unstable"),
        ("NEON ROOT", "Bass", "centered, firm low end"),
    ]
    y = 486
    for name, tag, desc in seed_cards:
        rounded_box(draw, (404, y, 1060, y + 104), 26, (255, 255, 255, 146), outline=(214, 226, 237, 190))
        rounded_box(draw, (426, y + 24, 522, y + 58), 16, (19, 37, 58, 242))
        draw_text(draw, (448, y + 32), tag, badge_font, (125, 233, 216))
        draw_text(draw, (544, y + 22), name, load_font(24, bold=True), (24, 38, 60))
        draw_text(draw, (544, y + 56), desc, small_font, (103, 116, 132))
        y += 118

    rounded_box(draw, (1148, 108, 1500, 300), 28, (18, 33, 54, 232))
    draw_text(draw, (1176, 136), "Mutation Core", h2_font, (242, 247, 252))
    draw_text(draw, (1176, 182), "semantic-first\nsafe structural fallback\npreset-valid export", body_font, (191, 211, 228))

    draw_text(draw, (1148, 344), "Control Surface", h2_font, (36, 54, 79))
    controls = [
        ("Synth", "Vital"),
        ("Intensity", "Balanced"),
        ("Style", "Harmonic Drift"),
        ("Variants", "12"),
        ("Seed", "21477"),
    ]
    y = 382
    for label, value in controls:
        draw_text(draw, (1148, y), label, small_font, (97, 112, 129))
        rounded_box(draw, (1148, y + 24, 1492, y + 82), 18, (255, 255, 255, 150), outline=(210, 223, 235, 195))
        draw_text(draw, (1172, y + 42), value, body_font, (24, 38, 60))
        y += 98

    rounded_box(draw, (1148, 810, 1492, 884), 24, (0, 199, 167, 255))
    draw_text(draw, (1220, 833), "Generate Futures", load_font(24, bold=True), (242, 255, 252))

    path = OUTPUT / "presetmutator-ui-mockup-light-future.png"
    base.save(path)
    return path


def make_concept_sheet_light_future() -> Path:
    size = (1400, 1800)
    img = vertical_gradient(size, (244, 249, 255), (230, 241, 248)).convert("RGBA")
    add_blur_blob(img, (180, 180), 180, (90, 219, 191, 80))
    add_blur_blob(img, (1170, 240), 190, (100, 146, 255, 70))
    add_blur_blob(img, (1120, 1420), 220, (255, 144, 98, 65))

    draw = ImageDraw.Draw(img)
    title_font = load_font(50, bold=True)
    h2_font = load_font(28, bold=True)
    body_font = load_font(22)
    small_font = load_font(18)

    draw_text(draw, (96, 92), "PRESETMUTATOR / LIGHT FUTURE", title_font, (18, 34, 56))
    draw_text(draw, (98, 164), "A brighter product direction for synth selection, seed browsing, and guided generation.", body_font, (86, 102, 120))

    rounded_box(draw, (86, 234, 1314, 686), 30, (255, 255, 255, 176), outline=(255, 255, 255, 205), width=2)
    draw_text(draw, (120, 272), "Design Direction", h2_font, (26, 42, 66))
    bullets = [
        "Lighter glassmorphism instead of dense dark panels",
        "Sharper accent palette: cyan, blue, and ember orange",
        "Interface feels more like a synth instrument dashboard",
        "Generation controls are isolated as a control surface",
    ]
    y = 334
    for bullet in bullets:
        rounded_box(draw, (120, y + 8, 138, y + 26), 9, (0, 194, 163, 255))
        draw_text(draw, (158, y), bullet, body_font, (54, 70, 90))
        y += 86

    rounded_box(draw, (86, 736, 694, 1660), 30, (255, 255, 255, 170), outline=(255, 255, 255, 205), width=2)
    rounded_box(draw, (730, 736, 1314, 1660), 30, (18, 33, 54, 228))

    draw_text(draw, (120, 780), "Screen Structure", h2_font, (26, 42, 66))
    left_lines = [
        "Left rail keeps navigation minimal and legible.",
        "Center panel focuses on synth choice and curated seeds.",
        "Right panel acts like a control surface for mutation.",
        "Primary CTA is visually isolated for confidence.",
        "Vital stays the first-class starting experience.",
    ]
    y = 846
    for line in left_lines:
        rounded_box(draw, (120, y + 6, 138, y + 24), 9, (77, 131, 255, 255))
        draw.multiline_text((158, y), line, font=body_font, fill=(57, 72, 90), spacing=5)
        y += 118

    draw_text(draw, (764, 780), "Why This Feels Better", h2_font, (241, 247, 252))
    right_lines = [
        "More premium and less admin-tool.",
        "Closer to music software aesthetics.",
        "Better contrast hierarchy for core actions.",
        "Leaves room for future waveform or macro visuals.",
        "Still implementable as a pragmatic Tauri app UI.",
    ]
    y = 846
    for line in right_lines:
        rounded_box(draw, (764, y + 6, 782, y + 24), 9, (120, 229, 211, 255))
        draw.multiline_text((802, y), line, font=body_font, fill=(226, 235, 244), spacing=5)
        y += 118

    draw_text(draw, (96, 1714), "This redesign is a style direction update, not a workflow change.", small_font, (94, 109, 125))

    png_path = OUTPUT / "presetmutator-concept-sheet-light-future.png"
    pdf_path = OUTPUT / "presetmutator-concept-sheet-light-future.pdf"
    rgb = img.convert("RGB")
    rgb.save(png_path)
    rgb.save(pdf_path, "PDF", resolution=150.0)
    return pdf_path


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    ui_path = make_ui_mockup()
    pdf_path = make_concept_sheet()
    future_ui_path = make_ui_mockup_light_future()
    future_pdf_path = make_concept_sheet_light_future()
    print(ui_path)
    print(pdf_path)
    print(future_ui_path)
    print(future_pdf_path)


if __name__ == "__main__":
    main()
