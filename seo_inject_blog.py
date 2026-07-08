# -*- coding: utf-8 -*-
"""
seo_inject_blog.py — blog/f/ 14 篇病例故事 SEO（幂等, 标记 seo-inject-blog:v1）
注入: 1) MedicalClinic LD(复用主站数据)  2) 三级面包屑  3) BlogPosting LD(含 about 病症)
      4) 内链区块: 指回对应病症页(钱页) + 两篇相关病例
不发明日期: 帖内无 datePublished 数据, LD 不写该字段。
Run:  python seo_inject_blog.py
"""
import io
import json
import os
import re

os.chdir(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://acupuncturistusa.com"
MARK = "<!-- seo-inject-blog:v1 -->"
BLOG = "blog/f"

CLINIC = {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "LocalBusiness"],
    "name": "Huo Energy Medicine & Acupuncture",
    "url": SITE + "/",
    "telephone": "+1-718-445-0608",
    "address": {"@type": "PostalAddress", "streetAddress": "59-23 163rd Street",
                "addressLocality": "Fresh Meadows", "addressRegion": "NY",
                "postalCode": "11365", "addressCountry": "US"},
    "areaServed": ["Fresh Meadows", "Queens", "New York City"],
    "founder": {"@type": "Person", "name": "Dr. Frank Huo", "url": SITE + "/frank-huo"},
    "image": SITE + "/images/content/dare-8c0e7d2.jpg",
    "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "45"},
}

# 病症页锚文本 (与主站 Queens 本地化标题一致)
COND_ANCHOR = {
    "infertility": "Acupuncture for Infertility in Queens, NY",
    "fibroids-and-cysts": "Acupuncture for Fibroids and Cysts in Queens, NY",
    "menopause": "Acupuncture for Menopause in Queens, NY",
    "acupuncture-for-uti": "Acupuncture for UTI & Interstitial Cystitis in Queens, NY",
    "acupuncture-for-cancer": "Acupuncture for Cancer Support in Queens, NY",
    "immune-disorders": "Acupuncture for Immune Disorders in Queens, NY",
    "back-and-joints-pain": "Acupuncture for Back and Joint Pain in Queens, NY",
    "acupuncture": "How Acupuncture Works at Huo Energy Medicine",
}

# slug -> (病症实体名 或 None, 对应病症页 slug, [两篇相关病例])
POSTS = {
    "acupuncture-for-autism-kids": ("Autism spectrum disorder", "acupuncture",
        ["acupuncture-formyalgic-encephalomyelitischronic-fatigue-syndrome", "acupuncture-for-rosacea"]),
    "acupuncture-for-infertility": ("Infertility", "infertility",
        ["acupuncture-for-miscarriage", "irregular-menstrual"]),
    "acupuncture-for-miscarriage": ("Recurrent miscarriage", "infertility",
        ["acupuncture-for-infertility", "irregular-menstrual"]),
    "acupuncture-for-rosacea": ("Rosacea", "immune-disorders",
        ["acupuncture-formyalgic-encephalomyelitischronic-fatigue-syndrome",
         "hepatitis-b-virus-count-is-down-9956--in-six-weeks"]),
    "acupuncture-formyalgic-encephalomyelitischronic-fatigue-syndrome":
        ("Myalgic encephalomyelitis / chronic fatigue syndrome", "immune-disorders",
         ["hepatitis-b-virus-count-is-down-9956--in-six-weeks", "acupuncture-for-rosacea"]),
    "blood-cancer-low-platelet-count": ("Blood cancer", "acupuncture-for-cancer",
        ["prostate-cancer", "the-degree-of-enhancement-and-size-of-brain-tumor-has-decreased"]),
    "healing-of-chronic-interstitial-cystitis-hunners-ulcers":
        ("Interstitial cystitis", "acupuncture-for-uti",
         ["irregular-menstrual", "uterine-fibroid-shrinking-and-ovarian-cyst-resolved"]),
    "hepatitis-b-virus-count-is-down-9956--in-six-weeks": ("Hepatitis B", "immune-disorders",
        ["acupuncture-formyalgic-encephalomyelitischronic-fatigue-syndrome",
         "blood-cancer-low-platelet-count"]),
    "irregular-menstrual": ("Irregular menstruation", "infertility",
        ["acupuncture-for-infertility", "menopause"]),
    "knee-pain-and-tingling-in-toes-and-fingers": ("Knee pain and peripheral tingling",
        "back-and-joints-pain",
        ["acupuncture-formyalgic-encephalomyelitischronic-fatigue-syndrome", "menopause"]),
    "menopause": ("Menopause", "menopause",
        ["irregular-menstrual", "uterine-fibroid-shrinking-and-ovarian-cyst-resolved"]),
    "prostate-cancer": ("Prostate cancer", "acupuncture-for-cancer",
        ["blood-cancer-low-platelet-count",
         "the-degree-of-enhancement-and-size-of-brain-tumor-has-decreased"]),
    "the-degree-of-enhancement-and-size-of-brain-tumor-has-decreased": ("Brain tumor",
        "acupuncture-for-cancer", ["blood-cancer-low-platelet-count", "prostate-cancer"]),
    "uterine-fibroid-shrinking-and-ovarian-cyst-resolved":
        ("Uterine fibroids and ovarian cysts", "fibroids-and-cysts",
         ["menopause", "acupuncture-for-infertility"]),
}


