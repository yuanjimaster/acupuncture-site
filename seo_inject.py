# -*- coding: utf-8 -*-
"""
seo_inject.py — acupuncturistusa.com SEO round 1
Injects (idempotent, marker <!-- seo-inject:v1 -->):
  1. MedicalClinic + LocalBusiness JSON-LD  (all pages)
  2. BreadcrumbList JSON-LD                 (all subpages)
  3. FAQPage JSON-LD                        (faq.html, auto-extracted from .faq-question/.faq-answer)
  4. MedicalWebPage JSON-LD                 (15 condition pages)
  5. Related-conditions internal links      (condition pages, topical clusters, keyword anchors)
Run:  python seo_inject.py
"""
import io
import json
import os
import re

os.chdir(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://acupuncturistusa.com"
MARK = "<!-- seo-inject:v1 -->"

CLINIC = {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "LocalBusiness"],
    "name": "Huo Energy Medicine & Acupuncture",
    "url": SITE + "/",
    "telephone": "+1-718-445-0608",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "59-23 163rd Street",
        "addressLocality": "Fresh Meadows",
        "addressRegion": "NY",
        "postalCode": "11365",
        "addressCountry": "US",
    },
    "areaServed": ["Fresh Meadows", "Queens", "New York City"],
    "medicalSpecialty": "https://schema.org/PublicHealth",
    "founder": {"@type": "Person", "name": "Dr. Frank Huo", "url": SITE + "/frank-huo"},
    "image": SITE + "/images/content/dare-8c0e7d2.jpg",
    # 真实数据源: Birdeye 聚合页 (huo-acupuncture-pc-147128105170110), 2026-07-07 实查
    "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "45"},
}

# slug -> (breadcrumb name, MedicalCondition name for MedicalWebPage; None = not a condition page)
PAGES = {
    "acupuncture": ("Acupuncture", None),
    "energy-medicine": ("Energy Medicine", None),
    "frank-huo": ("Dr. Frank Huo", None),
    "faq": ("FAQ", None),
    "testimonials": ("Testimonials", None),
    "testimonials-video": ("Video Testimonials", None),
    "blog": ("Blog", None),
    "downloads": ("Downloads", None),
    "arthritis": ("Acupuncture for Arthritis", "Arthritis"),
    "back-and-joints-pain": ("Back & Joint Pain", "Back pain"),
    "ankylosing-spondylitis": ("Ankylosing Spondylitis", "Ankylosing spondylitis"),
    "headaches-and-migraines": ("Headaches & Migraines", "Migraine"),
    "depression-and-anxiety": ("Depression & Anxiety", "Depression and anxiety"),
    "infertility": ("Acupuncture for Infertility", "Infertility"),
    "fibroids-and-cysts": ("Fibroids & Cysts", "Uterine fibroids and ovarian cysts"),
    "menopause": ("Menopause Relief", "Menopause"),
    "acupuncture-for-uti": ("Acupuncture for UTI", "Urinary tract infection"),
    "kidney-stone-dissolved": ("Kidney Stones", "Kidney stone"),
    "diabetes-and-kidney-disease": ("Diabetes & Kidney Disease", "Diabetes and chronic kidney disease"),
    "immune-disorders": ("Immune Disorders", "Autoimmune disease"),
    "multiple-sclerosis": ("Multiple Sclerosis", "Multiple sclerosis"),
    "acupuncture-for-cancer": ("Acupuncture for Cancer Support", "Cancer supportive care"),
    "quit-smoking": ("Quit Smoking", "Nicotine dependence"),
}

# keyword-rich anchors for internal links
ANCHOR = {
    "arthritis": "Acupuncture for arthritis pain (rheumatoid, psoriatic & osteoarthritis)",
    "back-and-joints-pain": "Acupuncture for back and joint pain relief",
    "ankylosing-spondylitis": "Acupuncture for ankylosing spondylitis",
    "headaches-and-migraines": "Acupuncture for headaches and migraines",
    "depression-and-anxiety": "Acupuncture for depression and anxiety",
    "infertility": "Acupuncture for infertility (PCOS, endometriosis, IVF support)",
    "fibroids-and-cysts": "Acupuncture for uterine fibroids and ovarian cysts",
    "menopause": "Acupuncture for menopause symptom relief",
    "acupuncture-for-uti": "Acupuncture for chronic UTI",
    "kidney-stone-dissolved": "Acupuncture and kidney stones",
    "diabetes-and-kidney-disease": "Acupuncture for diabetes and kidney disease",
    "immune-disorders": "Acupuncture for immune disorders",
    "multiple-sclerosis": "Acupuncture for multiple sclerosis",
    "acupuncture-for-cancer": "Acupuncture support during cancer care",
    "quit-smoking": "Quit smoking with acupuncture",
}

