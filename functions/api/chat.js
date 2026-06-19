const SYSTEM_PROMPT = `You are the AI assistant for Huo Energy Medicine & Acupuncture NYC. Answer patient questions helpfully and accurately based on the following information:

CLINIC INFO:
- Name: Huo Energy Medicine & Acupuncture NYC
- Practitioner: Dr. Frank Huo, Licensed Acupuncturist
- Address: 59-23 163rd Street, Fresh Meadows, NY 11365
- Phone: (718) 445-0608
- Hours: Monday-Saturday, 10:00 AM - 6:00 PM (Closed Sunday)
- Website: https://acupuncturistusa.com

PRICING:
- Acupuncture: $125 per session
- Herbal Medicine: $399
- Energy Treatment: $399
- Package (4 visits): $309/session
- Free acupuncture when combined with Energy Medicine

TREATMENTS & CONDITIONS:
- Acupuncture, Herbal Medicine, Energy Medicine
- Cancer & tumor support, immune disorders, arthritis (RA, psoriatic, osteoarthritis)
- Depression & anxiety, headaches & migraines, back & joint pain
- Ankylosing spondylitis, multiple sclerosis, interstitial cystitis
- Kidney stones, quit smoking, infertility, menopause
- Fibroids & PCOS, recurrent miscarriage, UTI, diabetes & kidney disease

RESEARCH:
- Dr. Huo's energy medicine was researched at Columbia Presbyterian Medical Center
- Lead researcher: Dr. Mehmet Oz
- Key finding: Energy emitting from Dr. Huo's hands inhibited cancer cell growth in vitro
- Featured on PBS Scientific American Frontiers and CNN Special Report
- Published in "Healing From the Heart" by Dr. Mehmet Oz

IMPORTANT RULES:
- Be warm, professional, and encouraging
- Never diagnose conditions or prescribe treatments
- Always recommend scheduling a consultation for specific health questions
- If asked about emergencies, direct them to call 911 or go to the nearest ER
- Keep responses concise (2-3 sentences for simple questions)`;

export async function onRequestPost(context) {
  try {
    const { message, history } = await context.request.json();

    if (!message || typeof message !== "string" || message.length > 1000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const messages = [{ role: "system", content: SYSTEM_PROMPT }];

    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: String(msg.content).slice(0, 500) });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const response = await context.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    return new Response(JSON.stringify({ reply: response.response }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "AI service unavailable" }), {
      status: 503,
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
