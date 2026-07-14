insert into public.projects (title, slug, category, location, short_description, full_description, cover_image_url, project_type, year, status, featured, sort_order)
values
('Private Residence', 'private-residence', 'Residential Architecture', 'Kerala', 'A contemporary residence balancing privacy, layered light and grounded materiality.', 'A contemporary residence balancing privacy, layered light and grounded materiality.', 'architecture_placeholders_webp/06-project-private-residence.webp', 'Residential', '2025', 'published', true, 10),
('Courtyard Home', 'courtyard-home', 'Residential Interior', 'Manjeri', 'A quiet interior composition designed around family gathering, calm finishes and softened edges.', 'A quiet interior composition designed around family gathering, calm finishes and softened edges.', 'architecture_placeholders_webp/02-hero-minimal-living-room.webp', 'Interiors', '2025', 'published', true, 20),
('Integrated Workspace', 'integrated-workspace', 'Commercial Interior', 'Malappuram', 'A workspace shaped for clarity, collaboration and a restrained architectural identity.', 'A workspace shaped for clarity, collaboration and a restrained architectural identity.', 'architecture_placeholders_webp/07-project-commercial-office.webp', 'Commercial', '2024', 'published', true, 30),
('Boutique Hotel Lounge', 'boutique-hotel-lounge', 'Commercial Interior', 'Kerala', 'A moody guest experience with warm lighting, intimate scale and crafted material details.', 'A moody guest experience with warm lighting, intimate scale and crafted material details.', 'architecture_placeholders_webp/08-project-boutique-hotel-lounge.webp', 'Hospitality', '2024', 'published', true, 40),
('Hill View Villa', 'hill-view-villa', 'Residential Architecture', 'Wayanad', 'A refined family villa that frames landscape views through strong architectural lines.', 'A refined family villa that frames landscape views through strong architectural lines.', 'architecture_placeholders_webp/01-hero-modern-residence-exterior.webp', 'Residential', '2024', 'published', false, 50),
('Stair Gallery House', 'stair-gallery-house', 'Residential Architecture', 'Calicut', 'A sculptural vertical journey designed as the visual heart of a private home.', 'A sculptural vertical journey designed as the visual heart of a private home.', 'architecture_placeholders_webp/03-hero-curved-staircase.webp', 'Architecture', '2023', 'published', false, 60)
on conflict (slug) do update set
title = excluded.title,
category = excluded.category,
location = excluded.location,
short_description = excluded.short_description,
full_description = excluded.full_description,
cover_image_url = excluded.cover_image_url,
project_type = excluded.project_type,
year = excluded.year,
status = excluded.status,
featured = excluded.featured,
sort_order = excluded.sort_order;

insert into public.careers (job_title, slug, employment_type, location, work_mode, experience_level, short_description, responsibilities, requirements, application_email, status, sort_order)
values
('Junior Architect', 'junior-architect', 'Full-time', 'Manjeri, Kerala', 'On-site', '0-2 years', 'Assist with concept development, drawings, presentations and site coordination.', 'Concept development, drawings, presentations and site coordination.', 'Architecture qualification, drafting ability and strong design sensitivity.', 'hr@idharchitecture.com', 'published', 10),
('Interior Design Intern', 'interior-design-intern', 'Internship', 'Manjeri, Kerala', 'On-site', 'Internship', 'Support mood boards, material research, furniture layouts and design documentation.', 'Mood boards, material research, furniture layouts and design documentation.', 'Interior design student or recent graduate with portfolio.', 'hr@idharchitecture.com', 'published', 20),
('3D Visualizer', '3d-visualizer', 'Project', 'Hybrid', 'Hybrid', '2+ years', 'Create refined visual narratives for residential, commercial and hospitality projects.', '3D visualization, rendering and visual storytelling.', 'Strong visualization portfolio and experience with rendering workflows.', 'hr@idharchitecture.com', 'published', 30)
on conflict (slug) do update set
job_title = excluded.job_title,
employment_type = excluded.employment_type,
location = excluded.location,
work_mode = excluded.work_mode,
experience_level = excluded.experience_level,
short_description = excluded.short_description,
responsibilities = excluded.responsibilities,
requirements = excluded.requirements,
application_email = excluded.application_email,
status = excluded.status,
sort_order = excluded.sort_order;

insert into public.insights (title, slug, content_type, category_label, excerpt, body_content, cover_image_url, author, published_date, status, featured, sort_order, seo_title, seo_description)
values
('Studio Announcement: IDH Expands Residential Design Services', 'studio-announcement-idh-expands-residential-design-services', 'Announcement', 'Studio Note', 'A note from the studio on our expanded residential architecture and interiors offering across Kerala.', 'A note from the studio on our expanded residential architecture and interiors offering across Kerala.', 'architecture_placeholders_webp/01-hero-modern-residence-exterior.webp', 'IDH Studio', current_date, 'published', true, 10, 'IDH Expands Residential Design Services', 'A studio announcement from Integrated Design Habitat.'),
('Material News: Warm Stone, Dark Timber and Quiet Metal', 'material-news-warm-stone-dark-timber-and-quiet-metal', 'News', 'Design News', 'A short look at the tactile palette shaping premium homes and hospitality environments this year.', 'A short look at the tactile palette shaping premium homes and hospitality environments this year.', 'architecture_placeholders_webp/09-insight-natural-materials.webp', 'IDH Studio', current_date, 'published', true, 20, 'Warm Stone, Dark Timber and Quiet Metal', 'Material news and design direction from IDH.')
on conflict (slug) do update set
title = excluded.title,
content_type = excluded.content_type,
category_label = excluded.category_label,
excerpt = excluded.excerpt,
body_content = excluded.body_content,
cover_image_url = excluded.cover_image_url,
author = excluded.author,
published_date = excluded.published_date,
status = excluded.status,
featured = excluded.featured,
sort_order = excluded.sort_order,
seo_title = excluded.seo_title,
seo_description = excluded.seo_description;