def ld(obj):
    return ('<script type="application/ld+json">'
            + json.dumps(obj, ensure_ascii=True, separators=(",", ":")) + "</script>")


def strip_tags(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)).strip()


def post_meta(slug):
    h = io.open(f"{BLOG}/{slug}.html", encoding="utf-8").read()
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S)
    desc = re.search(r'name="description"\s+content="([^"]*)"', h)
    img = re.search(r'property="og:image"\s+content="([^"]*)"', h)
    title = strip_tags(h1.group(1)) if h1 else slug.replace("-", " ").title()
    return title, (desc.group(1) if desc else ""), (img.group(1) if img else None)


TITLES = {s: post_meta(s)[0] for s in POSTS}

changed = 0
for slug, (condition, cond_slug, related) in POSTS.items():
    path = f"{BLOG}/{slug}.html"
    html = io.open(path, encoding="utf-8").read()
    if MARK in html:
        print(f"  skip {slug} (already injected)")
        continue
    title, desc, img = post_meta(slug)
    url = f"{SITE}/blog/f/{slug}"

    post_ld = {"@context": "https://schema.org", "@type": "BlogPosting",
               "headline": title[:110], "description": desc, "url": url,
               "mainEntityOfPage": url,
               "author": {"@type": "Person", "name": "Dr. Frank Huo", "url": SITE + "/frank-huo"},
               "publisher": {"@type": "Organization", "name": "Huo Energy Medicine & Acupuncture",
                             "url": SITE + "/"},
               "about": {"@type": "MedicalCondition", "name": condition}}
    if img:
        post_ld["image"] = img if img.startswith("http") else SITE + img

    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": "Blog", "item": SITE + "/blog"},
        {"@type": "ListItem", "position": 3, "name": title, "item": url}]}

    head_inject = MARK + "\n" + "\n".join([ld(CLINIC), ld(crumbs), ld(post_ld)]) + "\n"
    html = html.replace("</head>", head_inject + "</head>", 1)

    rel_items = "\n".join(
        f'      <li style="margin:8px 0;"><a href="/blog/f/{r}">{TITLES[r]} — patient story</a></li>'
        for r in related)
    block = f"""{MARK}
<section class="related-conditions" style="max-width:900px;margin:40px auto 0;padding:0 20px;">
  <h2 style="font-size:1.15em;">Explore This Treatment</h2>
  <p style="margin:8px 0;"><strong><a href="/{cond_slug}">{COND_ANCHOR[cond_slug]}</a></strong> — conditions we treat, approach, and what to expect.</p>
  <h3 style="font-size:1em;margin-top:14px;">More Patient Stories</h3>
  <ul style="list-style:none;padding-left:0;">
{rel_items}
  </ul>
  <p style="font-size:0.95em;"><a href="/faq">Read the FAQ</a> or call <a href="tel:+17184450608">(718) 445-0608</a> to ask about your condition.</p>
</section>
"""
    html = html.replace('<footer class="site-footer"', block + '<footer class="site-footer"', 1)
    io.open(path, "w", encoding="utf-8", newline="\n").write(html)
    changed += 1
    print(f"  inject blog/f/{slug:<62} -> /{cond_slug}")

print(f"done: {changed} posts injected")
