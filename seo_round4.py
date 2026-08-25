# -*- coding: utf-8 -*-
"""SEO round 4 (2026-08-25):
1. Absolutize og:image / twitter:image (relative URLs are invisible to social crawlers).
2. Absolutize relative "logo"/"image" URLs inside JSON-LD blocks.
3. Remove the head ["MedicalClinic","LocalBusiness"] block: it duplicates the rich
   footer MedicalBusiness entity and carries a self-serving aggregateRating, which
   Google ignores (2019 reviews policy) and can flag as spammy structured data.
4. Fix favicon type (JPG declared as image/png).
5. Bump sitemap lastmod for every touched page.
"""
import io, os, re, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
BASE = "https://acupuncturistusa.com"
TODAY = "2026-08-25"

pages = [p for p in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)
         if os.sep + "." not in p and "_files" not in p]

head_entity = re.compile(
    r'<script type="application/ld\+json">\{"@context":"https://schema\.org","@type":\["MedicalClinic","LocalBusiness"\].*?</script>\n?',
    re.DOTALL)

changed = []
for path in pages:
    with io.open(path, encoding="utf-8") as f:
        src = f.read()
    out = src
    # 1. absolute social images
    out = out.replace('property="og:image" content="/', f'property="og:image" content="{BASE}/')
    out = out.replace('name="twitter:image" content="/', f'name="twitter:image" content="{BASE}/')
    # 2. absolute JSON-LD asset URLs
    out = out.replace('"logo":"/', f'"logo":"{BASE}/')
    out = out.replace('"image":"/', f'"image":"{BASE}/')
    # 3. drop duplicate head entity block (self-serving aggregateRating)
    out = head_entity.sub("", out)
    # 4. favicon type
    out = out.replace('<link rel="icon" type="image/png" href="/images/content/dare-8c0e7d2.jpg">',
                      '<link rel="icon" type="image/jpeg" href="/images/content/dare-8c0e7d2.jpg">')
    if out != src:
        with io.open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(out)
        changed.append(os.path.relpath(path, ROOT))

# 5. sitemap lastmod
sm_path = os.path.join(ROOT, "sitemap.xml")
with io.open(sm_path, encoding="utf-8") as f:
    sm = f.read()
sm2 = re.sub(r"<lastmod>\d{4}-\d{2}-\d{2}</lastmod>", f"<lastmod>{TODAY}</lastmod>", sm)
if sm2 != sm:
    with io.open(sm_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(sm2)
    changed.append("sitemap.xml")

print(f"changed {len(changed)} files:")
for c in changed:
    print(" ", c)
