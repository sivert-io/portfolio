"""Utility script to generate scaled, inverted, and vector variants of the site logo."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable, List, Sequence, Tuple

import cv2
import numpy as np
import svgwrite
from PIL import Image, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_LOGO = PROJECT_ROOT / "public" / "logo.png"
UPSCALED_LOGO = SOURCE_LOGO.with_name("logo@4x.png")
INVERTED_LOGO = SOURCE_LOGO.with_name("logo-inverted.png")
UPSCALED_INVERTED_LOGO = SOURCE_LOGO.with_name("logo-inverted@4x.png")
SVG_LOGO = SOURCE_LOGO.with_suffix(".svg")
SVG_LOGO_INVERTED = SOURCE_LOGO.with_name("logo-inverted.svg")

# Single place to tweak defaults
UPSCALE_FACTOR = 4
# Alpha threshold to decide whether a pixel belongs to the glyph
ALPHA_THRESHOLD = 12
# How aggressively contours are simplified when converted into SVG paths
CONTOUR_SIMPLIFICATION_RATIO = 0.0012
# Blur sigma used to soften the alpha mask before tracing
MASK_GAUSSIAN_SIGMA = 1.5
# Morphological kernel size for gently closing gaps
MASK_MORPH_KERNEL = (3, 3)
# Number of morphology iterations to apply
MASK_MORPH_ITERATIONS = 1


def ensure_source_exists() -> None:
    if not SOURCE_LOGO.exists():
        raise FileNotFoundError(
            f"Could not locate {SOURCE_LOGO}. Please ensure the logo is in place."
        )


def load_logo() -> Image.Image:
    """Load the source logo as an RGBA Pillow Image."""
    image = Image.open(SOURCE_LOGO)
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    return image


def invert_rgba(image: Image.Image) -> Image.Image:
    """Invert the RGB channels while keeping the alpha channel untouched."""
    if image.mode != "RGBA":
        image = image.convert("RGBA")

    r, g, b, a = image.split()
    inverted_rgb = ImageOps.invert(Image.merge("RGB", (r, g, b)))
    return Image.merge("RGBA", (*inverted_rgb.split(), a))


def upscale_logo(image: Image.Image) -> Image.Image:
    """Return a 4x upscaled version of the logo."""
    new_size = (image.width * UPSCALE_FACTOR, image.height * UPSCALE_FACTOR)
    return image.resize(new_size, Image.Resampling.LANCZOS)


def alpha_mask(image: Image.Image) -> np.ndarray:
    """Create a binary mask from the alpha channel to identify glyph pixels."""
    alpha = np.array(image)[..., 3]
    mask = (alpha >= ALPHA_THRESHOLD).astype(np.uint8) * 255
    return mask


def smooth_mask(mask: np.ndarray) -> np.ndarray:
    """Apply gentle morphological closing and blurring to smooth the mask edges."""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, MASK_MORPH_KERNEL)
    smoothed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=MASK_MORPH_ITERATIONS)
    smoothed = cv2.GaussianBlur(smoothed, (0, 0), sigmaX=MASK_GAUSSIAN_SIGMA)
    _, refined = cv2.threshold(smoothed, 127, 255, cv2.THRESH_BINARY)
    return refined


def mask_bounding_box(mask: np.ndarray) -> Tuple[int, int, int, int]:
    """Return (y_min, y_max, x_min, x_max) bounds of non-zero mask pixels."""
    ys, xs = np.where(mask > 0)
    if ys.size == 0 or xs.size == 0:
        height, width = mask.shape
        return 0, height - 1, 0, width - 1
    return int(ys.min()), int(ys.max()), int(xs.min()), int(xs.max())


def weighted_fill_color(image: Image.Image, mask: np.ndarray) -> str:
    """Estimate the predominant fill colour of the logo based on visible pixels."""
    rgba = np.array(image, dtype=np.float32)
    alpha = rgba[..., 3] / 255.0
    masked = mask.astype(bool)

    weights = alpha[masked]
    if weights.size == 0:
        # Fallback to black if nothing is visible
        return "#000000"

    rgb = rgba[..., :3][masked]
    weighted_rgb = np.sum(rgb * weights[:, None], axis=0) / np.sum(weights)
    rounded = np.clip(np.rint(weighted_rgb), 0, 255).astype(np.uint8)
    return "#{:02X}{:02X}{:02X}".format(*rounded.tolist())


def invert_hex_colour(fill_hex: str) -> str:
    """Compute the inverted colour for a given hex string (#RRGGBB)."""
    colour = fill_hex.lstrip("#")
    r = 255 - int(colour[0:2], 16)
    g = 255 - int(colour[2:4], 16)
    b = 255 - int(colour[4:6], 16)
    return "#{:02X}{:02X}{:02X}".format(r, g, b)


def simplify_contour(contour: np.ndarray) -> np.ndarray:
    """Simplify contour using the Douglas-Peucker algorithm."""
    perimeter = cv2.arcLength(contour, True)
    epsilon = max(perimeter * CONTOUR_SIMPLIFICATION_RATIO, 0.5)
    approximation = cv2.approxPolyDP(contour, epsilon, True)
    return approximation if len(approximation) >= 3 else contour


def catmull_rom_to_bezier(points: np.ndarray) -> Sequence[Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]]:
    """Convert a closed Catmull-Rom spline to cubic Bezier control points."""
    n = len(points)
    if n < 3:
        return []

    beziers: List[Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]] = []
    for i in range(n):
        p0 = points[(i - 1) % n]
        p1 = points[i]
        p2 = points[(i + 1) % n]
        p3 = points[(i + 2) % n]

        b1 = p1 + (p2 - p0) / 6.0
        b2 = p2 - (p3 - p1) / 6.0
        beziers.append((p1, b1, b2, p2))
    return beziers


