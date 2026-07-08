# Google Reviews Playbook — Huo Energy Medicine & Acupuncture

Internal SOP. Site infrastructure is live: `/review` page, QR (`/images/review-qr.png`),
print cards (`/review-card.html`), footer link sitewide, CTA on testimonials pages.

## One-time owner setup (only you can do these, ~15 min)

1. **Claim/verify Google Business Profile**: go to https://business.google.com with the
   clinic's Google account → add/claim "Huo Energy Medicine & Acupuncture",
   59-23 163rd Street, Fresh Meadows, NY 11365, (718) 445-0608.
   Category: *Acupuncture clinic* (secondary: *Alternative medicine practitioner*).
   Fill hours, add 5–10 real photos (front door, treatment room, certificates).
2. **Get the official short review link**: GBP dashboard → **Ask for reviews** →
   copy the `g.page/r/XXXX/review` link.
3. **Swap the link into the site** (one line): edit `make_review_kit.py`,
   set `GOOGLE_REVIEW_URL = "https://g.page/r/XXXX/review"`, then run
   `python make_review_kit.py` and deploy (`npx wrangler pages deploy . --commit-dirty=true`).
   The printed QR never changes — it points to `/review`, which redirects visitors
   to whatever link is current.

## Weekly routine

- Ask **2–3 satisfied patients per week** at checkout: "Would you mind scanning this
  card and sharing your experience? It takes a minute and helps others find us."
- Hand the printed card (`review-card.html` → print → cut, 4 per sheet).
- **Reply to every review within 48h** (owner replies boost local ranking).
  Thank-you replies for positive; calm, factual, HIPAA-safe replies for negative
  (never confirm someone is a patient in a reply).

## Message templates

**SMS (EN):** Thank you for visiting Huo Energy Medicine today! If the treatment
helped, would you share a quick review? It takes 60 seconds:
https://acupuncturistusa.com/review — Dr. Huo

**SMS (中文):** 感谢您今天来霍氏能量医学诊所！如果治疗对您有帮助，恳请花一分钟留个评价，
这对其他病人找到我们非常重要：https://acupuncturistusa.com/review — 霍医生

**Email (EN):** Subject: How was your visit?
Body: Dear [Name], thank you for trusting us with your care. If your treatment went
well, a short Google review helps other patients in Queens find us:
https://acupuncturistusa.com/review . It takes about a minute. — Dr. Frank Huo

## Policy guardrails (do NOT skip)

- **Never incentivize reviews** (no discounts/gifts for reviews — violates Google policy,
  can nuke the whole profile).
- **No review gating** (don't pre-filter: ask everyone you'd be comfortable asking,
  not only guaranteed-5-star patients via a filter form).
- **Never write or buy reviews.** The site's schema rating (4.8/45) is sourced from
  Birdeye's public aggregate — update it in `seo_inject.py` + `seo_inject_blog.py`
  when the real numbers change materially.
- HIPAA: never mention diagnosis/treatment details in reply to a review.

## Why this matters

Google review stars are the #1 click factor in the local map pack. The site's own
schema rating is ignored by Google (self-serving policy) — the REAL stars come only
from the Google Business Profile. Every 10 fresh reviews with owner replies typically
moves map-pack ranking within the neighborhood.
