const WEBMCP_SCRIPT = `<script>
(function(){
  var tools = [
    {
      name: "get_clinic_info",
      description: "Get contact information, address, hours, and pricing for Huo Energy Medicine & Acupuncture NYC",
      inputSchema: { type: "object", properties: {} },
      execute: function() {
        return {
          name: "Huo Energy Medicine & Acupuncture NYC",
          practitioner: "Dr. Frank Huo",
          phone: "(718) 445-0608",
          address: "59-23 163rd Street, Fresh Meadows, NY 11365",
          hours: "Monday-Saturday, 10:00 AM - 6:00 PM",
          pricing: { acupuncture: "$125", herbal_medicine: "$399", energy_treatment: "$399", package_4_visits: "$309/session" },
          website: "https://acupuncturistusa.com"
        };
      }
    },
    {
      name: "list_treatments",
      description: "List all conditions and treatments offered by the clinic",
      inputSchema: { type: "object", properties: {} },
      execute: function() {
        return {
          treatments: ["Cancer & Tumor Support","Immune Disorders","Arthritis","Depression & Anxiety","Headaches & Migraines","Back & Joint Pain","Ankylosing Spondylitis","Multiple Sclerosis","Interstitial Cystitis","Kidney Stones","Quit Smoking","Infertility","Menopause","Fibroids & PCOS","Recurrent Miscarriage","UTI","Diabetes & Kidney Disease"],
          modalities: ["Acupuncture","Herbal Medicine","Energy Medicine"],
          details_url: "https://acupuncturistusa.com/acupuncture"
        };
      }
    },
    {
      name: "get_research_info",
      description: "Get published research and credentials for Dr. Frank Huo's energy medicine",
      inputSchema: { type: "object", properties: {} },
      execute: function() {
        return {
          research_institution: "Columbia Presbyterian Medical Center",
          lead_researcher: "Dr. Mehmet Oz",
          key_finding: "Energy emitting from Dr. Huo's finger inhibited cancer cell growth in vitro",
          media: ["PBS Scientific American Frontiers","CNN Special Report"],
          publications_url: "https://acupuncturistusa.com/downloads"
        };
      }
    }
  ];
  window.__webmcp_tools = tools;
  if (typeof navigator !== "undefined" && navigator.modelContext) {
    if (navigator.modelContext.registerTool) {
      var c = new AbortController();
      tools.forEach(function(t){ navigator.modelContext.registerTool(t, {signal:c.signal}); });
      window.__webmcp_abort = c;
    } else if (navigator.modelContext.provideContext) {
      navigator.modelContext.provideContext({tools:tools});
    }
  }
})();
</script>`;

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname === "/robots.txt") {
    return new Response(`User-agent: *
Allow: /
Sitemap: https://acupuncturistusa.com/sitemap.xml
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /
`, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  if (url.pathname === "/agent/register" && context.request.method === "POST") {
    return new Response(JSON.stringify({
      credential_type: "public",
      access: "anonymous",
      token: "public-access",
      scopes: ["public"],
      message: "This is a public informational website. No authentication is required. All content is freely accessible."
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/agent/register" && context.request.method === "GET") {
    return new Response(JSON.stringify({
      registration_endpoint: "https://acupuncturistusa.com/agent/register",
      method: "POST",
      identity_types_supported: ["anonymous"],
      credential_types_supported: ["public"],
      authentication_required: false,
      description: "Public site. POST to register as an anonymous agent. No credentials required."
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (context.request.method === "OPTIONS" && (url.pathname.startsWith("/.well-known/") || url.pathname === "/agent/register")) {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Accept, Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const accept = context.request.headers.get("Accept") || "";
  const response = await context.next();
  const contentType = response.headers.get("Content-Type") || "";

  if (accept.includes("text/markdown") && contentType.includes("text/html")) {
    const html = await response.text();
    const markdown = htmlToMarkdown(html);
    const tokens = Math.ceil(markdown.length / 4);
    return new Response(markdown, {
      status: response.status,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": String(tokens),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  if (contentType.includes("text/html")) {
    const html = await response.text();
    const injected = html.replace("</head>", WEBMCP_SCRIPT + "</head>").replace("</body>", '<script src="/js/ai-widget.js"></script></body>');
    const newHeaders = new Headers(response.headers);
    newHeaders.delete("content-length");
    return new Response(injected, {
      status: response.status,
      headers: newHeaders,
    });
  }

  return response;
}

function htmlToMarkdown(html) {
  let body = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) body = bodyMatch[1];

  body = body.replace(/<script[\s\S]*?<\/script>/gi, "");
  body = body.replace(/<style[\s\S]*?<\/style>/gi, "");
  body = body.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  body = body.replace(/<header[\s\S]*?<\/header>/gi, "");
  body = body.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  body = body.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  body = body.replace(/<form[\s\S]*?<\/form>/gi, "");
  body = body.replace(/<button[\s\S]*?<\/button>/gi, "");

  body = body.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, c) => `# ${strip(c)}\n\n`);
  body = body.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `## ${strip(c)}\n\n`);
  body = body.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `### ${strip(c)}\n\n`);
  body = body.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, c) => `#### ${strip(c)}\n\n`);

  body = body.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const t = strip(text);
    if (!t || href.startsWith("tel:") || href.startsWith("#")) return t;
    return `[${t}](${href})`;
  });

  body = body.replace(/<img[^>]+alt="([^"]*)"[^>]*>/gi, (_, alt) => alt ? `![${alt}]` : "");
  body = body.replace(/<img[^>]*>/gi, "");

  body = body.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, c) => `**${strip(c)}**`);
  body = body.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, c) => `**${strip(c)}**`);
  body = body.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, c) => `*${strip(c)}*`);

  body = body.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, c) => `- ${strip(c)}\n`);
  body = body.replace(/<\/?[uo]l[^>]*>/gi, "\n");

  body = body.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => `${strip(c)}\n\n`);
  body = body.replace(/<br\s*\/?>/gi, "\n");
  body = body.replace(/<hr\s*\/?>/gi, "\n---\n\n");

  body = body.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) => `> ${strip(c)}\n\n`);

  body = body.replace(/<[^>]+>/g, "");

  body = body.replace(/&amp;/g, "&");
  body = body.replace(/&lt;/g, "<");
  body = body.replace(/&gt;/g, ">");
  body = body.replace(/&quot;/g, '"');
  body = body.replace(/&#39;/g, "'");
  body = body.replace(/&rsquo;/g, "'");
  body = body.replace(/&lsquo;/g, "'");
  body = body.replace(/&rdquo;/g, "”");
  body = body.replace(/&ldquo;/g, "“");
  body = body.replace(/&ndash;/g, "–");
  body = body.replace(/&mdash;/g, "—");
  body = body.replace(/&hellip;/g, "…");
  body = body.replace(/&#\d+;/g, (m) => {
    const code = parseInt(m.slice(2, -1));
    return String.fromCharCode(code);
  });

  body = body.replace(/\n{3,}/g, "\n\n");
  body = body.trim();

  return body;
}

function strip(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
