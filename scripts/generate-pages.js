const fs = require("fs");
const path = require("path");
const { contact, nav, services, projects, process, insights, youtubeInsightFallbacks, jobs, team } = require("../data/site-data");

const root = path.resolve(__dirname, "..");
const cacheKey = "client-preview-20260623";
const brochure = "public/IDH-studio-overview.pdf";

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const whatsappHref = (message) =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;

const meta = {
  home: {
    file: "index.html",
    title: "Integrated Design Habitat - Architecture & Interiors",
    description: "Integrated Design Habitat (IDH) is a luxury architecture, interiors and spatial design studio in Manjeri, Kerala."
  },
  about: {
    file: "about.html",
    title: "About IDH - Integrated Design Habitat",
    description: "Learn about IDH, our journey, vision, mission, founder message, co-founder message, team and studio values."
  },
  services: {
    file: "services.html",
    title: "Services | Integrated Design Habitat",
    description: "Explore IDH's architecture, interior design, residential, commercial, hospitality and consultation services, along with our collaborative design process."
  },
  projects: {
    file: "projects.html",
    title: "Projects - Integrated Design Habitat",
    description: "Selected architecture, interior, commercial and hospitality projects by IDH."
  },
  insights: {
    file: "insights.html",
    title: "Insights - IDH Journal",
    description: "Announcements, news, articles and blog stories from Integrated Design Habitat."
  },
  careers: {
    file: "careers.html",
    title: "Careers - Integrated Design Habitat",
    description: "Career vacancies, internships and applications at Integrated Design Habitat."
  },
  contact: {
    file: "contact.html",
    title: "Contact - Integrated Design Habitat",
    description: "Contact IDH for general enquiries, sales, project quotes, careers and studio visits."
  },
  privacy: {
    file: "privacy-policy.html",
    title: "Privacy Policy - Integrated Design Habitat",
    description: "Privacy policy for Integrated Design Habitat website visitors and enquiry submissions."
  }
};

function header(active) {
  const links = nav
    .map(([label, href]) => `<a${label.toLowerCase() === active ? " class=\"active\"" : ""} href="${href}">${label}</a>`)
    .join("");
  return `
  <header class="site-header" id="siteHeader">
    <a class="brand brand-logo" href="index.html" aria-label="Integrated Design Habitat home">
      <img src="assets/idh-logo-transparent.png" alt="Integrated Design Habitat" />
    </a>
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
    <nav aria-label="Main navigation">${links}</nav>
    <a class="button button-gold header-cta" href="contact.html">Start Enquiry</a>
  </header>`;
}

