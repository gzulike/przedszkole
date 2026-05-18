/* =========================================================
   Przedszkole pw. Aniołów Stróżów — script.js
   Mobile menu, smooth scroll, counters, slider, scroll reveal,
   form validation, back-to-top
   ========================================================= */

(function () {
    'use strict';

    /* --- Year in footer --------------------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* --- Mobile menu ------------------------------------ */
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            const open = nav.classList.toggle('is-open');
            hamburger.classList.toggle('is-open', open);
            hamburger.setAttribute('aria-expanded', String(open));
        });
        nav.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => {
                nav.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
            })
        );
    }

    /* --- Smooth scroll for in-page links (also handles ?anchor style) --- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - 80,
                behavior: 'smooth'
            });
        });
    });

    /* --- Counters animation ----------------------------- */
    const counters = document.querySelectorAll('.stat__num');
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 1600;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased).toLocaleString('pl-PL');
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString('pl-PL');
        };
        requestAnimationFrame(tick);
    };

    /* --- IntersectionObserver: reveal + counters -------- */
    const revealEls = document.querySelectorAll(
        '.section__head, .value-card, .feature-card, .offer-item, .timeline__item, .stat, .opinion, .patron__inner > *, .contact__form, .contact__text, .hero__text, .hero__visual'
    );
    revealEls.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            if (entry.target.classList.contains('stat')) {
                const num = entry.target.querySelector('.stat__num');
                if (num && !num.dataset.done) {
                    num.dataset.done = '1';
                    animateCounter(num);
                }
            }
            io.unobserve(entry.target);
        });
    }, { threshold: 0.18 });

    revealEls.forEach(el => io.observe(el));
    document.querySelectorAll('.stat').forEach(s => io.observe(s));

    /* --- Opinions slider -------------------------------- */
    const opinions = document.querySelectorAll('.opinion');
    const dotsWrap = document.querySelector('.opinions__dots');
    const prevBtn = document.querySelector('.slider-btn--prev');
    const nextBtn = document.querySelector('.slider-btn--next');
    let current = 0;
    let auto;

    if (opinions.length && dotsWrap) {
        opinions.forEach((_, i) => {
            const b = document.createElement('button');
            b.setAttribute('aria-label', 'Opinia ' + (i + 1));
            if (i === 0) b.classList.add('is-active');
            b.addEventListener('click', () => go(i));
            dotsWrap.appendChild(b);
        });

        const go = (i) => {
            current = (i + opinions.length) % opinions.length;
            opinions.forEach((o, idx) => o.classList.toggle('is-active', idx === current));
            dotsWrap.querySelectorAll('button').forEach((d, idx) =>
                d.classList.toggle('is-active', idx === current));
            resetAuto();
        };
        const next = () => go(current + 1);
        const prev = () => go(current - 1);

        if (nextBtn) nextBtn.addEventListener('click', next);
        if (prevBtn) prevBtn.addEventListener('click', prev);

        const resetAuto = () => {
            clearInterval(auto);
            auto = setInterval(next, 6000);
        };
        resetAuto();
        // Pause on hover
        const sliderEl = document.querySelector('.opinions__slider');
        if (sliderEl) {
            sliderEl.addEventListener('mouseenter', () => clearInterval(auto));
            sliderEl.addEventListener('mouseleave', resetAuto);
        }
    }

    /* --- Contact form validation ------------------------ */
    const form = document.querySelector('.contact__form');
    if (form) {
        const okMsg  = form.querySelector('.form-msg--ok');
        const errMsg = form.querySelector('.form-msg--err');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            okMsg.classList.remove('is-visible');
            errMsg.classList.remove('is-visible');

            const email = form.email.value.trim();
            const msg   = form.message.value.trim();
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!emailOk || msg.length < 3) {
                errMsg.classList.add('is-visible');
                if (!emailOk) form.email.focus();
                else form.message.focus();
                return;
            }
            okMsg.classList.add('is-visible');
            form.reset();
            setTimeout(() => okMsg.classList.remove('is-visible'), 5000);
        });
    }

    /* --- Back to top ------------------------------------ */
    const toTop = document.querySelector('.to-top');
    if (toTop) {
        window.addEventListener('scroll', () => {
            toTop.classList.toggle('is-visible', window.scrollY > 600);
        });
    }

    /* --- Sticky header subtle shadow on scroll ---------- */
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.style.boxShadow = window.scrollY > 8
                ? '0 4px 18px rgba(58,46,38,.08)'
                : 'none';
        });
    }

})();
