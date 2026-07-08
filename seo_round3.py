# -*- coding: utf-8 -*-
"""
seo_round3.py — 反向漏斗: 病症页(钱页) → 真实病例故事(blog/f)
仅连真实对应病例, 无病例的病症页不硬凑。幂等标记 seo-inject:v3。
Run:  python seo_round3.py
"""
import io
import os
import re

os.chdir(os.path.dirname(os.path.abspath(__file__)))
MARK3 = "<!-- seo-inject:v3 -->"

# 病症页 -> 真实病例故事
STORIES = {
    "infertility": ["acupuncture-for-infertility", "acupuncture-for-miscarriage", "irregular-menstrual"],
    "fibroids-and-cysts": ["uterine-fibroid-shrinking-and-ovarian-cyst-resolved"],
    "menopause": ["menopause", "irregular-menstrual"],
    "acupuncture-for-uti": ["healing-of-chronic-interstitial-cystitis-hunners-ulcers"],
    "acupuncture-for-cancer": ["prostate-cancer", "blood-cancer-low-platelet-count",
                               "the-degree-of-enhancement-and-size-of-brain-tumor-has-decreased"],
    "immune-disorders": ["hepatitis-b-virus-count-is-down-9956--in-six-weeks",
                         "acupuncture-formyalgic-encephalomyelitischronic-fatigue-syndrome",
                         "acupuncture-for-rosacea"],
    "back-and-joints-pain": ["knee-pain-and-tingling-in-toes-and-fingers"],
}


def strip_tags(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)).strip()


def post_title(slug):
    h = io.open(f"blog/f/{slug}.html", encoding="utf-8").read()
    m = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S)
    return strip_tags(m.group(1)) if m else slug.replace("-", " ").title()


def stories_html(slugs):
    items = "\n".join(
        f'      <li style="margin:8px 0;"><a href="/blog/f/{s}">{post_title(s)} &mdash; patient story</a></li>'
        for s in slugs)
    return f"""{MARK3}
  <h3 style="font-size:1em;margin-top:14px;">Patient Case Stories</h3>
  <ul style="list-style:none;padding-left:0;">
{items}
  </ul>
"""


FAQ_LINE = '  <p style="font-size:0.95em;"><a href="/faq">Questions about treatment? Read the FAQ</a>'

changed = 0
for slug, posts in STORIES.items():
    path = slug + ".html"
    html = io.open(path, encoding="utf-8").read()
    if MARK3 in html:
        print(f"  skip {path} (already injected)")
        continue
    if FAQ_LINE not in html:
        print(f"  FAIL {path}: anchor line not found")
        continue
    html = html.replace(FAQ_LINE, stories_html(posts) + FAQ_LINE, 1)
    io.open(path, "w", encoding="utf-8", newline="\n").write(html)
    changed += 1
    print(f"  inject {path:<32} +{len(posts)} stories")

# acupuncture.html: 无 related 区块, 独立加 Patient Case Stories 小节 (autism 病例 + 博客索引)
path = "acupuncture.html"
html = io.open(path, encoding="utf-8").read()
if MARK3 not in html:
    block = f"""{MARK3}
<section class="related-conditions" style="max-width:900px;margin:40px auto 0;padding:0 20px;">
  <h2 style="font-size:1.15em;">Patient Case Stories</h2>
  <ul style="list-style:none;padding-left:0;">
      <li style="margin:8px 0;"><a href="/blog/f/acupuncture-for-autism-kids">{post_title("acupuncture-for-autism-kids")} &mdash; patient story</a></li>
      <li style="margin:8px 0;"><a href="/blog">All patient stories on the blog</a></li>
  </ul>
</section>
"""
    html = html.replace('<footer class="site-footer"', block + '<footer class="site-footer"', 1)
    io.open(path, "w", encoding="utf-8", newline="\n").write(html)
    changed += 1
    print(f"  inject {path:<32} +1 story + blog index")

print(f"done: {changed} pages")
