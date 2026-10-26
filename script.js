const root = document.documentElement;
const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const themeToggle = document.getElementById('themeToggle');
const bookingDialog = document.getElementById('bookingDialog');
const bookingForm = document.getElementById('bookingForm');
const whatsappBooking = document.getElementById('whatsappBooking');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxAvif = document.getElementById('lightboxAvif');
const lightboxWebp = document.getElementById('lightboxWebp');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxText = document.getElementById('lightboxText');
const lightboxCounter = document.getElementById('lightboxCounter');
const galleryGrid = document.getElementById('galleryGrid');
const galleryEmpty = document.getElementById('galleryEmpty');

document.getElementById('year').textContent = new Date().getFullYear();

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  header.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

function updateThemeButton() {
  const dark = root.classList.contains('dark');
  themeToggle.textContent = dark ? '☼' : '☾';
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}
updateThemeButton();

themeToggle.addEventListener('click', () => {
  const next = root.classList.contains('dark') ? 'light' : 'dark';
  root.className = next;
  localStorage.setItem('arena-theme', next);
  updateThemeButton();
});

document.querySelectorAll('[data-open-booking]').forEach((button) => button.addEventListener('click', () => {
  header.classList.remove('menu-open');
  bookingDialog.showModal();
  document.body.classList.add('modal-open');
}));

// Unlock scrolling on every close path, not just the `close` event — Escape,
// backdrop click and the close button must all leave the page scrollable.
const unlockBody = () => document.body.classList.remove('modal-open');
const closeDialog = (dialog) => { dialog.close(); unlockBody(); };

[bookingDialog, lightbox].forEach((dialog) => {
  dialog.addEventListener('close', unlockBody);
  dialog.addEventListener('cancel', unlockBody);
});

bookingDialog.addEventListener('click', (event) => {
  if (event.target === bookingDialog) closeDialog(bookingDialog);
});

bookingForm.addEventListener('input', () => {
  const data = new FormData(bookingForm);
  const arrival = data.get('arrival') || 'not selected';
  const departure = data.get('departure') || 'not selected';
  const guests = data.get('guests') || '2 guests';
  const rooms = data.get('rooms') || '1 room';
  const message = `Hello Arena Continental, I would like to check availability. Arrival: ${arrival}. Departure: ${departure}. ${guests}, ${rooms}.`;
  whatsappBooking.href = `https://wa.me/2347036211471?text=${encodeURIComponent(message)}`;
});

const galleryItems = Array.from(galleryGrid.querySelectorAll('.gallery-item'));

// The lightbox walks whatever the active filter is showing, not the whole set.
let visibleItems = galleryItems.slice();
let currentIndex = 0;

function showImage(index) {
  if (!visibleItems.length) return;
  currentIndex = (index + visibleItems.length) % visibleItems.length;
  const item = visibleItems[currentIndex];
  lightboxAvif.srcset = item.dataset.fullAvif;
  lightboxWebp.srcset = item.dataset.fullWebp;
  lightboxImage.src = item.dataset.full;
  lightboxImage.alt = item.querySelector('img').alt;
  lightboxTitle.textContent = item.dataset.title;
  lightboxText.textContent = item.dataset.caption;
  lightboxCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
}

galleryItems.forEach((item) => item.addEventListener('click', () => {
  showImage(visibleItems.indexOf(item));
  lightbox.showModal();
  document.body.classList.add('modal-open');
}));

document.getElementById('lightboxPrev').addEventListener('click', () => showImage(currentIndex - 1));
document.getElementById('lightboxNext').addEventListener('click', () => showImage(currentIndex + 1));
document.getElementById('lightboxClose').addEventListener('click', () => closeDialog(lightbox));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeDialog(lightbox); });

document.addEventListener('keydown', (event) => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(currentIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showImage(currentIndex + 1); }
});

document.querySelectorAll('.filter-chip').forEach((chip) => chip.addEventListener('click', () => {
  const filter = chip.dataset.filter;

  document.querySelectorAll('.filter-chip').forEach((other) => {
    const active = other === chip;
    other.classList.toggle('is-active', active);
    other.setAttribute('aria-pressed', String(active));
  });

  galleryItems.forEach((item) => {
    item.hidden = filter !== 'all' && item.dataset.cat !== filter;
  });

  visibleItems = galleryItems.filter((item) => !item.hidden);
  galleryEmpty.hidden = visibleItems.length > 0;
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
