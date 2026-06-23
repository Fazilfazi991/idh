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