def contour_to_path_commands(contour: np.ndarray) -> List[str]:
    """Convert a simplified contour to SVG path commands with cubic curves."""
    contour = contour.squeeze(axis=1).astype(np.float32)
    if contour.ndim != 2 or len(contour) < 3:
        return []

    beziers = catmull_rom_to_bezier(contour)
    if not beziers:
        return []

    start_x, start_y = beziers[0][0]
    commands = [f"M {start_x:.2f} {start_y:.2f}"]
    for _, c1, c2, p in beziers:
        commands.append(f"C {c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p[0]:.2f} {p[1]:.2f}")
    commands.append("Z")
    return commands


def build_svg_paths(contours: Iterable[np.ndarray], hierarchy: np.ndarray | None) -> List[List[str]]:
    """Group contours (handling holes) into path command lists."""
    contours = list(contours)
    if not contours:
        return []

    if hierarchy is None:
        return [contour_to_path_commands(simplify_contour(cnt)) for cnt in contours]

    hierarchy = hierarchy[0]
    paths: List[List[str]] = []

    def collect(idx: int, accumulator: List[str]) -> None:
        commands = contour_to_path_commands(simplify_contour(contours[idx]))
        if commands:
            accumulator.extend(commands)
        child = hierarchy[idx][2]
        while child != -1:
            collect(child, accumulator)
            child = hierarchy[child][0]

    for idx, node in enumerate(hierarchy):
        parent = node[3]
        if parent != -1:
            continue
        commands: List[str] = []
        collect(idx, commands)
        if commands:
            paths.append(commands)

    return paths


def write_svg(mask: np.ndarray, svg_path: Path, fill_hex: str, background: str | None = None) -> None:
    """Create an SVG file from the alpha mask contours."""
    height, width = mask.shape
    contours, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    path_groups = [commands for commands in build_svg_paths(contours, hierarchy) if commands]

    drawing = svgwrite.Drawing(
        str(svg_path),
        size=(width, height),
        viewBox=f"0 0 {width} {height}",
        profile="tiny",
    )

    if background:
        drawing.add(
            drawing.rect(
                insert=(0, 0),
                size=(width, height),
                fill=background,
            )
        )

    for commands in path_groups:
        drawing.add(
            drawing.path(
                d=" ".join(commands),
                fill=fill_hex,
                stroke="none",
                fill_rule="evenodd",
            )
        )

    drawing.save()


def main() -> None:
    ensure_source_exists()

    logo = load_logo()
    mask = alpha_mask(logo)
    smoothed_mask = smooth_mask(mask)
    y_min, y_max, x_min, x_max = mask_bounding_box(smoothed_mask)
    crop_box = (x_min, y_min, x_max + 1, y_max + 1)

    cropped_logo = logo.crop(crop_box)
    cropped_mask = mask[y_min : y_max + 1, x_min : x_max + 1]
    cropped_smoothed_mask = smoothed_mask[y_min : y_max + 1, x_min : x_max + 1]

    # Generate and persist the 4x upscale
    upscaled_logo = upscale_logo(cropped_logo)
    upscaled_logo.save(UPSCALED_LOGO)
    # Generate inverted PNG
    inverted_logo = invert_rgba(cropped_logo)
    inverted_logo.save(INVERTED_LOGO)
    upscale_logo(inverted_logo).save(UPSCALED_INVERTED_LOGO)

    # Determine dominant fill colour and its inverse
    fill_hex = weighted_fill_color(cropped_logo, cropped_mask)
    inverted_hex = invert_hex_colour(fill_hex)

    # Export vector variants
    write_svg(cropped_smoothed_mask, SVG_LOGO, fill_hex)
    write_svg(cropped_smoothed_mask, SVG_LOGO_INVERTED, inverted_hex)

    print("Generated assets:")
    for path in (
        UPSCALED_LOGO,
        UPSCALED_INVERTED_LOGO,
        INVERTED_LOGO,
        SVG_LOGO,
        SVG_LOGO_INVERTED,
    ):
        print(f" - {path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()