function footer() {
  const footerNav = [
    ["Studio", "about.html", "&#9633;"],
    ["Services", "services.html", "&#9651;"],
    ["Projects", "projects.html", "&#9637;"],
    ["Contact", "contact.html", "&#9675;"]
  ];
  const socialIcons = {
    Instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.3" cy="6.7" r=".8"/></svg>`,
    Facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.2h2.1V4.8h-2.9c-3.1 0-4.4 1.9-4.4 4.2v2H6.5v3.6h2.3V20h3.8v-5.4h3l.5-3.6h-3.5V9.4c0-.8.4-1.2 1.4-1.2Z"/></svg>`,
    LinkedIn: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.1 9.2h3.2V20H5.1zM6.7 4.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM11 9.2h3.1v1.5c.5-.9 1.6-1.8 3.4-1.8 2.4 0 4 1.6 4 4.8V20h-3.2v-5.7c0-1.5-.5-2.4-1.8-2.4-1.4 0-2.2 1-2.2 2.4V20H11z"/></svg>`,
    YouTube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.2c-.2-1.1-.9-1.8-2-2C17.3 6 12 6 12 6s-5.3 0-7 .2c-1.1.2-1.8.9-2 2-.2 1.2-.2 3.8-.2 3.8s0 2.6.2 3.8c.2 1.1.9 1.8 2 2 1.7.2 7 .2 7 .2s5.3 0 7-.2c1.1-.2 1.8-.9 2-2 .2-1.2.2-3.8.2-3.8s0-2.6-.2-3.8Z"/><path d="m10.2 14.8 4.7-2.8-4.7-2.8Z"/></svg>`
  };
  const socials = Object.entries(contact.socials)
    .map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${socialIcons[label] || `<span>${label}</span>`}</a>`)
    .join("");

  return `
  <footer class="site-footer">
    <div class="footer-main footer-container">
      <div class="footer-identity">
        <a class="footer-logo-mark" href="index.html" aria-label="Integrated Design Habitat home">
          <img src="assets/idh-logo-transparent.png" alt="Integrated Design Habitat" />
        </a>
        <p>Architecture <i></i> Interiors <i></i> Spatial Design</p>
        <div class="footer-map" aria-label="IDH studio location map">
          <iframe title="IDH studio location map" loading="lazy" src="https://www.google.com/maps?q=Maas%20Tower%20Ground%20Floor%20Manjeri%20Malappuram%20Kerala&output=embed"></iframe>
        </div>
      </div>
      <div class="footer-connect">
        <div class="footer-title"><span>Get in touch</span><i></i></div>
        <a class="footer-contact-row" href="mailto:${contact.email}">
          <b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h18v12H3zM4 7l8 6 8-6"/></svg></b><span>${contact.email}</span>
        </a>
        <a class="footer-contact-row" href="tel:${contact.phoneHref}">
          <b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 3.5 5.5 6.1c-.7.7.1 3.5 3.7 7.1s6.4 4.4 7.1 3.7l2.6-2.7-3.4-2.3-1.7 1.6c-1.2-.5-2.8-2.1-3.3-3.3l1.6-1.7z"/></svg></b><span>${contact.phone}</span>
        </a>
        <div class="footer-contact-row">
          <b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11z"/><circle cx="12" cy="10" r="2"/></svg></b>
          <address>Maas Tower, Ground Floor<br />Manjeri, Malappuram, Kerala</address>
        </div>
      </div>
      <div class="footer-explore">
        <div class="footer-title"><span>Explore</span><i></i></div>
        <nav class="footer-nav" aria-label="Footer navigation">
          ${footerNav.map(([label, href, icon]) => `<a href="${href}"><b>${icon}</b><span>${label}</span><i>&rarr;</i></a>`).join("")}
        </nav>
      </div>
    </div>
    <div class="footer-divider"><i></i></div>
    <div class="footer-bottom footer-container">
      <p>&copy; 2025 Integrated Design Habitat (IDH). All rights reserved. <a href="privacy-policy.html">Privacy Policy</a></p>
      <p class="footer-purpose">Designed with purpose. Spaces that inspire.</p>
      <div class="footer-socials" aria-label="Social links">${socials}</div>
    </div>
  </footer>
  <a class="whatsapp" href="${whatsappHref("Hello IDH, I would like to enquire about your design services.")}" target="_blank" rel="noopener noreferrer" aria-label="Chat with Integrated Design Habitat on WhatsApp">
    <span>Chat on WhatsApp</span>
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path class="wa-bubble" d="M26.6 5.5A14.2 14.2 0 0 0 4.3 22.6L2.4 29.5l7.1-1.9A14.2 14.2 0 0 0 26.6 5.5Z" />
      <path class="wa-phone" d="M11.1 9.2c.3-.6.6-.6 1-.6h.8c.3 0 .6.1.8.7l1.2 2.9c.1.4.1.7-.1 1l-.9 1.1c-.3.3-.2.6 0 .9 1.1 1.9 2.7 3.4 4.7 4.4.4.2.7.2 1-.1l1.3-1.6c.3-.3.6-.4 1-.2l2.8 1.3c.5.2.8.4.8.7 0 .4-.2 2.1-1.4 3.1-1.1 1-2.6 1.2-3.4 1.1-1.1-.1-4.6-1.1-7.7-3.9-3.8-3.4-5-7.4-5.1-8.4-.1-1 .2-1.8.7-2.4.4-.4.8-.7 1.1-.9.3-.2.5-.4.6-.7Z" />
    </svg>
  </a>`;
}

function layout(key, active, body) {
  const page = meta[key];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${esc(page.description)}" />
  <title>${esc(page.title)}</title>
  <link rel="icon" type="image/png" href="assets/favicon.png" />
  <link rel="apple-touch-icon" href="assets/favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css?v=${cacheKey}" />
</head>
<body>
${header(active)}
${body}
${footer()}
  <script>window.IDH_SUPABASE_CONFIG = window.IDH_SUPABASE_CONFIG || {};</script>
  <script src="supabase-config.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="script.js?v=${cacheKey}"></script>
</body>
</html>
`;
}

