/* Zahnarztpraxis Weigang, Waren (Müritz) — interactions. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var skipPreloader = root.classList.contains('pl-skip') || reduceMotion;

  /* the hero settles (photo, marker) once the preloader has gone */
  var settle = function () { root.classList.add('is-loaded'); };
  requestAnimationFrame(function () { setTimeout(settle, skipPreloader ? 120 : 1650); });

  /* ---------- frozen viewport unit: refresh on width change only ----------
     iOS Safari changes innerHeight while the URL bar collapses; a vh that
     follows it would make the open sheet jump. */
  var vhPx = window.innerHeight;
  var vw0 = window.innerWidth;
  root.style.setProperty('--vh', (vhPx * 0.01) + 'px');
  window.addEventListener('resize', function () {
    if (window.innerWidth !== vw0) {
      vw0 = window.innerWidth;
      vhPx = window.innerHeight;
      root.style.setProperty('--vh', (vhPx * 0.01) + 'px');
    }
  });

  /* ---------- scroll lock for the menu sheet and the calendar sheet ----------
     overflow:hidden alone does not stop iOS Safari, so the body is pinned at
     the current offset and the exact position is restored on close. */
  var lockY = 0, locks = 0;
  function lockScroll(on) {
    var b = document.body.style;
    if (on) {
      if (locks++ > 0) return;
      lockY = window.scrollY;
      b.position = 'fixed'; b.top = -lockY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%';
    } else {
      if (locks === 0 || --locks > 0) return;
      b.position = b.top = b.left = b.right = b.width = '';
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, lockY);
      root.style.scrollBehavior = '';
    }
  }
  var isLocked = function () { return locks > 0; };

  /* ---------- header: tightens once the page moves ---------- */
  var header = document.querySelector('.site-header');
  var ticking = false;
  function onScroll() {
    ticking = false;
    if (isLocked()) return;                          /* body is pinned; keep the state it had */
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    markCurrent();
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ---------- navigation: the strip grows into the sheet on phones ---------- */
  var strip = document.querySelector('.navbar');
  var toggle = document.querySelector('.navbar__toggle');
  var sheetMq = window.matchMedia('(max-width: 64rem)');
  function setNav(open) {
    if ((strip.getAttribute('data-open') === 'true') === open) return;
    strip.setAttribute('data-open', open ? 'true' : 'false');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('.visually-hidden').textContent = open ? 'Menü schließen' : 'Menü öffnen';
    if (open) lockScroll(true);
    root.classList.toggle('nav-open', open);
    if (!open) lockScroll(false);
  }
  toggle.addEventListener('click', function () { setNav(strip.getAttribute('data-open') !== 'true'); });
  /* anchor links in the sheet: unlock first, then let the jump happen */
  strip.querySelector('.navbar__menu').addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || strip.getAttribute('data-open') !== 'true') return;
    var hash = a.getAttribute('href');
    if (hash.charAt(0) !== '#') { setNav(false); return; }
    e.preventDefault();
    setNav(false);
    var target = document.querySelector(hash);
    if (target) {
      requestAnimationFrame(function () { target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); });
      history.replaceState(null, '', hash);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && strip.getAttribute('data-open') === 'true') { setNav(false); toggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (strip.getAttribute('data-open') === 'true' && !e.target.closest('.navbar')) setNav(false);
  });
  sheetMq.addEventListener('change', function (m) { if (!m.matches) setNav(false); });

  /* ---------- header hover: one washed-accent block glides from link to link ---------- */
  var menuInner = document.querySelector('.navbar__menu-inner');
  var wideHover = window.matchMedia('(min-width: 64.0625rem) and (hover: hover) and (pointer: fine)');
  if (!reduceMotion) {
    var glider = document.createElement('span');
    glider.className = 'navbar__glider';
    glider.setAttribute('aria-hidden', 'true');
    menuInner.prepend(glider);
    var moveTo = function (link) {
      glider.style.left = link.offsetLeft + 'px';
      glider.style.top = link.offsetTop + 'px';
      glider.style.width = link.offsetWidth + 'px';
    };
    var showGlider = function (link) {
      if (!wideHover.matches) return;
      if (!menuInner.classList.contains('has-glider')) {
        glider.style.transition = 'none';
        moveTo(link);
        void glider.offsetWidth;
        glider.style.transition = '';
        menuInner.classList.add('has-glider');
      } else {
        moveTo(link);
      }
    };
    var hideGlider = function () { menuInner.classList.remove('has-glider'); };
    menuInner.querySelectorAll('.navbar__link').forEach(function (link) {
      link.addEventListener('mouseenter', function () { showGlider(link); });
      link.addEventListener('focus', function () { showGlider(link); });
      link.addEventListener('blur', hideGlider);
    });
    menuInner.querySelector('.navbar__links').addEventListener('mouseleave', hideGlider);
  }

  /* ---------- current section ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.navbar__link'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function markCurrent() {
    var line = window.innerHeight * 0.35, current = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) current = i; });
    var termin = document.getElementById('termin');
    if (termin && termin.getBoundingClientRect().top <= line) current = -1;
    navLinks.forEach(function (a, i) {
      a.classList.toggle('is-current', i === current);
      if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  onScroll();

  /* ---------- reveal: whole groups, never per item ---------- */
  var reveals = document.querySelectorAll('.reveal');
  function finish(el) {
    el.classList.add('is-in');
    var done = function () { el.classList.add('is-done'); };
    el.addEventListener('transitionend', function (e) { if (e.target === el) done(); });
    setTimeout(done, 1200);
  }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in', 'is-done'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { finish(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
    /* a jump (anchor, End key, restored scroll) can skip an element entirely */
    var sweeping = false;
    var sweep = function () {
      sweeping = false;
      reveals.forEach(function (el) {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vhPx) { finish(el); io.unobserve(el); }
      });
    };
    window.addEventListener('scroll', function () {
      if (!sweeping) { sweeping = true; requestAnimationFrame(sweep); }
    }, { passive: true });
    window.addEventListener('load', sweep);
  }

  /* ---------- opening hours: live status in Waren's time zone ---------- */
  var HOURS = { 1: [7.5, 18], 2: [7.5, 18], 3: [7.5, 18], 4: [7.5, 19], 5: [7.5, 12] };
  var DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var hm = function (h) { var m = Math.round((h % 1) * 60); return Math.floor(h) + ':' + (m < 10 ? '0' : '') + m; };
  function berlinNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var get = function (t) { for (var i = 0; i < parts.length; i++) if (parts[i].type === t) return parts[i].value; return ''; };
      var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      return { day: day, t: (+get('hour') % 24) + (+get('minute')) / 60 };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), t: d.getHours() + d.getMinutes() / 60 };
    }
  }
  function nextOpening(now) {
    for (var k = 0; k < 8; k++) {
      var d = (now.day + k) % 7, h = HOURS[d];
      if (!h) continue;
      if (k === 0 && now.t >= h[0]) continue;
      var when = k === 0 ? 'heute' : k === 1 ? 'morgen' : DAY_NAMES[d];
      var whenShort = k === 0 ? 'heute' : k === 1 ? 'morgen' : SHORT[d];
      return { long: when + ' um ' + hm(h[0]) + ' Uhr', short: whenShort + ' ' + hm(h[0]) };
    }
    return null;
  }
  var statusEls = document.querySelectorAll('[data-status]');
  var pill = document.querySelector('[data-status-pill]');
  var hoursCard = document.querySelector('[data-hours]');
  var nowLine = document.querySelector('[data-now]');
  function updateStatus() {
    var now = berlinNow();
    var h = HOURS[now.day];
    var open = !!h && now.t >= h[0] && now.t < h[1];
    var title, sub, pillText;
    if (open) {
      title = 'Jetzt geöffnet';
      sub = (h[1] - now.t <= 1 ? 'schließt um ' : 'heute bis ') + hm(h[1]) + ' Uhr';
      pillText = 'Geöffnet · bis ' + hm(h[1]) + ' Uhr';
    } else {
      var next = nextOpening(now);
      title = 'Gerade geschlossen';
      sub = next ? 'öffnet ' + next.long : '';
      pillText = next ? 'Geschlossen · öffnet ' + next.short : 'Geschlossen';
    }
    statusEls.forEach(function (el) {
      el.setAttribute('data-state', open ? 'open' : 'closed');
      el.querySelector('[data-status-title]').textContent = title;
      el.querySelector('[data-status-sub]').textContent = sub;
    });
    if (pill) {
      pill.setAttribute('data-state', open ? 'open' : 'closed');
      pill.querySelector('[data-status-pill-text]').textContent = pillText;
    }
    if (hoursCard) {
      hoursCard.querySelector('[data-hours-today]').textContent = 'Heute, ' + DAY_NAMES[now.day];
      hoursCard.querySelectorAll('.hrow').forEach(function (row) {
        row.classList.toggle('is-today', row.getAttribute('data-day').split(' ').indexOf(String(now.day)) > -1);
      });
      placeNow(now);
    }
  }
  /* the "jetzt" line: on the 7–20 h scale, across the weekday rows */
  function placeNow(now) {
    if (!nowLine) return;
    var h = HOURS[now.day];
    if (!h || now.t < 7 || now.t > 20) { nowLine.hidden = true; return; }
    var rows = hoursCard.querySelectorAll('.hrow:not(.hrow--off)');
    var track = rows[0].querySelector('.hrow__track').getBoundingClientRect();
    var card = hoursCard.getBoundingClientRect();
    var first = rows[0].getBoundingClientRect(), last = rows[rows.length - 1].getBoundingClientRect();
    nowLine.hidden = false;
    nowLine.style.left = (track.left - card.left + (now.t - 7) / 13 * track.width) + 'px';
    nowLine.style.top = (first.top - card.top - 4) + 'px';
    nowLine.style.height = (last.bottom - first.top + 8) + 'px';
  }
  updateStatus();
  setInterval(updateStatus, 60000);
  window.addEventListener('resize', function () { placeNow(berlinNow()); });
  window.addEventListener('load', function () { placeNow(berlinNow()); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeNow(berlinNow()); });

  /* ---------- Leistungen: tabs by situation ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.picker__tab'));
  var tabRow = document.querySelector('.picker__tabs');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus({ preventScroll: true });
    /* in the phone chip row, bring the chosen chip into view — sideways only */
    if (tabRow.scrollWidth > tabRow.clientWidth) {
      var l = tab.offsetLeft - tabRow.offsetLeft - parseFloat(getComputedStyle(tabRow).paddingLeft);
      tabRow.scrollTo({ left: l, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (k === 'Home') n = 0;
      else if (k === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); selectTab(tabs[n], true); }
    });
  });

  /* ---------- Stimmen: filter by theme ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var quotes = document.querySelectorAll('.quote');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      quotes.forEach(function (q) {
        q.hidden = f !== 'alle' && q.getAttribute('data-tags').split(' ').indexOf(f) === -1;
      });
    });
  });

  /* ---------- FAQ accordion: one open at a time ---------- */
  var accList = document.querySelector('.acc-list');
  var accs = Array.prototype.slice.call(document.querySelectorAll('.acc'));
  var setAcc = function (item, open) {
    item.classList.toggle('is-open', open);
    item.querySelector('.acc__btn').setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  accs.forEach(function (item) {
    item.querySelector('.acc__btn').addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      accs.forEach(function (other) { if (other !== item) setAcc(other, false); });
      setAcc(item, open);
    });
  });
  /* the list reserves its tallest open state, so opening a question never
     moves the heading beside it or the rows below */
  if (accList) {
    var reserve = function () {
      accList.style.minHeight = '';
      if (!window.matchMedia('(min-width: 40.0625rem)').matches) return;
      var rows = 0, tallest = 0;
      accs.forEach(function (item) {
        rows += item.querySelector('h3').offsetHeight;
        tallest = Math.max(tallest, item.querySelector('.acc__inner').scrollHeight);
      });
      var gaps = (accs.length - 1) * parseFloat(getComputedStyle(accList).rowGap || 0);
      accList.style.minHeight = Math.ceil(rows + gaps + tallest) + 'px';
    };
    reserve();
    window.addEventListener('resize', reserve);
    window.addEventListener('load', reserve);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserve);
  }

  /* ---------- custom dropdowns — the native <select> stays for value + validation ---------- */
  var closeAll = function (except) {
    document.querySelectorAll('.select.is-open').forEach(function (w) { if (w !== except) w._close(); });
  };
  document.querySelectorAll('#contact-form select.input').forEach(function (sel) {
    var wrap = document.createElement('div');
    wrap.className = 'select';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('select__native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');

    var id = sel.id;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'select__btn';
    btn.id = id + '-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="select__val"></span><svg class="select__chev" aria-hidden="true"><use href="#i-chev"/></svg>';
    var label = document.querySelector('label[for="' + id + '"]');
    if (label) { label.htmlFor = btn.id; label.id = id + '-lbl'; btn.setAttribute('aria-labelledby', label.id + ' ' + btn.id); }

    var list = document.createElement('ul');
    list.className = 'select__list';
    list.id = id + '-list';
    list.setAttribute('role', 'listbox');
    list.tabIndex = -1;
    if (label) list.setAttribute('aria-labelledby', label.id);
    btn.setAttribute('aria-controls', list.id);
    var opts = Array.prototype.map.call(sel.options, function (o, i) {
      var li = document.createElement('li');
      li.id = id + '-o' + i;
      li.setAttribute('role', 'option');
      li.innerHTML = '<span>' + o.text + '</span><svg aria-hidden="true"><use href="#i-check"/></svg>';
      if (o.value === '') li.classList.add('is-placeholder');
      list.appendChild(li);
      return li;
    });
    wrap.appendChild(btn);
    wrap.appendChild(list);

    var active = sel.selectedIndex;
    var sync = function () {
      var o = sel.options[sel.selectedIndex];
      btn.querySelector('.select__val').textContent = o ? o.text : '';
      btn.classList.toggle('is-empty', !o || o.value === '');
      opts.forEach(function (li, i) { li.setAttribute('aria-selected', String(i === sel.selectedIndex)); });
    };
    var mark = function (i) {
      active = Math.max(0, Math.min(opts.length - 1, i));
      opts.forEach(function (li, k) { li.classList.toggle('is-active', k === active); });
      list.setAttribute('aria-activedescendant', opts[active].id);
      var li = opts[active];
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop - 4;
      else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight + 4;
    };
    var open = function () {
      closeAll(wrap);
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      var r = btn.getBoundingClientRect();
      wrap.classList.toggle('is-up', window.innerHeight - r.bottom < 280 && r.top > window.innerHeight - r.bottom);
      mark(sel.selectedIndex < 0 ? 0 : sel.selectedIndex);
      list.focus({ preventScroll: true });
    };
    var close = function (focusBtn) {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      if (focusBtn) btn.focus({ preventScroll: true });
    };
    wrap._close = function () { close(false); };
    var choose = function (i) {
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
      close(true);
    };
    btn.addEventListener('click', function () { wrap.classList.contains('is-open') ? close(true) : open(); });
    btn.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].indexOf(e.key) > -1) { e.preventDefault(); open(); }
    });
    var typed = '', typedT;
    list.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); mark(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(active - 1); }
      else if (e.key === 'Home') { e.preventDefault(); mark(0); }
      else if (e.key === 'End') { e.preventDefault(); mark(opts.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { close(false); }
      else if (e.key.length === 1) {
        typed += e.key.toLowerCase(); clearTimeout(typedT);
        typedT = setTimeout(function () { typed = ''; }, 600);
        for (var k = 0; k < opts.length; k++) {
          if (sel.options[k].text.toLowerCase().indexOf(typed) === 0) { mark(k); break; }
        }
      }
    });
    opts.forEach(function (li, i) {
      li.addEventListener('click', function () { choose(i); });
      li.addEventListener('mousemove', function () { if (active !== i) mark(i); });
    });
    sel.addEventListener('change', sync);
    sync();
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.select.is-open').forEach(function (w) { if (!w.contains(e.target)) w._close(); });
  });

  /* ---------- date picker: German calendar, Monday first; past days and weekends off ---------- */
  var dp = document.querySelector('.datepick');
  if (dp) {
    var phone = window.matchMedia('(max-width: 30rem)');
    var dpBtn = dp.querySelector('.datepick__btn');
    var dpVal = dp.querySelector('.datepick__val');
    var dpInput = dp.querySelector('input[type="hidden"]');
    var cal = dp.querySelector('.cal');
    var calTitle = cal.querySelector('.cal__title');
    var calBody = cal.querySelector('tbody');
    var calPrev = cal.querySelector('[data-cal="-1"]');
    var calNext = cal.querySelector('[data-cal="1"]');
    var MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var dayOnly = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
    var today = dayOnly(new Date());
    var maxDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
    var chosen = null, focusD = today, viewY = today.getFullYear(), viewM = today.getMonth();
    var scrim = null;
    var same = function (a, b) { return a && b && a.getTime() === b.getTime(); };
    var closedDay = function (d) { return d.getDay() === 0 || d.getDay() === 6; };
    var firstOpen = function (d) { while (closedDay(d)) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); return d; };

    var render = function () {
      calTitle.textContent = MONTHS[viewM] + ' ' + viewY;
      calPrev.disabled = viewY === today.getFullYear() && viewM === today.getMonth();
      calNext.disabled = viewY === maxDate.getFullYear() && viewM === maxDate.getMonth();
      var first = new Date(viewY, viewM, 1);
      var lead = (first.getDay() + 6) % 7;
      var days = new Date(viewY, viewM + 1, 0).getDate();
      var html = '', cell = 0;
      for (var w = 0; w < 6 && cell < lead + days; w++) {
        html += '<tr>';
        for (var d = 0; d < 7; d++, cell++) {
          var n = cell - lead + 1;
          if (n < 1 || n > days) { html += '<td></td>'; continue; }
          var date = new Date(viewY, viewM, n);
          var off = date < today || date > maxDate || closedDay(date);
          var cls = 'cal__day' + (d === 4 ? ' is-fri' : '') + (same(date, today) ? ' is-today' : '');
          html += '<td><button type="button" class="' + cls + '" data-d="' + n + '"' +
            ' aria-label="' + DAY_NAMES[date.getDay()] + ', ' + n + '. ' + MONTHS[viewM] + ' ' + viewY + (d === 4 ? ', nur vormittags' : '') + '"' +
            ' aria-selected="' + (same(date, chosen) ? 'true' : 'false') + '"' +
            ' tabindex="' + (same(date, focusD) ? '0' : '-1') + '"' + (off ? ' disabled' : '') + '>' + n + '</button></td>';
        }
        html += '</tr>';
      }
      calBody.innerHTML = html;
    };
    var focusDay = function () {
      var b = calBody.querySelector('[tabindex="0"]');
      if (b) b.focus({ preventScroll: true });
    };
    var moveFocus = function (d) {
      if (d < today) d = today;
      if (d > maxDate) d = maxDate;
      focusD = d; viewY = d.getFullYear(); viewM = d.getMonth();
      render(); focusDay();
    };
    var openCal = function () {
      focusD = chosen || firstOpen(today); viewY = focusD.getFullYear(); viewM = focusD.getMonth();
      render();
      cal.hidden = false;
      dpBtn.setAttribute('aria-expanded', 'true');
      if (phone.matches) {
        scrim = document.createElement('div');
        scrim.className = 'cal-scrim';
        scrim.addEventListener('click', function () { closeCal(true); });
        dp.appendChild(scrim);
        lockScroll(true);
      }
      focusDay();
    };
    var closeCal = function (focusBtn) {
      if (cal.hidden) return;
      cal.hidden = true;
      dpBtn.setAttribute('aria-expanded', 'false');
      if (scrim) { scrim.remove(); scrim = null; lockScroll(false); }
      if (focusBtn) dpBtn.focus({ preventScroll: true });
    };
    var pick = function (d) {
      chosen = d;
      dpInput.value = pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
      dpVal.textContent = SHORT[d.getDay()] + ', ' + dpInput.value;
      dpBtn.classList.remove('is-empty');
      closeCal(true);
    };
    dpBtn.addEventListener('click', function () { cal.hidden ? openCal() : closeCal(true); });
    calPrev.addEventListener('click', function () { viewM--; if (viewM < 0) { viewM = 11; viewY--; } render(); });
    calNext.addEventListener('click', function () { viewM++; if (viewM > 11) { viewM = 0; viewY++; } render(); });
    calBody.addEventListener('click', function (e) {
      var b = e.target.closest('.cal__day');
      if (b && !b.disabled) pick(new Date(viewY, viewM, +b.getAttribute('data-d')));
    });
    calBody.addEventListener('keydown', function (e) {
      var b = e.target.closest('.cal__day');
      if (!b) return;
      var cur = new Date(viewY, viewM, +b.getAttribute('data-d'));
      var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (step) { e.preventDefault(); moveFocus(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + step)); }
      else if (e.key === 'Home') { e.preventDefault(); moveFocus(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() - (cur.getDay() + 6) % 7)); }
      else if (e.key === 'End') { e.preventDefault(); moveFocus(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 6 - (cur.getDay() + 6) % 7)); }
      else if (e.key === 'PageUp') { e.preventDefault(); moveFocus(new Date(cur.getFullYear(), cur.getMonth() - 1, Math.min(cur.getDate(), 28))); }
      else if (e.key === 'PageDown') { e.preventDefault(); moveFocus(new Date(cur.getFullYear(), cur.getMonth() + 1, Math.min(cur.getDate(), 28))); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!b.disabled) pick(cur); }
    });
    cal.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closeCal(true); } });
    document.addEventListener('click', function (e) { if (!cal.hidden && !dp.contains(e.target)) closeCal(false); });
    phone.addEventListener('change', function () { closeCal(false); });
  }

  /* ---------- request form — draft: validates, then shows the thank-you state ----------
     Production: Web3Forms (hidden access_key + the botcheck honeypot already in place). */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form__status');
    var messages = {
      'f-name': 'Bitte geben Sie Ihren Namen an.',
      'f-tel': 'Bitte geben Sie eine Telefonnummer an, damit wir Sie zurückrufen können.',
      'f-mail': 'Bitte prüfen Sie die E-Mail-Adresse.',
      'f-ok': 'Bitte bestätigen Sie die Einwilligung.'
    };
    var check = function (input) {
      var field = input.closest('.field');
      var err = document.getElementById(input.id + '-err');
      var ok = input.checkValidity();
      if (input.type === 'email' && ok && input.value) ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value);
      if (input.type === 'tel' && ok && input.value) ok = input.value.replace(/\D/g, '').length >= 6;
      field.classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) {
        err.textContent = ok ? '' : messages[input.id];
        input.setAttribute('aria-describedby', err.id);
      }
      return ok;
    };
    var checked = form.querySelectorAll('[required], [type="email"]');
    checked.forEach(function (input) {
      input.addEventListener(input.type === 'checkbox' ? 'change' : 'blur', function () {
        if (input.value || input.type === 'checkbox') check(input);
      });
      input.addEventListener('input', function () { if (input.closest('.field').classList.contains('is-invalid')) check(input); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="botcheck"]').checked) return;
      var firstBad = null;
      checked.forEach(function (input) { if (!check(input) && !firstBad) firstBad = input; });
      if (firstBad) { firstBad.focus(); return; }
      var name = form.querySelector('#f-name').value.trim().split(/\s+/)[0];
      var date = form.querySelector('#f-date').value;
      var cell = form.closest('.form-cell');
      cell.classList.add('is-sent');
      status.textContent = 'Danke, ' + name + '! Ihre Anfrage' + (date ? ' für den ' + date : '') +
        ' ist bei uns. Wir rufen Sie zurück, meist noch am selben Werktag.';
      if (cell.getBoundingClientRect().top < 0) cell.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
})();
