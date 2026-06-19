const PAGES = [
  { url: "/", title: "Home", keywords: "acupuncture nyc energy medicine dr frank huo fresh meadows queens new york free treatment" },
  { url: "/acupuncture", title: "Acupuncture Treatments", keywords: "acupuncture treatments conditions pain relief healing needles meridians qi" },
  { url: "/energy-medicine", title: "Energy Medicine", keywords: "energy medicine healing qi gong external qi therapy cancer research columbia" },
  { url: "/herbal-medicine", title: "Herbal Medicine", keywords: "herbal medicine chinese herbs natural remedies traditional formulas" },
  { url: "/pricing", title: "Pricing", keywords: "pricing cost fees insurance payment acupuncture session package" },
  { url: "/contact", title: "Contact & Location", keywords: "contact phone address location directions fresh meadows queens appointment" },
  { url: "/about", title: "About Dr. Huo", keywords: "about dr frank huo acupuncturist licensed practitioner experience credentials" },
  { url: "/downloads", title: "Research & Publications", keywords: "research publications studies columbia presbyterian dr oz cancer cells scientific" },
  { url: "/testimonials", title: "Patient Testimonials", keywords: "testimonials reviews patients success stories results experiences" },
  { url: "/faq", title: "FAQ", keywords: "faq questions answers common first visit insurance accepted" },
  { url: "/arthritis", title: "Arthritis Treatment", keywords: "arthritis rheumatoid psoriatic osteoarthritis joint pain inflammation" },
  { url: "/cancer", title: "Cancer Support", keywords: "cancer tumor support treatment complementary oncology immune" },
  { url: "/depression", title: "Depression & Anxiety", keywords: "depression anxiety mental health stress emotional mood disorders" },
  { url: "/headaches", title: "Headaches & Migraines", keywords: "headaches migraines tension chronic pain relief" },
  { url: "/back-pain", title: "Back Pain", keywords: "back pain lower upper spine sciatica disc herniated" },
  { url: "/infertility", title: "Infertility Treatment", keywords: "infertility fertility ivf support conception pregnancy reproductive" },
  { url: "/menopause", title: "Menopause Relief", keywords: "menopause hot flashes hormonal balance night sweats" },
  { url: "/quit-smoking", title: "Quit Smoking", keywords: "quit smoking cessation addiction cravings withdrawal" },
  { url: "/kidney-stones", title: "Kidney Stones", keywords: "kidney stones pain urinary tract renal" },
  { url: "/ms", title: "Multiple Sclerosis", keywords: "multiple sclerosis ms autoimmune neurological" },
  { url: "/immune-disorders", title: "Immune Disorders", keywords: "immune disorders autoimmune system boost defense" },
  { url: "/diabetes", title: "Diabetes & Kidney Disease", keywords: "diabetes kidney disease blood sugar insulin renal" },
  { url: "/ankylosing-spondylitis", title: "Ankylosing Spondylitis", keywords: "ankylosing spondylitis spine stiffness autoimmune" },
  { url: "/interstitial-cystitis", title: "Interstitial Cystitis", keywords: "interstitial cystitis bladder pain urinary" },
  { url: "/fibroids", title: "Fibroids & PCOS", keywords: "fibroids pcos polycystic ovary uterine" },
  { url: "/recurrent-miscarriage", title: "Recurrent Miscarriage", keywords: "recurrent miscarriage pregnancy loss fertility support" },
  { url: "/uti", title: "UTI Treatment", keywords: "uti urinary tract infection bladder" },
];

export async function onRequestPost(context) {
  try {
    const { query } = await context.request.json();

    if (!query || typeof query !== "string" || query.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid query" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const q = query.toLowerCase();
    const terms = q.split(/\s+/).filter(t => t.length > 2);

    const scored = PAGES.map(page => {
      let score = 0;
      for (const term of terms) {
        if (page.title.toLowerCase().includes(term)) score += 3;
        if (page.keywords.includes(term)) score += 1;
      }
      return { ...page, score };
    }).filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

    let aiSummary = null;
    if (context.env.AI && scored.length > 0) {
      try {
        const result = await context.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
          messages: [
            { role: "system", content: "You help visitors find information on an acupuncture clinic website. Given a search query and matching pages, write a 1-2 sentence helpful summary directing them. Be concise." },
            { role: "user", content: `Query: "${query}"\nMatching pages: ${scored.map(p => p.title).join(", ")}` }
          ],
          max_tokens: 100,
          temperature: 0.5,
        });
        aiSummary = result.response;
      } catch {}
    }

    return new Response(JSON.stringify({
      results: scored.map(({ url, title, score }) => ({ url, title, score })),
      summary: aiSummary,
      total: scored.length,
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Search failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