function pageHero(eyebrow, title, copy, image = "architecture_placeholders_webp/04-hero-moody-interior-corner.webp") {
  return `
    <section class="page-hero">
      <img src="${image}" alt="" aria-hidden="true" />
      <div class="page-hero-scrim"></div>
      <div class="page-hero-content reveal">
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p>${copy}</p>
      </div>
    </section>`;
}

const brochureButton = `<a class="button button-outline" href="${brochure}" download>Download Brochure</a>`;

const serviceAnchor = (title) =>
  String(title)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const projectCategories = ["Residential Architecture", "Residential Interior", "Commercial Architecture", "Commercial Interior", "Landscape", "Others"];
const projectCategory = (project) => project.category || ({
  Residential: "Residential Architecture",
  Interiors: "Residential Interior",
  Commercial: "Commercial Interior",
  Hospitality: "Commercial Interior",
  Architecture: "Residential Architecture"
})[project.type] || "Others";

const serviceCards = (items = services) =>
  items.map((service) => `
    <article class="lux-card reveal">
      <img src="${service.image}" alt="${esc(service.title)}" loading="lazy" />
      <span>${service.number}</span>
      <h3>${service.title}</h3>
      <p>${service.excerpt}</p>
      <a href="services.html#${serviceAnchor(service.title)}">Explore <i>&rarr;</i></a>
    </article>`).join("");

const projectCards = (items = projects) =>
  items.map((project) => `
    <article class="project-card reveal" data-category="${esc(projectCategory(project))}">
      <div><img src="${project.image}" alt="${esc(project.title)}" loading="lazy" /></div>
      <p>${projectCategory(project)} &middot; ${project.location}</p>
      <h3>${project.title}</h3>
      <small>${project.excerpt}</small>
      <a href="projects/${serviceAnchor(project.title)}">View project &rarr;</a>
    </article>`).join("");

function enquiryForm(type = "general") {
  const isCareer = type === "career";
  const isSales = type === "sales";
  const target = isCareer ? contact.careersEmail : isSales ? contact.salesEmail : contact.email;
  return `
    <form class="lux-form reveal" data-mail-form data-recipient="${target}" data-subject="${isCareer ? "Career Application" : isSales ? "Sales Enquiry / Request a Quote" : "General Enquiry"}">
      <div class="form-grid">
        <label>Name<input name="Name" required /></label>
        <label>Email<input type="email" name="Email" required /></label>
        <label>Phone<input name="Phone" /></label>
        ${isCareer ? `
        <label>Position applying for<input name="Position" required /></label>
        <label>Experience level<select name="Experience level"><option>Internship</option><option>0-2 years</option><option>3-5 years</option><option>5+ years</option></select></label>
        <label>Portfolio link<input type="url" name="Portfolio link" placeholder="https://" /></label>
        <label class="full">Upload CV<input type="file" name="Upload CV" disabled /><small>Please attach your CV and portfolio when your email app opens, or email ${contact.careersEmail} directly.</small></label>` : `
        <label>${isSales ? "Project type" : "Enquiry type"}<select name="Enquiry type"><option>${isSales ? "Request a quote" : "General enquiry"}</option><option>Book consultation</option><option>Site visit</option><option>Partnership</option></select></label>
        <label>Preferred timeline<input name="Timeline" /></label>`}
        <label class="full">Message<textarea name="Message" rows="6" required></textarea></label>
      </div>
      <button class="button button-gold" type="submit">${isCareer ? "Send Application" : isSales ? "Send Sales Enquiry" : "Send Enquiry"}</button>
      <p class="form-note">This static form opens your email app and routes to <strong>${target}</strong>.</p>
    </form>`;
}