# topical clusters
RELATED = {
    "arthritis": ["back-and-joints-pain", "ankylosing-spondylitis", "headaches-and-migraines"],
    "back-and-joints-pain": ["arthritis", "ankylosing-spondylitis", "headaches-and-migraines"],
    "ankylosing-spondylitis": ["arthritis", "back-and-joints-pain", "immune-disorders"],
    "headaches-and-migraines": ["depression-and-anxiety", "back-and-joints-pain", "menopause"],
    "depression-and-anxiety": ["headaches-and-migraines", "quit-smoking", "menopause"],
    "infertility": ["fibroids-and-cysts", "menopause", "immune-disorders"],
    "fibroids-and-cysts": ["infertility", "menopause", "acupuncture-for-uti"],
    "menopause": ["infertility", "fibroids-and-cysts", "depression-and-anxiety"],
    "acupuncture-for-uti": ["kidney-stone-dissolved", "diabetes-and-kidney-disease", "fibroids-and-cysts"],
    "kidney-stone-dissolved": ["acupuncture-for-uti", "diabetes-and-kidney-disease", "back-and-joints-pain"],
    "diabetes-and-kidney-disease": ["kidney-stone-dissolved", "acupuncture-for-uti", "immune-disorders"],
    "immune-disorders": ["multiple-sclerosis", "ankylosing-spondylitis", "acupuncture-for-cancer"],
    "multiple-sclerosis": ["immune-disorders", "depression-and-anxiety", "back-and-joints-pain"],
    "acupuncture-for-cancer": ["immune-disorders", "depression-and-anxiety", "quit-smoking"],
    "quit-smoking": ["depression-and-anxiety", "headaches-and-migraines", "immune-disorders"],
}


def ld(obj):
    return ('<script type="application/ld+json">'
            + json.dumps(obj, ensure_ascii=True, separators=(",", ":")) + "</script>")


def strip_tags(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)).strip()


def faq_ld(html):
    qs = re.findall(r'class="faq-question"[^>]*>(.*?)</', html, re.S)
    ans = re.findall(r'class="faq-answer-inner"[^>]*>(.*?)</div>', html, re.S)
    pairs = [(strip_tags(q), strip_tags(a)) for q, a in zip(qs, ans) if strip_tags(q) and strip_tags(a)]
    if not pairs:
        return ""
    return ld({"@context": "https://schema.org", "@type": "FAQPage",
               "mainEntity": [{"@type": "Question", "name": q,
                               "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pairs]})


def related_block(slug):
    items = "\n".join(
        f'      <li style="margin:8px 0;"><a href="/{t}">{ANCHOR[t]}</a></li>'
        for t in RELATED[slug])
    return f"""{MARK}
<section class="related-conditions" style="max-width:900px;margin:40px auto 0;padding:0 20px;">
  <h2 style="font-size:1.15em;">Related Conditions We Treat</h2>
  <ul style="list-style:none;padding-left:0;">
{items}
  </ul>
  <p style="font-size:0.95em;"><a href="/faq">Questions about treatment? Read the FAQ</a> or call <a href="tel:+17184450608">(718) 445-0608</a>.</p>
</section>
"""


changed = 0
for slug, (bname, condition) in list(PAGES.items()) + [("index", ("Home", None))]:
    path = slug + ".html"
    if not os.path.exists(path):
        print(f"  skip {path} (missing)")
        continue
    html = io.open(path, encoding="utf-8").read()
    if MARK in html:
        print(f"  skip {path} (already injected)")
        continue

    blocks = [ld(CLINIC)]
    if slug != "index":
        blocks.append(ld({"@context": "https://schema.org", "@type": "BreadcrumbList",
                          "itemListElement": [
                              {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
                              {"@type": "ListItem", "position": 2, "name": bname, "item": f"{SITE}/{slug}"}]}))
    if condition:
        blocks.append(ld({"@context": "https://schema.org", "@type": "MedicalWebPage",
                          "url": f"{SITE}/{slug}",
                          "about": {"@type": "MedicalCondition", "name": condition},
                          "audience": "https://schema.org/Patient",
                          "provider": {"@type": "MedicalClinic",
                                       "name": "Huo Energy Medicine & Acupuncture"}}))
    if slug == "faq":
        f = faq_ld(html)
        if f:
            blocks.append(f)

    inject_head = MARK + "\n" + "\n".join(blocks) + "\n"
    html = html.replace("</head>", inject_head + "</head>", 1)

    if slug in RELATED:
        html = html.replace('<footer class="site-footer"', related_block(slug) + '<footer class="site-footer"', 1)

    io.open(path, "w", encoding="utf-8", newline="\n").write(html)
    changed += 1
    extras = [b for b in ("breadcrumb" if slug != "index" else "", "medical" if condition else "",
                          "faq-ld" if slug == "faq" else "", "related" if slug in RELATED else "") if b]
    print(f"  inject {path:<36} clinic+{'+'.join(extras) if extras else 'base'}")

# sitemap lastmod refresh
sm = io.open("sitemap.xml", encoding="utf-8").read()
sm2 = re.sub(r"<lastmod>\d{4}-\d{2}-\d{2}</lastmod>", "<lastmod>2026-07-07</lastmod>", sm)
if sm2 != sm:
    io.open("sitemap.xml", "w", encoding="utf-8", newline="\n").write(sm2)
    print("  sitemap.xml lastmod -> 2026-07-07")
print(f"done: {changed} pages injected")
