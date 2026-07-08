/* WebMCP tools — Huo Energy Medicine & Acupuncture (acupuncturistusa.com)
   Registers site tools for in-browser AI agents via navigator.modelContext.
   Supports both provideContext({tools}) (early API) and registerTool(tool) (spec). */
(function () {
  "use strict";

  var SITE = "https://acupuncturistusa.com";

  var CLINIC = {
    name: "Huo Energy Medicine & Acupuncture",
    practitioner: "Dr. Frank Huo, Ph.D, L.Ac. (NCCAOM board certified)",
    address: "59-23 163rd Street, Fresh Meadows, NY 11365",
    phone: "(718) 445-0608",
    email: "yuanjimaster@gmail.com",
    rating: "4.8/5 from 45 aggregated reviews (Birdeye)",
    reviewLinks: {
      google: "https://g.page/r/Cckckx7C7iUDEAI/review",
      yelp: "https://biz.yelp.com/r2r/T6wRX7Zf04oB5XjFBnvIBw"
    },
    website: SITE
  };

  var CONDITIONS = {
    "arthritis": "Acupuncture for arthritis pain (rheumatoid, psoriatic, osteoarthritis)",
    "back-and-joints-pain": "Acupuncture for back and joint pain",
    "ankylosing-spondylitis": "Acupuncture for ankylosing spondylitis",
    "headaches-and-migraines": "Acupuncture for headaches and migraines",
    "depression-and-anxiety": "Acupuncture for depression and anxiety",
    "infertility": "Acupuncture for infertility (PCOS, endometriosis, IVF support)",
    "fibroids-and-cysts": "Acupuncture for uterine fibroids and ovarian cysts",
    "menopause": "Acupuncture for menopause symptom relief",
    "acupuncture-for-uti": "Acupuncture for chronic UTI and interstitial cystitis",
    "kidney-stone-dissolved": "Acupuncture for kidney stones",
    "diabetes-and-kidney-disease": "Acupuncture for diabetes and kidney disease",
    "immune-disorders": "Acupuncture for immune and autoimmune disorders",
    "multiple-sclerosis": "Acupuncture for multiple sclerosis",
    "acupuncture-for-cancer": "Acupuncture support during cancer care",
    "quit-smoking": "Quit smoking with acupuncture"
  };

  var STORIES = {
    "acupuncture-for-autism-kids": "Acupuncture for kids with autism",
    "acupuncture-for-infertility": "Infertility case",
    "acupuncture-for-miscarriage": "Recurrent miscarriage case",
    "acupuncture-for-rosacea": "Rosacea case",
    "acupuncture-formyalgic-encephalomyelitischronic-fatigue-syndrome": "ME/CFS case",
    "blood-cancer-low-platelet-count": "Blood cancer, low platelet count",
    "healing-of-chronic-interstitial-cystitis-hunners-ulcers": "Chronic interstitial cystitis / Hunner's ulcers",
    "hepatitis-b-virus-count-is-down-9956--in-six-weeks": "Hepatitis B viral load down 99.56% in six weeks",
    "irregular-menstrual": "Irregular menstruation case",
    "knee-pain-and-tingling-in-toes-and-fingers": "Knee pain and tingling in toes and fingers",
    "menopause": "Menopause case",
    "prostate-cancer": "Prostate cancer case",
    "the-degree-of-enhancement-and-size-of-brain-tumor-has-decreased": "Brain tumor enhancement and size decreased",
    "uterine-fibroid-shrinking-and-ovarian-cyst-resolved": "Uterine fibroid shrinking, ovarian cyst resolved"
  };

  function text(obj) {
    return { content: [{ type: "text", text: JSON.stringify(obj, null, 2) }] };
  }

  var TOOLS = [
    {
      name: "get_clinic_info",
      description: "Get the clinic's name, practitioner, address, phone, email, rating and review links for Huo Energy Medicine & Acupuncture in Fresh Meadows, Queens, NYC.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () { return Promise.resolve(text(CLINIC)); }
    },
    {
      name: "list_conditions_treated",
      description: "List all medical conditions treated at the clinic, each with its information page URL.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () {
        var out = Object.keys(CONDITIONS).map(function (k) {
          return { condition: CONDITIONS[k], url: SITE + "/" + k };
        });
        return Promise.resolve(text(out));
      }
    },
    {
      name: "find_condition_page",
      description: "Find the clinic's information page for a given condition or symptom (e.g. 'migraine', 'infertility', 'knee pain'). Returns the best-matching page URL.",
      inputSchema: {
        type: "object",
        properties: { condition: { type: "string", description: "Condition, disease or symptom to look up" } },
        required: ["condition"], additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: function (input) {
        var q = String((input && input.condition) || "").toLowerCase();
        var hits = Object.keys(CONDITIONS).filter(function (k) {
          return k.indexOf(q.replace(/\s+/g, "-")) >= 0 || CONDITIONS[k].toLowerCase().indexOf(q) >= 0;
        }).map(function (k) { return { condition: CONDITIONS[k], url: SITE + "/" + k }; });
        return Promise.resolve(text(hits.length ? hits : {
          match: null,
          note: "No exact page; the clinic treats a wide range of conditions — call (718) 445-0608 to ask.",
          allConditions: SITE + "/"
        }));
      }
    },
    {
      name: "list_patient_stories",
      description: "List real patient case stories published on the clinic blog, each with URL.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () {
        var out = Object.keys(STORIES).map(function (k) {
          return { story: STORIES[k], url: SITE + "/blog/f/" + k };
        });
        return Promise.resolve(text(out));
      }
    },
    {
      name: "request_appointment",
      description: "Get instructions to book an appointment at the clinic (phone and email; no online booking system).",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () {
        return Promise.resolve(text({
          how: "Call or email to book. Mention your condition briefly.",
          phone: CLINIC.phone, email: CLINIC.email, address: CLINIC.address,
          faq: SITE + "/faq"
        }));
      }
    },
    {
      name: "get_review_links",
      description: "Get direct links to leave the clinic a review on Google or Yelp.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () {
        return Promise.resolve(text({ reviewPage: SITE + "/review", links: CLINIC.reviewLinks }));
      }
    }
  ];

  function register(mc) {
    try {
      if (typeof mc.provideContext === "function") {
        mc.provideContext({ tools: TOOLS });
        return true;
      }
      if (typeof mc.registerTool === "function") {
        TOOLS.forEach(function (t) { mc.registerTool(t); });
        return true;
      }
    } catch (e) { /* agent context unavailable; stay silent */ }
    return false;
  }

  var mc = (typeof navigator !== "undefined" && navigator.modelContext) ||
           (typeof document !== "undefined" && document.modelContext);
  if (mc) { register(mc); }
})();