function home() {
  return layout("home", "home", `
  <main>
    <section class="hero" id="home" aria-labelledby="hero-title">
      <video class="hero-video" autoplay muted loop playsinline preload="auto">
        <source src="public/videos/optimized/idh-hero.webm" type="video/webm" />
        <source src="public/videos/optimized/idh-hero.mp4" type="video/mp4" />
      </video>
      <div class="hero-scrim"></div>
      <div class="hero-content reveal">
        <p class="eyebrow">Architecture <i></i> Interiors <i></i> Spatial Design</p>
        <h1 id="hero-title">Designing Spaces<br />With Quiet Luxury<br />&amp; <em>Purpose</em></h1>
        <p class="hero-copy">Integrated Design Habitat crafts refined residential, commercial and hospitality environments with timeless detail.</p>
        <div class="hero-actions"><a class="button button-gold" href="projects.html">View Projects</a><a class="button button-outline" href="contact.html">Start an Enquiry</a>${brochureButton}</div>
      </div>
      <div class="hero-meta"><span>Featured film</span><span>Integrated Design Habitat</span></div>
      <a class="scroll-cue" href="#about"><span>Scroll to explore</span><b>&darr;</b></a>
    </section>
    <section class="about-feature" id="about">
      <div class="about-scene reveal"><img src="architecture_placeholders_webp/05-about-studio-vignette.webp" alt="Atmospheric crafted interior by Integrated Design Habitat" loading="lazy" /><div class="about-panel"><div class="about-label"><p class="eyebrow">About the studio</p><i></i></div><h2>Design-Led.<br />Detail-Driven.<br />Purposeful Spaces.</h2><p>We create timeless environments shaped by intention, craft and a quiet commitment to quality.</p><p>Every project begins with its people and ends with a space that feels entirely their own.</p><a href="about.html">Learn more about us <span>&rsaquo;</span></a></div></div>
      <div class="about-metrics reveal"><div class="metric-card"><i class="metric-icon">&#9671;</i><strong>12+</strong><b></b><span>Years of experience</span></div><div class="metric-card"><i class="metric-icon">&#9635;</i><strong>250+</strong><b></b><span>Projects completed</span></div><div class="metric-card"><i class="metric-icon">&#9678;</i><strong>25+</strong><b></b><span>Cities worldwide</span></div></div>
    </section>
  </main>`);
}

function about() {
  const studioNotes = [
    ["Founder Message", "&ldquo;Quiet design has the power to change how we live.&rdquo;", "Every IDH project begins with listening. We look for the subtle details that make a space feel calm, personal and enduring, then shape them into architecture and interiors with purpose."],
    ["Co-founder Message", "&ldquo;The strongest spaces are built from clarity.&rdquo;", "Our role is to make the design journey precise and reassuring, bringing together creative direction, practical decisions and careful execution so each project moves with confidence."]
  ];
  const aboutTeam = [
    ["Founder", "Principal Designer", "assets/team-founder.png", "Guides the studio's creative direction with a focus on proportion, atmosphere and spaces that feel deeply personal."],
    ["Co-founder", "Design Director", "assets/team-cofounder.png", "Leads design coordination and project clarity, bringing structure, detail and calm decision-making into every stage."],
    ["Studio Team", "Architecture & Interiors", "assets/team-studio.png", "A collaborative team shaping refined residential, commercial and hospitality spaces."]
  ];
  return layout("about", "about", `
  <main>
    <section class="about-hero page-hero">
      <img src="architecture_placeholders_webp/05-about-studio-vignette.webp" alt="" aria-hidden="true" />
      <div class="page-hero-scrim"></div>
      <div class="page-hero-content reveal">
        <p class="eyebrow">About IDH</p>
        <h1>A studio shaped by restraint, craft and a sense of place.</h1>
        <p>Integrated Design Habitat is an architecture, interiors and spatial design studio based in Manjeri, Kerala, creating refined residential, commercial and hospitality spaces.</p>
      </div>
    </section>
    <section class="about-editorial about-journey reveal">
      <div><p class="eyebrow">Our Journey</p><h2>From thoughtful beginnings to enduring spatial identities.</h2></div>
      <p>IDH began with a simple belief: spaces should feel intentional, personal and quietly elevated. Our journey continues through residences, commercial interiors and hospitality environments that balance beauty with use.</p>
    </section>
    <section class="about-editorial about-duo">
      <article class="reveal"><p class="eyebrow">Vision</p><h2>To shape timeless habitats that enrich daily life.</h2><p>Our vision is to create architecture and interiors that remain relevant beyond trends, rooted in context, proportion and emotional clarity.</p></article>
      <article class="reveal"><p class="eyebrow">Mission</p><h2>To bring clarity, craft and care into every stage.</h2><p>We guide clients from first idea to final realisation through considered design, transparent communication and refined detailing.</p></article>
    </section>
    <section class="about-editorial about-notes">
      <div class="about-section-kicker reveal"><p class="eyebrow">Studio Notes</p><h2>From the Studio</h2></div>
      <div class="about-note-grid">${studioNotes.map(([label, quote, copy]) => `<article class="reveal"><span>${label}</span><h3>${quote}</h3><p>${copy}</p></article>`).join("")}</div>
    </section>
    <section class="about-editorial about-team">
      <div class="about-section-kicker reveal"><p class="eyebrow">Team</p><h2>The People Behind IDH</h2></div>
      <div class="about-team-grid">${aboutTeam.map(([name, role, image, note]) => `<article class="reveal"><img src="${image}" alt="${esc(name)}" loading="lazy" /><h3>${name}</h3><span>${role}</span><p>${note}</p></article>`).join("")}</div>
    </section>
  </main>`);
}

