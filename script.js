const header = document.querySelector('#siteHeader');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-header nav');

if (header) {
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });
}

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible'));
}, { threshold: 0.12 });
const observeReveal = element => observer.observe(element);
document.querySelectorAll('.reveal').forEach(observeReveal);

const video = document.querySelector('.hero-video');
if (video) {
  video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
  video.addEventListener('error', () => video.classList.add('video-unavailable'), true);
}

document.querySelectorAll('[data-mail-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if ((form.dataset.subject || '').toLowerCase().includes('career')) {
      trackEvent('career_apply_click', { itemType: 'career', itemSlug: 'career-application-form' });
    }
    const recipient = form.dataset.recipient || 'info@idharchitecture.com';
    const subject = form.dataset.subject || 'Website enquiry';
    const values = Array.from(new FormData(form).entries())
      .filter(([, value]) => value && String(value).trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    const body = `${values}\n\nSent from the IDH website.`;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});

const youtubeGrid = document.querySelector('[data-youtube-insights]');
const videoModal = document.querySelector('[data-video-modal]');
const videoModalFrame = videoModal?.querySelector('iframe');
const videoModalClose = document.querySelector('[data-video-modal-close]');

const formatVideoDate = value => {
  if (!value) return 'IDH Video';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'IDH Video';
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const openVideoModal = videoId => {
  if (!videoId || !videoModal || !videoModalFrame) return;
  videoModalFrame.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1`;
  videoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  videoModalClose?.focus();
};

const closeVideoModal = () => {
  if (!videoModal || !videoModalFrame) return;
  videoModal.setAttribute('aria-hidden', 'true');
  videoModalFrame.src = '';
  document.body.classList.remove('modal-open');
};

const createVideoCard = video => {
  const article = document.createElement('article');
  article.className = 'insight-card video-insight-card reveal';
  article.id = video.category?.toLowerCase() || '';
  article.dataset.youtubeCard = '';
  article.dataset.videoId = video.videoId;

  const button = document.createElement('button');
  button.className = 'video-thumb';
  button.type = 'button';
  button.dataset.videoId = video.videoId;
  button.setAttribute('aria-label', `Play ${video.title}`);

  const image = document.createElement('img');
  image.src = video.thumbnail || 'architecture_placeholders_webp/10-insight-designing-wellbeing.webp';
  image.alt = video.title;
  image.loading = 'lazy';

  const play = document.createElement('span');
  play.className = 'play-overlay';
  play.setAttribute('aria-hidden', 'true');

  const copy = document.createElement('div');
  const category = document.createElement('span');
  category.textContent = video.category;
  const date = document.createElement('small');
  date.textContent = formatVideoDate(video.publishedAt);
  const title = document.createElement('h3');
  title.textContent = video.title;

  button.append(image, play);
  copy.append(category, date, title);

  if (video.description) {
    const description = document.createElement('p');
    description.textContent = video.description;
    copy.append(description);
  }

  article.append(button, copy);
  return article;
};

if (youtubeGrid) {
  fetch('/api/youtube-insights')
    .then(response => response.ok ? response.json() : Promise.reject(new Error('YouTube feed unavailable')))
    .then(data => {
      if (!Array.isArray(data.items) || data.items.length === 0) return;
      youtubeGrid.replaceChildren(...data.items.map(createVideoCard));
      youtubeGrid.querySelectorAll('.reveal').forEach(observeReveal);
    })
    .catch(() => {
      youtubeGrid.dataset.fallback = 'true';
    });
}

document.addEventListener('click', event => {
  const opener = event.target.closest('[data-video-id]');
  if (opener) {
    openVideoModal(opener.dataset.videoId);
  }

  if (event.target === videoModal || event.target.closest('[data-video-modal-close]')) {
    closeVideoModal();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeVideoModal();
});

const publicSupabaseConfig = window.IDH_SUPABASE_CONFIG || {};
const publicSupabase = window.supabase?.createClient && publicSupabaseConfig.supabaseUrl && publicSupabaseConfig.supabaseAnonKey
  ? window.supabase.createClient(publicSupabaseConfig.supabaseUrl, publicSupabaseConfig.supabaseAnonKey)
  : null;

const fallbackImage = 'architecture_placeholders_webp/04-hero-moody-interior-corner.webp';
let pageViewTracked = false;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
})[char]);
const displayDate = value => value ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'IDH Journal';
const paragraphs = value => String(value || '').split(/\n{2,}/).map(text => `<p>${escapeHtml(text)}</p>`).join('');

const skeleton = count => Array.from({ length: count }, () => '<article class="dynamic-skeleton"></article>').join('');
const empty = text => `<p class="dynamic-empty">${text}</p>`;

async function trackEvent(eventType, details = {}) {
  if (!publicSupabase) return;
  const payload = {
    event_type: eventType,
    page_path: location.pathname,
    item_type: details.itemType || null,
    item_id: details.itemId || null,
    item_slug: details.itemSlug || null,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null
  };
  publicSupabase.from('analytics_events').insert(payload).then(() => {}).catch(() => {});
}

function trackPageView() {
  if (pageViewTracked) return;
  pageViewTracked = true;
  trackEvent('page_view');
  if (location.pathname.includes('careers')) trackEvent('career_view');
}

function renderProject(project) {
  const href = `projects/${encodeURIComponent(project.slug)}`;
  return `<article class="project-card reveal" data-category="${escapeHtml(project.category || 'Others')}">
    <div><img src="${escapeHtml(project.cover_image_url || fallbackImage)}" alt="${escapeHtml(project.title)}" loading="lazy" /></div>
    <p>${escapeHtml(project.category || project.project_type || 'Project')} &middot; ${escapeHtml(project.location || '')}</p>
    <h3>${escapeHtml(project.title)}</h3>
    <small>${escapeHtml(project.short_description || '')}</small>
    <a href="${href}">View project &rarr;</a>
  </article>`;
}

function renderCareer(job) {
  const email = job.application_email || 'careers@idharchitecture.com';
  return `<article class="job-card reveal">
    <span>${escapeHtml(job.employment_type || 'Role')}</span>
    <h3>${escapeHtml(job.job_title)}</h3>
    <p>${escapeHtml([job.location, job.work_mode].filter(Boolean).join(' &middot; '))}</p>
    <small>${escapeHtml(job.short_description || '')}</small>
    <a data-career-apply data-role="${escapeHtml(job.slug || job.job_title)}" href="mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Career Application: ${job.job_title}`)}">Apply &rarr;</a>
  </article>`;
}

function renderInsight(post, compact = false) {
  const href = `insights/${encodeURIComponent(post.slug)}`;
  if (compact) {
    return `<article class="reveal">
      <img src="${escapeHtml(post.cover_image_url || fallbackImage)}" alt="${escapeHtml(post.title)}" loading="lazy" />
      <div><small>${escapeHtml(post.category_label || post.content_type)} &middot; ${displayDate(post.published_date)}</small><h3>${escapeHtml(post.title)}</h3><a href="${href}">Read more &rarr;</a></div>
    </article>`;
  }
  return `<article class="insight-card reveal" id="${escapeHtml(String(post.content_type || '').toLowerCase())}">
    <img src="${escapeHtml(post.cover_image_url || fallbackImage)}" alt="${escapeHtml(post.title)}" loading="lazy" />
    <div><span>${escapeHtml(post.content_type)}</span><small>${escapeHtml(post.category_label || displayDate(post.published_date))}</small><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt || '')}</p><a href="${href}">Read more &rarr;</a></div>
  </article>`;
}

function applyProjectFilter(value) {
  document.querySelectorAll('[data-dynamic-projects] .project-card').forEach(card => {
    const visible = !value || card.dataset.category === value;
    card.hidden = !visible;
  });
}

function setupProjectFilters() {
  const filters = document.querySelector('[data-project-filters]');
  if (!filters) return;
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-project-category]');
    if (!button) return;
    filters.querySelectorAll('[data-project-category]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    applyProjectFilter(button.dataset.projectCategory || '');
  });
}

async function hydratePublicData() {
  if (!publicSupabase) return;

  for (const grid of document.querySelectorAll('[data-dynamic-projects]')) {
    const limit = Number(grid.dataset.limit || 0);
    grid.innerHTML = skeleton(limit || 6);
    let query = publicSupabase.from('projects').select('*').eq('status', 'published').order('sort_order');
    if (grid.dataset.featured === 'true') query = query.eq('featured', true);
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    grid.innerHTML = error ? empty('Unable to load projects right now.') : data?.length ? data.map(renderProject).join('') : empty('No items available at the moment.');
    applyProjectFilter(document.querySelector('[data-project-category].active')?.dataset.projectCategory || '');
    grid.querySelectorAll('.reveal').forEach(observeReveal);
  }

  for (const grid of document.querySelectorAll('[data-dynamic-careers]')) {
    grid.innerHTML = skeleton(3);
    const { data, error } = await publicSupabase.from('careers').select('*').eq('status', 'published').order('sort_order');
    grid.innerHTML = error ? empty('Unable to load careers right now.') : data?.length ? data.map(renderCareer).join('') : empty('No items available at the moment.');
    grid.querySelectorAll('.reveal').forEach(observeReveal);
  }

  for (const grid of document.querySelectorAll('[data-dynamic-insights]')) {
    const limit = Number(grid.dataset.limit || 0);
    grid.innerHTML = skeleton(limit || 4);
    let query = publicSupabase.from('insights').select('*').eq('status', 'published').order('sort_order').order('published_date', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    grid.innerHTML = error ? empty('Unable to load insights right now.') : data?.length ? data.map(post => renderInsight(post, Boolean(limit))).join('') : empty('No items available at the moment.');
    grid.querySelectorAll('.reveal').forEach(observeReveal);
  }
}

async function hydrateInsightDetail() {
  const detail = document.querySelector('[data-insight-detail]');
  if (!detail || !publicSupabase) return;
  const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || new URLSearchParams(location.search).get('slug') || '');
  const body = document.querySelector('[data-insight-body]');
  const cover = document.querySelector('[data-insight-cover]');
  const { data, error } = await publicSupabase.from('insights').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error || !data) {
    detail.innerHTML = '<p class="eyebrow">Insights</p><h1>Insight unavailable.</h1><p>No items available at the moment.</p>';
    body.innerHTML = '';
    return;
  }
  document.title = data.seo_title || `${data.title} - IDH Journal`;
  trackEvent('insight_view', { itemType: 'insight', itemId: data.id, itemSlug: data.slug });
  if (cover && data.cover_image_url) cover.src = data.cover_image_url;
  detail.innerHTML = `<p class="eyebrow">${escapeHtml(data.content_type)}</p><h1>${escapeHtml(data.title)}</h1><p>${escapeHtml(data.excerpt || '')}</p>`;
  body.innerHTML = `${paragraphs(data.body_content || data.excerpt)}<p><a href="../insights.html">Back to insights &rarr;</a></p>`;
}

async function hydrateProjectDetail() {
  const detail = document.querySelector('[data-project-detail]');
  if (!detail || !publicSupabase) return;
  const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || new URLSearchParams(location.search).get('slug') || '');
  const body = document.querySelector('[data-project-body]');
  const cover = document.querySelector('[data-project-cover]');
  const { data, error } = await publicSupabase.from('projects').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error || !data) {
    detail.innerHTML = '<p class="eyebrow">Projects</p><h1>Project unavailable.</h1><p>No items available at the moment.</p>';
    if (body) body.innerHTML = '';
    return;
  }
  document.title = `${data.title} - IDH Projects`;
  trackEvent('project_view', { itemType: 'project', itemId: data.id, itemSlug: data.slug });
  if (cover && data.cover_image_url) cover.src = data.cover_image_url;
  detail.innerHTML = `<p class="eyebrow">${escapeHtml(data.category || 'Project')}</p><h1>${escapeHtml(data.title)}</h1><p>${escapeHtml(data.short_description || '')}</p>`;
  if (body) body.innerHTML = `<h2>${escapeHtml(data.location || '')}</h2>${paragraphs(data.full_description || data.short_description)}<p><a href="../projects.html">Back to projects &rarr;</a></p>`;
}

document.addEventListener('click', event => {
  const careerApply = event.target.closest('[data-career-apply]');
  if (careerApply) trackEvent('career_apply_click', { itemType: 'career', itemSlug: careerApply.dataset.role || null });
});

setupProjectFilters();
trackPageView();
hydratePublicData();
hydrateInsightDetail();
hydrateProjectDetail();
