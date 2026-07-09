const contact = {
  email: "info@idharchitecture.com",
  salesEmail: "sales@idharchitecture.com",
  careersEmail: "careers@idharchitecture.com",
  phone: "+91 99170 70111",
  phoneHref: "+919917070111",
  address: "Maas Tower, Ground Floor, Manjeri, Malappuram, Kerala",
  whatsapp: "919917070111",
  socials: {
    Instagram: "https://www.instagram.com/idh_llc?igsh=YXNlZWNsNHdocXZj",
    Facebook: "https://www.facebook.com/share/18zVrRfJFG/",
    LinkedIn: "https://www.linkedin.com/company/integrated-design-habitat/",
    YouTube: "https://youtube.com/@integrateddesignhabitatidh?si=MFk1Va1-z9uE1dz3"
  }
};

const nav = [
  ["Home", "index.html"],
  ["About", "about.html"],
  ["Services", "services.html"],
  ["Projects", "projects.html"],
  ["Insights", "insights.html"],
  ["Careers", "careers.html"],
  ["Contact", "contact.html"]
];

const services = [
  {
    number: "01",
    title: "Architecture Design",
    image: "services_section_images_webp/01-architecture-design-curved-staircase.webp",
    excerpt: "Thoughtful architecture rooted in context, proportion, climate and everyday life.",
    detail: "From early site response and massing to detailed spatial planning, IDH crafts architecture that feels calm, intelligent and deeply personal."
  },
  {
    number: "02",
    title: "Interior Design",
    image: "services_section_images_webp/02-interior-design-lounge-corner.webp",
    excerpt: "Refined interiors that elevate atmosphere, comfort and the experience within a space.",
    detail: "Material palettes, furniture, lighting, joinery and finishing details are composed with quiet restraint and enduring elegance."
  },
  {
    number: "03",
    title: "Residential Design",
    image: "services_section_images_webp/03-residential-design-modern-courtyard.webp",
    excerpt: "Elegant homes shaped around the rhythms, rituals and aspirations of the people who live in them.",
    detail: "Private residences, villas and apartments are planned with privacy, warmth, flow and long-term usability at the centre."
  },
  {
    number: "04",
    title: "Commercial Interiors",
    image: "services_section_images_webp/04-commercial-interiors-corridor.webp",
    excerpt: "Workspaces and branded environments that support productivity while expressing identity.",
    detail: "We design offices, studios, showrooms and customer-facing spaces where atmosphere and performance work together."
  },
  {
    number: "05",
    title: "Hospitality Design",
    image: "services_section_images_webp/05-hospitality-design-dining.webp",
    excerpt: "Memorable hospitality spaces that invite, engage and remain with guests long after they leave.",
    detail: "Restaurants, boutique stays and public lounges are designed with layered ambience, service logic and a sense of place."
  },
  {
    number: "06",
    title: "Project Consultation",
    image: "services_section_images_webp/06-project-consultation-still-life.webp",
    excerpt: "Expert design guidance from concept clarity to successful project delivery.",
    detail: "For clients who need a precise second eye, we offer concept reviews, feasibility input, material direction and execution strategy."
  }
];

const projects = [
  {
    title: "Private Residence",
    type: "Residential",
    location: "Kerala",
    image: "architecture_placeholders_webp/06-project-private-residence.webp",
    excerpt: "A contemporary residence balancing privacy, layered light and grounded materiality."
  },
  {
    title: "Courtyard Home",
    type: "Interiors",
    location: "Manjeri",
    image: "architecture_placeholders_webp/02-hero-minimal-living-room.webp",
    excerpt: "A quiet interior composition designed around family gathering, calm finishes and softened edges."
  },
  {
    title: "Integrated Workspace",
    type: "Commercial",
    location: "Malappuram",
    image: "architecture_placeholders_webp/07-project-commercial-office.webp",
    excerpt: "A workspace shaped for clarity, collaboration and a restrained architectural identity."
  },
  {
    title: "Boutique Hotel Lounge",
    type: "Hospitality",
    location: "Kerala",
    image: "architecture_placeholders_webp/08-project-boutique-hotel-lounge.webp",
    excerpt: "A moody guest experience with warm lighting, intimate scale and crafted material details."
  },
  {
    title: "Hill View Villa",
    type: "Residential",
    location: "Wayanad",
    image: "architecture_placeholders_webp/01-hero-modern-residence-exterior.webp",
    excerpt: "A refined family villa that frames landscape views through strong architectural lines."
  },
  {
    title: "Stair Gallery House",
    type: "Architecture",
    location: "Calicut",
    image: "architecture_placeholders_webp/03-hero-curved-staircase.webp",
    excerpt: "A sculptural vertical journey designed as the visual heart of a private home."
  }
];

