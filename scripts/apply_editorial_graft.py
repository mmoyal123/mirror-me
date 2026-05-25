from pathlib import Path
import re

PAGES = {
    "index.html": {
        "marker": "editorial-graft-index",
        "meta": "Passer de la compréhension d’un schéma à sa résolution. Mirror Me aide à identifier les mécanismes défensifs et à construire de nouveaux modes de réponse.",
        "h1": "Passer de la compréhension à la résolution.",
        "intro": "La plupart des personnes qui s’adressent à moi ont une excellente culture d’elles-mêmes. Elles ont lu, analysé, intellectualisé. Elles savent précisément pourquoi elles bloquent. Le piège actuel est là : confondre la compréhension d’un schéma avec sa résolution.",
        "block": [
            "Votre mode de défense actuel, le contrôle, l’évitement, la sur-adaptation, a été intelligent. Il s’est construit pour protéger votre identité et vos valeurs profondes. Mais ce qui a été une protection est devenu un automatisme rigide qui tourne en boucle, au détriment de vos objectifs.",
            "Mirror Me ne propose pas une énième exploration théorique du passé. Nous mobilisons vos ressources actuelles pour concevoir de nouveaux modes de réponse. Nous passons de la théorie à l’expérience terrain."
        ],
        "cta": "Initier le travail",
    },
    "vision.html": {
        "marker": "editorial-graft-vision",
        "meta": "La conscience ne suffit pas. Mirror Me travaille l’intelligence relationnelle comme une structure : mécanismes, posture, réponses et bascule concrète.",
        "h1": "L’illusion de la prise de conscience.",
        "intro": "La conscience ne libère pas. Seule la structure le fait. Vous pouvez identifier vos loyautés invisibles pendant des années sans pour autant cesser de les servir. L’intelligence relationnelle ne consiste pas à comprendre le pourquoi, mais à maîtriser le comment.",
        "block": [
            "Votre identité n’est pas un concept à découvrir, c’est une architecture à restaurer. Tant que vos mécanismes de défense, contrôle, évitement, sur-adaptation, pilotent vos interactions, vous n’êtes pas aux commandes.",
            "Le travail ici consiste à isoler le mécanisme actif, l’intercepter avant qu’il ne se déclenche, et stabiliser une réponse différente. C’est un travail de précision, pas d’introspection."
        ],
        "cta": "Analyser ma posture",
    },
    "territoires.html": {
        "marker": "editorial-graft-territoires",
        "meta": "Couple, famille, travail, corps : vos mécanismes de défense se matérialisent dans le réel. Mirror Me aide à lire ces territoires et à changer de réponse.",
        "h1": "La matérialisation du conditionnement.",
        "intro": "Un mécanisme de défense n’est jamais abstrait. Il se déploie dans le réel : une réunion où vous vous taisez, une dispute de couple où vous fuyez, une pression familiale où vous vous sur-adaptez. Si vous pensez que ces situations sont des fatalités, vous ignorez le rôle que vous y jouez.",
        "block": [
            "Les territoires sont les miroirs qui ne mentent pas. Chaque zone de votre vie, couple, famille, travail, corps, est un terrain d’entraînement. Nous ne travaillons pas sur des théories, nous travaillons sur la manière dont vous occupez l’espace dans ces interactions.",
            "Lorsque vous changez votre mode de réponse sur un territoire, l’environnement se réajuste immédiatement. Ce n’est pas de la magie, c’est de la mécanique relationnelle."
        ],
        "cta": "Identifier mon blocage",
    },
    "coaching.html": {
        "marker": "editorial-graft-coaching",
        "meta": "Le coaching Mirror Me est un laboratoire de test : identifier le déclencheur, exposer l’automatisme, calibrer une nouvelle réponse.",
        "h1": "De la confidence à la calibration.",
        "intro": "Ici, on ne vient pas pour déposer ses problèmes, on vient pour tester de nouvelles réponses. Le coaching chez Mirror Me est un laboratoire. Vous ne venez pas raconter votre histoire, vous venez exposer votre automatisme à la lumière pour le neutraliser.",
        "block": [
            "C’est un espace de répétition grandeur nature. Nous identifions le déclencheur, nous isolons la loyauté invisible qui vous pousse à agir, et nous testons une nouvelle réponse chirurgicale.",
            "On n’explore pas le vide, on recalibre. Vous ne repartez pas avec une meilleure compréhension, vous repartez avec une compétence de réponse que vous n’aviez pas avant la séance."
        ],
        "cta": "Réserver ma session de test",
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


def replace_first_class_block(html, class_names, inner_html):
    class_alt = "|".join(re.escape(c) for c in class_names)
    pattern = rf'<div([^>]*class="[^"]*(?:{class_alt})[^"]*"[^>]*)>.*?</div>'
    return re.sub(pattern, lambda m: f'<div{m.group(1)}>{inner_html}</div>', html, count=1, flags=re.I | re.S)


def replace_first_button_text(html, text):
    pattern = r'(<a[^>]*class="[^"]*btn[^"]*"[^>]*>)(.*?)(</a>)'
    return re.sub(pattern, lambda m: f'{m.group(1)}{text}{m.group(3)}', html, count=1, flags=re.I | re.S)


def remove_added_graft_sections(html):
    before = html
    for marker in MARKERS:
        pattern = rf'\n*<section[^>]*id="{re.escape(marker)}"[^>]*>.*?</section>\n*'
        html = re.sub(pattern, '\n', html, count=1, flags=re.I | re.S)
    return html, before != html


def paragraphs(items):
    return "".join(f"<p>{item}</p>" for item in items)


changed = []
removed = []
skipped = []

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

    html, did_remove = remove_added_graft_sections(html)
    if did_remove:
        removed.append(filename)

    html = replace_meta(html, data["meta"])
    html = replace_first_h1(html, data["h1"])
    html = replace_first_class_block(html, ["hero-sub", "page-sub"], data["intro"])
    html = replace_first_class_block(html, ["editorial-block"], paragraphs(data["block"]))
    html = replace_first_button_text(html, data["cta"])

    if html != original:
        path.write_text(html, encoding="utf-8")
        changed.append(filename)

report = "# Gemini text integration prepared and applied\n\n"
report += "## Principle\n"
report += "- Gemini text kept complete\n"
report += "- Existing architecture preserved\n"
report += "- Added editorial-graft sections removed\n"
report += "- Existing hero/subtext/editorial blocks reused\n"
report += "- No CSS migration\n"
report += "- No main branch page modification\n\n"
report += "## Changed\n"
report += "\n".join(f"- {x}" for x in changed) if changed else "- None"
report += "\n\n## Removed added sections from\n"
report += "\n".join(f"- {x}" for x in removed) if removed else "- None"
report += "\n\n## Skipped\n"
report += "\n".join(f"- {x}" for x in skipped) if skipped else "- None"
report += "\n"

Path("EDITORIAL_GRAFT_APPLIED.md").write_text(report, encoding="utf-8")
print(report)