function servicesPage() {
  return layout("services", "services", `
  <main>
    ${pageHero("Services", "Design Services for Thoughtful Spaces", "Architecture, interiors and spatial design shaped with clarity, craft and purpose.", "services_section_images_webp/01-architecture-design-curved-staircase.webp")}
    <section class="content-section services-journey" id="design-services"><div class="section-heading reveal"><div><p class="eyebrow">Our Disciplines</p><h2>Design Services</h2></div>${brochureButton}</div><div class="detail-grid">${services.map((service) => `<article class="detail-card reveal" id="${serviceAnchor(service.title)}"><img src="${service.image}" alt="${esc(service.title)}" loading="lazy" /><span>${service.number}</span><h3>${service.title}</h3><p>${service.detail}</p><a href="contact.html">Discuss this service &rarr;</a></article>`).join("")}</div></section>
    <section class="content-section services-process" id="process"><div class="section-heading reveal"><div><p class="eyebrow">How We Work</p><h2>Our Process</h2></div><p class="section-note">A clear, collaborative path from first conversation to considered realisation.</p></div><div class="timeline-grid">${process.map(([num, title, text]) => `<article class="reveal"><span>${num}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}</div></section>
    <section class="contact-cta"><p class="eyebrow">Begin a conversation</p><h2>Ready to begin your project?</h2><p>Share your vision with us and we'll guide you through the next steps.</p><div class="cta-actions"><a class="button button-gold" href="contact.html">Start an Enquiry</a>${brochureButton}</div></section>
  </main>`);
}

function projectsPage() {
  return layout("projects", "projects", `
  <main>
    ${pageHero("Projects", "Selected spaces crafted with intention.", "A curated selection of residential, commercial, hospitality and spatial design work by IDH.", "architecture_placeholders_webp/06-project-private-residence.webp")}
    <section class="content-section">
      <div class="project-category-filter reveal" data-project-filters>
        <button class="active" data-project-category="">All</button>
        ${projectCategories.map((category) => `<button data-project-category="${category}">${category}</button>`).join("")}
      </div>
      <div class="project-grid expanded" data-dynamic-projects>${projectCards(projects)}</div>
    </section>
  </main>`);
}

function projectDetailPage() {
  return layout("projects", "projects", `
  <main>
    <section class="page-hero project-detail-hero">
      <img src="architecture_placeholders_webp/06-project-private-residence.webp" alt="" aria-hidden="true" data-project-cover />
      <div class="page-hero-scrim"></div>
      <div class="page-hero-content reveal" data-project-detail>
        <p class="eyebrow">Projects</p>
        <h1>Loading project...</h1>
        <p>Please wait while the project opens.</p>
      </div>
    </section>
    <section class="content-section policy-copy insight-detail-copy" data-project-body>
      <p>Loading...</p>
    </section>
  </main>`);
}

function insightsPage() {
  const manualInsights = insights.filter((post) => ["Article", "Blog"].includes(post.category));
  const youtubeFallbackCards = youtubeInsightFallbacks.map((post) => `
      <article class="insight-card video-insight-card reveal${post.videoId ? "" : " is-fallback"}" data-youtube-card${post.videoId ? ` data-video-id="${esc(post.videoId)}"` : ""}>
        <button class="video-thumb" type="button" ${post.videoId ? `data-video-id="${esc(post.videoId)}"` : "disabled"} aria-label="${post.videoId ? `Play ${esc(post.title)}` : "Video unavailable"}">
          <img src="${post.image}" alt="${esc(post.title)}" loading="lazy" />
          <span class="play-overlay" aria-hidden="true"></span>
        </button>
        <div>
          <span>${post.category}</span>
          <small>${post.date}</small>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
        </div>
      </article>`).join("");

  return layout("insights", "insights", `
  <main>
    ${pageHero("Insights", "Announcements, news, articles and studio notes.", "A curated journal of IDH updates, design thinking and studio observations.", "architecture_placeholders_webp/10-insight-designing-wellbeing.webp")}
    <section class="content-section insight-categories">${["Announcement","News","Article","Blog"].map((cat) => `<a href="#${cat.toLowerCase()}">${cat}</a>`).join("")}</section>
    <section class="content-section insight-live-section" aria-labelledby="youtube-insights-title">
      <div class="section-heading reveal">
        <div>
          <p class="eyebrow">YouTube Updates</p>
          <h2 id="youtube-insights-title">Announcements &amp; News</h2>
        </div>
      </div>
      <div class="insight-grid" data-youtube-insights aria-live="polite">${youtubeFallbackCards}</div>
    </section>
    <section class="content-section insight-grid" data-dynamic-insights>${manualInsights.map((post) => `<article class="insight-card reveal" id="${post.category.toLowerCase()}"><img src="${post.image}" alt="${esc(post.title)}" loading="lazy" /><div><span>${post.category}</span><small>${post.date}</small><h3>${post.title}</h3><p>${post.excerpt}</p><a href="insights.html">Read more &rarr;</a></div></article>`).join("")}</section>
    <div class="video-modal" data-video-modal aria-hidden="true">
      <button class="video-modal-close" type="button" data-video-modal-close aria-label="Close video">&times;</button>
      <div class="video-modal-frame" role="dialog" aria-modal="true" aria-label="IDH Insights video">
        <iframe title="IDH Insights video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    </div>
  </main>`);
}

function insightDetailPage() {
  return layout("insights", "insights", `
  <main>
    <section class="page-hero insight-detail-hero">
      <img src="architecture_placeholders_webp/10-insight-designing-wellbeing.webp" alt="" aria-hidden="true" data-insight-cover />
      <div class="page-hero-scrim"></div>
      <div class="page-hero-content reveal" data-insight-detail>
        <p class="eyebrow">Insights</p>
        <h1>Loading insight...</h1>
        <p>Please wait while the article opens.</p>
      </div>
    </section>
    <section class="content-section policy-copy insight-detail-copy" data-insight-body>
      <p>Loading...</p>
    </section>
  </main>`);
}

function careersPage() {
  return layout("careers", "careers", `
  <main>
    ${pageHero("Careers", "Join a studio where detail still matters.", "Explore vacancies, internships and future opportunities with Integrated Design Habitat.", "architecture_placeholders_webp/07-project-commercial-office.webp")}
    <section class="content-section"><div class="section-heading reveal"><div><p class="eyebrow">Open Roles</p><h2>Vacancies & Internships</h2></div></div><div class="job-grid" data-dynamic-careers>${jobs.map((job) => `<article class="job-card reveal"><span>${job.type}</span><h3>${job.title}</h3><p>${job.location}</p><small>${job.summary}</small><a data-career-apply data-role="${serviceAnchor(job.title)}" href="#apply">Apply &rarr;</a></article>`).join("")}</div></section>
    <section class="content-section form-section" id="apply"><div class="form-copy reveal"><p class="eyebrow">Apply</p><h2>Career Application</h2><p>Career, job and internship enquiries route to <strong>${contact.careersEmail}</strong>.</p></div>${enquiryForm("career")}</section>
  </main>`);
}

function contactPage() {
  return layout("contact", "contact", `
  <main>
    ${pageHero("Contact", "Begin with a conversation.", "Reach IDH for general enquiries, sales, quotes, careers, studio visits and collaborations.", "architecture_placeholders_webp/08-project-boutique-hotel-lounge.webp")}
    <section class="content-section contact-panels"><article class="reveal"><p class="eyebrow">General</p><h2>Studio Contact</h2><p><a href="mailto:${contact.email}">${contact.email}</a><br /><a href="mailto:${contact.salesEmail}">${contact.salesEmail}</a><br /><a href="mailto:${contact.careersEmail}">${contact.careersEmail}</a><br /><a href="tel:${contact.phoneHref}">${contact.phone}</a><br />${contact.address}</p><div class="social-row">${Object.entries(contact.socials).map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`).join("")}</div></article><article class="reveal"><p class="eyebrow">WhatsApp</p><h2>Quick Actions</h2><div class="cta-actions stacked"><a class="button button-gold" href="${whatsappHref("Hello IDH, I would like to book a design consultation.")}" target="_blank" rel="noopener noreferrer">Book Consultation</a><a class="button button-outline" href="${whatsappHref("Hello IDH, I would like to request a quote for my project.")}" target="_blank" rel="noopener noreferrer">Request a Quote</a><a class="button button-outline" href="careers.html">Career Enquiry</a></div></article></section>
    <section class="content-section form-section"><div class="form-copy reveal"><p class="eyebrow">General Enquiry</p><h2>Write to IDH</h2><p>General enquiries route to <strong>${contact.email}</strong>.</p></div>${enquiryForm("general")}</section>
    <section class="content-section form-section"><div class="form-copy reveal"><p class="eyebrow">Sales</p><h2>Request a Quote</h2><p>Sales enquiries and quote requests route to <strong>${contact.salesEmail}</strong>.</p></div>${enquiryForm("sales")}</section>
    <section class="content-section map-section"><div class="section-heading reveal"><div><p class="eyebrow">Visit</p><h2>Find the Studio</h2></div></div><div class="map-frame"><iframe title="IDH studio location map" loading="lazy" src="https://www.google.com/maps?q=Maas%20Tower%20Ground%20Floor%20Manjeri%20Malappuram%20Kerala&output=embed"></iframe><div class="map-caption">Maas Tower, Ground Floor &middot; Manjeri, Malappuram, Kerala</div></div></section>
  </main>`);
}

