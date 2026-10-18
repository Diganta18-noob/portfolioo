const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress = document.querySelector('.scroll-progress');
document.getElementById('year').textContent = new Date().getFullYear();
function updateClock() {
  const clock = document.querySelector('.local-time');
  if (clock) clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()) + ' IST';
}
updateClock();
setInterval(updateClock, 60000);
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
function closeMenu() {
  menuButton.classList.remove('active');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  mobileMenu.inert = true;
  document.body.classList.remove('menu-open');
}
menuButton.addEventListener('click', () => {
  const opening = !mobileMenu.classList.contains('open');
  menuButton.classList.toggle('active', opening);
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  mobileMenu.classList.toggle('open', opening);
  mobileMenu.setAttribute('aria-hidden', String(!opening));
  mobileMenu.inert = !opening;
  if (opening) mobileMenu.querySelector('a').focus({ preventScroll: true });
  document.body.classList.toggle('menu-open', opening);
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (!mobileMenu.classList.contains('open')) return;
  if (event.key === 'Escape') { closeMenu(); menuButton.focus(); }
  if (event.key === 'Tab') {
    const controls = [menuButton, ...mobileMenu.querySelectorAll('a')];
    if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
const header = document.querySelector('.site-header');
const navigationLinks = [...document.querySelectorAll('.desktop-nav a')];
const navigationSections = [...document.querySelectorAll('main > section[id]')];
window.addEventListener('load', () => {
  setTimeout(() => document.body.classList.add('loaded'), reducedMotion ? 0 : 350);
});
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.project-info, .skill-groups').forEach(group => {
  [...group.children].forEach((child, index) => {
    child.classList.add('motion-child');
    child.style.setProperty('--motion-delay', `${Math.min(index * 65, 260)}ms`);
  });
});
document.querySelectorAll('.timeline-item').forEach((item, index) => item.style.setProperty('--reveal-delay', `${index * 65}ms`));
document.querySelectorAll('.hero-stack, .hero-feature').forEach(element => element.classList.add('reveal'));
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
let scrollTicking = false;
function updateScrollEffects() {
  header.classList.toggle('scrolled', window.scrollY > 30);
  let current = '';
  for (const section of navigationSections) if (section.getBoundingClientRect().top <= window.innerHeight * .35) current = section.id;
  for (const link of navigationLinks) {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${maxScroll > 0 ? window.scrollY / maxScroll : 0})`;
  if (!reducedMotion) {
    const orbit = document.querySelector('.hero-orbit');
    const heroProgress = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    orbit.style.setProperty('--scroll-y', `${heroProgress * 90}px`);
    orbit.style.setProperty('--scroll-rotation', `${heroProgress * 20}deg`);
  }
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateScrollEffects);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollEffects();
if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const glow = document.querySelector('.cursor-glow');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let glowX = mouseX, glowY = mouseY, glowFrame = 0, lastTime = 0;
  function animateGlow(time) {
    const delta = Math.min(50, lastTime ? time - lastTime : 16.7);
    const blend = 1 - Math.exp(-delta / 95);
    lastTime = time;
    glowX += (mouseX - glowX) * blend;
    glowY += (mouseY - glowY) * blend;
    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    if (Math.abs(mouseX - glowX) + Math.abs(mouseY - glowY) > .5 && !document.hidden) glowFrame = requestAnimationFrame(animateGlow);
    else { glowFrame = 0; lastTime = 0; }
  }
  window.addEventListener('pointermove', event => {
    mouseX = event.clientX; mouseY = event.clientY;
    glow.classList.add('active');
    if (!glowFrame && !document.hidden) glowFrame = requestAnimationFrame(animateGlow);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(glowFrame); glowFrame = 0; lastTime = 0; }
  });
  document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('active'));

  document.querySelectorAll('.magnetic').forEach(element => {
    element.addEventListener('pointermove', event => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      element.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });
  document.querySelectorAll('.project-card').forEach(card => {
    let tiltFrame = 0;
    const visual = card.querySelector('.project-visual > :first-child');
    if (!visual) return;
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(tiltFrame);
      tiltFrame = requestAnimationFrame(() => {
      visual.style.setProperty('--tilt-x', `${-y * 5}deg`);
      visual.style.setProperty('--tilt-y', `${x * 5}deg`);
      visual.style.setProperty('--lift', '-7px');
      card.style.setProperty('--spot-x', `${(x + .5) * 100}%`);
      card.style.setProperty('--spot-y', `${(y + .5) * 100}%`);
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(tiltFrame);
      visual.style.setProperty('--tilt-x', '0deg');
      visual.style.setProperty('--tilt-y', '0deg');
      visual.style.setProperty('--lift', '0px');
    });
  });
}
