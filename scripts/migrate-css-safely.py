from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

PAGES = [
    "index.html",
    "formats.html",
    "vision.html",
    "territoires.html",
    "links.html",
]

STYLE_PATH = ROOT / "style.css"
REPORT_PATH = ROOT / "MIGRATION_REPORT.md"


def read(path):
    return path.read_text(encoding="utf-8")


def write(path, content):
    path.write_text(content, encoding="utf-8")


def extract_first_style(html):
    match = re.search(r"<style[^>]*>(.*?)</style>", html, flags=re.S | re.I)
    if not match:
        return None, html
    css = match.group(1).strip()
    html_without_style = html[:match.start()] + '<link rel="stylesheet" href="style.css"/>' + html[match.end():]
    return css, html_without_style


def has_forbidden_placeholder(html):
    forbidden = [
        "<nav id=\"nav\">...</nav>",
        "<footer>...</footer>",
        "<nav id=\"nav\">\n        </nav>",
        "<footer>\n        </footer>",
    ]
    return any(item in html for item in forbidden)


def main():
    report = []
    report.append("# Safe CSS Migration Report\n")
    report.append("This migration extracts real inline CSS only when the HTML file has a complete structure.\n")

    css_blocks = []
    updated_pages = []
    skipped_pages = []

    for page in PAGES:
        path = ROOT / page
        if not path.exists():
            skipped_pages.append((page, "file not found"))
            continue

        html = read(path)

        if has_forbidden_placeholder(html):
            skipped_pages.append((page, "forbidden placeholder detected"))
            continue

        if "<nav" not in html or "</nav>" not in html:
            skipped_pages.append((page, "navigation missing or incomplete"))
            continue

        css, new_html = extract_first_style(html)
        if not css:
            skipped_pages.append((page, "no inline style block found"))
            continue

        css_blocks.append(f"/* === Source: {page} === */\n{css}\n")
        write(path, new_html)
        updated_pages.append(page)

    if css_blocks:
        existing = ""
        if STYLE_PATH.exists():
            existing = read(STYLE_PATH).strip() + "\n\n"
        write(STYLE_PATH, existing + "\n\n".join(css_blocks).strip() + "\n")

    report.append("## Updated pages\n")
    if updated_pages:
        for page in updated_pages:
            report.append(f"- {page}")
    else:
        report.append("- None")

    report.append("\n## Skipped pages\n")
    if skipped_pages:
        for page, reason in skipped_pages:
            report.append(f"- {page}: {reason}")
    else:
        report.append("- None")

    report.append("\n## Safety rules applied\n")
    report.append("- No file with placeholder nav/footer is migrated.")
    report.append("- No file without complete navigation is migrated.")
    report.append("- Only the first inline <style> block is extracted.")
    report.append("- HTML content, images, IDs and scripts are otherwise preserved.")

    write(REPORT_PATH, "\n".join(report) + "\n")


if __name__ == "__main__":
    main()
