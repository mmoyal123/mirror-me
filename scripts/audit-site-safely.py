from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT / "SITE_AUDIT_REPORT.md"

PAGES = [
    "index.html",
    "formats.html",
    "vision.html",
    "territoires.html",
    "links.html",
    "coaching.html",
    "guide.html",
]


def read(path):
    return path.read_text(encoding="utf-8", errors="replace")


def count(pattern, text):
    return len(re.findall(pattern, text, flags=re.I | re.S))


def main():
    lines = []
    lines.append("# SITE AUDIT REPORT — MIRROR ME")
    lines.append("")
    lines.append("This report is read-only. No HTML page is modified by this audit.")
    lines.append("")

    for page in PAGES:
        path = ROOT / page
        lines.append(f"## {page}")
        if not path.exists():
            lines.append("- Status: missing")
            lines.append("")
            continue

        html = read(path)
        stripped = html.strip()

        lines.append(f"- Characters: {len(html)}")
        lines.append(f"- Empty: {'yes' if not stripped else 'no'}")
        lines.append(f"- Inline <style> blocks: {count(r'<style[^>]*>', html)}")
        lines.append(f"- Stylesheet links: {count(r'<link[^>]+rel=[\"\']stylesheet[\"\']', html)}")
        lines.append(f"- <script> blocks: {count(r'<script[^>]*>', html)}")
        lines.append(f"- <nav> present: {'yes' if '<nav' in html.lower() and '</nav>' in html.lower() else 'no'}")
        lines.append(f"- <footer> present: {'yes' if '<footer' in html.lower() and '</footer>' in html.lower() else 'no'}")
        lines.append(f"- <!DOCTYPE html> count: {count(r'<!doctype html>', html)}")
        lines.append(f"- <html> count: {count(r'<html', html)}")
        lines.append(f"- Data image/base64 present: {'yes' if 'base64,' in html else 'no'}")
        lines.append(f"- Placeholder nav/footer detected: {'yes' if '...</nav>' in html or '<footer>...</footer>' in html else 'no'}")
        lines.append("")

    lines.append("## Safety recommendation")
    lines.append("- Do not migrate a file if it is empty.")
    lines.append("- Do not migrate a file if it contains placeholder navigation or footer.")
    lines.append("- Do not migrate a file if it contains duplicated <!DOCTYPE html> or duplicated <html> roots before manual cleanup.")
    lines.append("- Extract CSS only after the page structure has been confirmed complete.")
    lines.append("")

    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
