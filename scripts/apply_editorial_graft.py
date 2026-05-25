from pathlib import Path
import re

PAGES = {
    "index.html": {
        "meta": "Passer de la compréhension d’un schéma à sa résolution. Mirror Me aide à identifier les mécanismes défensifs et à construire de nouveaux modes de réponse.",
        "h1": "Passer de la compréhension à la résolution.",
    },
    "vision.html": {
        "meta": "La conscience ne suffit pas. Mirror Me travaille l’intelligence relationnelle comme une structure : mécanismes, posture, réponses et bascule concrète.",
        "h1": "L’illusion de la prise de conscience.",
    },
    "territoires.html": {
        "meta": "Couple, famille, travail, corps : vos mécanismes de défense se matérialisent dans le réel. Mirror Me aide à lire ces territoires et à changer de réponse.",
        "h1": "La matérialisation du conditionnement.",
    },
    "coaching.html": {
        "meta": "Le coaching Mirror Me est un laboratoire de test : identifier le déclencheur, exposer l’automatisme, calibrer une nouvelle réponse.",
        "h1": "De la confidence à la calibration.",
    },
}

MARKERS = [
    "editorial-graft-index",
    "editorial-graft-vision",
    "editorial-graft-territoires",
    "editorial-graft-coaching",
]


def replace_meta(html, text):
    pattern = r'<meta\s+content="[^"]*"\s+name="description"\s*/?>|<meta\s+name="description"\s+content="[^"]*"\s*/?>'
    return re.sub(pattern, f'<meta name="description" content="{text}"/>', html, count=1, flags=re.I)


def replace_first_h1(html, text):
    return re.sub(r'<h1([^>]*)>.*?</h1>', lambda m: f'<h1{m.group(1)}>{text}</h1>', html, count=1, flags=re.I | re.S)


def remove_editorial_graft_sections(html):
    before = html
    for marker in MARKERS:
        pattern = rf'\n*<section[^>]*id="{re.escape(marker)}"[^>]*>.*?</section>\n*'
        html = re.sub(pattern, '\n', html, count=1, flags=re.I | re.S)
    return html, before != html


changed = []
skipped = []
removed = []

for filename, data in PAGES.items():
    path = Path(filename)
    if not path.exists():
        skipped.append(f"{filename}: missing")
        continue

    html = path.read_text(encoding="utf-8", errors="replace")
    low = html.lower()

    if "<nav" not in low or "</nav>" not in low or "<footer" not in low or "</footer>" not in low:
        skipped.append(f"{filename}: missing nav/footer")
        continue

    original = html
    html, did_remove = remove_editorial_graft_sections(html)
    if did_remove:
        removed.append(filename)

    html = replace_meta(html, data["meta"])
    html = replace_first_h1(html, data["h1"])

    if html != original:
        path.write_text(html, encoding="utf-8")
        changed.append(filename)

report = "# Editorial graft repaired\n\n"
report += "## Principle\n- Existing architecture preserved\n- Added editorial-graft sections removed\n- H1 and meta descriptions retained\n- No CSS migration\n- No main branch modification\n\n"
report += "## Changed\n"
report += "\n".join(f"- {x}" for x in changed) if changed else "- None"
report += "\n\n## Removed added sections from\n"
report += "\n".join(f"- {x}" for x in removed) if removed else "- None"
report += "\n\n## Skipped\n"
report += "\n".join(f"- {x}" for x in skipped) if skipped else "- None"
report += "\n"

Path("EDITORIAL_GRAFT_APPLIED.md").write_text(report, encoding="utf-8")
print(report)
