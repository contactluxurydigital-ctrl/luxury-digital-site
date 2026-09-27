/* ==========================================================================
   LUXURY DIGITAL — interactions
   Vanilla JS, aucune dépendance. Tous les effets lourds sont coupés sur
   mobile / écrans tactiles et quand l'utilisateur préfère moins d'animations.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isDesktop = function () { return window.innerWidth >= 900; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var vh = window.innerHeight;

  /* ------------------------------------------------------------------
     1. Découpe lettre par lettre ([data-split])
     ------------------------------------------------------------------ */
  function splitChars(el) {
    var index = 0;
    var label = el.textContent.replace(/\s+/g, ' ').trim();

    function walk(node, parent) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var word = document.createElement('span');
            word.className = 'split-word';
            Array.from(part).forEach(function (c) {
              var outer = document.createElement('span');
              outer.className = 'split-char';
              var inner = document.createElement('span');
              inner.textContent = c;
              inner.style.setProperty('--i', index++);
              outer.appendChild(inner);
              word.appendChild(outer);
            });
            frag.appendChild(word);
          });
          parent.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child, child);
        }
      });
    }
    walk(el, el);
    // Le texte d'origine reste lisible par les lecteurs d'écran, les lettres découpées sont masquées
    Array.prototype.forEach.call(el.children, function (c) { c.setAttribute('aria-hidden', 'true'); });
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.appendChild(sr);
  }
  if (!reduceMotion) document.querySelectorAll('[data-split]').forEach(splitChars);

  /* Lettres de la phrase "statement" (illuminées au scroll) */
  var statementChars = [];
  var statementTitle = document.querySelector('[data-chars]');
  if (statementTitle && !reduceMotion) {
    var text = statementTitle.textContent.trim();
    statementTitle.setAttribute('aria-label', text);
    statementTitle.textContent = '';
    text.split(' ').forEach(function (w, wi, arr) {
      var word = document.createElement('span');
      word.className = 'split-word';
      word.setAttribute('aria-hidden', 'true');
      Array.from(w).forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        word.appendChild(s);
        statementChars.push(s);
      });
      statementTitle.appendChild(word);
      if (wi < arr.length - 1) statementTitle.appendChild(document.createTextNode(' '));
    });
  }

  /* ------------------------------------------------------------------
     2. Chargement : zoom du hero + apparition du titre
     ------------------------------------------------------------------ */
  requestAnimationFrame(function () {
    doc.classList.add('is-loaded');
    document.querySelectorAll('.hero [data-split]').forEach(function (el) { el.classList.add('is-in'); });
  });

  /* ------------------------------------------------------------------
     3. Reveal au scroll + compteurs
     ------------------------------------------------------------------ */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var pad = parseInt(el.dataset.pad || '0', 10);
    var format = function (n) {
      var s = String(Math.round(n));
      while (s.length < pad) s = '0' + s;
      return prefix + s + suffix;
    };
    if (reduceMotion) { el.textContent = format(target); return; }
    var duration = target > 100 ? 2400 : 1800;
    var start = performance.now();
    (function tick(now) {
      var t = clamp((now - start) / duration, 0, 1);
      var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
      el.textContent = format(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  var counters = document.querySelectorAll('[data-count]');
  if (!reduceMotion) counters.forEach(function (el) { el.textContent = (el.dataset.prefix || '') + (el.dataset.pad ? '00' : '0') + (el.dataset.suffix || ''); });

  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealIO.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { revealIO.observe(el); });

    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countIO.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countIO.observe(el); });

    /* Changement subtil de couleur de fond selon la section au centre de l'écran */
    var themeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) body.dataset.theme = entry.target.dataset.theme;
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    document.querySelectorAll('main [data-theme], footer[data-theme]').forEach(function (el) { themeIO.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
    counters.forEach(animateCount);
  }

  /* ------------------------------------------------------------------
     4. Smooth scrolling (desktop, molette) — léger, compatible sticky
     ------------------------------------------------------------------ */
  var smooth = { current: window.scrollY, target: window.scrollY, active: false };
  var smoothEnabled = finePointer && !reduceMotion;
  var maxScroll = function () { return doc.scrollHeight - window.innerHeight; };

  function smoothLoop() {
    smooth.current = lerp(smooth.current, smooth.target, 0.1);
    if (Math.abs(smooth.target - smooth.current) < 0.5) {
      smooth.current = smooth.target;
      smooth.active = false;
    }
    window.scrollTo(0, smooth.current);
    if (smooth.active) requestAnimationFrame(smoothLoop);
  }
  function smoothTo(y) {
    smooth.target = clamp(y, 0, maxScroll());
    if (!smooth.active) {
      smooth.current = window.scrollY;
      smooth.active = true;
      requestAnimationFrame(smoothLoop);
    }
  }

  if (smoothEnabled) {
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      if (e.target.closest && e.target.closest('[data-native-scroll]')) return;
      e.preventDefault();
      var delta = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (!smooth.active) smooth.target = window.scrollY;
      smoothTo(smooth.target + delta);
    }, { passive: false });
    // Clavier / barre de défilement : on resynchronise la cible
    window.addEventListener('scroll', function () {
      if (!smooth.active) { smooth.target = smooth.current = window.scrollY; }
    }, { passive: true });
  }

  /* Liens d'ancre : défilement fluide */
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    var target = id === '#top' ? body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var y = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY;
    if (smoothEnabled) smoothTo(y);
    else window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ------------------------------------------------------------------
     5. Moteur de scroll : parallax, sections sticky, timeline, header
     ------------------------------------------------------------------ */
  var header = document.querySelector('.header');
  var progressBar = document.querySelector('.progress');
  var manifesto = document.querySelector('[data-sticky="manifesto"]');
  var manifestoLines = manifesto ? manifesto.querySelectorAll('[data-step]') : [];
  var manifestoIndex = manifesto ? manifesto.querySelector('.manifesto__index') : null;
  var statement = document.querySelector('[data-sticky="statement"]');
  var timeline = document.querySelector('[data-timeline]');
  var steps = timeline ? timeline.querySelectorAll('.step') : [];
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var visible = new Set();
  var lastY = window.scrollY;
  var litCount = 0;
  var lastStage = -2;

  if ('IntersectionObserver' in window) {
    var visIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); });
      requestTick();
    }, { rootMargin: '10% 0px 10% 0px' });
    parallaxEls.forEach(function (el) { visIO.observe(el); });
  }

  function stickyProgress(section) {
    var r = section.getBoundingClientRect();
    var range = r.height - vh;
    return { p: range > 0 ? clamp(-r.top / range, 0, 1) : 0, top: r.top, bottom: r.bottom };
  }

  function update() {
    ticking = false;
    var y = window.scrollY;

    // Barre de progression
    if (progressBar) progressBar.style.setProperty('--scroll', (y / Math.max(1, maxScroll())).toFixed(4));

    // Header : se cache en descendant, revient en remontant
    if (header) {
      header.classList.toggle('is-hidden', y > lastY && y > vh * 0.8);
      header.classList.toggle('is-scrolled', y > 40);
      lastY = y;
    }

    // Parallax + entrées (--p = traversée de l'écran, --e = entrée)
    if (!reduceMotion) {
      visible.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        var e = clamp((vh - r.top) / (vh * 0.85), 0, 1);
        el.style.setProperty('--p', p.toFixed(4));
        el.style.setProperty('--e', (1 - Math.pow(1 - e, 3)).toFixed(4));
      });
    }

    // Manifeste : les lignes apparaissent une à une
    if (manifesto) {
      var m = stickyProgress(manifesto);
      var stage;
      if (reduceMotion) stage = 6;
      else if (m.top > vh * 0.45) stage = -1;
      else stage = Math.min(6, Math.floor(m.p * 7.4));
      if (stage !== lastStage) {
        lastStage = stage;
        manifesto.dataset.stage = stage;
        manifestoLines.forEach(function (l) { l.classList.toggle('is-in', +l.dataset.step <= stage); });
        if (manifestoIndex) manifestoIndex.textContent = '0' + Math.max(1, stage + 1);
      }
    }

    // Phrase statement : lettres illuminées progressivement
    if (statement && statementChars.length) {
      var s = stickyProgress(statement);
      var target = s.top > vh ? 0 : Math.round(clamp((s.p * 1.25) + (s.top < vh * 0.5 && s.p === 0 ? 0.04 : 0), 0, 1) * statementChars.length);
      if (target !== litCount) {
        var from = Math.min(target, litCount), to = Math.max(target, litCount);
        for (var i = from; i < to; i++) statementChars[i].classList.toggle('is-lit', i < target);
        litCount = target;
      }
      statement.classList.toggle('is-done', litCount >= statementChars.length);
    } else if (statement) {
      statement.classList.add('is-done');
    }

    // Timeline verticale
    if (timeline) {
      var tr = timeline.getBoundingClientRect();
      var tracking = tr.top < vh && tr.bottom > 0;
      timeline.classList.toggle('is-tracking', tracking);
      if (tracking) {
        var fill = clamp((vh * 0.6 - tr.top) / tr.height, 0, 1);
        timeline.style.setProperty('--fill', fill.toFixed(4));
        steps.forEach(function (st) { st.classList.toggle('is-active', st.getBoundingClientRect().top < vh * 0.62); });
      }
    }
  }

  var ticking = false;
  function requestTick() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; requestTick(); });
  update();

  /* ------------------------------------------------------------------
     6. Effets pointeur (desktop uniquement)
     ------------------------------------------------------------------ */
  if (!finePointer || reduceMotion) return;

  /* Curseur custom */
  var cursor = document.querySelector('.cursor');
  var dot = cursor && cursor.querySelector('.cursor__dot');
  var ring = cursor && cursor.querySelector('.cursor__ring');
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var ringPos = { x: mouse.x, y: mouse.y };
  if (cursor) {
    doc.classList.add('has-cursor');
    window.addEventListener('pointermove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
      dot.style.transform = 'translate3d(' + mouse.x + 'px,' + mouse.y + 'px,0)';
    }, { passive: true });
    (function loop() {
      ringPos.x = lerp(ringPos.x, mouse.x, 0.18);
      ringPos.y = lerp(ringPos.y, mouse.y, 0.18);
      ring.style.transform = 'translate3d(' + ringPos.x.toFixed(2) + 'px,' + ringPos.y.toFixed(2) + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      cursor.classList.toggle('is-view', !!t.closest('[data-cursor="view"]') && !t.closest('a, button'));
      cursor.classList.toggle('is-link', !!t.closest('a, button, summary, [data-tilt]'));
    });
    document.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); });
    document.addEventListener('mouseenter', function () { cursor.classList.remove('is-hidden'); });
  }

  /* Hero : profondeur au mouvement de la souris */
  var hero = document.querySelector('.hero');
  if (hero) {
    var h = { x: 0, y: 0, tx: 0, ty: 0, running: false };
    var heroLoop = function () {
      h.x = lerp(h.x, h.tx, 0.06);
      h.y = lerp(h.y, h.ty, 0.06);
      hero.style.setProperty('--hx', (h.x * -22).toFixed(2) + 'px');
      hero.style.setProperty('--hy', (h.y * -16).toFixed(2) + 'px');
      if (Math.abs(h.x - h.tx) > 0.001 || Math.abs(h.y - h.ty) > 0.001) requestAnimationFrame(heroLoop);
      else h.running = false;
    };
    hero.addEventListener('pointermove', function (e) {
      if (!isDesktop()) return;
      h.tx = (e.clientX / window.innerWidth) * 2 - 1;
      h.ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!h.running) { h.running = true; requestAnimationFrame(heroLoop); }
    });
  }

  /* Boutons magnétiques */
  document.querySelectorAll('.magnetic').forEach(function (el) {
    var strength = parseFloat(el.dataset.magnetic || '0.3');
    var inner = el.querySelector('.btn__inner');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = 'transform .25s cubic-bezier(.22,1,.36,1)';
      el.style.transform = 'translate3d(' + dx * strength + 'px,' + dy * strength + 'px,0)';
      if (inner) inner.style.transform = 'translate3d(' + dx * strength * 0.35 + 'px,' + dy * strength * 0.35 + 'px,0)';
    });
    el.addEventListener('pointerleave', function () {
      el.style.transition = '';
      el.style.transform = '';
      if (inner) inner.style.transform = '';
    });
  });

  /* Cartes services : hover 3D */
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add('is-tilting');
      card.style.setProperty('--rx', (py * -7).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', function () {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

/* Année du footer */
document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