const process = [
  ["01", "Discover", "Understanding your vision, needs, site, lifestyle and aspirations."],
  ["02", "Define", "Research, analysis, budgets and aligned design objectives."],
  ["03", "Design", "Concepts, spatial planning and mood direction shaped with purpose."],
  ["04", "Develop", "Refining materials, drawings, details and coordinated execution intent."],
  ["05", "Deliver", "Managing execution guidance for a seamless and considered realisation."]
];

const insights = [
  {
    title: "Studio Announcement: IDH Expands Residential Design Services",
    category: "Announcement",
    date: "Studio Note",
    image: "architecture_placeholders_webp/01-hero-modern-residence-exterior.webp",
    excerpt: "A note from the studio on our expanded residential architecture and interiors offering across Kerala.",
    youtube: ""
  },
  {
    title: "Material News: Warm Stone, Dark Timber and Quiet Metal",
    category: "News",
    date: "Design News",
    image: "architecture_placeholders_webp/09-insight-natural-materials.webp",
    excerpt: "A short look at the tactile palette shaping premium homes and hospitality environments this year.",
    youtube: ""
  },
  {
    title: "The Beauty of Imperfection in Modern Design",
    category: "Article",
    date: "Editorial",
    image: "architecture_placeholders_webp/05-about-studio-vignette.webp",
    excerpt: "Why natural texture, hand-finished surfaces and gentle asymmetry can make a space feel deeply human.",
    youtube: ""
  },
  {
    title: "Designing for Wellbeing: Light, Air and Calm",
    category: "Blog",
    date: "Journal Entry",
    image: "architecture_placeholders_webp/10-insight-designing-wellbeing.webp",
    excerpt: "A studio note on creating homes that support attention, rest, privacy and everyday ease.",
    youtube: ""
  }
];

const youtubeInsightFallbacks = [
  {
    title: "Studio Announcement: IDH Residential Design Update",
    category: "Announcement",
    date: "Studio Video",
    image: "architecture_placeholders_webp/01-hero-modern-residence-exterior.webp",
    excerpt: "A fallback studio announcement shown when the latest YouTube playlist videos are temporarily unavailable.",
    videoId: ""
  },
  {
    title: "Design News: Material Direction and Studio Notes",
    category: "News",
    date: "Design News",
    image: "architecture_placeholders_webp/09-insight-natural-materials.webp",
    excerpt: "A fallback news card for IDH Insights while the live YouTube feed is unavailable.",
    videoId: ""
  }
];

const jobs = [
  {
    title: "Junior Architect",
    type: "Full-time",
    location: "Manjeri, Kerala",
    summary: "Assist with concept development, drawings, presentations and site coordination."
  },
  {
    title: "Interior Design Intern",
    type: "Internship",
    location: "Manjeri, Kerala",
    summary: "Support mood boards, material research, furniture layouts and design documentation."
  },
  {
    title: "3D Visualizer",
    type: "Project / Full-time",
    location: "Hybrid",
    summary: "Create refined visual narratives for residential, commercial and hospitality projects."
  }
];

const testimonials = [
  ["Sarah L.", "Their ability to translate our vision into a space that feels both luxurious and deeply personal is unmatched."],
  ["Khalid M.", "A true combination of creativity, professionalism and attention to detail. The entire experience was seamless."],
  ["Priya & Arjun", "The studio brought calm structure to every decision and helped us create a home that feels entirely ours."]
];

const team = [
  {
    name: "Founder",
    role: "Principal Designer",
    image: "assets/team-founder.png",
    note: "Guides the studio’s creative direction with a focus on proportion, atmosphere, material restraint and spaces that feel deeply personal."
  },
  {
    name: "Co-founder",
    role: "Design Director",
    image: "assets/team-cofounder.png",
    note: "Leads design coordination and project clarity, bringing structure, detail and calm decision-making into every stage of the process."
  },
  {
    name: "Studio Team",
    role: "Architecture & Interiors",
    image: "assets/team-studio.png",
    note: "A collaborative studio of designers, architects and project coordinators shaping refined residential, commercial and hospitality spaces."
  }
];

module.exports = { contact, nav, services, projects, process, insights, youtubeInsightFallbacks, jobs, testimonials, team };