function privacyPage() {
  return layout("privacy", "", `
  <main>
    ${pageHero("Privacy Policy", "A clear note on how IDH handles enquiries.", "How Integrated Design Habitat treats enquiry, sales and career information submitted through this website.", "architecture_placeholders_webp/09-insight-natural-materials.webp")}
    <section class="content-section policy-copy reveal">
      <h2>Privacy Policy</h2>
      <p>Integrated Design Habitat (IDH) collects only the information voluntarily shared through enquiry, sales and career forms, including name, contact details, project information, portfolio links and messages.</p>
      <p>General enquiries are routed to ${contact.email}. Sales and quote requests are routed to ${contact.salesEmail}. Career, job and internship enquiries are routed to ${contact.careersEmail}.</p>
      <p>We use this information only to respond to requests, evaluate applications and communicate about relevant studio services. We do not sell personal information.</p>
      <p>This website currently opens the visitor's email client for submissions. If a database or third-party form service is connected later, this policy should be updated to describe that service.</p>
      <p>For privacy questions, contact <a href="mailto:${contact.email}">${contact.email}</a>.</p>
    </section>
  </main>`);
}

const pages = {
  [meta.home.file]: home(),
  [meta.about.file]: about(),
  [meta.services.file]: servicesPage(),
  [meta.projects.file]: projectsPage(),
  ["project.html"]: projectDetailPage(),
  [meta.insights.file]: insightsPage(),
  ["insight.html"]: insightDetailPage(),
  [meta.careers.file]: careersPage(),
  [meta.contact.file]: contactPage(),
  [meta.privacy.file]: privacyPage()
};

for (const [file, html] of Object.entries(pages)) {
  fs.writeFileSync(path.join(root, file), html, "utf8");
}

console.log(`Generated ${Object.keys(pages).length} static pages.`);
