/* =========================================================
   Przedszkole pw. Aniołów Stróżów — script.js
   Menu mobilne, smooth scroll, walidacja, liczniki, galeria-dots,
   fade-in, back-to-top
   ========================================================= */

(function () {
    'use strict';

    /* --- Year in footer --------------------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* --- Mobile menu ------------------------------------ */
    const burger = document.getElementById('burger');
    const mm = document.getElementById('mobileMenu');
    if (burger && mm) {
        burger.addEventListener('click', () => {
            const open = mm.classList.toggle('open');
            burger.classList.toggle('open', open);
            burger.setAttribute('aria-expanded', String(open));
        });
        mm.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => {
                mm.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            })
        );
    }

    /* --- Smooth scroll for in-page links ---------------- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - 90,
                behavior: 'smooth'
            });
        });
    });

    /* --- Nav shadow on scroll --------------------------- */
    const nav = document.getElementById('nav');
    if (nav) {
        const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* --- Back to top ------------------------------------ */
    const toTop = document.querySelector('.to-top');
    if (toTop) {
        window.addEventListener('scroll', () => {
            toTop.classList.toggle('is-visible', window.scrollY > 600);
        }, { passive: true });
    }

    /* --- Animated stat counters ------------------------- */
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 1600;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased).toLocaleString('pl-PL');
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString('pl-PL');
        };
        requestAnimationFrame(tick);
    };

    /* --- Fade-in + trigger counters --------------------- */
    const fadeTargets = document.querySelectorAll(
        'section, .feature, .testimonial, .bullet-list li, .timeline li, .stat'
    );
    fadeTargets.forEach(el => el.classList.add('fade'));

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            if (entry.target.classList && entry.target.classList.contains('stat')) {
                const num = entry.target.querySelector('.stat-num');
                if (num && !num.dataset.done) {
                    num.dataset.done = '1';
                    animateCounter(num);
                }
            }
            io.unobserve(entry.target);
        });
    }, { threshold: 0.12 });
    fadeTargets.forEach(el => io.observe(el));

    /* --- Gallery: dynamiczne kafelki + pozioma karuzela + lightbox --- */
    const galleryEl = document.getElementById('gallery');
    const GALLERY_COUNT = 29; // img/01.jpg ... img/29.jpg
    const pad = (n) => String(n).padStart(2, '0');
    const buildSrc = (i) => 'img/' + pad(i) + '.jpg';

    let images = []; // {src, alt}

    if (galleryEl) {
        for (let i = 1; i <= GALLERY_COUNT; i++) {
            const src = buildSrc(i);
            const alt = 'Zdjęcie z przedszkola — ' + i;
            images.push({ src, alt });

            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'gallery-tile';
            tile.setAttribute('aria-label', 'Otwórz ' + alt);
            tile.dataset.index = String(i - 1);
            // Bez numeracji na małym kafelku — licznik pokazuje się tylko w lightboxie.
            tile.innerHTML =
                '<img src="' + src + '" alt="' + alt + '" loading="lazy" decoding="async">';
            galleryEl.appendChild(tile);
        }

        /* --- Strzałki przewijania karuzeli ----------------- */
        const prevBtn = document.querySelector('.gallery-nav--prev');
        const nextBtn = document.querySelector('.gallery-nav--next');

        const scrollStep = () => {
            const firstTile = galleryEl.querySelector('.gallery-tile');
            if (!firstTile) return galleryEl.clientWidth * 0.8;
            const gap = parseFloat(getComputedStyle(galleryEl).gap) || 8;
            return (firstTile.offsetWidth + gap) * Math.max(1, Math.floor(galleryEl.clientWidth / (firstTile.offsetWidth + gap)) - 1);
        };

        const updateNavState = () => {
            if (!prevBtn || !nextBtn) return;
            const maxScroll = galleryEl.scrollWidth - galleryEl.clientWidth - 1;
            prevBtn.disabled = galleryEl.scrollLeft <= 0;
            nextBtn.disabled = galleryEl.scrollLeft >= maxScroll;
        };

        if (prevBtn) prevBtn.addEventListener('click', () => {
            galleryEl.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            galleryEl.scrollBy({ left:  scrollStep(), behavior: 'smooth' });
        });
        galleryEl.addEventListener('scroll', updateNavState, { passive: true });
        window.addEventListener('resize', updateNavState);
        // initial state (po załadowaniu zdjęć)
        setTimeout(updateNavState, 50);

        /* --- Klik w kafelek → otwórz lightbox -------------- */
        galleryEl.addEventListener('click', (e) => {
            const tile = e.target.closest('.gallery-tile');
            if (!tile) return;
            const idx = parseInt(tile.dataset.index, 10) || 0;
            openLightbox(idx);
        });
    }

    /* --- Lightbox --------------------------------------- */
    const lightbox = document.getElementById('lightbox');
    const lbImg    = document.getElementById('lightboxImg');
    const lbCount  = document.getElementById('lightboxCounter');
    let lbIndex = 0;

    const showLightboxImage = (i) => {
        if (!images.length) return;
        lbIndex = (i + images.length) % images.length;
        const item = images[lbIndex];
        // Mini animacja przy zmianie
        if (lbImg) {
            lbImg.style.opacity = '0';
            const img = new Image();
            img.onload = () => {
                lbImg.src = item.src;
                lbImg.alt = item.alt;
                lbImg.style.opacity = '1';
            };
            img.onerror = () => {
                lbImg.src = item.src; // i tak pokaż – przeglądarka pokaże złamaną ikonę
                lbImg.alt = item.alt;
                lbImg.style.opacity = '1';
            };
            img.src = item.src;
        }
        if (lbCount) lbCount.textContent = (lbIndex + 1) + ' / ' + images.length;
    };

    const openLightbox = (i) => {
        if (!lightbox) return;
        showLightboxImage(i);
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lb-open');
    };
    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lb-open');
    };
    const nextLightbox = () => showLightboxImage(lbIndex + 1);
    const prevLightbox = () => showLightboxImage(lbIndex - 1);

    if (lightbox) {
        const closeBtn = lightbox.querySelector('.lightbox__close');
        const nextBtn  = lightbox.querySelector('.lightbox__nav--next');
        const prevBtn  = lightbox.querySelector('.lightbox__nav--prev');
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (nextBtn)  nextBtn.addEventListener('click', nextLightbox);
        if (prevBtn)  prevBtn.addEventListener('click', prevLightbox);

        // klik w tło (poza zdjęciem / przyciskami) zamyka modal
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // klawiatura: Esc / strzałki
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape')     closeLightbox();
            else if (e.key === 'ArrowRight') nextLightbox();
            else if (e.key === 'ArrowLeft')  prevLightbox();
        });

        // Swipe (mobile) – proste przesunięcie palcem
        let touchStartX = 0;
        lightbox.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
        }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
            if (!e.changedTouches || !e.changedTouches[0]) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) {
                if (dx < 0) nextLightbox(); else prevLightbox();
            }
        }, { passive: true });
    }

    /* --- Contact form validation ------------------------ */
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (form && status) {
        // Adres odbiorcy – używany tylko w fallbacku mailto:
        // (wysyłka przez Web3Forms; access_key jest w hidden inpucie w HTML)
        const RECIPIENT = 'ursynow-sluzebniczki@o2.pl';
        const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            status.innerHTML = '';

            const email = form.email.value.trim();
            const child = form.child ? form.child.value.trim() : '';
            const msg = form.msg.value.trim();
            const rodo = form.rodo && form.rodo.checked;

            let ok = true;
            const setErr = (id, t) => {
                const el = document.getElementById(id);
                if (el) el.textContent = t;
                if (t) ok = false;
            };
            setErr('err-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Nieprawidłowy adres e-mail.');
            setErr('err-msg', msg.length < 3 ? 'Treść jest zbyt krótka.' : '');
            setErr('err-rodo', rodo ? '' : 'Aby wysłać wiadomość, prosimy o akceptację klauzuli RODO.');

            const consentLabel = document.querySelector('.consent-label');
            if (consentLabel) consentLabel.classList.toggle('has-error', !rodo);

            if (!ok) {
                status.innerHTML = '<div class="form-error">Proszę uzupełnić wymagane pola i&nbsp;zaakceptować klauzulę RODO.</div>';
                return;
            }

            const btn = document.getElementById('submitBtn');
            if (btn) { btn.disabled = true; btn.textContent = 'Wysyłanie…'; }

            // Główna ścieżka: AJAX do Web3Forms – wiadomość trafia na e-mail powiązany z access_key.
            try {
                const data = new FormData(form);
                const resp = await fetch(WEB3FORMS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: data
                });
                const json = await resp.json().catch(() => ({}));
                if (resp.ok && json.success === true) {
                    form.reset();
                    if (consentLabel) consentLabel.classList.remove('has-error');
                    status.innerHTML = '<div class="form-success">Dziękujemy! Wiadomość została wysłana — odezwiemy się najszybciej, jak to możliwe.</div>';
                } else {
                    throw new Error((json && json.message) || 'Web3Forms error');
                }
            } catch (err) {
                // Fallback: otwórz klienta poczty z gotową treścią (działa bez serwera)
                const subject = encodeURIComponent('Zapytanie z formularza – Przedszkole Aniołów Stróżów');
                const body = encodeURIComponent(
                    'Adres e-mail nadawcy: ' + email + '\n' +
                    (child ? 'Dziecko: ' + child + '\n' : '') +
                    'Akceptacja RODO: TAK\n\n' +
                    'Treść wiadomości:\n' + msg + '\n'
                );
                window.location.href = 'mailto:' + RECIPIENT + '?subject=' + subject + '&body=' + body;
                status.innerHTML = '<div class="form-success">Otwieramy Twojego klienta poczty z gotową wiadomością. Jeśli okno się nie otworzyło, napisz bezpośrednio na <strong>' + RECIPIENT + '</strong>.</div>';
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = 'Wyślij →'; }
                setTimeout(() => { status.innerHTML = ''; }, 9000);
            }
        });

        // Wyczyść błąd RODO przy zaznaczeniu
        if (form.rodo) {
            form.rodo.addEventListener('change', () => {
                if (form.rodo.checked) {
                    const errEl = document.getElementById('err-rodo');
                    if (errEl) errEl.textContent = '';
                    const consentLabel = document.querySelector('.consent-label');
                    if (consentLabel) consentLabel.classList.remove('has-error');
                }
            });
        }
    }

    /* --- Welcome modal (zapisy) – pojawia się 3 s po otwarciu strony --- */
    const welcomeModal = document.getElementById('welcomeModal');
    if (welcomeModal) {
        const openWelcome = () => {
            welcomeModal.classList.add('is-open');
            welcomeModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('wm-open');
        };
        const closeWelcome = () => {
            welcomeModal.classList.remove('is-open');
            welcomeModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('wm-open');
        };

        // Pojawia się 3 sekundy po załadowaniu strony
        setTimeout(openWelcome, 3000);

        // Zamknięcie: × / kliknięcie w tło / klik w CTA (link do kontaktu)
        welcomeModal.addEventListener('click', (e) => {
            if (e.target.closest('[data-close]')) closeWelcome();
        });

        // Esc na klawiaturze
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && welcomeModal.classList.contains('is-open')) closeWelcome();
        });
    }

})();
