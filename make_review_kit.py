# -*- coding: utf-8 -*-
"""
make_review_kit.py — Google Business Profile 评论收集设施（站内部分, 幂等可重跑）
产出:
  1. review.html      — /review 中转页（Google/Yelp 大按钮; Google 链接只需改一处 GOOGLE_REVIEW_URL）
  2. images/review-qr.png — QR 码指向 /review（中转设计: 换 Google 链接不用重印）
  3. review-card.html — 诊所打印用卡片（noindex）
  4. 全站页脚 Quick Links 加 "Leave a Review ★"
  5. testimonials / testimonials-video 页顶加评论 CTA
  6. sitemap 加 /review
换 Google 官方短链: 编辑本文件 GOOGLE_REVIEW_URL 后重跑, 再部署。
"""
import io
import os
import re

os.chdir(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://acupuncturistusa.com"

# GBP 官方评论短链 (店主 2026-07-07 从 business.google.com 获取)
GOOGLE_REVIEW_URL = "https://g.page/r/Cckckx7C7iUDEAI/review"
# Yelp 官方 request-a-review 直链 (店主 2026-07-07 从 biz.yelp.com 获取)
YELP_REVIEW_URL = "https://biz.yelp.com/r2r/T6wRX7Zf04oB5XjFBnvIBw"

# ---------- 1. review.html (克隆 downloads.html 骨架) ----------
tpl = io.open("downloads.html", encoding="utf-8").read()
head_end = tpl.find("</head>")
head = tpl[:head_end]
tail_from_footer = tpl[tpl.find('<footer class="site-footer"'):]
header_part = tpl[head_end:tpl.find("</header>") + 9]

def swap(h, pat, repl):
    return re.sub(pat, repl, h, count=1, flags=re.S)

head = swap(head, r"<title>.*?</title>",
            "<title>Leave a Review | Huo Energy Medicine &amp; Acupuncture NYC</title>")
head = swap(head, r'(name="description"\s+content=")[^"]*',
            r"\g<1>Share your experience at Huo Energy Medicine & Acupuncture in Fresh Meadows, Queens NY. "
            "Leave a Google or Yelp review — it takes 60 seconds and helps other patients find care.")
head = swap(head, r'(rel="canonical"\s+href=")[^"]*', r"\g<1>" + SITE + "/review")
head = swap(head, r'(property="og:url"\s+content=")[^"]*', r"\g<1>" + SITE + "/review")
head = swap(head, r'(property="og:title"\s+content=")[^"]*',
            r"\g<1>Leave a Review | Huo Energy Medicine NYC")
head = swap(head, r'(property="og:description"\s+content=")[^"]*',
            r"\g<1>Your review helps other patients in Queens find effective care.")
head = head.replace('"name":"Downloads"', '"name":"Leave a Review"')
head = head.replace(SITE + "/downloads", SITE + "/review")

BODY = f"""
<div class="promo-banner">Your feedback helps other patients find effective care. Thank you!</div>
<section class="page-header"><h1>Share Your Experience</h1></section>
<section class="section"><div class="container" style="max-width: 700px; text-align: center;">
  <p style="font-size: 1.1em;">If Dr. Huo's treatment helped you, a short review means the world to us
  &mdash; and helps other patients in Fresh Meadows and Queens find care that works.
  It takes about <strong>60 seconds</strong>.</p>
  <p style="margin: 28px 0;">
    <a class="btn btn-primary" style="font-size: 1.1em; padding: 14px 28px;"
       href="{GOOGLE_REVIEW_URL}" target="_blank" rel="noopener">&#9733; Review us on Google</a>
  </p>
  <p style="margin: 18px 0;">
    <a class="btn btn-green" href="{YELP_REVIEW_URL}" target="_blank" rel="noopener">Review us on Yelp</a>
  </p>
  <p style="color: #777; font-size: 0.95em; margin-top: 30px;">Prefer to tell us privately?
  Call <a href="tel:+17184450608">(718) 445-0608</a> or email
  <a href="mailto:yuanjimaster@gmail.com">yuanjimaster@gmail.com</a>.</p>
</div></section>
"""
io.open("review.html", "w", encoding="utf-8", newline="\n").write(
    head + "</head>" + header_part.split("</head>", 1)[-1] + BODY + tail_from_footer)
print("  review.html written")

# ---------- 2. QR 码 -> /review ----------
import qrcode
img = qrcode.make(SITE + "/review", box_size=12, border=2)
img.save("images/review-qr.png")
print("  images/review-qr.png written")

# ---------- 3. 打印卡片 (noindex) ----------
CARD = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Review Card — print</title>
<meta name="robots" content="noindex, nofollow">
<style>
  body {{ font-family: Georgia, serif; display: flex; flex-wrap: wrap; gap: 10mm; padding: 10mm; }}
  .card {{ width: 105mm; height: 74mm; border: 1px solid #ccc; border-radius: 4mm; padding: 8mm;
          display: flex; align-items: center; gap: 8mm; page-break-inside: avoid; }}
  .card img {{ width: 44mm; height: 44mm; }}
  h2 {{ font-size: 14pt; margin: 0 0 4mm; }} p {{ font-size: 10pt; margin: 2mm 0; color: #333; }}
  @media print {{ .card {{ border-color: #999; }} }}
</style></head><body>
""" + "".join(f"""<div class="card"><img src="/images/review-qr.png" alt="QR code to leave a review">
  <div><h2>Enjoyed your treatment?</h2>
  <p>Scan to leave us a Google review &mdash; it takes 60 seconds and helps other patients find us.</p>
  <p><strong>Huo Energy Medicine &amp; Acupuncture</strong><br>(718) 445-0608 &middot; acupuncturistusa.com/review</p>
  </div></div>
""" for _ in range(4)) + "</body></html>\n"
io.open("review-card.html", "w", encoding="utf-8", newline="\n").write(CARD)
print("  review-card.html written (print 4-up)")

# ---------- 4. 全站页脚 Quick Links + Leave a Review ----------
import glob
n = 0
for f in glob.glob("*.html") + glob.glob("blog/f/*.html"):
    if f in ("review-card.html",):
        continue
    h = io.open(f, encoding="utf-8").read()
    if 'href="/review"' in h and f != "review.html":
        continue
    if '<ul class="footer-links">' in h and 'href="/review">Leave a Review' not in h:
        h = h.replace('<ul class="footer-links">',
                      '<ul class="footer-links"><li><a href="/review">Leave a Review &#9733;</a></li>', 1)
        io.open(f, "w", encoding="utf-8", newline="\n").write(h)
        n += 1
print(f"  footer review link added to {n} pages")

# ---------- 5. testimonials 页顶 CTA ----------
CTA = ('<!-- review-cta --><div style="text-align:center;margin:18px 0;">'
       '<a class="btn btn-primary" href="/review">&#9733; Had a good experience? Leave us a review</a></div>')
for f in ("testimonials.html", "testimonials-video.html"):
    h = io.open(f, encoding="utf-8").read()
    if "review-cta" in h:
        continue
    m = re.search(r"(</section>)", h[h.find('class="page-header"'):])
    if m:
        idx = h.find('class="page-header"') + m.end(1)
        h = h[:idx] + "\n" + CTA + h[idx:]
        io.open(f, "w", encoding="utf-8", newline="\n").write(h)
        print(f"  CTA added to {f}")

# ---------- 6. sitemap ----------
s = io.open("sitemap.xml", encoding="utf-8").read()
if "/review<" not in s:
    entry = ('<url><loc>' + SITE + '/review</loc><lastmod>2026-07-07</lastmod>'
             '<priority>0.6</priority><changefreq>monthly</changefreq></url>')
    s = s.replace("</urlset>", entry + "\n</urlset>")
    io.open("sitemap.xml", "w", encoding="utf-8", newline="\n").write(s)
    print("  sitemap: /review added")
print("done")
