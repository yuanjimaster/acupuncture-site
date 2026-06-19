document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // WebMCP: expose site tools to AI agents
  var webmcpTools = [
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
              treatments: [
                "Cancer & Tumor Support", "Immune Disorders", "Arthritis (RA, Psoriatic, Osteo)",
                "Depression & Anxiety", "Headaches & Migraines", "Back & Joint Pain",
                "Ankylosing Spondylitis", "Multiple Sclerosis", "Interstitial Cystitis",
                "Kidney Stones", "Quit Smoking", "Infertility", "Menopause",
                "Fibroids & PCOS", "Recurrent Miscarriage", "UTI", "Diabetes & Kidney Disease"
              ],
              modalities: ["Acupuncture", "Herbal Medicine", "Energy Medicine"],
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
              media: ["PBS Scientific American Frontiers", "CNN Special Report"],
              book: "Healing From the Heart by Dr. Mehmet Oz",
              publications_url: "https://acupuncturistusa.com/downloads"
            };
          }
        }
  ];
  if (typeof navigator !== 'undefined' && navigator.modelContext && navigator.modelContext.registerTool) {
    var controller = new AbortController();
    webmcpTools.forEach(function(tool) {
      navigator.modelContext.registerTool(tool, { signal: controller.signal });
    });
    window.__webmcp_abort = controller;
  }
  window.__webmcp_tools = webmcpTools;

  // Active nav link
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.startsWith('tel:')) return;
    href = href.replace(/\/$/, '') || '/';
    if (href === path) {
      link.classList.add('active');
    }
  });
});
