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
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

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
