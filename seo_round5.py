# -*- coding: utf-8 -*-
"""SEO round 5 (2026-08-25): YMYL / E-E-A-T wording safety pass.

Marketing copy: efficacy *claims* are rewritten to defensible, documented language.
Patient testimonial quotes are left verbatim (editing quotes would falsify them);
compliance for testimonials comes from the new site-wide footer disclaimer.
"""
import io, os, glob

ROOT = os.path.dirname(os.path.abspath(__file__))

# Ordered: most-specific first, generic fallbacks last.
REPLACEMENTS = [
    # -- "scientifically proven" family --
    ("scientifically proven at Columbia Presbyterian Medical Center",
     "documented in laboratory testing at Columbia Presbyterian Medical Center"),
    ("was scientifically proven to be effective",
     "was documented in laboratory testing"),
    ("this healing system is scientifically proven",
     "this healing system has been documented in laboratory testing"),
    ("my unique scientifically proven energy meditation system",
     "my unique energy meditation system"),
    ("Scientifically Proven", "Laboratory-Documented"),
    ("Scientifically proven", "Laboratory-documented"),
    ("scientifically proven", "laboratory-documented"),
    # -- disease-cure claims --
    ("Dr. Frank Huo treats cancer, chronic pain, immune disorders, infertility and more",
     "Dr. Frank Huo treats chronic pain, immune disorders and infertility, and offers supportive care for cancer patients"),
    ('"text":"We treat cancer support, arthritis,',
     '"text":"We provide supportive care for cancer patients, and treat arthritis,'),
    ("We use energy acupuncture to treat and relieve your pain permanently instead of using pharmaceuticals for temporary relief.",
     "We use energy acupuncture to pursue lasting pain relief instead of relying on pharmaceuticals for temporary relief."),
    ("for the Incurable and Unresolved", "for Chronic and Unresolved Conditions"),
    ("for the incurable and unresolved", "for chronic and unresolved conditions"),
    ("Rheumatoid Arthritis Nearly Cured by Using Dr. Frank Huo&rsquo;s Natural Healing Energy Medicine",
     "Patient Story: Rheumatoid Arthritis in Remission with Dr. Frank Huo&rsquo;s Natural Healing Energy Medicine"),
    # -- individual result presented as a general claim in social meta --
    ("Acupuncture for rheumatoid arthritis with documented lab results: RF dropped from 444 to 29.4.",
     "Acupuncture for rheumatoid arthritis. Documented patient case: RF fell from 444 to 29.4 (individual results vary)."),
]

DISCLAIMER = ('<div class="container"><p class="footer-disclaimer" '
              'style="font-size:12px;color:#8a8a8a;margin-top:20px;line-height:1.6;'
              'border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;">'
              'Individual results vary. Testimonials on this site reflect each patient&rsquo;s '
              'personal experience and are not a promise of outcome. Acupuncture, herbal medicine, '
              'and energy medicine are complementary approaches; they are not a substitute for '
              'medical diagnosis or treatment. Please consult your physician about any medical '
              'condition.</p></div>\n</footer>')

pages = [p for p in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)
         if os.sep + "." not in p and "_files" not in p]

changed = []
for path in pages:
    with io.open(path, encoding="utf-8") as f:
        src = f.read()
    out = src
    for old, new in REPLACEMENTS:
        out = out.replace(old, new)
    if "</footer>" in out and "footer-disclaimer" not in out:
        out = out.replace("</footer>", DISCLAIMER, 1)
    if out != src:
        with io.open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(out)
        changed.append(os.path.relpath(path, ROOT))

print(f"changed {len(changed)} files")
for c in changed:
    print(" ", c)
